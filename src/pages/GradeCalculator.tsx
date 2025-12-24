import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectName, setSubjectName] = useState("");
  const [marks, setMarks] = useState("");
  const [credits, setCredits] = useState("");

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

  const addSubject = () => {
    const marksNum = parseFloat(marks);
    const creditsNum = parseFloat(credits);

    if (
      !subjectName.trim() ||
      isNaN(marksNum) ||
      marksNum < 0 ||
      marksNum > 100 ||
      isNaN(creditsNum) ||
      creditsNum <= 0
    ) {
      return;
    }

    const newSubject: Subject = {
      id: crypto.randomUUID(),
      name: subjectName.trim(),
      marks: marksNum,
      credits: creditsNum,
    };

    setSubjects([...subjects, newSubject]);
    setSubjectName("");
    setMarks("");
    setCredits("");
  };

  const removeSubject = (id: string) => {
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  const clearAll = () => {
    setSubjects([]);
  };

  const results = calculateResults();

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold gradient-text mb-6">
        Academic Grade Calculator
      </h2>

      {/* Add Subject Form */}
      <div className="bg-white/5 p-6 rounded-2xl mb-6 border border-white/10">
        <h3 className="text-xl text-slate-300 mb-4">Add Subject</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Subject Name"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            className="bg-white/10 px-3 py-2 rounded outline-none text-white placeholder-slate-400"
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
            className="bg-white/10 px-3 py-2 rounded outline-none text-white placeholder-slate-400"
            onKeyPress={(e) => e.key === "Enter" && addSubject()}
          />
          <input
            type="number"
            placeholder="Credits"
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
            min="0.5"
            step="0.5"
            className="bg-white/10 px-3 py-2 rounded outline-none text-white placeholder-slate-400"
            onKeyPress={(e) => e.key === "Enter" && addSubject()}
          />
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={addSubject}
            className="px-6 py-2 rounded btn-neon hover:bg-white/10 transition"
          >
            ➕ Add Subject
          </button>
          {subjects.length > 0 && (
            <button
              onClick={clearAll}
              className="px-6 py-2 rounded bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 transition border border-pink-500/30"
            >
              🗑️ Clear All
            </button>
          )}
        </div>
      </div>

      {/* Grading System Info */}
      <div className="bg-white/5 p-4 rounded-2xl mb-6 border border-white/10">
        <h3 className="text-lg text-slate-300 mb-3">Grading System</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
          <div className="text-slate-400">
            <span className="text-neonCyan">90-100</span> → 10
          </div>
          <div className="text-slate-400">
            <span className="text-neonCyan">80-89</span> → 9
          </div>
          <div className="text-slate-400">
            <span className="text-neonCyan">70-79</span> → 8
          </div>
          <div className="text-slate-400">
            <span className="text-neonCyan">60-69</span> → 7
          </div>
          <div className="text-slate-400">
            <span className="text-neonCyan">56-59</span> → 6
          </div>
          <div className="text-slate-400">
            <span className="text-neonCyan">50-55</span> → 5
          </div>
          <div className="text-slate-400">
            <span className="text-neonCyan">45-49</span> → 4.5
          </div>
          <div className="text-slate-400">
            <span className="text-pink-400">&lt;45</span> → 0
          </div>
        </div>
      </div>

      {/* Subjects List */}
      {subjects.length > 0 && (
        <div className="bg-white/5 p-6 rounded-2xl mb-6 border border-white/10">
          <h3 className="text-xl text-slate-300 mb-4">Subjects Added</h3>
          <div className="space-y-3">
            <AnimatePresence>
              {subjects.map((subject) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white/5 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center border border-white/10 hover:border-white/20 transition"
                >
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-white">
                      {subject.name}
                    </p>
                    <div className="flex gap-4 mt-1 text-sm text-slate-400">
                      <span>Marks: {subject.marks}</span>
                      <span>Credits: {subject.credits}</span>
                      <span className="text-neonCyan">
                        Grade Point: {getGradePoint(subject.marks)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeSubject(subject.id)}
                    className="mt-2 sm:mt-0 px-4 py-1 rounded bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 transition"
                  >
                    🗑️ Remove
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Results */}
      {subjects.length > 0 && (
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <h3 className="text-2xl text-slate-300 mb-4">Results</h3>

          {/* Subject-wise Results Table */}
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-3 text-slate-300">Subject</th>
                  <th className="pb-3 text-slate-300">Marks</th>
                  <th className="pb-3 text-slate-300">Credits</th>
                  <th className="pb-3 text-slate-300">Grade Point</th>
                  <th className="pb-3 text-slate-300">Credit × Grade</th>
                </tr>
              </thead>
              <tbody>
                {results.subjectResults.map((result, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="border-b border-white/5"
                  >
                    <td className="py-3 text-white">{result.name}</td>
                    <td className="py-3 text-slate-300">{result.marks}</td>
                    <td className="py-3 text-slate-300">{result.credits}</td>
                    <td className="py-3 text-neonCyan font-semibold">
                      {result.gradePoint}
                    </td>
                    <td className="py-3 text-neonPink font-semibold">
                      {(result.credits * result.gradePoint).toFixed(2)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <p className="text-slate-400 text-sm mb-1">Total Credits</p>
              <p className="text-2xl text-neonCyan font-bold">
                {results.totalCredits}
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <p className="text-slate-400 text-sm mb-1">Total Grade Points</p>
              <p className="text-2xl text-neonPink font-bold">
                {results.subjectResults
                  .reduce(
                    (sum, r) => sum + r.credits * r.gradePoint,
                    0
                  )
                  .toFixed(2)}
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 glow-border">
              <p className="text-slate-400 text-sm mb-1">Final SGPA</p>
              <p className="text-3xl text-white font-bold">
                {results.sgpa.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Formula Display */}
          <div className="mt-6 p-4 bg-black/20 rounded-xl border border-white/5">
            <p className="text-slate-400 text-sm mb-2">Formula:</p>
            <p className="text-slate-300 text-sm font-mono">
              SGPA = (Σ (credit × gradePoint)) / (Σ credits)
            </p>
            <p className="text-slate-400 text-xs mt-2">
              = {results.subjectResults
                .map((r) => `${r.credits} × ${r.gradePoint}`)
                .join(" + ")}{" "}
              / {results.totalCredits}
            </p>
            <p className="text-slate-400 text-xs mt-1">
              = {results.subjectResults
                .reduce((sum, r) => sum + r.credits * r.gradePoint, 0)
                .toFixed(2)}{" "}
              / {results.totalCredits} ={" "}
              <span className="text-neonCyan font-bold">
                {results.sgpa.toFixed(2)}
              </span>
            </p>
          </div>
        </div>
      )}

      {subjects.length === 0 && (
        <div className="bg-white/5 p-8 rounded-2xl border border-white/10 text-center">
          <p className="text-slate-400">
            Add subjects with marks and credits to calculate your SGPA
          </p>
        </div>
      )}
    </div>
  );
}

