import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { quotes } from "../data/quotes";
// dayjs not needed in this component
import { getSubjects } from "../utils/attendance";
import { useXp } from "../context/XpContext";

export default function Timer() {
  const { addXp } = useXp();
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [quote, setQuote] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [focusMinutes, setFocusMinutes] = useState<number>(parseInt(localStorage.getItem("pomodoroFocus")||"25")||25);
  const [breakMinutes, setBreakMinutes] = useState<number>(parseInt(localStorage.getItem("pomodoroBreak")||"5")||5);
  const [selectedSubject, setSelectedSubject] = useState<string>(localStorage.getItem("selectedSubject")||"");
  const [subjects, setSubjects] = useState<{id:string; name:string}[]>([]);
  const [soundscape, setSoundscape] = useState<"none"|"deep"|"nebula"|"rocket">(((localStorage.getItem("soundscape") || "none") as unknown as "none"|"deep"|"nebula"|"rocket"));
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  // Load saved state
  useEffect(() => {
    const savedStart = localStorage.getItem("timerStartTime");
    const savedElapsed = localStorage.getItem("timerElapsed");
    const savedRunning = localStorage.getItem("timerIsRunning");

    if (savedElapsed) setElapsed(parseInt(savedElapsed));
    if (savedStart) setStartTime(parseInt(savedStart));
    if (savedRunning === "true") setIsRunning(true);
    setSubjects(getSubjects());
  }, []);

  // Persist state
  useEffect(() => {
    localStorage.setItem("timerElapsed", elapsed.toString());
    localStorage.setItem("timerIsRunning", isRunning.toString());
    if (startTime) localStorage.setItem("timerStartTime", startTime.toString());
    localStorage.setItem("pomodoroFocus", String(focusMinutes));
    localStorage.setItem("pomodoroBreak", String(breakMinutes));
    localStorage.setItem("selectedSubject", selectedSubject);
    localStorage.setItem("soundscape", soundscape);
  }, [elapsed, isRunning, startTime, focusMinutes, breakMinutes, selectedSubject, soundscape]);

  // Soundscapes control
  useEffect(() => {
    if (!isRunning || soundscape === "none") {
      if (oscRef.current) { oscRef.current.stop(); oscRef.current.disconnect(); oscRef.current = null; }
      return;
    }
    if (!audioCtxRef.current) {
      const AnyWindow = window as unknown as { webkitAudioContext?: typeof AudioContext } & Window;
      const Ctx = (window.AudioContext || AnyWindow.webkitAudioContext);
      audioCtxRef.current = Ctx ? new Ctx() : null;
      if (!audioCtxRef.current) return;
    }
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 0.02;
    if (soundscape === "deep") { osc.type = "sine"; osc.frequency.value = 50; }
    if (soundscape === "nebula") { osc.type = "triangle"; osc.frequency.value = 120; }
    if (soundscape === "rocket") { osc.type = "square"; osc.frequency.value = 200; }
    osc.start();
    oscRef.current = osc;
    return () => { if (oscRef.current) { oscRef.current.stop(); oscRef.current.disconnect(); oscRef.current = null; } };
  }, [isRunning, soundscape]);

  // Timer loop
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setElapsed((prev) => {
          const limit = (mode === "focus" ? focusMinutes : breakMinutes) * 60;
          let next = prev;
          if (startTime) {
            const now = Date.now();
            next = Math.floor((now - startTime) / 1000);
          } else {
            next = prev + 1;
          }
          if (next >= limit) {
            setIsRunning(false);
            setElapsed(limit);
            setTimeout(() => {
              if (mode === "focus") {
                if (limit > 0) {
                  import("../utils/studyData").then(({ addStudySession, logAction }) => {
                    addStudySession(limit, selectedSubject || undefined);
                    const subj = selectedSubject ? ` ${selectedSubject}` : "";
                    logAction(`Studied${subj} for ${(limit/60).toFixed(0)} mins (Timer)`);
                    addXp(limit); // +1 XP per minute
                  });
                }
                setMode("break");
                setElapsed(0);
                setStartTime(Date.now());
                setIsRunning(true);
              } else {
                setMode("focus");
                setElapsed(0);
                setStartTime(Date.now());
                setIsRunning(true);
              }
            }, 300);
          }
          return next;
        });
      }, 1000);
      intervalRef.current = interval;
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => { if (intervalRef.current) { clearInterval(intervalRef.current); } };
  }, [isRunning, startTime, mode, focusMinutes, breakMinutes, selectedSubject]);

  // Continue across routes
  useEffect(() => {
    const handleVisibility = () => {
      if (isRunning && startTime) {
        const now = Date.now();
        setElapsed(Math.floor((now - startTime) / 1000));
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isRunning, startTime]);

  const toggleTimer = () => {
    if (!isRunning) {
      setStartTime(Date.now() - elapsed * 1000);
      setIsRunning(true);
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    } else {
      if (isRunning && elapsed > 0) {
        const prev = localStorage.getItem("lastSaved") || "0";
        const diff = elapsed - parseInt(prev);
        if (diff > 0) {
          if (mode === "focus") {
            import("../utils/studyData").then(({ addStudySession }) => addStudySession(diff, selectedSubject || undefined));
          }
          localStorage.setItem("lastSaved", elapsed.toString());
        }
      }
      setIsRunning(false);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setElapsed(0);
    setStartTime(null);
    localStorage.removeItem("timerStartTime");
    localStorage.removeItem("timerElapsed");
    localStorage.removeItem("timerIsRunning");
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
  };

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center select-none">
      <motion.div
        className="relative w-72 h-72 flex items-center justify-center rounded-full"
        animate={{
          boxShadow: isRunning
            ? [
                "0 0 20px #ff66cc",
                "0 0 40px #a26bff",
                "0 0 60px #3fb0ff",
              ]
            : "0 0 10px rgba(255,255,255,0.05)"
        }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <svg className="absolute inset-0 -rotate-90">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff66cc" />
              <stop offset="50%" stopColor="#a26bff" />
              <stop offset="100%" stopColor="#3fb0ff" />
            </linearGradient>
          </defs>
          <circle
            cx="50%"
            cy="50%"
            r="110"
            stroke="url(#grad)"
            strokeWidth="10"
            fill="none"
            strokeDasharray={2 * Math.PI * 110}
            strokeDashoffset={
              2 * Math.PI * 110 - (elapsed % 3600) / 3600 * 2 * Math.PI * 110
            }
            style={{
              transition: "stroke-dashoffset 1s linear",
              opacity: isRunning ? 1 : 0.5,
            }}
          />
        </svg>

        <motion.div
          className="absolute w-64 h-64 rounded-full"
          animate={{
            boxShadow: isRunning
              ? [
                  "inset 0 0 40px rgba(255,102,204,0.3)",
                  "inset 0 0 50px rgba(162,107,255,0.3)",
                  "inset 0 0 60px rgba(63,176,255,0.3)",
                ]
              : "inset 0 0 20px rgba(255,255,255,0.05)"
          }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />

        <div className="z-10 flex flex-col items-center">
          <span className="text-sm text-slate-400 mb-1">{mode === "focus" ? "Focus Burst" : "Recharge Orbit"}</span>
          <span className="text-4xl font-bold gradient-text">{formatTime(elapsed)}</span>
        </div>
      </motion.div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={toggleTimer}
          className="px-6 py-2 rounded bg-white/10 hover:bg-white/20 transition btn-neon"
        >
          {isRunning ? "🚀 Pause" : "🚀 Start"}
        </button>
        <button
          onClick={resetTimer}
          className="px-6 py-2 rounded bg-white/10 hover:bg-white/20 transition btn-neon"
        >
          🪐 Reset
        </button>
      </div>

      {/* Controls */}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <div className="bg-white/5 px-3 py-2 rounded">
          <span className="text-slate-300 mr-2">Focus (min)</span>
          <input type="number" min={1} max={120} value={focusMinutes} onChange={e=>setFocusMinutes(parseInt(e.target.value)||25)} className="w-20 bg-white/10 px-2 py-1 rounded" />
        </div>
        <div className="bg-white/5 px-3 py-2 rounded">
          <span className="text-slate-300 mr-2">Break (min)</span>
          <input type="number" min={1} max={60} value={breakMinutes} onChange={e=>setBreakMinutes(parseInt(e.target.value)||5)} className="w-20 bg-white/10 px-2 py-1 rounded" />
        </div>
        <div className="bg-white/5 px-3 py-2 rounded">
          <span className="text-slate-300 mr-2">Subject</span>
          <select value={selectedSubject} onChange={e=>setSelectedSubject(e.target.value)} className="bg-white/10 px-2 py-1 rounded">
            <option value="">Unassigned</option>
            {subjects.map(s=> (<option key={s.id} value={s.name}>{s.name}</option>))}
          </select>
        </div>
        <div className="bg-white/5 px-3 py-2 rounded">
          <span className="text-slate-300 mr-2">Soundscape</span>
          <select value={soundscape} onChange={e=>setSoundscape(e.target.value as "none"|"deep"|"nebula"|"rocket")} className="bg-white/10 px-2 py-1 rounded">
            <option value="none">None</option>
            <option value="deep">Deep Space Hum</option>
            <option value="nebula">Nebula Whispers</option>
            <option value="rocket">Rocket Launch</option>
          </select>
        </div>
      </div>

      {quote && (
        <motion.p
          key={quote}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-6 text-lg text-pink-400/80 max-w-md italic"
        >
          “{quote}”
        </motion.p>
      )}
    </div>
  );
}


