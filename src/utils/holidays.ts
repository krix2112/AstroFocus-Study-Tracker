import dayjs from "dayjs";

const STATIC_IN_HOLIDAYS: Record<number, string[]> = {
  // Minimal set; can be expanded or driven via API
  2025: [
    "2025-01-26", // Republic Day
    "2025-03-14", // Holi (approx; varies)
    "2025-08-15", // Independence Day
    "2025-10-02", // Gandhi Jayanti
    "2025-10-20", // Diwali (approx; varies)
    "2025-12-25", // Christmas
  ],
  2024: ["2024-01-26","2024-08-15","2024-10-02","2024-11-01","2024-12-25"],
};

function safeParse<T>(raw: string | null, fallback: T): T { try { return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; } }

export function getCustomHolidays(): string[] {
  return safeParse<string[]>(localStorage.getItem("custom_holidays"), []);
}

export function setCustomHolidays(dates: string[]) {
  localStorage.setItem("custom_holidays", JSON.stringify(Array.from(new Set(dates))));
}

export function isHoliday(dateISO: string): boolean {
  const y = dayjs(dateISO).year();
  const stat = new Set((STATIC_IN_HOLIDAYS[y] || []).map(d => d));
  const custom = new Set(getCustomHolidays());
  return stat.has(dateISO) || custom.has(dateISO);
}

export function getMonthMatrix(year: number, month: number) {
  // month: 0-11
  const first = dayjs().year(year).month(month).date(1);
  const start = first.startOf('week');
  const end = first.endOf('month').endOf('week');
  const days: string[] = [];
  for (let d = start; !d.isAfter(end, 'day'); d = d.add(1,'day')) {
    days.push(d.format('YYYY-MM-DD'));
  }
  return days;
}


