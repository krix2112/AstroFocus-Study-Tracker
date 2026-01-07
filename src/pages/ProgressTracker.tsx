import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PremiumCard from "../components/PremiumCard";
import { useAuth } from "../context/AuthContext";
import { createClient } from "@supabase/supabase-js";
import { VITE_SUPABASE_URL as supabaseUrl, VITE_SUPABASE_ANON_KEY as supabaseAnonKey } from "../env";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { HiCheckCircle, HiXCircle, HiExclamationCircle } from "react-icons/hi";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Academic calculation functions
function calculateInternal(cie1: number, cie2: number, cie3?: number): number {
  const cies = [cie1, cie2, cie3].filter((c) => c !== undefined && c !== null) as number[];
  cies.sort((a, b) => b - a); // Sort descending
  const best2 = cies.slice(0, 2);
  return (best2[0] + best2[1]) / 2;
}

function getSubjectStatus(
  internal: number,
  endSem: number,
  total: number
): "PASS" | "INTERNAL_BACK" | "EXTERNAL_BACK" | "SEMESTER_BACK" {
  if (internal < 21) return "INTERNAL_BACK";
  if (endSem < 24) return "EXTERNAL_BACK";
  if (total < 45) return "SEMESTER_BACK";
  return "PASS";
}

interface SubjectData {
  id: string;
  name: string;
  cie1: number;
  cie2: number;
  cie3?: number;
  internal: number;
  endSem: number;
  total: number;
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
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectCie1, setNewSubjectCie1] = useState("");
  const [newSubjectCie2, setNewSubjectCie2] = useState("");
  const [newSubjectCie3, setNewSubjectCie3] = useState("");
  const [newSubjectEndSem, setNewSubjectEndSem] = useState("");
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);

  // Academic Trajectory State
  const [sgpaData, setSgpaData] = useState<SGPAData[]>([]);
  const [editingSemester, setEditingSemester] = useState<number | null>(null);
  const [editingSgpa, setEditingSgpa] = useState("");

  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Load data from database
  useEffect(() => {
    if (!user?.id) return;
    loadProgressData();
  }, [user?.id]);

  async function loadProgressData() {
    if (!user?.id) return;
    setLoading(true);
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
        semData.forEach((row: any) => {
          if (!grouped[row.semester]) grouped[row.semester] = [];
          grouped[row.semester].push({
            id: row.id,
            name: row.subject_name,
            cie1: row.cie1,
            cie2: row.cie2,
            cie3: row.cie3,
            internal: row.internal,
            endSem: row.end_sem,
            total: row.total,
            status: row.status,
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
          sgpaRows.map((row: any) => ({
            semester: row.semester,
            sgpa: row.sgpa,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading progress data:", error);
    } finally {
      setLoading(false);
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

  function addSubject() {
    if (!newSubjectName.trim()) return;
    const cie1 = parseFloat(newSubjectCie1) || 0;
    const cie2 = parseFloat(newSubjectCie2) || 0;
    const cie3 = newSubjectCie3 ? parseFloat(newSubjectCie3) : undefined;
    const endSem = parseFloat(newSubjectEndSem) || 0;

    const internal = calculateInternal(cie1, cie2, cie3);
    const total = internal + endSem;
    const status = getSubjectStatus(internal, endSem, total);

    const newSubject: SubjectData = {
      id: crypto.randomUUID(),
      name: newSubjectName,
      cie1,
      cie2,
      cie3,
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
    setNewSubjectEndSem("");
  }

  function updateSubject(subjectId: string, updates: Partial<SubjectData>) {
    const currentSemData = semesterData.find((s) => s.semester === selectedSemester);
    if (!currentSemData) return;

    const subject = currentSemData.subjects.find((s) => s.id === subjectId);
    if (!subject) return;

    const updated = { ...subject, ...updates };
    const internal = calculateInternal(updated.cie1, updated.cie2, updated.cie3);
    const total = internal + updated.endSem;
    const status = getSubjectStatus(internal, updated.endSem, total);

    updated.internal = internal;
    updated.total = total;
    updated.status = status;

    const subjectIndex = currentSemData.subjects.findIndex((s) => s.id === subjectId);
    currentSemData.subjects[subjectIndex] = updated;
    setSemesterData([...semesterData]);

    saveSubjectData(updated, selectedSemester);
  }

  const currentSemesterSubjects = useMemo(() => {
    return semesterData.find((s) => s.semester === selectedSemester)?.subjects || [];
  }, [semesterData, selectedSemester]);

  const statusColors = {
    PASS: "text-green-400",
    INTERNAL_BACK: "text-red-400",
    EXTERNAL_BACK: "text-orange-400",
    SEMESTER_BACK: "text-red-400",
  };

  const statusIcons = {
    PASS: HiCheckCircle,
    INTERNAL_BACK: HiXCircle,
    EXTERNAL_BACK: HiExclamationCircle,
    SEMESTER_BACK: HiXCircle,
  };

  const statusLabels = {
    PASS: "Pass",
    INTERNAL_BACK: "Internal Back",
    EXTERNAL_BACK: "External Back",
    SEMESTER_BACK: "Semester Back",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-4xl font-bold gradient-onestop mb-2">Progress & Performance Tracker</h2>
        <p className="text-text-tertiary">Track your semester performance and academic trajectory</p>
      </div>

      {syncing && (
        <div className="bg-accent-cyan/20 border border-accent-cyan/30 text-accent-cyan p-3 rounded-lg text-sm">
          Syncing with database...
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tile 1: Semester Performance */}
        <PremiumCard accent="cyan" className="p-6">
          <h3 className="text-2xl font-bold text-text-primary mb-4">Semester Performance</h3>

          {/* Semester Selector */}
          <div className="mb-6">
            <label className="block text-text-primary text-sm font-medium mb-2">
              Select Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
              className="w-full bg-surface px-4 py-2 rounded-lg outline-none text-text-primary border border-border focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-all"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          {/* Add Subject Form */}
          <div className="mb-6 p-4 bg-bg-secondary rounded-lg border border-border">
            <h4 className="text-lg font-semibold text-text-primary mb-3">Add Subject</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Subject Name"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                className="w-full bg-surface px-3 py-2 rounded-lg outline-none text-text-primary placeholder-text-tertiary border border-border focus:border-accent-cyan transition-all"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="CIE 1"
                  value={newSubjectCie1}
                  onChange={(e) => setNewSubjectCie1(e.target.value)}
                  min="0"
                  max="20"
                  className="bg-surface px-3 py-2 rounded-lg outline-none text-text-primary placeholder-text-tertiary border border-border focus:border-accent-cyan transition-all"
                />
                <input
                  type="number"
                  placeholder="CIE 2"
                  value={newSubjectCie2}
                  onChange={(e) => setNewSubjectCie2(e.target.value)}
                  min="0"
                  max="20"
                  className="bg-surface px-3 py-2 rounded-lg outline-none text-text-primary placeholder-text-tertiary border border-border focus:border-accent-cyan transition-all"
                />
                <input
                  type="number"
                  placeholder="CIE 3 (optional)"
                  value={newSubjectCie3}
                  onChange={(e) => setNewSubjectCie3(e.target.value)}
                  min="0"
                  max="20"
                  className="bg-surface px-3 py-2 rounded-lg outline-none text-text-primary placeholder-text-tertiary border border-border focus:border-accent-cyan transition-all"
                />
              </div>
              <input
                type="number"
                placeholder="End Semester Marks (out of 60)"
                value={newSubjectEndSem}
                onChange={(e) => setNewSubjectEndSem(e.target.value)}
                min="0"
                max="60"
                className="w-full bg-surface px-3 py-2 rounded-lg outline-none text-text-primary placeholder-text-tertiary border border-border focus:border-accent-cyan transition-all"
              />
              <button
                onClick={addSubject}
                className="w-full px-4 py-2 rounded-lg btn-premium btn-accent-cyan"
              >
                Add Subject
              </button>
            </div>
          </div>

          {/* Subjects List */}
          <div className="space-y-4">
            <AnimatePresence>
              {currentSemesterSubjects.map((subject) => {
                const StatusIcon = statusIcons[subject.status];
                return (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-bg-secondary rounded-lg border border-border"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-text-primary mb-2">{subject.name}</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-text-tertiary">CIE 1:</span>{" "}
                            <span className="text-text-primary">{subject.cie1}</span>
                          </div>
                          <div>
                            <span className="text-text-tertiary">CIE 2:</span>{" "}
                            <span className="text-text-primary">{subject.cie2}</span>
                          </div>
                          {subject.cie3 !== undefined && (
                            <div>
                              <span className="text-text-tertiary">CIE 3:</span>{" "}
                              <span className="text-text-primary">{subject.cie3}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 ${statusColors[subject.status]}`}>
                        <StatusIcon className="w-5 h-5" />
                        <span className="font-semibold">{statusLabels[subject.status]}</span>
                      </div>
                    </div>

                    {editingSubjectId === subject.id ? (
                      // Edit Mode
                      <div className="space-y-3 mt-4 p-3 bg-surface rounded-lg">
                        <input
                          type="text"
                          value={subject.name}
                          onChange={(e) => updateSubject(subject.id, { name: e.target.value })}
                          className="w-full bg-bg-secondary px-3 py-2 rounded-lg outline-none text-text-primary border border-border focus:border-accent-cyan transition-all"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="number"
                            value={subject.cie1}
                            onChange={(e) => updateSubject(subject.id, { cie1: parseFloat(e.target.value) || 0 })}
                            min="0"
                            max="20"
                            className="bg-bg-secondary px-3 py-2 rounded-lg outline-none text-text-primary border border-border focus:border-accent-cyan transition-all"
                          />
                          <input
                            type="number"
                            value={subject.cie2}
                            onChange={(e) => updateSubject(subject.id, { cie2: parseFloat(e.target.value) || 0 })}
                            min="0"
                            max="20"
                            className="bg-bg-secondary px-3 py-2 rounded-lg outline-none text-text-primary border border-border focus:border-accent-cyan transition-all"
                          />
                          <input
                            type="number"
                            value={subject.cie3 || ""}
                            onChange={(e) => updateSubject(subject.id, { cie3: e.target.value ? parseFloat(e.target.value) : undefined })}
                            min="0"
                            max="20"
                            placeholder="CIE 3"
                            className="bg-bg-secondary px-3 py-2 rounded-lg outline-none text-text-primary border border-border focus:border-accent-cyan transition-all"
                          />
                        </div>
                        <input
                          type="number"
                          value={subject.endSem}
                          onChange={(e) => updateSubject(subject.id, { endSem: parseFloat(e.target.value) || 0 })}
                          min="0"
                          max="60"
                          className="w-full bg-bg-secondary px-3 py-2 rounded-lg outline-none text-text-primary border border-border focus:border-accent-cyan transition-all"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingSubjectId(null)}
                            className="px-3 py-1.5 rounded-lg bg-accent-cyan/20 text-accent-cyan hover:bg-accent-cyan/30 text-sm transition-all"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingSubjectId(null)}
                            className="px-3 py-1.5 rounded-lg bg-accent-pink/20 text-accent-pink hover:bg-accent-pink/30 text-sm transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Progress Bars */}
                        <div className="space-y-2 mb-3">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-text-tertiary">Internal (40)</span>
                              <span className="text-text-primary font-semibold">
                                {subject.internal.toFixed(2)}
                              </span>
                            </div>
                            <div className="w-full bg-surface rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  subject.internal >= 21 ? "bg-accent-cyan" : "bg-red-400"
                                }`}
                                style={{ width: `${(subject.internal / 40) * 100}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-text-tertiary">EndSem (60)</span>
                              <span className="text-text-primary font-semibold">{subject.endSem}</span>
                            </div>
                            <div className="w-full bg-surface rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  subject.endSem >= 24 ? "bg-accent-violet" : "bg-orange-400"
                                }`}
                                style={{ width: `${(subject.endSem / 60) * 100}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-text-tertiary">Total (100)</span>
                              <span className="text-text-primary font-semibold">{subject.total.toFixed(2)}</span>
                            </div>
                            <div className="w-full bg-surface rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  subject.total >= 45 ? "bg-accent-pink" : "bg-red-400"
                                }`}
                                style={{ width: `${subject.total}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingSubjectId(subject.id)}
                            className="px-3 py-1.5 rounded-lg bg-accent-cyan/20 text-accent-cyan hover:bg-accent-cyan/30 text-sm transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteSubject(subject.id)}
                            className="px-3 py-1.5 rounded-lg bg-accent-pink/20 text-accent-pink hover:bg-accent-pink/30 text-sm transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </PremiumCard>

        {/* Tile 2: Academic Trajectory */}
        <PremiumCard accent="violet" className="p-6">
          <h3 className="text-2xl font-bold text-text-primary mb-4">Academic Trajectory</h3>

          {/* SGPA Input Grid */}
          <div className="mb-6 grid grid-cols-4 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
              const existing = sgpaData.find((s) => s.semester === sem);
              return (
                <div key={sem} className="space-y-1">
                  <label className="text-xs text-text-tertiary">Sem {sem}</label>
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
                        saveSgpaData(sem, parseFloat(editingSgpa));
                        setEditingSemester(null);
                        setEditingSgpa("");
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && editingSemester === sem && editingSgpa) {
                        saveSgpaData(sem, parseFloat(editingSgpa));
                        setEditingSemester(null);
                        setEditingSgpa("");
                      }
                    }}
                    min="0"
                    max="10"
                    step="0.01"
                    className="w-full bg-surface px-2 py-2 rounded-lg outline-none text-text-primary placeholder-text-tertiary border border-border focus:border-accent-violet transition-all text-sm"
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
              Enter SGPA for each semester to see your trajectory
            </div>
          )}
        </PremiumCard>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 pt-6 border-t border-border">
        <p className="text-text-tertiary text-sm">Made by Krishna</p>
      </div>
    </div>
  );
}

