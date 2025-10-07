import { useEffect, useMemo, useState } from "react";
import { getSubjects, saveSubjects, type Subject } from "../utils/attendance";
import { summarizeVideo, generateQuiz, type QuizQuestion } from "../utils/ai";

type Note = { id: string; subjectId: string; content: string };

function safeParse<T>(raw: string | null, fallback: T): T { try { return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; } }

export default function Wardrobe() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [activeSubjectId, setActiveSubjectId] = useState<string>(()=> localStorage.getItem("wardrobe_active_subject") || "");
  const [notes, setNotes] = useState<Note[]>(() => safeParse(localStorage.getItem("wardrobe_notes"), [] as Note[]));
  const [canvasData, setCanvasData] = useState<Record<string, string>>(() => safeParse(localStorage.getItem("wardrobe_canvas"), {} as Record<string,string>));
  const [resourceUrl, setResourceUrl] = useState("");
  const [summary, setSummary] = useState<string>("");
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const activeSubject = useMemo(()=> subjects.find(s=>s.id===activeSubjectId) || null, [subjects, activeSubjectId]);

  useEffect(() => { setSubjects(getSubjects()); setHydrated(true); }, []);
  useEffect(() => { if (hydrated) saveSubjects(subjects); }, [subjects, hydrated]);
  useEffect(() => { localStorage.setItem("wardrobe_active_subject", activeSubjectId); }, [activeSubjectId]);
  useEffect(() => { localStorage.setItem("wardrobe_notes", JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem("wardrobe_canvas", JSON.stringify(canvasData)); }, [canvasData]);

  const addNote = () => {
    if (!activeSubjectId) return;
    setNotes(prev => [{ id: crypto.randomUUID(), subjectId: activeSubjectId, content: "" }, ...prev]);
  };

  const subjectNotes = notes.filter(n => n.subjectId === activeSubjectId);

  const addResource = () => {
    if (!activeSubject || !resourceUrl.trim()) return;
    const updated = subjects.map(s => s.id===activeSubject.id ? ({ ...s, resources: [ ...(s.resources||[]), resourceUrl.trim() ] }) : s);
    setSubjects(updated);
    setResourceUrl("");
  };

  const handleSummarize = async (url: string) => {
    const text = await summarizeVideo(url);
    setSummary(text);
  };

  const handleQuiz = async (url: string) => {
    const items = await generateQuiz(url);
    setQuiz(items);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold gradient-text heading-neon">Wardrobe</h2>

      <div className="bg-white/5 p-4 rounded-2xl">
        <h3 className="text-xl text-slate-300 mb-3">Subjects</h3>
        <div className="flex flex-wrap gap-2">
          {subjects.map(s => (
            <button key={s.id} onClick={()=> setActiveSubjectId(s.id)} className={`px-3 py-1 rounded ${activeSubjectId===s.id?"bg-purple-500/30 border border-purple-400/40":"bg-white/10 hover:bg-white/20"}`}>{s.name}</button>
          ))}
        </div>
      </div>

      {activeSubject && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 p-4 rounded-2xl">
            <h3 className="text-xl text-slate-300 mb-3">Notes & Concepts</h3>
            <button onClick={addNote} className="mb-3 px-3 py-1 rounded btn-neon">+ New Note</button>
            <div className="space-y-3">
              {subjectNotes.map(n => (
                <textarea key={n.id} value={n.content} onChange={e=> setNotes(prev=> prev.map(x=> x.id===n.id?{...x, content:e.target.value}:x))} className="w-full min-h-28 bg-white/10 p-2 rounded" placeholder="Write markdown or plain text..." />
              ))}
              {subjectNotes.length===0 && <p className="text-slate-500">No notes yet.</p>}
            </div>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl">
            <h3 className="text-xl text-slate-300 mb-3">Flowchart / Diagram</h3>
            <canvas id="wardrobe-canvas" width={600} height={360} className="w-full bg-black/40 rounded"></canvas>
            <div className="mt-2 flex gap-2">
              <button className="px-3 py-1 rounded btn-neon" onClick={()=> setCanvasData(prev=> ({...prev, [activeSubjectId]: (document.getElementById("wardrobe-canvas") as HTMLCanvasElement)?.toDataURL() || ""}))}>Save Diagram</button>
              <button className="px-3 py-1 rounded btn-neon" onClick={()=> {
                const url = canvasData[activeSubjectId];
                if (!url) return;
                const img = new Image();
                img.onload = () => {
                  const c = document.getElementById("wardrobe-canvas") as HTMLCanvasElement;
                  const ctx = c.getContext("2d");
                  if (!ctx) return;
                  ctx.clearRect(0,0,c.width,c.height);
                  ctx.drawImage(img,0,0,c.width,c.height);
                };
                img.src = url;
              }}>Load Saved</button>
            </div>
          </div>
        </div>
      )}

      {activeSubject && (
        <div className="bg-white/5 p-4 rounded-2xl">
          <h3 className="text-xl text-slate-300 mb-3">Files & Resources</h3>
          <div className="flex gap-2 mb-2">
            <input value={resourceUrl} onChange={e=>setResourceUrl(e.target.value)} placeholder="https://youtube.com/... or any file URL" className="flex-1 bg-white/10 px-3 py-2 rounded" />
            <button onClick={addResource} className="px-3 py-2 rounded btn-neon">Add</button>
            <button onClick={()=>{ if(resourceUrl) handleSummarize(resourceUrl); }} className="px-3 py-2 rounded btn-neon">AI Summarize</button>
            <button onClick={()=>{ if(resourceUrl) handleQuiz(resourceUrl); }} className="px-3 py-2 rounded btn-neon">AI Quiz</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(activeSubject.resources||[]).map((url, i)=> (
              <a key={i} href={url} target="_blank" rel="noreferrer" className="underline text-cyan-300">Resource {i+1}</a>
            ))}
          </div>
          {summary && (
            <div className="mt-4 p-3 bg-white/5 rounded border border-white/10">
              <h4 className="font-semibold text-slate-300 mb-2">AI Summary</h4>
              <p className="text-slate-200 text-sm whitespace-pre-wrap">{summary}</p>
            </div>
          )}
          {quiz.length>0 && (
            <div className="mt-4 p-3 bg-white/5 rounded border border-white/10">
              <h4 className="font-semibold text-slate-300 mb-2">AI Quiz</h4>
              <Quiz items={quiz} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Quiz({ items }: { items: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const correct = items.filter(q => (answers[q.id]||"").trim().toLowerCase() === q.answer.trim().toLowerCase()).length;
  return (
    <div className="space-y-3">
      {items.map((q, idx) => (
        <div key={q.id} className="p-2 rounded bg-white/5">
          <div className="text-slate-200 text-sm mb-1">{idx+1}. {q.question}</div>
          {q.type === "mcq" ? (
            <div className="flex flex-col gap-1">
              {(q.options||[]).map(opt => (
                <label key={opt} className="text-sm text-slate-300 flex items-center gap-2">
                  <input type="radio" name={q.id} value={opt} onChange={e=> setAnswers(prev=> ({...prev, [q.id]: e.target.value}))} />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          ) : (
            <input className="bg-white/10 px-2 py-1 rounded text-sm w-full" placeholder="Your answer" onChange={e=> setAnswers(prev=> ({...prev, [q.id]: e.target.value}))} />
          )}
          {submitted && (
            <div className="text-xs mt-1">
              <span className="text-slate-400">Answer: </span>
              <span className="text-cyan-300">{q.answer}</span>
            </div>
          )}
        </div>
      ))}
      <div className="flex items-center gap-3">
        <button className="px-3 py-1 rounded btn-neon" onClick={()=> setSubmitted(true)}>Submit</button>
        {submitted && <div className="text-slate-300 text-sm">Score: <span className="text-neonPink">{correct}/{items.length}</span></div>}
      </div>
    </div>
  );
}


