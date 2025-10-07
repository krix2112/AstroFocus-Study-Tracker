import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import { getAssignments, saveAssignments } from "../utils/assignments";
import { logAction } from "../utils/studyData";
import { useXp } from "../context/XpContext";
import { getSubjects as subjectsFromStorage } from "../utils/attendance";

interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: "Pending" | "Done";
  priority?: "High" | "Medium" | "Low";
  subtasks?: { id: string; title: string; done: boolean }[];
}

export default function Assignments() {
  const { addXp } = useXp();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [form, setForm] = useState({ title: "", subject: "", dueDate: "", priority: "Medium" as "High"|"Medium"|"Low" });
  const [filter, setFilter] = useState<"All" | "Pending" | "Done">("All");

  useEffect(() => {
    setAssignments(getAssignments());
  }, []);

  useEffect(() => {
    saveAssignments(assignments);
  }, [assignments]);

  const addAssignment = () => {
    if (!form.title || !form.dueDate) return;
    const newAssign: Assignment = {
      id: crypto.randomUUID(),
      title: form.title,
      subject: form.subject,
      dueDate: form.dueDate,
      priority: form.priority,
      status: "Pending",
      subtasks: [],
    };
    setAssignments([...assignments, newAssign]);
    setForm({ title: "", subject: "", dueDate: "", priority: "Medium" });
    logAction(`Added assignment: ${newAssign.title}`);
  };

  const toggleStatus = (id: string) => {
    setAssignments(assignments.map(a => {
      if (a.id !== id) return a;
      const nextStatus = a.status === "Pending" ? "Done" : "Pending";
      if (nextStatus === "Done") addXp(50); // +50 XP per completed assignment
      return { ...a, status: nextStatus };
    }));
    const a = assignments.find(x=>x.id===id);
    if (a) logAction(`${a.status === "Pending" ? "Completed" : "Reopened"}: ${a.title} (Assignments)`);
  };

  const removeAssignment = (id: string) => {
    const a = assignments.find(x=>x.id===id);
    setAssignments(assignments.filter(a => a.id !== id));
    if (a) logAction(`Deleted assignment: ${a.title}`);
  };

  const addSubtask = (id: string, title: string) => {
    if (!title.trim()) return;
    setAssignments(prev => prev.map(a => a.id===id ? ({
      ...a,
      subtasks: [ ...(a.subtasks||[]), { id: crypto.randomUUID(), title: title.trim(), done: false } ]
    }) : a));
  };

  const toggleSubtask = (id: string, subId: string) => {
    setAssignments(prev => prev.map(a => a.id===id ? ({
      ...a,
      subtasks: (a.subtasks||[]).map(s => s.id===subId ? ({...s, done: !s.done}) : s)
    }) : a));
  };

  const getUrgencyColor = (date: string) => {
    const days = dayjs(date).diff(dayjs(), "day");
    if (days < 0) return "text-pink-500"; // overdue
    if (days <= 2) return "text-yellow-400"; // due soon
    return "text-green-400"; // plenty of time
  };

  const filtered = assignments.filter(a =>
    filter === "All" ? true : a.status === filter
  );

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold gradient-text mb-6">Assignments</h2>

      {/* Add Form */}
      <div className="bg-white/5 p-6 rounded-2xl mb-6">
        <h3 className="text-xl text-slate-300 mb-4">Add New Assignment</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="bg-white/10 px-3 py-2 rounded outline-none"
          />
          <input
            type="text"
            placeholder="Subject"
            value={form.subject}
            onChange={e => setForm({ ...form, subject: e.target.value })}
            className="bg-white/10 px-3 py-2 rounded outline-none"
          />
          <input
            type="date"
            value={form.dueDate}
            onChange={e => setForm({ ...form, dueDate: e.target.value })}
            className="bg-white/10 px-3 py-2 rounded outline-none"
          />
        </div>
        <div className="mt-3">
          <span className="text-slate-300 mr-2">Gravity Well</span>
          <select value={form.priority} onChange={e=>setForm({...form, priority: e.target.value as any})} className="bg-white/10 px-3 py-2 rounded">
            <option value="High">High (Black Hole)</option>
            <option value="Medium">Medium (Planet)</option>
            <option value="Low">Low (Star)</option>
          </select>
        </div>
        <button
          onClick={addAssignment}
          className="mt-4 px-6 py-2 rounded bg-white/10 hover:bg-white/20 transition"
        >
          ➕ Add Assignment
        </button>
      </div>

      {/* Filters */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl text-slate-300">Your Tasks</h3>
        <div className="flex gap-2">
          {["All", "Pending", "Done"].map(opt => (
            <button
              key={opt}
              onClick={() => setFilter(opt as any)}
              className={`px-3 py-1 rounded ${
                filter === opt ? "bg-white/20" : "bg-white/5 hover:bg-white/10"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Assignment List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map(a => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white/5 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center border border-white/10 hover:border-white/20 transition"
            >
              <div>
                <p className="text-lg font-semibold">{a.title}</p>
                {a.subject && <p className="text-slate-400 text-sm">{a.subject}</p>}
                {a.priority && (
                  <p className="text-xs text-slate-400 mt-1">
                    Priority: {a.priority === "High" ? "🕳️ Black Hole" : a.priority === "Medium" ? "🪐 Planet" : "⭐ Star"}
                  </p>
                )}
                <p className={`text-sm ${getUrgencyColor(a.dueDate)}`}>
                  Due: {dayjs(a.dueDate).format("DD MMM YYYY")}
                </p>

                {/* Subtasks */}
                <div className="mt-2 space-y-1">
                  {(a.subtasks||[]).map(st => (
                    <label key={st.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={st.done} onChange={()=>toggleSubtask(a.id, st.id)} />
                      <span className={st.done?"line-through text-slate-500":""}>{st.title}</span>
                    </label>
                  ))}
                  <SubtaskInput onAdd={(title)=>addSubtask(a.id, title)} />
                </div>
              </div>

              <div className="flex gap-3 mt-3 sm:mt-0">
                <button
                  onClick={() => toggleStatus(a.id)}
                  className={`px-4 py-1 rounded ${
                    a.status === "Done"
                      ? "bg-green-500/30 text-green-300"
                      : "bg-yellow-500/20 text-yellow-300"
                  }`}
                >
                  {a.status === "Done" ? "🚀 Mission Accomplished!" : "🛰️ In Orbit"}
                </button>
                {/* Play resource if provided */}
                {a.subject && (
                  <a
                    href={(subjectsFromStorage().find(s=>s.name===a.subject)?.resources||[])[0] || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-1 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition"
                  >
                    ▶ Play
                  </a>
                )}
                <button
                  onClick={() => removeAssignment(a.id)}
                  className="px-4 py-1 rounded bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 transition"
                >
                  🗑 Delete
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <p className="text-slate-500 mt-4">No assignments found.</p>
        )}
      </div>
    </div>
  );
}

function SubtaskInput({ onAdd }: { onAdd: (title: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="flex gap-2 mt-1">
      <input value={val} onChange={e=>setVal(e.target.value)} placeholder="Add subtask" className="bg-white/10 px-2 py-1 rounded text-sm" />
      <button onClick={()=>{ onAdd(val); setVal(""); }} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-sm">Add</button>
    </div>
  );
}


