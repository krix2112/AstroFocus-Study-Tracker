import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { 
  HiHome,
  HiAcademicCap,
  HiCalculator,
  HiCalendar,
  HiClock,
  HiBookOpen,
  HiSparkles,
  HiCog,
  HiLogout,
  HiMoon,
  HiSun,
  HiLightBulb,
  HiChartBar
} from "react-icons/hi";

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
}

const navItems: NavItem[] = [
  { path: "/", label: "Mission Control", icon: HiHome, category: "home" },
  { path: "/progress-tracker", label: "Progress Tracker", icon: HiChartBar, category: "academics" },
  { path: "/cgpa-tracker", label: "CGPA Tracker", icon: HiAcademicCap, category: "academics" },
  { path: "/grade-calculator", label: "Grade Calculator", icon: HiCalculator, category: "academics" },
  { path: "/attendance", label: "Attendance", icon: HiCalendar, category: "academics" },
  { path: "/timer", label: "Focus Timer", icon: HiClock, category: "focus" },
  { path: "/wardrobe", label: "Wardrobe", icon: HiBookOpen, category: "personal" },
  { path: "/resources", label: "Resources", icon: HiSparkles, category: "growth" },
  { path: "/ai-assistant", label: "AI Assistant", icon: HiLightBulb, category: "growth" },
];

export default function Navigation() {
  const location = useLocation();
  const auth = useAuth();
  const user = auth?.user || null;
  const signOut = auth?.signOut || (async () => {});
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const groupedItems = navItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  const categoryLabels: Record<string, string> = {
    home: "Home",
    academics: "Academics",
    focus: "Focus",
    growth: "Growth",
    personal: "Personal",
  };

  return (
    <aside className="w-64 bg-surface border-r border-border h-screen flex flex-col sticky top-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold gradient-onestop mb-1">ONE STOP</h1>
        <p className="text-xs text-text-tertiary">Academic Command Center</p>
      </div>

      {/* User Profile Card */}
      {user && (
        <div className="p-4 border-b border-border">
          <div className="glass-card p-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-cyan to-accent-violet flex items-center justify-center text-white font-bold">
                {user.student_name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text-primary truncate">
                  {user.student_name}
                </p>
                {user.admission_no && (
                  <p className="text-xs text-text-tertiary truncate">
                    {user.admission_no}
                  </p>
                )}
              </div>
            </div>
            <div className="text-xs text-text-secondary mt-2">
              <p className="truncate">{user.registration_no}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="space-y-1">
            <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider px-3 mb-2">
              {categoryLabels[category]}
            </p>
            {items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-200
                    ${
                      active
                        ? "bg-surface-hover accent-border-left text-accent-cyan font-medium"
                        : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border space-y-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all duration-200"
        >
          {theme === "dark" ? (
            <>
              <HiSun className="w-5 h-5" />
              <span className="text-sm">Light Mode</span>
            </>
          ) : (
            <>
              <HiMoon className="w-5 h-5" />
              <span className="text-sm">Dark Mode</span>
            </>
          )}
        </button>
        <Link
          to="/settings"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all duration-200"
        >
          <HiCog className="w-5 h-5" />
          <span className="text-sm">Settings</span>
        </Link>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all duration-200"
        >
          <HiLogout className="w-5 h-5" />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

