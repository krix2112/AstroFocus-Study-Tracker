import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PremiumCard from "../components/PremiumCard";
import { useAuth } from "../context/AuthContext";
import {
  HiHome,
  HiAcademicCap,
  HiCalculator,
  HiCalendar,
  HiClock,
  HiBookOpen,
  HiSparkles,
  HiLightBulb,
  HiChartBar,
} from "react-icons/hi";

const featureTiles = [
  {
    title: "Mission Control",
    description: "Your academic dashboard",
    icon: HiHome,
    path: "/",
    accent: "cyan",
  },
  {
    title: "Progress Tracker",
    description: "Track semester performance & trajectory",
    icon: HiChartBar,
    path: "/progress-tracker",
    accent: "violet",
  },
  {
    title: "CGPA Tracker",
    description: "Calculate and track your CGPA",
    icon: HiAcademicCap,
    path: "/cgpa-tracker",
    accent: "pink",
  },
  {
    title: "Grade Calculator",
    description: "Calculate semester grades",
    icon: HiCalculator,
    path: "/grade-calculator",
    accent: "blue",
  },
  {
    title: "Attendance",
    description: "Track your attendance",
    icon: HiCalendar,
    path: "/attendance",
    accent: "cyan",
  },
  {
    title: "Focus Timer",
    description: "Pomodoro timer for focused study",
    icon: HiClock,
    path: "/timer",
    accent: "violet",
  },
  {
    title: "Wardrobe",
    description: "Save and organize resources",
    icon: HiBookOpen,
    path: "/wardrobe",
    accent: "pink",
  },
  {
    title: "Resources",
    description: "Curated academic resources",
    icon: HiSparkles,
    path: "/resources",
    accent: "blue",
  },
  {
    title: "AI Assistant",
    description: "Get help with your studies",
    icon: HiLightBulb,
    path: "/ai-assistant",
    accent: "cyan",
  },
];

export default function Home() {
  const auth = useAuth();
  const user = auth?.user || null;

  return (
    <div className="min-h-screen p-6 space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center space-y-4 mb-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-6xl font-bold gradient-onestop"
        >
          ONE STOP
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-xl text-text-secondary"
        >
          Your Academic Command Center
        </motion.p>
        {!user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6"
          >
            <Link
              to="/login"
              className="inline-block px-8 py-3 rounded-lg btn-premium btn-accent-cyan"
            >
              Sign In to Continue
            </Link>
          </motion.div>
        )}
      </div>

      {/* Feature Tiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {featureTiles.map((tile, index) => {
          const Icon = tile.icon;
          return (
            <motion.div
              key={tile.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link to={tile.path}>
                <PremiumCard
                  accent={tile.accent as "cyan" | "violet" | "pink" | "blue"}
                  className="p-6 h-full flex flex-col cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`text-4xl text-accent-${tile.accent} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">
                    {tile.title}
                  </h3>
                  <p className="text-text-secondary text-sm flex-1">
                    {tile.description}
                  </p>
                  <div className="mt-4 text-accent-cyan text-sm font-medium group-hover:translate-x-2 transition-transform duration-300">
                    Explore →
                  </div>
                </PremiumCard>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-center mt-12 pt-8 border-t border-border">
        <p className="text-text-tertiary text-sm">
          Made by Krishna
        </p>
      </div>
    </div>
  );
}

