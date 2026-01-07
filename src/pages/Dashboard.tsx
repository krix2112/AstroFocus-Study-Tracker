import { useEffect, useMemo, useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useXp } from "../context/XpContext";
import { useAuth } from "../context/AuthContext";
import dayjs from "dayjs";
import { getStudyHistory, getWeeklyData, getWeeklyTotals, getStudyStreak, getPerSubjectHistory, getRecentActions } from "../utils/studyData";
import { getMonthMatrix, isHoliday, getCustomHolidays, setCustomHolidays } from "../utils/holidays";
import { quotes } from "../data/quotes";
import PremiumCard from "../components/PremiumCard";
import MetricCard from "../components/MetricCard";
import { HiClock, HiFire, HiTrendingUp, HiAcademicCap } from "react-icons/hi";

export default function Dashboard() {
  const auth = useAuth();
  const user = auth?.user || null;
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

  const colors = ["var(--accent-cyan)","var(--accent-violet)","var(--accent-pink)"];
  const max = Math.max(...data.map(d=>d.count),1);

  const weeklyTotals = useMemo(() => getWeeklyTotals(), [data]);
  const streak = useMemo(() => getStudyStreak(), [data]);
  const todayMins = Math.floor((parseInt(localStorage.getItem("studyTime")||"0")||0)/60);
  const perSubject = useMemo(() => getPerSubjectHistory(), [data]);
  const todayISO = dayjs().format("YYYY-MM-DD");
  const todaySubjects = Object.entries(perSubject[todayISO] || {}).sort((a,b)=>b[1]-a[1]);
  const recent = useMemo(()=> getRecentActions(5), [data]);


  return (
    <div className="space-y-6 animate-fade-in">
      {/* Mission Control Header */}
      <div className="space-y-4">
        {user?.student_name && (
          <PremiumCard accent="cyan" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gradient-cyan mb-1">
                  Welcome, {user.student_name}!
                </h1>
                {user.admission_no && (
                  <p className="text-text-secondary text-sm">Admission No: {user.admission_no}</p>
                )}
              </div>
            </div>
          </PremiumCard>
        )}
        <div>
          <h2 className="text-4xl font-bold gradient-onestop mb-2">Mission Control</h2>
          <p className="text-text-tertiary">Your academic command center</p>
        </div>
      </div>

      {/* North Star Goal */}
      <PremiumCard accent="violet" className="p-6">
        <p className="text-text-tertiary text-sm font-medium mb-3">North Star Goal</p>
        <div className="flex gap-3 items-center">
          <input
            value={northStar}
            onChange={(e)=>{ setNorthStar(e.target.value); }}
            placeholder="e.g., Finish Thesis, Ace Calculus"
            className="bg-surface px-4 py-2.5 rounded-lg outline-none flex-1 text-text-primary placeholder-text-tertiary border border-border focus:border-accent-violet focus:ring-2 focus:ring-accent-violet/20 transition-all"
          />
          <button
            className="px-4 py-2.5 rounded-lg btn-premium btn-accent-violet"
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
          <div className="mt-4 flex flex-wrap gap-2">
            {northStarList.map((g,i)=> (
              <div key={i} className="px-3 py-1.5 rounded-full bg-surface border border-border flex items-center gap-2 text-sm">
                <button
                  className="text-accent-cyan hover:underline"
                  onClick={() => { setNorthStar(g); localStorage.setItem("northStarGoal", g); }}
                >
                  Set
                </button>
                <span className="text-text-secondary">{g}</span>
                <button
                  className="text-accent-pink hover:text-accent-pink/80"
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
      </PremiumCard>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Today's Focus"
          value={`${todayMins} min`}
          subtitle={todaySubjects.length > 0 ? `Focus: ${todaySubjects[0][0]}` : "Start your session"}
          icon={<HiClock className="w-6 h-6" />}
          accent="cyan"
        />
        <MetricCard
          label="Study Streak"
          value={`${streak} days`}
          subtitle="Keep the momentum going"
          icon={<HiFire className="w-6 h-6" />}
          accent="pink"
        />
        <MetricCard
          label="This Week"
          value={`${weeklyTotals.reduce((a,b)=>a+b.minutes,0)} min`}
          subtitle="Total study time"
          icon={<HiTrendingUp className="w-6 h-6" />}
          accent="violet"
        />
      </div>

      {/* Level Card */}
      <PremiumCard accent="pink" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-text-tertiary text-sm font-medium mb-1">Academic Rank</p>
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-bold text-gradient-pink">Level {level}</div>
              <div className="text-text-secondary">XP: <span className="text-accent-cyan font-semibold">{xp}</span></div>
            </div>
          </div>
          <HiAcademicCap className="w-8 h-8 text-accent-pink opacity-60" />
        </div>
        <div className="mt-4 h-3 w-full rounded-full bg-surface overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, ((xp - currentLevelFloorXp) / Math.max(1, (nextLevelXp - currentLevelFloorXp))) * 100)}%`,
              background: "linear-gradient(90deg, var(--accent-pink), var(--accent-cyan))",
              boxShadow: "0 0 20px rgba(236, 72, 153, 0.4), 0 0 30px rgba(0, 217, 255, 0.3)",
            }}
          />
        </div>
        <p className="text-text-tertiary text-xs mt-2">
          {nextLevelXp - xp} XP until Level {level + 1}
        </p>
      </PremiumCard>

      {/* GPA Target & Trajectory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PremiumCard accent="blue" className="p-6">
          <p className="text-text-tertiary text-sm font-medium mb-3">GPA Target</p>
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <label className="text-xs text-text-tertiary mb-1 block">Target</label>
              <input 
                value={targetGPA} 
                onChange={(e)=>{ setTargetGPA(e.target.value); localStorage.setItem("targetGPA", e.target.value); }} 
                placeholder="e.g., 3.8" 
                className="bg-surface px-3 py-2 rounded-lg outline-none w-full text-text-primary placeholder-text-tertiary border border-border focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all" 
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-text-tertiary mb-1 block">Current</label>
              <input 
                value={currentGPA} 
                onChange={(e)=>{ setCurrentGPA(e.target.value); localStorage.setItem("currentGPA", e.target.value); }} 
                placeholder="e.g., 3.4" 
                className="bg-surface px-3 py-2 rounded-lg outline-none w-full text-text-primary placeholder-text-tertiary border border-border focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all" 
              />
            </div>
          </div>
        </PremiumCard>
        <PremiumCard accent="cyan" className="p-6">
          <p className="text-text-tertiary text-sm font-medium mb-3">Trajectory Forecast</p>
          {Number(currentGPA)||Number(targetGPA) ? (
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-text-secondary text-sm">Current:</span>
                <span className="text-3xl font-bold text-accent-cyan">{currentGPA || "—"}</span>
                <span className="text-text-tertiary">/</span>
                <span className="text-text-secondary text-sm">Target:</span>
                <span className="text-3xl font-bold text-accent-pink">{targetGPA || "—"}</span>
              </div>
              <div className="text-text-secondary text-sm">
                Distance to Target: <span className="text-text-primary font-semibold">{(Number(targetGPA||0) - Number(currentGPA||0)).toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <div className="text-text-tertiary">Enter your current and target GPA to see distance to target.</div>
          )}
        </PremiumCard>
      </div>

      {/* Mission Briefing */}
      <PremiumCard accent="violet" className="p-6">
        <h3 className="text-xl font-bold mb-4 text-text-primary">Mission Briefing</h3>
        {todaySubjects.length>0 ? (
          <ul className="space-y-2">
            {todaySubjects.slice(0,3).map(([name, secs])=> (
              <li key={name} className="flex items-center justify-between text-text-secondary">
                <span>{name}</span>
                <span className="text-accent-cyan font-medium">{(secs/60).toFixed(0)} min</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-tertiary">No alignment set. Add subjects to your timetable or start a Focus session.</p>
        )}
      </PremiumCard>
      <PremiumCard className="p-6">
        <h3 className="text-xl font-bold mb-4 text-text-primary">Daily Heatmap</h3>
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
          .react-calendar-heatmap .color-scale-0 { fill: rgba(0, 217, 255, 0.15); }
          .react-calendar-heatmap .color-scale-1 { fill: rgba(0, 217, 255, 0.4); }
          .react-calendar-heatmap .color-scale-2 { fill: rgba(0, 217, 255, 0.7); }
        `}</style>
      </PremiumCard>
      {/* Weekly Totals */}
      <PremiumCard accent="cyan" className="p-6">
        <h3 className="text-xl font-bold mb-4 text-text-primary">Weekly Minutes</h3>
        <div className="w-full h-64">
          <ResponsiveContainer>
            <BarChart data={weeklyTotals}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
              <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "var(--bg-secondary)", 
                  border: "1px solid var(--border)", 
                  color: "var(--text-primary)",
                  borderRadius: "8px"
                }} 
              />
              <Bar dataKey="minutes" fill="var(--accent-cyan)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </PremiumCard>

      {/* Weekly Distribution */}
      <PremiumCard accent="violet" className="p-6">
        <h3 className="text-xl font-bold mb-4 text-text-primary">Weekly Distribution</h3>
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
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  borderRadius: "8px"
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
      </PremiumCard>

      {/* Study Timeline */}
      <PremiumCard accent="pink" className="p-6">
        <h3 className="text-xl font-bold mb-4 text-text-primary">Study Timeline</h3>
        {recent.length>0 ? (
          <ul className="space-y-2">
            {recent.map(it => (
              <li key={it.id} className="flex items-center justify-between text-text-secondary text-sm py-1 border-b border-border last:border-0">
                <span>{dayjs(it.at).format("DD MMM HH:mm")}</span>
                <span className="text-text-primary">{it.text}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-tertiary">No actions yet.</p>
        )}
      </PremiumCard>

      {/* Indian Calendar with Holidays */}
      <PremiumCard accent="blue" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-text-primary">Calendar</h3>
          <div className="ml-auto flex items-center gap-2">
            <button className="px-3 py-1.5 btn-premium rounded-lg" onClick={()=> setCalendarYM(v=> ({ y: dayjs().year(v.y).month(v.m).subtract(1,'month').year(), m: dayjs().year(v.y).month(v.m).subtract(1,'month').month() }))}>{"<"}</button>
            <div className="text-text-primary font-medium px-4">{dayjs().year(calendarYM.y).month(calendarYM.m).format("MMMM YYYY")}</div>
            <button className="px-3 py-1.5 btn-premium rounded-lg" onClick={()=> setCalendarYM(v=> ({ y: dayjs().year(v.y).month(v.m).add(1,'month').year(), m: dayjs().year(v.y).month(v.m).add(1,'month').month() }))}>{">"}</button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-text-tertiary mb-2 font-medium">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=> (<div key={d}>{d}</div>))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {getMonthMatrix(calendarYM.y, calendarYM.m).map(d => {
            const holiday = isHoliday(d);
            const inMonth = dayjs(d).month() === calendarYM.m;
            return (
              <button
                key={d}
                className={`p-2 rounded-lg text-xs transition-all ${inMonth?"":"opacity-40"} ${holiday?"bg-accent-pink/20 border border-accent-pink/30":"bg-surface border border-border hover:bg-surface-hover"}`}
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
        <div className="text-text-tertiary text-xs mt-3">Pink days are holidays (static/custom). Attendance excludes them.</div>
      </PremiumCard>

      {/* Inspiration */}
      <PremiumCard className="p-6 text-center">
        <p className="text-text-secondary italic text-lg">"{quote}"</p>
      </PremiumCard>
    </div>
  )
}


