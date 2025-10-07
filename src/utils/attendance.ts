import dayjs from "dayjs";
import { isHoliday } from "./holidays";

export type AttendanceStatus = "Present" | "Absent" | "Cancelled" | "Leave";

export type Subject = { id: string; name: string; resources?: string[] };
export type Timetable = Record<number, string[]>; // 0-6 -> subjectIds for that weekday
export type AttendanceRecords = Record<string, Record<string, AttendanceStatus>>; // dateISO -> subjectId -> status
export type Cycle = { start: string; end: string | null };

const SUBJECTS_KEY = "att_subjects";
const TIMETABLE_KEY = "att_timetable";
const RECORDS_KEY = "att_records";
const CYCLE_KEY = "att_active_cycle";

function safeParse<T>(raw: string | null, fallback: T): T {
  try { return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}

export function getSubjects(): Subject[] {
  return safeParse<Subject[]>(localStorage.getItem(SUBJECTS_KEY), []);
}
export function saveSubjects(subjects: Subject[]) {
  localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
}

export function getTimetable(): Timetable {
  return safeParse<Timetable>(localStorage.getItem(TIMETABLE_KEY), {} as Timetable);
}
export function saveTimetable(timetable: Timetable) {
  localStorage.setItem(TIMETABLE_KEY, JSON.stringify(timetable));
}

export function getRecords(): AttendanceRecords {
  return safeParse<AttendanceRecords>(localStorage.getItem(RECORDS_KEY), {} as AttendanceRecords);
}
export function saveRecords(records: AttendanceRecords) {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

export function getActiveCycle(): Cycle {
  const def: Cycle = { start: dayjs().startOf("week").format("YYYY-MM-DD"), end: null };
  return safeParse<Cycle>(localStorage.getItem(CYCLE_KEY), def);
}
export function saveActiveCycle(cycle: Cycle) {
  localStorage.setItem(CYCLE_KEY, JSON.stringify(cycle));
}

export function listDatesInRange(startISO: string, endISO: string): string[] {
  const start = dayjs(startISO);
  const end = dayjs(endISO);
  const dates: string[] = [];
  for (let d = start; !d.isAfter(end, "day"); d = d.add(1, "day")) {
    dates.push(d.format("YYYY-MM-DD"));
  }
  return dates;
}

export function computeStats(rangeStart: string, rangeEnd: string) {
  const subjects = getSubjects();
  const timetable = getTimetable();
  const records = getRecords();
  return computeStatsFrom(subjects, timetable, records, rangeStart, rangeEnd);
}

export function computeStatsFrom(
  subjects: Subject[],
  timetable: Timetable,
  records: AttendanceRecords,
  rangeStart: string,
  rangeEnd: string
) {
  const subjectIds = subjects.map(s => s.id);

  const perSubject: Record<string, { conducted: number; attended: number }> = {};
  subjectIds.forEach(id => (perSubject[id] = { conducted: 0, attended: 0 }));

  const dates = listDatesInRange(rangeStart, rangeEnd);
  dates.forEach(date => {
    if (isHoliday(date)) return; // Skip holidays entirely
    const weekday = dayjs(date).day();
    const daySubjects = (timetable[weekday] || []).filter(id => subjectIds.includes(id));
    const rec = records[date] || {};

    daySubjects.forEach(sid => {
      const status: AttendanceStatus | undefined = rec[sid];
      if (status === "Cancelled" || status === "Leave") {
        return; // excluded from denominator (cancelled or whole-day leave)
      }
      // If scheduled and not cancelled/leave, count as conducted regardless of marking
      perSubject[sid].conducted += 1;
      if (status === "Present") perSubject[sid].attended += 1;
    });
  });

  const totals = Object.values(perSubject).reduce(
    (acc, s) => {
      acc.conducted += s.conducted;
      acc.attended += s.attended;
      return acc;
    },
    { conducted: 0, attended: 0 }
  );

  const percent = (totals.attended / Math.max(1, totals.conducted)) * 100;

  return { perSubject, totals, percent };
}

export function predictionSkipable(perSubject: Record<string, { conducted: number; attended: number }>, targetPercent = 75) {
  // For each subject: how many more classes can be skipped without dropping below target
  const result: Record<string, number> = {};
  Object.entries(perSubject).forEach(([sid, s]) => {
    // Find max k such that attended / (conducted + k) >= target
    let k = 0;
    // If conducted is 0, you can skip indefinitely until cap; treat as 0 skipable initially
    while (((s.conducted + k) > 0 ? (s.attended / (s.conducted + k)) * 100 : 0) >= targetPercent) {
      k += 1;
      if (k > 1000) break; // safety
    }
    result[sid] = Math.max(0, k - 1);
  });
  return result;
}

export function predictionNeeded(perSubject: Record<string, { conducted: number; attended: number }>, targetPercent = 75) {
  // For each subject: min n to attend consecutively to reach target from now
  const result: Record<string, number> = {};
  Object.entries(perSubject).forEach(([sid, s]) => {
    if (s.conducted === 0) {
      result[sid] = 0;
      return;
    }
    let n = 0;
    while (((s.attended + n) / Math.max(1, (s.conducted + n))) * 100 < targetPercent) {
      n += 1;
      if (n > 1000) break; // safety
    }
    result[sid] = n;
  });
  return result;
}


