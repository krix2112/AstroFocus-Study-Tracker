import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  getSubjects,
  saveSubjects,
  getTimetable,
  saveTimetable,
  getRecords,
  saveRecords,
  getActiveCycle,
  saveActiveCycle,
  type AttendanceStatus,
  type Subject,
  type Timetable,
  computeStatsFrom,
  predictionSkipable,
  predictionNeeded,
} from "../utils/attendance";
import { logAction } from "../utils/studyData";
import { useXp } from "../context/XpContext";

type Filter = "All" | "Present" | "Absent" | "Cancelled" | "Leave";

export default function Attendance() {
  const { addXp } = useXp();
  // Simple error boundary to prevent blank screen
  const [error, setError] = useState<string | null>(null);
  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-3xl font-bold gradient-text mb-4">Attendance</h2>
        <div className="bg-pink-500/10 border border-pink-500/30 p-4 rounded-xl text-pink-200">
          {error}
        </div>
        <button className="mt-4 px-4 py-2 rounded bg-white/10 hover:bg-white/20" onClick={() => setError(null)}>Try Again</button>
      </div>
    );
  }
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [timetable, setTimetable] = useState<Timetable>({});
  const [records, setRecords] = useState(getRecords());
  const [cycle, setCycle] = useState(getActiveCycle());
  const [newSubject, setNewSubject] = useState("");
  const [resourceURL, setResourceURL] = useState<string>("");
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [filter, setFilter] = useState<Filter>("All");

  useEffect(() => {
    // Hydrate from storage without immediately overwriting with empty state
    const subs = getSubjects();
    const tt = getTimetable();
    if (subs.length) setSubjects(subs);
    if (Object.keys(tt).length) setTimetable(tt);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return; // avoid saving before initial load
    saveSubjects(subjects);
  }, [subjects, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveTimetable(timetable);
  }, [timetable, hydrated]);

  useEffect(() => {
    saveRecords(records);
  }, [records]);

  useEffect(() => {
    saveActiveCycle(cycle);
  }, [cycle]);

  const weekday = dayjs(selectedDate).day();
  const daySubjects = (timetable[weekday] || []).map(id => subjects.find(s => s.id === id)).filter(Boolean) as Subject[];
  const dateRecord = records[selectedDate] || {};

  const setStatus = (subjectId: string, status: AttendanceStatus) => {
    setRecords(prev => {
      const copy = { ...prev } as any;
      copy[selectedDate] = { ...(copy[selectedDate] || {}) };
      copy[selectedDate][subjectId] = status;
      return copy;
    });
    if (status === "Present") addXp(10); // +10 XP per class present
  };

  const removeSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    // also remove from timetable slots
    setTimetable(tt => {
      const next: Timetable = { ...tt };
      Object.keys(next).forEach(k => {
        const idx = Number(k);
        next[idx] = (next[idx] || []).filter(sid => sid !== id);
      });
      return next;
    });
  };

  const addSubject = () => {
    if (!newSubject.trim()) return;
    const s: Subject = { id: crypto.randomUUID(), name: newSubject.trim(), resources: [] };
    setSubjects([...subjects, s]);
    setNewSubject("");
  };

  const toggleSlot = (weekdayIdx: number, subjectId: string) => {
    setTimetable(prev => {
      const slots = prev[weekdayIdx] || [];
      const exists = slots.includes(subjectId);
      const nextSlots = exists ? slots.filter(s => s !== subjectId) : [...slots, subjectId];
      return { ...prev, [weekdayIdx]: nextSlots };
    });
  };

  const { perSubject, totals, percent } = useMemo(() => (
    computeStatsFrom(subjects, timetable, records, cycle.start, (cycle.end || dayjs().format("YYYY-MM-DD")))
  ), [records, timetable, subjects, cycle]);

  const skipable = useMemo(() => predictionSkipable(perSubject, 75), [perSubject]);
  const needed = useMemo(() => predictionNeeded(perSubject, 75), [perSubject]);

  const pieData = useMemo(() => {
    const arr = Object.entries(perSubject).map(([sid, s]) => ({
      name: subjects.find(x => x.id === sid)?.name || sid,
      value: s.conducted ? (s.attended / Math.max(1, s.conducted)) * 100 : 0
    }));
    const safe = (Array.isArray(arr) ? arr : []).filter(d => Number.isFinite(d.value) && d.value > 0);
    return safe;
  }, [perSubject, subjects]);

  const barData = useMemo(() => {
    const arr = Object.entries(perSubject).map(([sid, s]) => ({
      name: subjects.find(x => x.id === sid)?.name || sid,
      attended: s.attended,
      conducted: s.conducted
    }));
    return Array.isArray(arr) ? arr : [];
  }, [perSubject, subjects]);

  const colors = ["#ff66cc", "#a26bff", "#3fb0ff"];

  const filteredSubjects = filter === "All" ? daySubjects : daySubjects.filter(s => (dateRecord[s.id] || "Pending") === filter);

  const clearAttendanceData = () => {
    localStorage.removeItem("att_subjects");
    localStorage.removeItem("att_timetable");
    localStorage.removeItem("att_records");
    localStorage.removeItem("att_active_cycle");
    setSubjects([]);
    setTimetable({});
    setRecords({});
    setCycle({ start: dayjs().format("YYYY-MM-DD"), end: null });
  };

  return (
    <div className="p-6 space-y-8" onErrorCapture={(e) => { setError((e as any)?.message || 'Unexpected error rendering attendance'); }}>
      <h2 className="text-3xl font-bold gradient-text">Attendance</h2>

      {/* Cycle Controls */}
      <div className="bg-white/5 p-4 rounded-2xl flex flex-col gap-3">
        <div className="flex flex-wrap gap-3 items-center">
          <div>
            <span className="text-slate-300 mr-2">Cycle Start</span>
            <input type="date" className="bg-white/10 px-2 py-1 rounded" value={cycle.start} onChange={e => setCycle({ ...cycle, start: e.target.value })} />
          </div>
          <div>
            <span className="text-slate-300 mr-2">Cycle End</span>
            <input type="date" className="bg-white/10 px-2 py-1 rounded" value={cycle.end || ""} onChange={e => setCycle({ ...cycle, end: e.target.value || null })} />
          </div>
          <button className="ml-auto px-3 py-1 rounded bg-white/10 hover:bg-white/20" onClick={() => setCycle({ start: dayjs().format("YYYY-MM-DD"), end: null })}>Start New Cycle</button>
          <button className="px-3 py-1 rounded bg-pink-500/20 hover:bg-pink-500/30" onClick={clearAttendanceData}>Reset Attendance Data</button>
        </div>
        <div className="text-slate-400 text-sm">Attendance % (current cycle): <span className="text-white">{percent.toFixed(1)}%</span></div>
      </div>

      {/* Subject Management */}
      <div className="bg-white/5 p-4 rounded-2xl">
        <h3 className="text-xl text-slate-300 mb-3">Subjects</h3>
        <div className="flex gap-2 mb-3">
          <input type="text" placeholder="Add subject" value={newSubject} onChange={e => setNewSubject(e.target.value)} className="bg-white/10 px-3 py-2 rounded outline-none w-full max-w-xs" />
          <button onClick={addSubject} className="px-4 py-2 rounded bg-white/10 hover:bg-white/20">Add</button>
        </div>
        <div className="space-y-2">
          {subjects.map(s => (
            <div key={s.id} className="p-2 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <span className="font-medium">{s.name}</span>
                <button onClick={() => removeSubject(s.id)} className="ml-auto text-pink-400">✕</button>
              </div>
              {/* Resources */}
              <div className="mt-2">
                <div className="flex gap-2 items-center">
                  <input value={resourceURL} onChange={e=>setResourceURL(e.target.value)} placeholder="Add resource URL (YouTube)" className="bg-white/10 px-2 py-1 rounded flex-1" />
                  <button onClick={()=>{
                    if (!resourceURL.trim()) return;
                    setSubjects(prev => prev.map(x => x.id===s.id ? ({...x, resources:[...(x.resources||[]), resourceURL.trim()]}) : x));
                    setResourceURL("");
                  }} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-sm">Add Link</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(s.resources||[]).map((url, idx) => (
                    <div key={idx} className="px-2 py-1 rounded bg-white/10 text-xs flex items-center gap-2">
                      <button onClick={()=>setPreviewURL(url)} className="text-cyan-300 underline">Play</button>
                      <a href={url} target="_blank" rel="noreferrer" className="underline text-slate-300">Resource {idx+1}</a>
                      <button onClick={()=> setSubjects(prev => prev.map(x=> x.id===s.id ? ({...x, resources:(x.resources||[]).filter((_,i)=>i!==idx)}) : x))} className="text-pink-400">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timetable Editor */}
      <div className="bg-white/5 p-4 rounded-2xl" onDragOver={(e)=>e.preventDefault()}>
        <h3 className="text-xl text-slate-300 mb-3">Weekly Timetable</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl border border-white/10"
              onDrop={(e)=>{
                const sid = e.dataTransfer.getData("text/subjectId");
                if (sid) toggleSlot(idx, sid);
              }}
            >
              <p className="mb-2 text-slate-300">{d}</p>
              <div className="flex flex-wrap gap-2">
                {subjects.map(s => {
                  const active = (timetable[idx] || []).includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleSlot(idx, s.id)}
                      draggable
                      onDragStart={(e)=> e.dataTransfer.setData("text/subjectId", s.id)}
                      className={`px-3 py-1 rounded ${active ? "bg-purple-500/30 border border-purple-400/40" : "bg-white/10 hover:bg-white/20"}`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mark Attendance */}
      <div className="bg-white/5 p-4 rounded-2xl">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <h3 className="text-xl text-slate-300">Mark Attendance</h3>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="bg-white/10 px-2 py-1 rounded" />
          <div className="ml-auto flex gap-2">
            {["All","Present","Absent","Cancelled","Leave"].map(f => (
              <button key={f} onClick={() => setFilter(f as Filter)} className={`px-3 py-1 rounded ${filter===f?"bg-white/20":"bg-white/10 hover:bg-white/15"}`}>{f}</button>
            ))}
          </div>
        </div>
        {/* Whole Day Leave */}
        <div className="mb-3">
          <button className="px-3 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30" onClick={()=>{
            const ids = daySubjects.map(s=>s.id);
            setRecords(prev => {
              const copy = { ...prev } as any;
              copy[selectedDate] = { ...(copy[selectedDate] || {}) };
              ids.forEach(id=> { copy[selectedDate][id] = "Leave"; });
              return copy;
            });
            logAction(`Marked whole day leave on ${selectedDate}`);
          }}>Whole Day Leave</button>
        </div>
        <div className="space-y-2">
          <AnimatePresence>
            {filteredSubjects.map(s => {
              const current = (dateRecord as any)[s.id] as AttendanceStatus | undefined;
              return (
                <motion.div key={s.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5">
                  <div className="text-white">{s.name}</div>
                  <div className="flex gap-2">
                    {([
                      ["Present","bg-green-500/30 text-green-200"],
                      ["Absent","bg-pink-500/30 text-pink-200"],
                      ["Cancelled","bg-yellow-500/30 text-yellow-200"],
                      ["Leave","bg-cyan-500/30 text-cyan-200"],
                    ] as [AttendanceStatus,string][]).map(([st, cls])=> (
                      <button key={st} onClick={() => setStatus(s.id, st)} className={`px-3 py-1 rounded ${current===st?cls:"bg-white/10 hover:bg-white/20"}`}>{st}</button>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filteredSubjects.length===0 && <p className="text-slate-500">No classes scheduled for this day or filter.</p>}
        </div>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 p-4 rounded-2xl">
          <h3 className="text-xl text-slate-300 mb-2">Subject-wise %</h3>
          <div className="w-full h-72">
            {pieData.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={110} innerRadius={60} label={({name, percent = 0}: any) => `${name} ${Math.round((percent||0)*100)}%`}>
                    {pieData.map((_, i) => (<Cell key={i} fill={colors[i % colors.length]} />))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor:"#0b0b0b", border:"1px solid #333", color:"#fff" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">No data yet</div>
            )}
          </div>
        </div>
        <div className="bg-white/5 p-4 rounded-2xl">
          <h3 className="text-xl text-slate-300 mb-2">Attended vs Conducted</h3>
          <div className="w-full h-72">
            {barData.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#aaa" tick={{ fill:'#aaa' }} />
                  <YAxis stroke="#aaa" tick={{ fill:'#aaa' }} />
                  <Tooltip contentStyle={{ backgroundColor:"#0b0b0b", border:"1px solid #333", color:"#fff" }} />
                  <Bar dataKey="attended" stackId="a" fill="#3fb0ff" />
                  <Bar dataKey="conducted" stackId="a" fill="#a26bff55" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">No data yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Player Modal with watch tracking */}
      {previewURL && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 w-[90vw] max-w-3xl">
            <div className="flex items-center mb-2">
              <div className="text-slate-300">View from Orbit</div>
              <button className="ml-auto text-pink-400" onClick={()=>setPreviewURL(null)}>Close</button>
            </div>
            <div className="aspect-video w-full">
              <VideoWithTracking url={previewURL} subjectName={subjects.find(s=> (s.resources||[]).includes(previewURL))?.name || ""} onEarn={(secs)=> addXp(Math.floor(secs))} />
            </div>
          </div>
        </div>
      )}

      {/* Predictions */}
      <div className="bg-white/5 p-4 rounded-2xl">
        <h3 className="text-xl text-slate-300 mb-3">Predictions (target 75%)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <p className="text-slate-400 mb-2">How many more classes can I skip?</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(perSubject).map(sid => (
                <div key={sid} className="px-3 py-2 rounded-xl bg-white/10">
                  <span className="text-white mr-2">{subjects.find(s=>s.id===sid)?.name || sid}</span>
                  <span className="text-cyan-300">{skipable[sid]}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-slate-400 mb-2">Classes to attend to reach 75%</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(perSubject).map(sid => (
                <div key={sid} className="px-3 py-2 rounded-xl bg-white/10">
                  <span className="text-white mr-2">{subjects.find(s=>s.id===sid)?.name || sid}</span>
                  <span className="text-pink-300">{needed[sid]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="text-slate-400 text-sm mt-3">Overall: <span className="text-white font-semibold">{percent.toFixed(1)}%</span> ({totals.attended}/{totals.conducted})</div>
      </div>
    </div>
  );
}


function VideoWithTracking({ url, subjectName, onEarn }: { url: string; subjectName: string; onEarn: (seconds: number)=>void }) {
  const [start, setStart] = useState<number | null>(null);
  const [watched, setWatched] = useState(0);
  useEffect(() => {
    setStart(Date.now());
    const tick = setInterval(()=>{
      setWatched(w => w + 1);
    }, 1000);
    return () => { clearInterval(tick); };
  }, [url]);
  useEffect(() => {
    return () => {
      const total = start ? Math.floor((Date.now() - start)/1000) : watched;
      if (total > 0) {
        import("../utils/studyData").then(({ addStudySession, logAction }) => {
          addStudySession(total, subjectName || undefined);
          onEarn(Math.floor(total/60)); // +1 XP per minute watched
          logAction(`Watched ${subjectName || "resource"} for ${(total/60).toFixed(0)} mins (Wardrobe Video)`);
        });
      }
    };
  }, [start, watched, subjectName, onEarn]);
  return (
    <iframe
      className="w-full h-full rounded-xl"
      src={url.replace("watch?v=","embed/")}
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  );
}

