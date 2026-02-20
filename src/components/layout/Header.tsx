import { Moon, Sun, Bell } from "lucide-react";
import { useProfileStore } from "../../stores/useProfileStore";
import { useTheme } from "../../hooks/useTheme";

export const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const profile = useProfileStore((state) => state.profile);

  return (
    <header className="px-6 py-6 md:px-8 md:py-4 z-20 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 md:hidden">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-500 bg-primary-50">
              <img
                src={`https://ui-avatars.com/api/?name=${profile?.name || "User"}&background=3069fe&color=fff`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              {profile?.name || "Asal Design"} 👋
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="p-3 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors text-gray-600 dark:text-white relative group"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-400 rounded-full border-2 border-white dark:border-gray-950"></span>
          </button>
          <button
            onClick={toggleTheme}
            className="p-3 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors text-gray-600 dark:text-white group"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 group-hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
            )}
          </button>

          <div className="hidden md:flex items-center gap-4 pl-4 border-l border-gray-200 dark:border-white/10">
            <div className="text-right">
              <p className="text-gray-400 dark:text-white/60 text-[10px] font-black uppercase tracking-widest">
                Active Plan
              </p>
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                Platinum Member
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-gray-100 dark:border-white/20">
              <img
                src={`https://ui-avatars.com/api/?name=${profile?.name || "User"}&background=3069fe&color=fff`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
