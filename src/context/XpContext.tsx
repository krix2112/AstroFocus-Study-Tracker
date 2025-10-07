import { createContext, useContext, useEffect, useMemo, useState } from "react";

type XpContextValue = {
  xp: number;
  level: number;
  nextLevelXp: number;
  currentLevelFloorXp: number;
  addXp: (amount: number) => void;
};

const Ctx = createContext<XpContextValue | null>(null);

const LEVEL_THRESHOLDS = [0, 500, 1200, 2500, 4500, 7000];

export function XpProvider({ children }: { children: React.ReactNode }) {
  const [xp, setXp] = useState<number>(() => {
    const raw = localStorage.getItem("xp_total");
    return raw ? parseInt(raw) : 0;
  });

  useEffect(() => {
    localStorage.setItem("xp_total", String(xp));
  }, [xp]);

  const level = useMemo(() => {
    let lvl = 1;
    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
      if (xp >= LEVEL_THRESHOLDS[i]) lvl = i + 1;
    }
    return Math.min(lvl, LEVEL_THRESHOLDS.length);
  }, [xp]);

  const currentLevelFloorXp = useMemo(() => {
    const idx = Math.min(level, LEVEL_THRESHOLDS.length) - 1;
    return LEVEL_THRESHOLDS[idx] || 0;
  }, [level]);

  const nextLevelXp = useMemo(() => {
    const idx = Math.min(level, LEVEL_THRESHOLDS.length) - 1;
    const after = (LEVEL_THRESHOLDS[idx + 1] ?? LEVEL_THRESHOLDS[idx]) || 0;
    return after;
  }, [level]);

  const addXp = (amount: number) => {
    if (!Number.isFinite(amount) || amount <= 0) return;
    setXp(prev => prev + Math.floor(amount));
  };

  const value: XpContextValue = { xp, level, nextLevelXp, currentLevelFloorXp, addXp };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useXp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useXp must be used within XpProvider");
  return v;
}


