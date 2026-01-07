import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import PremiumCard from "../components/PremiumCard";
import MetricCard from "../components/MetricCard";
import { HiAcademicCap, HiChartBar } from "react-icons/hi";

interface Subject {
  id: string;
  name: string;
  marks: number;
  credits: number;
}

interface SubjectResult {
  name: string;
  marks: number;
  credits: number;
  gradePoint: number;
}

export default function GradeCalculator() {
  const auth = useAuth();
  const user = auth?.user || null;
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [marks, setMarks] = useState("");
  const [credits, setCredits] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", marks: "", credits: "" });

  // Load subjects from database on mount
  useEffect(() => {
    if (!user || !isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    const loadSubjects = async () => {
      if (!supabase || !user) return;
      try {
        const { data, error } = await supabase
          .from("grade_calculator_subjects")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error loading subjects:", error);
        } else {
          setSubjects(
            (data || []).map((subj) => ({
              id: subj.id,
              name: subj.name,
              marks: Number(subj.marks),
              credits: Number(subj.credits),
            }))
          );
        }
      } catch (error) {
        console.error("Error loading subjects:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, [user]);

  // Convert marks to grade point based on the grading system
  const getGradePoint = (marks: number): number => {
    if (marks >= 90 && marks <= 100) return 10;
    if (marks >= 80 && marks <= 89) return 9;
    if (marks >= 70 && marks <= 79) return 8;
    if (marks >= 60 && marks <= 69) return 7;
    if (marks >= 56 && marks <= 59) return 6;
    if (marks >= 50 && marks <= 55) return 5;
    if (marks >= 45 && marks <= 49) return 4.5;
    return 0; // below 45
  };

  // Calculate results
  const calculateResults = (): {
    subjectResults: SubjectResult[];
    totalCredits: number;
    sgpa: number;
  } => {
    const subjectResults: SubjectResult[] = subjects.map((subj) => ({
      name: subj.name,
      marks: subj.marks,
      credits: subj.credits,
      gradePoint: getGradePoint(subj.marks),
    }));

    const totalCredits = subjects.reduce((sum, subj) => sum + subj.credits, 0);
    const totalGradePoints = subjectResults.reduce(
      (sum, result) => sum + result.credits * result.gradePoint,
      0
    );
    const sgpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

    return {
      subjectResults,
      totalCredits,
      sgpa: Number(sgpa.toFixed(2)),
    };
  };

  const addSubject = async () => {
    const marksNum = parseFloat(marks);
    const creditsNum = parseFloat(credits);

    if (
      !subjectName.trim() ||
      isNaN(marksNum) ||
      marksNum < 0 ||
      marksNum > 100 ||
      isNaN(creditsNum) ||
      creditsNum <= 0 ||
      !user ||
      !isSupabaseConfigured ||
      !supabase
    ) {
      return;
    }

    setSyncing(true);

    try {
      const { data, error } = await supabase
        .from("grade_calculator_subjects")
        .insert([
          {
            user_id: user.id,
            name: subjectName.trim(),
            marks: marksNum,
            credits: creditsNum,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error adding subject:", error);
        alert("Failed to add subject. Please try again.");
        return;
      }

      const newSubject: Subject = {
        id: data.id,
        name: data.name,
        marks: Number(data.marks),
        credits: Number(data.credits),
      };

      setSubjects([...subjects, newSubject]);
      setSubjectName("");
      setMarks("");
      setCredits("");
    } catch (error) {
      console.error("Error adding subject:", error);
      alert("Failed to add subject. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  const removeSubject = async (id: string) => {
    if (!user || !isSupabaseConfigured || !supabase) return;

    setSyncing(true);

    try {
      const { error } = await supabase
        .from("grade_calculator_subjects")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error removing subject:", error);
        alert("Failed to remove subject. Please try again.");
        return;
      }

      setSubjects(subjects.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Error removing subject:", error);
      alert("Failed to remove subject. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  const clearAll = async () => {
    if (!confirm("Are you sure you want to clear all subjects?")) return;
    if (!user || !isSupabaseConfigured || !supabase) return;

    setSyncing(true);

    try {
      const { error } = await supabase
        .from("grade_calculator_subjects")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        console.error("Error clearing subjects:", error);
        alert("Failed to clear subjects. Please try again.");
        return;
      }

      setSubjects([]);
    } catch (error) {
      console.error("Error clearing subjects:", error);
      alert("Failed to clear subjects. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  const startEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setEditForm({
      name: subject.name,
      marks: subject.marks.toString(),
      credits: subject.credits.toString(),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", marks: "", credits: "" });
  };

  const saveEdit = async (id: string) => {
    const marksNum = parseFloat(editForm.marks);
    const creditsNum = parseFloat(editForm.credits);

    if (
      !editForm.name.trim() ||
      isNaN(marksNum) ||
      marksNum < 0 ||
      marksNum > 100 ||
      isNaN(creditsNum) ||
      creditsNum <= 0 ||
      !user ||
      !isSupabaseConfigured ||
      !supabase
    ) {
      return;
    }

    setSyncing(true);

    try {
      const { data, error } = await supabase
        .from("grade_calculator_subjects")
        .update({
          name: editForm.name.trim(),
          marks: marksNum,
          credits: creditsNum,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating subject:", error);
        alert("Failed to update subject. Please try again.");
        return;
      }

      setSubjects(
        subjects.map((s) =>
          s.id === id
            ? {
                ...s,
                name: data.name,
                marks: Number(data.marks),
                credits: Number(data.credits),
              }
            : s
        )
      );
      setEditingId(null);
      setEditForm({ name: "", marks: "", credits: "" });
    } catch (error) {
      console.error("Error updating subject:", error);
      alert("Failed to update subject. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  const results = calculateResults();

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-4xl font-bold gradient-onestop mb-2">Grade Calculator</h2>
          <p className="text-text-tertiary">Track and calculate your academic performance</p>
        </div>
        <PremiumCard className="p-8 text-center">
          <p className="text-text-secondary">Loading your subjects...</p>
        </PremiumCard>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-4xl font-bold gradient-onestop mb-2">Grade Calculator</h2>
        <p className="text-text-tertiary">Track and calculate your academic performance</p>
      </div>
      {syncing && (
        <div className="bg-accent-cyan/20 border border-accent-cyan/30 text-accent-cyan p-3 rounded-lg mb-4 text-sm glass-card">
          Syncing with database...
        </div>
      )}

      {/* Add Subject Form */}
      <PremiumCard accent="cyan" className="p-6">
        <h3 className="text-xl font-bold text-text-primary mb-4">Add Subject</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Subject Name"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            className="bg-surface px-3 py-2 rounded-lg outline-none text-text-primary placeholder-text-tertiary border border-border focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-all"
            onKeyPress={(e) => e.key === "Enter" && addSubject()}
          />
          <input
            type="number"
            placeholder="Marks (0-100)"
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            min="0"
            max="100"
            step="0.01"
            className="bg-surface px-3 py-2 rounded-lg outline-none text-text-primary placeholder-text-tertiary border border-border focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-all"
            onKeyPress={(e) => e.key === "Enter" && addSubject()}
          />
          <input
            type="number"
            placeholder="Credits"
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
            min="0.5"
            step="0.5"
            className="bg-surface px-3 py-2 rounded-lg outline-none text-text-primary placeholder-text-tertiary border border-border focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-all"
            onKeyPress={(e) => e.key === "Enter" && addSubject()}
          />
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={addSubject}
            className="px-6 py-2.5 rounded-lg btn-premium btn-accent-cyan"
          >
            ➕ Add Subject
          </button>
          {subjects.length > 0 && (
            <button
              onClick={clearAll}
              className="px-6 py-2.5 rounded-lg btn-premium bg-accent-pink/20 text-accent-pink hover:bg-accent-pink/30 border border-accent-pink/30"
            >
              🗑️ Clear All
            </button>
          )}
        </div>
      </PremiumCard>

      {/* Grading System Info */}
      <PremiumCard accent="violet" className="p-6">
        <h3 className="text-lg font-bold text-text-primary mb-4">Grading System</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div className="text-text-secondary">
            <span className="text-accent-cyan font-semibold">90-100</span> → <span className="text-text-primary font-bold">10</span>
          </div>
          <div className="text-text-secondary">
            <span className="text-accent-cyan font-semibold">80-89</span> → <span className="text-text-primary font-bold">9</span>
          </div>
          <div className="text-text-secondary">
            <span className="text-accent-cyan font-semibold">70-79</span> → <span className="text-text-primary font-bold">8</span>
          </div>
          <div className="text-text-secondary">
            <span className="text-accent-cyan font-semibold">60-69</span> → <span className="text-text-primary font-bold">7</span>
          </div>
          <div className="text-text-secondary">
            <span className="text-accent-cyan font-semibold">56-59</span> → <span className="text-text-primary font-bold">6</span>
          </div>
          <div className="text-text-secondary">
            <span className="text-accent-cyan font-semibold">50-55</span> → <span className="text-text-primary font-bold">5</span>
          </div>
          <div className="text-text-secondary">
            <span className="text-accent-cyan font-semibold">45-49</span> → <span className="text-text-primary font-bold">4.5</span>
          </div>
          <div className="text-text-secondary">
            <span className="text-accent-pink font-semibold">&lt;45</span> → <span className="text-text-primary font-bold">0</span>
          </div>
        </div>
      </PremiumCard>

      {/* Subjects List */}
      {subjects.length > 0 && (
        <PremiumCard accent="violet" className="p-6">
          <h3 className="text-xl font-bold text-text-primary mb-4">Subjects Added</h3>
          <div className="space-y-3">
            <AnimatePresence>
              {subjects.map((subject) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-card p-4 hover:bg-surface-hover transition-all"
                >
                  {editingId === subject.id ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Subject Name"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          className="bg-surface px-3 py-2 rounded-lg outline-none text-text-primary placeholder-text-tertiary border border-border focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-all"
                        />
                        <input
                          type="number"
                          placeholder="Marks (0-100)"
                          value={editForm.marks}
                          onChange={(e) =>
                            setEditForm({ ...editForm, marks: e.target.value })
                          }
                          min="0"
                          max="100"
                          step="0.01"
                          className="bg-surface px-3 py-2 rounded-lg outline-none text-text-primary placeholder-text-tertiary border border-border focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-all"
                        />
                        <input
                          type="number"
                          placeholder="Credits"
                          value={editForm.credits}
                          onChange={(e) =>
                            setEditForm({ ...editForm, credits: e.target.value })
                          }
                          min="0.5"
                          step="0.5"
                          className="bg-surface px-3 py-2 rounded-lg outline-none text-text-primary placeholder-text-tertiary border border-border focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-all"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(subject.id)}
                          className="px-4 py-2 rounded bg-green-500/20 text-green-300 hover:bg-green-500/30 transition border border-green-500/30"
                        >
                          ✅ Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-2 rounded bg-slate-500/20 text-slate-300 hover:bg-slate-500/30 transition border border-slate-500/30"
                        >
                          ❌ Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div className="flex-1">
                        <p className="text-lg font-semibold text-text-primary">
                          {subject.name}
                        </p>
                        <div className="flex gap-4 mt-1 text-sm text-text-secondary">
                          <span>Marks: <span className="text-text-primary font-medium">{subject.marks}</span></span>
                          <span>Credits: <span className="text-text-primary font-medium">{subject.credits}</span></span>
                          <span className="text-accent-cyan font-semibold">
                            Grade Point: {getGradePoint(subject.marks)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2 sm:mt-0">
                        <button
                          onClick={() => startEdit(subject)}
                          className="px-4 py-1.5 rounded-lg btn-premium bg-accent-cyan/20 text-accent-cyan hover:bg-accent-cyan/30 border border-accent-cyan/30"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => removeSubject(subject.id)}
                          className="px-4 py-1.5 rounded-lg btn-premium bg-accent-pink/20 text-accent-pink hover:bg-accent-pink/30 border border-accent-pink/30"
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </PremiumCard>
      )}

      {/* Results with Charts */}
      {subjects.length > 0 && (
        <>
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              label="Total Credits"
              value={results.totalCredits}
              icon={<HiAcademicCap className="w-6 h-6" />}
              accent="cyan"
            />
            <MetricCard
              label="Total Grade Points"
              value={results.subjectResults.reduce((sum, r) => sum + r.credits * r.gradePoint, 0).toFixed(2)}
              icon={<HiChartBar className="w-6 h-6" />}
              accent="violet"
            />
            <MetricCard
              label="Final SGPA"
              value={results.sgpa.toFixed(2)}
              subtitle="Semester Grade Point Average"
              icon={<HiAcademicCap className="w-6 h-6" />}
              accent="pink"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Subject-wise Performance Bar Chart */}
            <PremiumCard accent="cyan" className="p-6">
              <h3 className="text-xl font-bold text-text-primary mb-4">Subject Performance</h3>
              <div className="w-full h-64">
                <ResponsiveContainer>
                  <BarChart data={results.subjectResults.map(r => ({ name: r.name, marks: r.marks, gradePoint: r.gradePoint }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "var(--bg-secondary)", 
                        border: "1px solid var(--border)", 
                        color: "var(--text-primary)",
                        borderRadius: "8px"
                      }} 
                    />
                    <Bar dataKey="marks" fill="var(--accent-cyan)" name="Marks" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </PremiumCard>

            {/* Grade Point Distribution Pie Chart */}
            <PremiumCard accent="violet" className="p-6">
              <h3 className="text-xl font-bold text-text-primary mb-4">Grade Point Distribution</h3>
              <div className="w-full h-64">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={results.subjectResults.map(r => ({ name: r.name, value: r.gradePoint }))}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                      innerRadius={40}
                      paddingAngle={5}
                    >
                      {results.subjectResults.map((_, i) => (
                        <Cell key={i} fill={["var(--accent-cyan)", "var(--accent-violet)", "var(--accent-pink)", "var(--accent-blue)"][i % 4]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "var(--bg-secondary)", 
                        border: "1px solid var(--border)", 
                        color: "var(--text-primary)",
                        borderRadius: "8px"
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </PremiumCard>
          </div>

          {/* Detailed Results */}
          <PremiumCard accent="blue" className="p-6">
            <h3 className="text-2xl font-bold text-text-primary mb-4">Detailed Results</h3>

          {/* Subject-wise Results Table */}
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-text-primary font-semibold">Subject</th>
                  <th className="pb-3 text-text-primary font-semibold">Marks</th>
                  <th className="pb-3 text-text-primary font-semibold">Credits</th>
                  <th className="pb-3 text-text-primary font-semibold">Grade Point</th>
                  <th className="pb-3 text-text-primary font-semibold">Credit × Grade</th>
                </tr>
              </thead>
              <tbody>
                {results.subjectResults.map((result, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="border-b border-border"
                  >
                    <td className="py-3 text-text-primary font-medium">{result.name}</td>
                    <td className="py-3 text-text-secondary">{result.marks}</td>
                    <td className="py-3 text-text-secondary">{result.credits}</td>
                    <td className="py-3 text-accent-cyan font-semibold">
                      {result.gradePoint}
                    </td>
                    <td className="py-3 text-accent-pink font-semibold">
                      {(result.credits * result.gradePoint).toFixed(2)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

            {/* Formula Display */}
            <PremiumCard className="p-4 mt-4">
              <p className="text-text-tertiary text-sm mb-2 font-medium">Formula:</p>
              <p className="text-text-primary text-sm font-mono mb-2">
                SGPA = (Σ (credit × gradePoint)) / (Σ credits)
              </p>
              <p className="text-text-secondary text-xs">
                = {results.subjectResults
                  .map((r) => `${r.credits} × ${r.gradePoint}`)
                  .join(" + ")}{" "}
                / {results.totalCredits}
              </p>
              <p className="text-text-secondary text-xs mt-1">
                = {results.subjectResults
                  .reduce((sum, r) => sum + r.credits * r.gradePoint, 0)
                  .toFixed(2)}{" "}
                / {results.totalCredits} ={" "}
                <span className="text-accent-cyan font-bold">
                  {results.sgpa.toFixed(2)}
                </span>
              </p>
            </PremiumCard>
          </PremiumCard>
        </>
      )}

      {subjects.length === 0 && (
        <PremiumCard className="p-8 text-center">
          <p className="text-text-secondary">
            Add subjects with marks and credits to calculate your SGPA
          </p>
        </PremiumCard>
      )}
    </div>
  );
}

