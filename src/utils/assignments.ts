function safeParse<T>(raw: string | null, fallback: T): T {
  try { return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}

export function getAssignments() {
  return safeParse<any[]>(localStorage.getItem("assignments"), []);
}

export function saveAssignments(data:any[]) {
  localStorage.setItem("assignments", JSON.stringify(data));
}
