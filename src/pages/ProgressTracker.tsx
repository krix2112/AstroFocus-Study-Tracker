import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PremiumCard from "../components/PremiumCard";
import { useAuth } from "../context/AuthContext";
import { createClient } from "@supabase/supabase-js";
import { VITE_SUPABASE_URL as supabaseUrl, VITE_SUPABASE_ANON_KEY as supabaseAnonKey } from "../env";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { HiCheckCircle, HiXCircle, HiExclamationCircle, HiPencil, HiTrash, HiPlus, HiX } from "react-icons/hi";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Academic calculation functions - CORRECTED LOGIC
function calculateCieAverage(cie1: number, cie2: number, cie3?: number): number {
  const cies = [cie1, cie2, cie3].filter((c) => c !== undefined && c !== null && !isNaN(c)) as number[];
  if (cies.length < 2) return 0;
  cies.sort((a, b) => b - a); // Sort descending
  const best2 = cies.slice(0, 2);
  return (best2[0] + best2[1]) / 2; // Average of best 2, out of 20
}

function getSubjectStatus(
  internal: number,
  endSem: number,
  total: number
): "PASS" | "INTERNAL_BACK" | "EXTERNAL_BACK" | "SEMESTER_BACK" {
  // Priority order: Internal Back > External Back > Semester Back > Pass
  if (internal < 21) return "INTERNAL_BACK";
  if (endSem < 24) return "EXTERNAL_BACK";
  if (total < 45) return "SEMESTER_BACK";
  // Both internal and external passed, and total >= 45
  return "PASS";
}

interface SubjectData {
  id: string;
  name: string;
  cie1: number;
  cie2: number;
  cie3?: number;
  cieAverage: number; // Calculated from best 2 CIEs (out of 20)
  internal: number; // Teacher internal marks (0-40) - MANUALLY ENTERED
  endSem: number; // End semester marks (0-60)
  total: number; // Internal + EndSem (0-100)
  status: "PASS" | "INTERNAL_BACK" | "EXTERNAL_BACK" | "SEMESTER_BACK";
}

interface SemesterData {
  semester: number;
  subjects: SubjectData[];
}

interface SGPAData {
  semester: number;
  sgpa: number;
}

export default function ProgressTracker() {
  const auth = useAuth();
  const user = auth?.user || null;

  // Semester Performance State
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [semesterData, setSemesterData] = useState<SemesterData[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectCie1, setNewSubjectCie1] = useState("");
  const [newSubjectCie2, setNewSubjectCie2] = useState("");
  const [newSubjectCie3, setNewSubjectCie3] = useState("");
  const [newSubjectInternal, setNewSubjectInternal] = useState("");
  const [newSubjectEndSem, setNewSubjectEndSem] = useState("");
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);

  // Academic Trajectory State
  const [sgpaData, setSgpaData] = useState<SGPAData[]>([]);
  const [editingSemester, setEditingSemester] = useState<number | null>(null);
  const [editingSgpa, setEditingSgpa] = useState("");

  const [syncing, setSyncing] = useState(false);

  // Load data from database
  useEffect(() => {
    if (!user?.id) return;
    loadProgressData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function loadProgressData() {
    if (!user?.id) return;
    try {
      // Load semester performance data
      const { data: semData, error: semError } = await supabase
        .from("progress_semester_performance")
        .select("*")
        .eq("user_id", user.id)
        .order("semester", { ascending: true });

      if (semError) throw semError;

      if (semData) {
        const grouped: Record<number, SubjectData[]> = {};
        semData.forEach((row: {
          id: string;
          semester: number;
          subject_name: string;
          cie1: number;
          cie2: number;
          cie3?: number;
          internal: number;
          end_sem: number;
          total: number;
          status: "PASS" | "INTERNAL_BACK" | "EXTERNAL_BACK" | "SEMESTER_BACK";
        }) => {
          if (!grouped[row.semester]) grouped[row.semester] = [];
          const cie1 = row.cie1 || 0;
          const cie2 = row.cie2 || 0;
          const cie3 = row.cie3;
          const cieAverage = calculateCieAverage(cie1, cie2, cie3);
          grouped[row.semester].push({
            id: row.id,
            name: row.subject_name,
            cie1,
            cie2,
            cie3,
            cieAverage,
            internal: row.internal || 0,
            endSem: row.end_sem || 0,
            total: row.total || 0,
            status: row.status || "INTERNAL_BACK",
          });
        });
        setSemesterData(
          Object.entries(grouped).map(([sem, subjects]) => ({
            semester: parseInt(sem),
            subjects,
          }))
        );
      }

      // Load SGPA trajectory data
      const { data: sgpaRows, error: sgpaError } = await supabase
        .from("progress_sgpa_trajectory")
        .select("*")
        .eq("user_id", user.id)
        .order("semester", { ascending: true });

      if (sgpaError) throw sgpaError;

      if (sgpaRows) {
        setSgpaData(
          sgpaRows.map((row: { semester: number; sgpa: number }) => ({
            semester: row.semester,
            sgpa: row.sgpa,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading progress data:", error);
    }
  }

  async function saveSubjectData(subject: SubjectData, semester: number) {
    if (!user?.id) return;
    setSyncing(true);
    try {
      const { error } = await supabase.from("progress_semester_performance").upsert({
        id: subject.id,
        user_id: user.id,
        semester,
        subject_name: subject.name,
        cie1: subject.cie1,
        cie2: subject.cie2,
        cie3: subject.cie3 || null,
        internal: subject.internal,
        end_sem: subject.endSem,
        total: subject.total,
        status: subject.status,
      });

      if (error) throw error;
      await loadProgressData();
    } catch (error) {
      console.error("Error saving subject:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setSyncing(false);
    }
  }

  async function deleteSubject(subjectId: string) {
    if (!user?.id) return;
    if (!confirm("Are you sure you want to delete this subject?")) return;
    setSyncing(true);
    try {
      const { error } = await supabase
        .from("progress_semester_performance")
        .delete()
        .eq("id", subjectId);

      if (error) throw error;
      await loadProgressData();
    } catch (error) {
      console.error("Error deleting subject:", error);
      alert("Failed to delete. Please try again.");
    } finally {
      setSyncing(false);
    }
  }

  async function saveSgpaData(semester: number, sgpa: number) {
    if (!user?.id) return;
    setSyncing(true);
    try {
      const { error } = await supabase.from("progress_sgpa_trajectory").upsert({
        user_id: user.id,
        semester,
        sgpa,
      });

      if (error) throw error;
      await loadProgressData();
    } catch (error) {
      console.error("Error saving SGPA:", error);
    } finally {
      setSyncing(false);
    }
  }

  function validateAndAddSubject() {
    if (!newSubjectName.trim()) {
      alert("Please enter a subject name");
      return;
    }

    const cie1 = Math.max(0, Math.min(20, parseFloat(newSubjectCie1) || 0));
    const cie2 = Math.max(0, Math.min(20, parseFloat(newSubjectCie2) || 0));
    const cie3 = newSubjectCie3 ? Math.max(0, Math.min(20, parseFloat(newSubjectCie3))) : undefined;
    const internal = Math.max(0, Math.min(40, parseFloat(newSubjectInternal) || 0));
    const endSem = Math.max(0, Math.min(60, parseFloat(newSubjectEndSem) || 0));

    const cieAverage = calculateCieAverage(cie1, cie2, cie3);
    const total = internal + endSem;
    const status = getSubjectStatus(internal, endSem, total);

    const newSubject: SubjectData = {
      id: crypto.randomUUID(),
      name: newSubjectName.trim(),
      cie1,
      cie2,
      cie3,
      cieAverage,
      internal,
      endSem,
      total,
      status,
    };

    const currentSemData = semesterData.find((s) => s.semester === selectedSemester);
    if (currentSemData) {
      currentSemData.subjects.push(newSubject);
      setSemesterData([...semesterData]);
    } else {
      setSemesterData([...semesterData, { semester: selectedSemester, subjects: [newSubject] }]);
    }

    saveSubjectData(newSubject, selectedSemester);

    // Reset form
    setNewSubjectName("");
    setNewSubjectCie1("");
    setNewSubjectCie2("");
    setNewSubjectCie3("");
    setNewSubjectInternal("");
    setNewSubjectEndSem("");
    setShowAddModal(false);
  }

  function updateSubject(subjectId: string, updates: Partial<SubjectData>) {
    const currentSemData = semesterData.find((s) => s.semester === selectedSemester);
    if (!currentSemData) return;

    const subject = currentSemData.subjects.find((s) => s.id === subjectId);
    if (!subject) return;

    const updated = { ...subject, ...updates };
    
    // Recalculate CIE average if CIEs changed
    if (updates.cie1 !== undefined || updates.cie2 !== undefined || updates.cie3 !== undefined) {
      updated.cieAverage = calculateCieAverage(updated.cie1, updated.cie2, updated.cie3);
    }
    
    // Recalculate total and status if internal or endSem changed
    if (updates.internal !== undefined || updates.endSem !== undefined) {
      updated.total = updated.internal + updated.endSem;
      updated.status = getSubjectStatus(updated.internal, updated.endSem, updated.total);
    }

    const subjectIndex = currentSemData.subjects.findIndex((s) => s.id === subjectId);
    currentSemData.subjects[subjectIndex] = updated;
    setSemesterData([...semesterData]);

    saveSubjectData(updated, selectedSemester);
  }

  const currentSemesterSubjects = useMemo(() => {
    return semesterData.find((s) => s.semester === selectedSemester)?.subjects || [];
  }, [semesterData, selectedSemester]);

  const statusConfig = {
    PASS: {
      color: "text-green-400",
      bgColor: "bg-green-400/20",
      borderColor: "border-green-400/30",
      icon: HiCheckCircle,
      label: "PASS",
    },
    INTERNAL_BACK: {
      color: "text-red-400",
      bgColor: "bg-red-400/20",
      borderColor: "border-red-400/30",
      icon: HiXCircle,
      label: "INTERNAL BACK",
    },
    EXTERNAL_BACK: {
      color: "text-orange-400",
      bgColor: "bg-orange-400/20",
      borderColor: "border-orange-400/30",
      icon: HiExclamationCircle,
      label: "EXTERNAL BACK",
    },
    SEMESTER_BACK: {
      color: "text-red-400",
      bgColor: "bg-red-400/20",
      borderColor: "border-red-400/30",
      icon: HiXCircle,
      label: "SEMESTER BACK",
    },
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div>
        <h2 className="text-4xl font-bold gradient-onestop mb-2">Progress & Performance Tracker</h2>
        <p className="text-text-tertiary">Track your semester performance and academic trajectory</p>
      </div>

      {syncing && (
        <div className="bg-accent-cyan/20 border border-accent-cyan/30 text-accent-cyan p-4 rounded-lg text-sm">
          Syncing with database...
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tile 1: Semester Performance - REDESIGNED */}
        <div className="lg:col-span-1">
          <PremiumCard accent="cyan" className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-text-primary">Semester Performance</h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg btn-premium btn-accent-cyan"
              >
                <HiPlus className="w-5 h-5" />
                <span>Add Subject</span>
              </button>
            </div>

            {/* Semester Selector */}
            <div className="mb-8">
              <label className="block text-text-primary text-sm font-semibold mb-3">
                Select Semester
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
                className="w-full bg-surface px-4 py-3 rounded-lg outline-none text-text-primary border border-border focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-all text-lg"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>

            {/* Subjects List - Spacious Card Layout */}
            <div className="space-y-6">
              {currentSemesterSubjects.length === 0 ? (
                <div className="text-center py-12 text-text-tertiary">
                  <p className="text-lg mb-2">No subjects added yet</p>
                  <p className="text-sm">Click "Add Subject" to get started</p>
                </div>
              ) : (
                <AnimatePresence>
                  {currentSemesterSubjects.map((subject) => {
                    const config = statusConfig[subject.status];
                    const StatusIcon = config.icon;
                    const isEditing = editingSubjectId === subject.id;

                    // Get best 2 CIEs for display
                    const cies = [subject.cie1, subject.cie2, subject.cie3].filter((c) => c !== undefined && c !== null && !isNaN(c)) as number[];
                    const sortedCies = [...cies].sort((a, b) => b - a);
                    const best2 = sortedCies.slice(0, 2);

                    return (
                      <motion.div
                        key={subject.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-bg-secondary rounded-xl border border-border p-6 space-y-6"
                      >
                        {/* Subject Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-text-primary mb-1">{subject.name}</h4>
                            <p className="text-sm text-text-tertiary">Semester {selectedSemester}</p>
                          </div>
                          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${config.bgColor} ${config.borderColor} border`}>
                            <StatusIcon className={`w-5 h-5 ${config.color}`} />
                            <span className={`font-bold text-sm ${config.color}`}>{config.label}</span>
                          </div>
                        </div>

                        {isEditing ? (
                          /* Edit Mode */
                          <div className="space-y-4 pt-4 border-t border-border">
                            <div>
                              <label className="block text-text-primary text-sm font-medium mb-2">Subject Name</label>
                              <input
                                type="text"
                                value={subject.name}
                                onChange={(e) => updateSubject(subject.id, { name: e.target.value })}
                                className="w-full bg-surface px-4 py-2 rounded-lg outline-none text-text-primary border border-border focus:border-accent-cyan transition-all"
                              />
                            </div>

                            {/* CIE Performance Section */}
                            <div className="p-4 bg-surface/50 rounded-lg border border-border">
                              <label className="block text-text-primary text-sm font-semibold mb-3">CIE Performance (Informational)</label>
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-xs text-text-tertiary mb-1">CIE 1</label>
                                  <input
                                    type="number"
                                    value={subject.cie1}
                                    onChange={(e) => {
                                      const val = Math.max(0, Math.min(20, parseFloat(e.target.value) || 0));
                                      updateSubject(subject.id, { cie1: val });
                                    }}
                                    min="0"
                                    max="20"
                                    className="w-full bg-bg-secondary px-3 py-2 rounded-lg outline-none text-text-primary border border-border focus:border-accent-cyan transition-all"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-text-tertiary mb-1">CIE 2</label>
                                  <input
                                    type="number"
                                    value={subject.cie2}
                                    onChange={(e) => {
                                      const val = Math.max(0, Math.min(20, parseFloat(e.target.value) || 0));
                                      updateSubject(subject.id, { cie2: val });
                                    }}
                                    min="0"
                                    max="20"
                                    className="w-full bg-bg-secondary px-3 py-2 rounded-lg outline-none text-text-primary border border-border focus:border-accent-cyan transition-all"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-text-tertiary mb-1">CIE 3 (Optional)</label>
                                  <input
                                    type="number"
                                    value={subject.cie3 || ""}
                                    onChange={(e) => {
                                      const val = e.target.value ? Math.max(0, Math.min(20, parseFloat(e.target.value))) : undefined;
                                      updateSubject(subject.id, { cie3: val });
                                    }}
                                    min="0"
                                    max="20"
                                    placeholder="Optional"
                                    className="w-full bg-bg-secondary px-3 py-2 rounded-lg outline-none text-text-primary border border-border focus:border-accent-cyan transition-all"
                                  />
                                </div>
                              </div>
                              <p className="text-xs text-text-tertiary mt-2">
                                Best 2 CIEs Average: <span className="text-text-primary font-semibold">{subject.cieAverage.toFixed(2)} / 20</span>
                              </p>
                            </div>

                            {/* Official Evaluation Section */}
                            <div className="p-4 bg-accent-cyan/10 rounded-lg border-2 border-accent-cyan/30">
                              <label className="block text-text-primary text-sm font-semibold mb-3">Official Evaluation</label>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs text-text-tertiary mb-2">
                                    Internal Marks (out of 40)
                                  </label>
                                  <input
                                    type="number"
                                    value={subject.internal}
                                    onChange={(e) => {
                                      const val = Math.max(0, Math.min(40, parseFloat(e.target.value) || 0));
                                      updateSubject(subject.id, { internal: val });
                                    }}
                                    min="0"
                                    max="40"
                                    className="w-full bg-bg-secondary px-4 py-2 rounded-lg outline-none text-text-primary border border-border focus:border-accent-cyan transition-all"
                                  />
                                  <p className="text-xs text-text-tertiary mt-1">Enter marks given by faculty</p>
                                </div>
                                <div>
                                  <label className="block text-xs text-text-tertiary mb-2">
                                    End Semester (out of 60)
                                  </label>
                                  <input
                                    type="number"
                                    value={subject.endSem}
                                    onChange={(e) => {
                                      const val = Math.max(0, Math.min(60, parseFloat(e.target.value) || 0));
                                      updateSubject(subject.id, { endSem: val });
                                    }}
                                    min="0"
                                    max="60"
                                    className="w-full bg-bg-secondary px-4 py-2 rounded-lg outline-none text-text-primary border border-border focus:border-accent-cyan transition-all"
                                  />
                                  <p className="text-xs text-text-tertiary mt-1">Enter EndSem marks</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                              <button
                                onClick={() => setEditingSubjectId(null)}
                                className="flex-1 px-4 py-2 rounded-lg bg-accent-cyan/20 text-accent-cyan hover:bg-accent-cyan/30 transition-all font-medium"
                              >
                                Save Changes
                              </button>
                              <button
                                onClick={() => setEditingSubjectId(null)}
                                className="px-4 py-2 rounded-lg bg-surface hover:bg-surface-hover transition-all text-text-secondary"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* View Mode */
                          <>
                            {/* CIE Performance Display */}
                            <div className="p-4 bg-surface/50 rounded-lg border border-border">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-semibold text-text-primary">CIE Performance</span>
                                <span className="text-xs text-text-tertiary">Best 2 considered</span>
                              </div>
                              <div className="flex gap-3">
                                {[subject.cie1, subject.cie2, subject.cie3].map((cie, idx) => {
                                  if (cie === undefined || isNaN(cie)) return null;
                                  const isBest = best2.includes(cie);
                                  return (
                                    <div
                                      key={idx}
                                      className={`flex-1 p-3 rounded-lg border ${
                                        isBest
                                          ? "bg-accent-cyan/20 border-accent-cyan/30"
                                          : "bg-bg-secondary border-border"
                                      }`}
                                    >
                                      <div className="text-xs text-text-tertiary mb-1">CIE {idx + 1}</div>
                                      <div className="text-lg font-bold text-text-primary">{cie} / 20</div>
                                      {isBest && (
                                        <div className="text-xs text-accent-cyan mt-1">✓ Best</div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="mt-3 pt-3 border-t border-border">
                                <span className="text-xs text-text-tertiary">Average of Best 2: </span>
                                <span className="text-sm font-semibold text-text-primary">
                                  {subject.cieAverage.toFixed(2)} / 20
                                </span>
                              </div>
                            </div>

                            {/* Official Evaluation Results */}
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-semibold text-text-primary">Internal Marks</span>
                                  <span className={`text-sm font-bold ${subject.internal >= 21 ? "text-green-400" : "text-red-400"}`}>
                                    {subject.internal} / 40
                                    {subject.internal >= 21 ? " ✓ Pass" : " ✗ Back"}
                                  </span>
                                </div>
                                <div className="w-full bg-surface rounded-full h-3">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(subject.internal / 40) * 100}%` }}
                                    transition={{ duration: 0.5 }}
                                    className={`h-3 rounded-full ${
                                      subject.internal >= 21 ? "bg-accent-cyan" : "bg-red-400"
                                    }`}
                                  />
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-semibold text-text-primary">End Semester</span>
                                  <span className={`text-sm font-bold ${subject.endSem >= 24 ? "text-green-400" : "text-orange-400"}`}>
                                    {subject.endSem} / 60
                                    {subject.endSem >= 24 ? " ✓ Pass" : " ✗ Back"}
                                  </span>
                                </div>
                                <div className="w-full bg-surface rounded-full h-3">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(subject.endSem / 60) * 100}%` }}
                                    transition={{ duration: 0.5 }}
                                    className={`h-3 rounded-full ${
                                      subject.endSem >= 24 ? "bg-accent-violet" : "bg-orange-400"
                                    }`}
                                  />
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-semibold text-text-primary">Total</span>
                                  <span className={`text-sm font-bold ${subject.total >= 45 ? "text-green-400" : "text-red-400"}`}>
                                    {subject.total.toFixed(2)} / 100
                                  </span>
                                </div>
                                <div className="w-full bg-surface rounded-full h-3">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${subject.total}%` }}
                                    transition={{ duration: 0.5 }}
                                    className={`h-3 rounded-full ${
                                      subject.total >= 45 ? "bg-accent-pink" : "bg-red-400"
                                    }`}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2 border-t border-border">
                              <button
                                onClick={() => setEditingSubjectId(subject.id)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan/20 text-accent-cyan hover:bg-accent-cyan/30 transition-all"
                              >
                                <HiPencil className="w-4 h-4" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => deleteSubject(subject.id)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-pink/20 text-accent-pink hover:bg-accent-pink/30 transition-all"
                              >
                                <HiTrash className="w-4 h-4" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </PremiumCard>
        </div>

        {/* Tile 2: Academic Trajectory */}
        <div className="lg:col-span-1">
          <PremiumCard accent="violet" className="p-8">
            <h3 className="text-3xl font-bold text-text-primary mb-8">Academic Trajectory</h3>

            {/* SGPA Input Grid */}
            <div className="mb-8 grid grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
                const existing = sgpaData.find((s) => s.semester === sem);
                return (
                  <div key={sem} className="space-y-2">
                    <label className="text-xs text-text-tertiary font-medium">Sem {sem}</label>
                    <input
                      type="number"
                      placeholder="SGPA"
                      value={editingSemester === sem ? editingSgpa : existing?.sgpa || ""}
                      onChange={(e) => {
                        setEditingSemester(sem);
                        setEditingSgpa(e.target.value);
                      }}
                      onBlur={() => {
                        if (editingSemester === sem && editingSgpa) {
                          const val = Math.max(0, Math.min(10, parseFloat(editingSgpa)));
                          saveSgpaData(sem, val);
                          setEditingSemester(null);
                          setEditingSgpa("");
                        }
                      }}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && editingSemester === sem && editingSgpa) {
                          const val = Math.max(0, Math.min(10, parseFloat(editingSgpa)));
                          saveSgpaData(sem, val);
                          setEditingSemester(null);
                          setEditingSgpa("");
                        }
                      }}
                      min="0"
                      max="10"
                      step="0.01"
                      className="w-full bg-surface px-3 py-2 rounded-lg outline-none text-text-primary placeholder-text-tertiary border border-border focus:border-accent-violet transition-all text-sm"
                    />
                  </div>
                );
              })}
            </div>

            {/* SGPA Line Chart */}
            {sgpaData.length > 0 && (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sgpaData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      dataKey="semester"
                      stroke="var(--text-secondary)"
                      tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                      label={{ value: "Semester", position: "insideBottom", offset: -5, fill: "var(--text-secondary)" }}
                    />
                    <YAxis
                      stroke="var(--text-secondary)"
                      tick={{ fill: "var(--text-secondary)" }}
                      domain={[0, 10]}
                      label={{ value: "SGPA", angle: -90, position: "insideLeft", fill: "var(--text-secondary)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--bg-secondary)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sgpa"
                      stroke="var(--accent-violet)"
                      strokeWidth={3}
                      dot={{ fill: "var(--accent-violet)", r: 5 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {sgpaData.length === 0 && (
              <div className="text-center py-12 text-text-tertiary">
                <p className="text-lg mb-2">No SGPA data yet</p>
                <p className="text-sm">Enter SGPA for each semester to see your trajectory</p>
              </div>
            )}
          </PremiumCard>
        </div>
      </div>

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-bg-secondary rounded-xl border border-border p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-text-primary">Add New Subject</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewSubjectName("");
                  setNewSubjectCie1("");
                  setNewSubjectCie2("");
                  setNewSubjectCie3("");
                  setNewSubjectInternal("");
                  setNewSubjectEndSem("");
                }}
                className="p-2 hover:bg-surface rounded-lg transition-colors"
              >
                <HiX className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-text-primary text-sm font-semibold mb-2">Subject Name</label>
                <input
                  type="text"
                  placeholder="Enter subject name"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full bg-surface px-4 py-3 rounded-lg outline-none text-text-primary placeholder-text-tertiary border border-border focus:border-accent-cyan transition-all"
                />
              </div>

              {/* CIE Performance */}
              <div className="p-4 bg-surface/50 rounded-lg border border-border">
                <label className="block text-text-primary text-sm font-semibold mb-3">CIE Performance (Informational Only)</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-text-tertiary mb-1">CIE 1 (out of 20)</label>
                    <input
                      type="number"
                      placeholder="0-20"
                      value={newSubjectCie1}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(20, parseFloat(e.target.value) || 0));
                        setNewSubjectCie1(val.toString());
                      }}
                      min="0"
                      max="20"
                      className="w-full bg-bg-secondary px-3 py-2 rounded-lg outline-none text-text-primary border border-border focus:border-accent-cyan transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-tertiary mb-1">CIE 2 (out of 20)</label>
                    <input
                      type="number"
                      placeholder="0-20"
                      value={newSubjectCie2}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(20, parseFloat(e.target.value) || 0));
                        setNewSubjectCie2(val.toString());
                      }}
                      min="0"
                      max="20"
                      className="w-full bg-bg-secondary px-3 py-2 rounded-lg outline-none text-text-primary border border-border focus:border-accent-cyan transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-tertiary mb-1">CIE 3 (Optional, out of 20)</label>
                    <input
                      type="number"
                      placeholder="Optional"
                      value={newSubjectCie3}
                      onChange={(e) => {
                        const val = e.target.value ? Math.max(0, Math.min(20, parseFloat(e.target.value))) : "";
                        setNewSubjectCie3(val.toString());
                      }}
                      min="0"
                      max="20"
                      className="w-full bg-bg-secondary px-3 py-2 rounded-lg outline-none text-text-primary border border-border focus:border-accent-cyan transition-all"
                    />
                  </div>
                </div>
                <p className="text-xs text-text-tertiary mt-2">
                  Best 2 CIEs will be automatically selected for average calculation
                </p>
              </div>

              {/* Official Evaluation */}
              <div className="p-4 bg-accent-cyan/10 rounded-lg border-2 border-accent-cyan/30">
                <label className="block text-text-primary text-sm font-semibold mb-3">Official Evaluation</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-text-tertiary mb-2 font-medium">
                      Internal Marks (out of 40)
                    </label>
                    <input
                      type="number"
                      placeholder="Enter marks given by faculty"
                      value={newSubjectInternal}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(40, parseFloat(e.target.value) || 0));
                        setNewSubjectInternal(val.toString());
                      }}
                      min="0"
                      max="40"
                      className="w-full bg-bg-secondary px-4 py-3 rounded-lg outline-none text-text-primary placeholder-text-tertiary border border-border focus:border-accent-cyan transition-all"
                    />
                    <p className="text-xs text-text-tertiary mt-1">Enter marks given by faculty (0-40)</p>
                  </div>
                  <div>
                    <label className="block text-xs text-text-tertiary mb-2 font-medium">
                      End Semester (out of 60)
                    </label>
                    <input
                      type="number"
                      placeholder="Enter EndSem marks"
                      value={newSubjectEndSem}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(60, parseFloat(e.target.value) || 0));
                        setNewSubjectEndSem(val.toString());
                      }}
                      min="0"
                      max="60"
                      className="w-full bg-bg-secondary px-4 py-3 rounded-lg outline-none text-text-primary placeholder-text-tertiary border border-border focus:border-accent-cyan transition-all"
                    />
                    <p className="text-xs text-text-tertiary mt-1">Enter EndSem marks (0-60)</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={validateAndAddSubject}
                  className="flex-1 px-6 py-3 rounded-lg btn-premium btn-accent-cyan font-semibold"
                >
                  Add Subject
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewSubjectName("");
                    setNewSubjectCie1("");
                    setNewSubjectCie2("");
                    setNewSubjectCie3("");
                    setNewSubjectInternal("");
                    setNewSubjectEndSem("");
                  }}
                  className="px-6 py-3 rounded-lg bg-surface hover:bg-surface-hover transition-all text-text-secondary font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center mt-12 pt-6 border-t border-border">
        <p className="text-text-tertiary text-sm">Made by Krishna</p>
      </div>
    </div>
  );
}
