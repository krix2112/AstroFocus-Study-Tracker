import { useEffect, useMemo, useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useXp } from "../context/XpContext";
import dayjs from "dayjs";
import { getStudyHistory, getWeeklyData, getWeeklyTotals, getStudyStreak, getPerSubjectHistory, getRecentActions } from "../utils/studyData";
import { getMonthMatrix, isHoliday, getCustomHolidays, setCustomHolidays } from "../utils/holidays";
import { quotes } from "../data/quotes";

export default function Dashboard() {
  const { xp, level, nextLevelXp, currentLevelFloorXp } = useXp();
  const [data, setData] = useState<any[]>([]);
  const [weekly, setWeekly] = useState<any[]>([]);
  const [northStar, setNorthStar] = useState<string>(localStorage.getItem("northStarGoal") || "");
  const [northStarList, setNorthStarList] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("northStarList")||"[]"); } catch { return []; }
  });
  const [quote, setQuote] = useState<string>("");
  const [targetGPA, setTargetGPA] = useState<string>(localStorage.getItem("targetGPA") || "");
  const [currentGPA, setCurrentGPA] = useState<string>(localStorage.getItem("currentGPA") || "");
  const [calendarYM, setCalendarYM] = useState<{y:number;m:number}>({ y: dayjs().year(), m: dayjs().month() });
  const [customHolidays, setCustomH] = useState<string[]>(getCustomHolidays());

  useEffect(() => {
    const hist = getStudyHistory();
    const arr = Object.entries(hist).map(([date, secs]) => ({
      date,
      count: Math.floor((Number(secs) || 0) / 60) // convert to minutes
    }));
    setData(arr);
    setWeekly(getWeeklyData());
    setQuote(quotes[Math.floor(Math.random()*quotes.length)]);
  }, []);

  const colors = ["#3fb0ff","#a26bff","#ff66cc"];
  const max = Math.max(...data.map(d=>d.count),1);

  const weeklyTotals = useMemo(() => getWeeklyTotals(), [data]);
  const streak = useMemo(() => getStudyStreak(), [data]);
  const todayMins = Math.floor((parseInt(localStorage.getItem("studyTime")||"0")||0)/60);
  const perSubject = useMemo(() => getPerSubjectHistory(), [data]);
  const todayISO = dayjs().format("YYYY-MM-DD");
  const todaySubjects = Object.entries(perSubject[todayISO] || {}).sort((a,b)=>b[1]-a[1]);
  const recent = useMemo(()=> getRecentActions(5), [data]);

  return (
    <div className="p-6 text-center">
      <h2 className="text-3xl font-bold gradient-text mb-6">Stellar Mission Control</h2>

      {/* North Star Goal */}
      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 mb-6 text-left">
        <p className="text-slate-400 text-sm mb-2">North Star Goal</p>
        <div className="flex gap-3 items-center">
          <input
            value={northStar}
            onChange={(e)=>{ setNorthStar(e.target.value); }}
            placeholder="e.g., Finish Thesis, Ace Calculus"
            className="bg-white/10 px-3 py-2 rounded outline-none flex-1"
          />
          <button
            className="px-3 py-2 rounded btn-neon"
            onClick={() => {
              if (!northStar.trim()) return;
              localStorage.setItem("northStarGoal", northStar.trim());
              const next = Array.from(new Set([northStar.trim(), ...northStarList])).slice(0, 10);
              setNorthStarList(next);
              localStorage.setItem("northStarList", JSON.stringify(next));
            }}
          >
            +
          </button>
        </div>
        {northStarList.length>0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {northStarList.map((g,i)=> (
              <div key={i} className="px-3 py-1 rounded-full bg-white/10 flex items-center gap-2">
                <button
                  className="text-cyan-300 underline"
                  onClick={() => { setNorthStar(g); localStorage.setItem("northStarGoal", g); }}
                >
                  Set
                </button>
                <span>{g}</span>
                <button
                  className="text-pink-400"
                  onClick={() => {
                    const next = northStarList.filter(x=>x!==g);
                    setNorthStarList(next);
                    localStorage.setItem("northStarList", JSON.stringify(next));
                  }}
                >✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-left">
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
          <p className="text-slate-400 text-sm">Planetary Alignment (Today)</p>
          <p className="text-2xl text-white">{todayMins} min</p>
          {todaySubjects.length>0 && (
            <p className="text-sm text-slate-400 mt-1">Focus: <span className="text-neonCyan">{todaySubjects[0][0]}</span></p>
          )}
        </div>
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
          <p className="text-slate-400 text-sm">Orbital Cycle</p>
          <p className="text-2xl text-neonPink">{streak} days</p>
        </div>
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
          <p className="text-slate-400 text-sm">This Week</p>
          <p className="text-2xl text-neonCyan">{weeklyTotals.reduce((a,b)=>a+b.minutes,0)} min</p>
        </div>
      </div>

      {/* Level Card */}
      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 mb-6 text-left">
        <p className="text-slate-400 text-sm mb-2">Stellar Rank</p>
        <div className="flex items-end gap-4">
          <div className="text-3xl text-neonPink">Level {level}</div>
          <div className="text-slate-300">XP: <span className="text-neonCyan">{xp}</span></div>
        </div>
        <div className="mt-3 h-3 w-full rounded-full bg-black/40 overflow-hidden">
          <div
            className="h-full"
            style={{
              width: `${Math.min(100, ((xp - currentLevelFloorXp) / Math.max(1, (nextLevelXp - currentLevelFloorXp))) * 100)}%`,
              background: "linear-gradient(90deg,#FF00FF,#00FFFF)",
              boxShadow: "0 0 10px #FF00FF, 0 0 14px #00FFFF",
            }}
          />
        </div>
      </div>

      {/* GPA Target & Trajectory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-left">
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
          <p className="text-slate-400 text-sm mb-2">North Star Target (GPA)</p>
          <div className="flex gap-3 items-center">
            <input value={targetGPA} onChange={(e)=>{ setTargetGPA(e.target.value); localStorage.setItem("targetGPA", e.target.value); }} placeholder="e.g., 3.8" className="bg-white/10 px-3 py-2 rounded outline-none w-40" />
            <span className="text-slate-400 text-sm">Current</span>
            <input value={currentGPA} onChange={(e)=>{ setCurrentGPA(e.target.value); localStorage.setItem("currentGPA", e.target.value); }} placeholder="e.g., 3.4" className="bg-white/10 px-3 py-2 rounded outline-none w-40" />
          </div>
        </div>
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
          <p className="text-slate-400 text-sm mb-2">Trajectory Forecast</p>
          {Number(currentGPA)||Number(targetGPA) ? (
            <div className="text-2xl">
              <span className="text-neonCyan">Current:</span> {currentGPA || "—"}
              <span className="mx-3 text-slate-500">/</span>
              <span className="text-neonPink">Target:</span> {targetGPA || "—"}
              <div className="text-slate-300 text-sm mt-1">Distance to Target: <span className="text-white">{(Number(targetGPA||0) - Number(currentGPA||0)).toFixed(2)}</span></div>
            </div>
          ) : (
            <div className="text-slate-500">Enter your current and target GPA to see distance to target.</div>
          )}
        </div>
      </div>

      {/* Mission Briefing */}
      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 mb-6 text-left">
        <h3 className="text-xl mb-2 text-slate-300">Mission Briefing</h3>
        {todaySubjects.length>0 ? (
          <ul className="list-disc pl-5 text-slate-300">
            {todaySubjects.slice(0,3).map(([name, secs])=> (
              <li key={name}>{name} — {(secs/60).toFixed(0)} min planned/studied</li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500">No alignment set. Add subjects to your timetable or start a Focus Burst.</p>
        )}
      </div>
      <div className="bg-white/5 p-6 rounded-2xl mb-10">
        <h3 className="text-xl mb-2 text-slate-300">Daily Heatmap</h3>
        <CalendarHeatmap
          startDate={dayjs().subtract(90,"day").format("YYYY-MM-DD")}
          endDate={dayjs().format("YYYY-MM-DD")}
          values={data}
          classForValue={(v: any) => {
            if (!v) return "color-empty";
            const idx = Math.min(2, Math.floor(((v.count||0)/max)*3));
            return `color-scale-${idx}`;
          }}
          tooltipDataAttrs={(value: any) => {
            const subjects = perSubject[value.date] || {};
            const top = Object.entries(subjects).sort((a:any,b:any)=> (b[1] as number)-(a[1] as number))[0];
            const topText = top ? ` • Top: ${top[0]}` : "";
            return { "data-tip": `${value.date || "No date"}: ${value.count || 0} min${topText}` };
          }}
        />
        <style>{`
          .react-calendar-heatmap .color-scale-0 { fill: #3fb0ff22; }
          .react-calendar-heatmap .color-scale-1 { fill: #a26bff55; }
          .react-calendar-heatmap .color-scale-2 { fill: #ff66cc88; }
          .react-calendar-heatmap .color-empty { fill: #222; }
        `}</style>
      </div>
      {/* Weekly Totals */}
      <div className="bg-white/5 p-6 rounded-2xl mt-10">
        <h3 className="text-xl mb-2 text-slate-300">Weekly Minutes</h3>
        <div className="w-full h-64">
          <ResponsiveContainer>
            <BarChart data={weeklyTotals}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#aaa" tick={{ fill:'#aaa' }} />
              <YAxis stroke="#aaa" tick={{ fill:'#aaa' }} />
              <Tooltip contentStyle={{ backgroundColor:"#0b0b0b", border:"1px solid #333", color:"#fff" }} />
              <Bar dataKey="minutes" fill="#ffd166" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Distribution */}
      <div className="bg-white/5 p-6 rounded-2xl mt-6">
        <h3 className="text-xl mb-2 text-slate-300">Weekly Distribution</h3>
        <div className="w-full h-64">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={weekly}
                dataKey="seconds"
                nameKey="name"
                outerRadius={100}
                innerRadius={50}
                paddingAngle={5}
                labelLine={false}
                label={false}
              >
                {weekly.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor:"#0b0b0b",
                  border:"1px solid #333",
                  color:"#fff"
                }}
              />
              {/* Legend to avoid label overlap */}
              {/* Simple inline legend */}
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-3 text-sm text-slate-300">
            {weekly.map((w,i)=>(
              <div key={i} className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: colors[i % colors.length] }} />
                <span>{w.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Study Timeline */}
      <div className="bg-white/5 p-4 rounded-2xl mt-6 text-left">
        <h3 className="text-xl mb-2 text-slate-300">Study Timeline</h3>
        {recent.length>0 ? (
          <ul className="space-y-1">
            {recent.map(it => (
              <li key={it.id} className="text-slate-300 text-sm">{dayjs(it.at).format("DD MMM HH:mm")} — {it.text}</li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500">No actions yet.</p>
        )}
      </div>

      {/* Indian Calendar with Holidays */}
      <div className="bg-white/5 p-4 rounded-2xl mt-6 text-left">
        <div className="flex items-center mb-2">
          <h3 className="text-xl text-slate-300">Calendar</h3>
          <div className="ml-auto flex items-center gap-2">
            <button className="px-2 py-1 btn-neon rounded" onClick={()=> setCalendarYM(v=> ({ y: dayjs().year(v.y).month(v.m).subtract(1,'month').year(), m: dayjs().year(v.y).month(v.m).subtract(1,'month').month() }))}>{"<"}</button>
            <div className="text-slate-400">{dayjs().year(calendarYM.y).month(calendarYM.m).format("MMMM YYYY")}</div>
            <button className="px-2 py-1 btn-neon rounded" onClick={()=> setCalendarYM(v=> ({ y: dayjs().year(v.y).month(v.m).add(1,'month').year(), m: dayjs().year(v.y).month(v.m).add(1,'month').month() }))}>{">"}</button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 mb-1">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=> (<div key={d}>{d}</div>))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {getMonthMatrix(calendarYM.y, calendarYM.m).map(d => {
            const holiday = isHoliday(d);
            const inMonth = dayjs(d).month() === calendarYM.m;
            return (
              <button
                key={d}
                className={`p-2 rounded text-xs ${inMonth?"":"opacity-40"} ${holiday?"bg-pink-500/20 border border-pink-400/30":"bg-white/5"}`}
                onClick={()=>{
                  const arr = customHolidays.includes(d) ? customHolidays.filter(x=>x!==d) : [...customHolidays, d];
                  setCustomH(arr); setCustomHolidays(arr);
                }}
                title={holiday?"Holiday": "Toggle custom holiday"}
              >
                {dayjs(d).date()}
              </button>
            );
          })}
        </div>
        <div className="text-slate-500 text-xs mt-2">Pink days are holidays (static/custom). Attendance excludes them.</div>
      </div>

      {/* Inspiration */}
      <div className="mt-8 text-slate-300 italic">“{quote}”</div>
    </div>
  )
}


