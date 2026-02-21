import { Moon, Sun, Bell, Menu } from "lucide-react";
import { useProfileStore } from "../../stores/useProfileStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { useTheme } from "../../hooks/useTheme";
import { useUIStore } from "../../stores/useUIStore";

export const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { toggleSidebar } = useUIStore();
  const profile = useProfileStore((state) => state.profile);
  const user = useAuthStore((state) => state.user);

  const displayName = profile?.name || user?.email?.split('@')[0] || "User";
  const userEmail = user?.email || "No email";

  return (
    <header className="sticky top-0 z-50 px-4 py-2.5 md:px-8 md:py-2.5 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 md:hidden">
            <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-gray-100 dark:border-white/10 bg-primary-50 flex items-center justify-center text-primary-600 font-bold uppercase">
              <img
                src={`https://ui-avatars.com/api/?name=${displayName}&background=f0f7ff&color=3069fe&bold=true`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                {displayName}
              </h2>
              <span className="text-[10px] text-gray-400 font-medium">{userEmail}</span>
            </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors text-gray-600 dark:text-white group"
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
              <p className="text-gray-900 dark:text-white text-xs font-bold leading-none">
                {displayName}
              </p>
              <p className="text-[10px] font-medium text-gray-400 truncate max-w-[120px]">
                {userEmail}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-gray-100 dark:border-white/20">
              <img
                src={`https://ui-avatars.com/api/?name=${displayName}&background=f0f7ff&color=3069fe&bold=true`}
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
