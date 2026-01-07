import { ReactNode } from "react";
import PremiumCard from "./PremiumCard";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  accent?: "cyan" | "violet" | "pink" | "blue";
  trend?: "up" | "down" | "neutral";
}

export default function MetricCard({ 
  label, 
  value, 
  subtitle, 
  icon,
  accent = "cyan",
  trend
}: MetricCardProps) {
  const accentColors = {
    cyan: "text-accent-cyan",
    violet: "text-accent-violet",
    pink: "text-accent-pink",
    blue: "text-accent-blue",
  };

  return (
    <PremiumCard accent={accent} className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-text-tertiary text-sm font-medium mb-1">{label}</p>
          <p className={`text-3xl font-bold ${accentColors[accent]} mb-1`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-text-secondary text-sm">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={`${accentColors[accent]} opacity-60`}>
            {icon}
          </div>
        )}
      </div>
    </PremiumCard>
  );
}

