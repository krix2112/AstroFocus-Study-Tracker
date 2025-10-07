import dayjs from "dayjs";

function safeParse<T>(raw: string | null, fallback: T): T {
  try { return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}

export function addStudySession(seconds:number, subject?: string) {
  const key = dayjs().format("YYYY-MM-DD");
  const data = safeParse<Record<string, number>>(localStorage.getItem("studyHistory"), {});
  data[key] = (data[key] || 0) + seconds;
  localStorage.setItem("studyHistory", JSON.stringify(data));

  // per-subject aggregation for dashboard insights
  if (subject) {
    const ps = safeParse<Record<string, Record<string, number>>>(localStorage.getItem("studyPerSubject"), {});
    ps[key] = ps[key] || {};
    ps[key][subject] = (ps[key][subject] || 0) + seconds;
    localStorage.setItem("studyPerSubject", JSON.stringify(ps));
  }
}

export function getStudyHistory() {
  return safeParse<Record<string, number>>(localStorage.getItem("studyHistory"), {});
}

export function getWeeklyData() {
  const data = getStudyHistory();
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const weekly = days.map(d=>({ name:d, seconds:0 }));
  Object.entries(data).forEach(([date, secs]: [string, any])=>{
    const day = dayjs(date).day();
    weekly[day].seconds += Number(secs) || 0;
  });
  return weekly;
}

export function getWeeklyTotals() {
  const weekly = getWeeklyData();
  return weekly.map(w => ({ name: w.name, minutes: Math.floor(w.seconds/60) }));
}

export function getStudyStreak() {
  const history = getStudyHistory();
  let streak = 0;
  for (let i=0; i<365; i++) {
    const d = dayjs().subtract(i, "day").format("YYYY-MM-DD");
    if ((history[d]||0) > 0) streak += 1; else break;
  }
  return streak;
}

export function getPerSubjectHistory() {
  return safeParse<Record<string, Record<string, number>>>(localStorage.getItem("studyPerSubject"), {});
}

// Action Log (Study Timeline)
type ActionItem = { id: string; at: string; text: string };
export function logAction(text: string) {
  const items = safeParse<ActionItem[]>(localStorage.getItem("actionLog"), []);
  const entry: ActionItem = { id: crypto.randomUUID(), at: dayjs().toISOString(), text };
  const next = [entry, ...items].slice(0, 50);
  localStorage.setItem("actionLog", JSON.stringify(next));
}

export function getRecentActions(limit = 5): ActionItem[] {
  const items = safeParse<ActionItem[]>(localStorage.getItem("actionLog"), []);
  return items.slice(0, limit);
}


