import type { ReactNode } from "react";

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  accent?: "cyan" | "violet" | "pink" | "blue";
  accentSide?: "left" | "right" | "top" | "bottom";
}

export default function PremiumCard({ 
  children, 
  className = "", 
  hover = true,
  accent,
  accentSide = "left"
}: PremiumCardProps) {
  const accentClass = accent ? `accent-border-${accentSide}` : "";
  const hoverClass = hover ? "glass-card" : "glass-card hover:transform-none hover:shadow-glass";
  
  return (
    <div className={`${hoverClass} ${accentClass} ${className} animate-fade-in`}>
      {children}
    </div>
  );
}


