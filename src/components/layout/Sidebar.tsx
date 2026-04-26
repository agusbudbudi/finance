import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ListChecks,
  CreditCard as CardIcon,
  TrendingUp,
  Briefcase,
  Wallet,
  Settings,
  HelpCircle,
  ChevronRight,
  LogOut,
  ShieldCheck,
  Receipt,
  Zap,
  PieChart,
} from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";

const navigation = [
  { name: "Overview", to: "/dashboard", icon: LayoutDashboard },
  { name: "Liquid Assets", to: "/buckets", icon: Wallet },
  { name: "Credit System", to: "/credit-card", icon: CardIcon },
  { name: "Income Streams", to: "/freelance", icon: Briefcase },
  { name: "Budget Strategy", to: "/planner", icon: ListChecks },
  { name: "Transactions", to: "/expense", icon: Receipt },
  { name: "Automated Bills", to: "/recurring", icon: Zap },
  { name: "Wealth Growth", to: "/investment", icon: TrendingUp },
];

import { useUIStore } from "../../stores/useUIStore";

export const Sidebar = () => {
  const navigate = useNavigate();
  const { isSidebarOpen, isSidebarCollapsed, toggleSidebarCollapse, isSimpleMode, toggleSimpleMode } = useUIStore();

  const handleToggleMode = () => {
    toggleSimpleMode();
    // After toggling, the redirect logic in App.tsx will ensure we end up in the right place.
    // Forcing a slight delay or explicit navigation here can also help.
    if (!isSimpleMode) {
      navigate("/simple");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 lg:static lg:flex flex-col bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-900 transition-all duration-300 ease-in-out
      ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      ${isSidebarCollapsed ? "w-20" : "w-64"}
    `}>
      {/* Brand Section */}
      <div className="flex items-center justify-between px-4 py-3 relative h-[72px]">
        <div className="flex items-center gap-2.5">
          <img
            src="/finance-logo.png"
            alt="Finance Logo"
            className="h-8 w-8 object-contain shrink-0"
          />
          <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
            <h1 className="text-lg font-black text-gray-900 dark:text-white tracking-tighter leading-none whitespace-nowrap">
              FINANCE<span className="text-primary-500">.</span>
            </h1>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider leading-none mt-1 whitespace-nowrap">
              Personal System
            </p>
          </div>
        </div>
        
        {/* Collapse Toggle (Desktop only) */}
        <button
          onClick={toggleSidebarCollapse}
          className="hidden lg:flex absolute -right-3 top-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors z-10 shadow-sm"
        >
          <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isSidebarCollapsed ? "" : "rotate-180"}`} />
        </button>
      </div>

      {/* Main Navigation */}
      <nav className={`flex-1 space-y-1 mt-2 transition-all duration-300 ${isSidebarCollapsed ? "px-3" : "px-4"}`}>
        {!isSidebarCollapsed && (
          <p className="px-3 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
            Main Menu
          </p>
        )}
        {navigation
          .filter((item) => !isSimpleMode || item.name === "Transactions")
          .map((item) => {
            const path = isSimpleMode && item.name === "Transactions" ? "/simple" : item.to;
            return (
              <NavLink
                key={item.name}
                to={path}
                end={path === "/simple" || path === "/dashboard"}
                className={({ isActive }) =>
                  `group flex items-center justify-between transition-all duration-300 ${
                    isSidebarCollapsed 
                      ? "p-2 justify-center rounded-lg mx-auto my-1" 
                      : "px-3 py-3 rounded-xl border-2 my-1"
                  } ${
                    isActive
                      ? isSidebarCollapsed
                        ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                        : "bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/20"
                      : isSidebarCollapsed
                        ? "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white"
                        : "text-gray-500 border-transparent hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white"
                  }`
                }
                title={isSidebarCollapsed ? item.name : undefined}
              >
                <div className={`flex items-center ${isSidebarCollapsed ? "justify-center w-8 h-8 rounded-lg transition-colors group-hover:bg-white dark:group-hover:bg-gray-800" : "gap-3"}`}>
                  <item.icon
                    className={`transition-transform duration-300 group-hover:scale-110 ${isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"}`}
                  />
                  {!isSidebarCollapsed && (
                    <span className="font-bold text-sm tracking-tight whitespace-nowrap overflow-hidden">
                      {item.name}
                    </span>
                  )}
                </div>
              </NavLink>
            );
          })}
        {isSimpleMode && (
          <>
            <NavLink
              to="/simple/income"
              className={({ isActive }) =>
                `group flex items-center justify-between transition-all duration-300 ${
                  isSidebarCollapsed 
                    ? "p-2 justify-center rounded-lg mx-auto my-1" 
                    : "px-3 py-3 rounded-xl border-2 my-1"
                } ${
                  isActive
                    ? isSidebarCollapsed
                      ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                      : "bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/20"
                    : isSidebarCollapsed
                      ? "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white"
                      : "text-gray-500 border-transparent hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white"
                }`
              }
              title={isSidebarCollapsed ? "Income" : undefined}
            >
              <div className={`flex items-center ${isSidebarCollapsed ? "justify-center w-8 h-8 rounded-lg transition-colors group-hover:bg-white dark:group-hover:bg-gray-800" : "gap-3"}`}>
                <Briefcase
                  className={`transition-transform duration-300 group-hover:scale-110 ${isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"}`}
                />
                {!isSidebarCollapsed && (
                  <span className="font-bold text-sm tracking-tight whitespace-nowrap overflow-hidden">
                    Income
                  </span>
                )}
              </div>
            </NavLink>
            <NavLink
              to="/simple/summary"
              className={({ isActive }) =>
                `group flex items-center justify-between transition-all duration-300 ${
                  isSidebarCollapsed 
                    ? "p-2 justify-center rounded-lg mx-auto my-1" 
                    : "px-3 py-3 rounded-xl border-2 my-1"
                } ${
                  isActive
                    ? isSidebarCollapsed
                      ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                      : "bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/20"
                    : isSidebarCollapsed
                      ? "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white"
                      : "text-gray-500 border-transparent hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white"
                }`
              }
              title={isSidebarCollapsed ? "Summary" : undefined}
            >
              <div className={`flex items-center ${isSidebarCollapsed ? "justify-center w-8 h-8 rounded-lg transition-colors group-hover:bg-white dark:group-hover:bg-gray-800" : "gap-3"}`}>
                <PieChart
                  className={`transition-transform duration-300 group-hover:scale-110 ${isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"}`}
                />
                {!isSidebarCollapsed && (
                  <span className="font-bold text-sm tracking-tight whitespace-nowrap overflow-hidden">
                    Summary
                  </span>
                )}
              </div>
            </NavLink>
          </>
        )}
      </nav>

      {/* Secondary Actions & Premium Banner */}
      <div className={`p-4 space-y-4 transition-all duration-300 ${isSidebarCollapsed ? "px-3" : "px-4"}`}>
        {!isSidebarCollapsed && (
          <div className="bg-primary-50 dark:bg-primary-900/10 rounded-xl p-4 border border-primary-100 dark:border-primary-900/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-xl bg-primary-500 flex items-center justify-center text-white shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-black text-primary-900 dark:text-primary-100 uppercase tracking-tight">
                Sync Active
              </span>
            </div>
            <p className="text-[9px] text-primary-700/70 dark:text-primary-300/50 font-medium leading-relaxed">
              Your data is E2E encrypted and securely synced to the cloud.
            </p>
          </div>
        )}

        <div className="space-y-1">
          <button
            onClick={handleToggleMode}
            className={`w-full flex items-center transition-all duration-300 font-bold text-sm group ${
              isSidebarCollapsed 
                ? "p-2 justify-center rounded-lg mx-auto my-1" 
                : "gap-3 px-3 py-2.5 rounded-xl border-2 my-1"
            } ${
              isSidebarCollapsed
                ? isSimpleMode
                  ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                  : "text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
                : "text-gray-500 border-transparent hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white"
            }`}
            title={isSidebarCollapsed ? "Toggle Simple Mode" : undefined}
          >
            <div className={`flex items-center ${isSidebarCollapsed ? "justify-center w-8 h-8 rounded-lg transition-colors group-hover:bg-white dark:group-hover:bg-gray-800" : ""}`}>
              <Zap className={`transition-transform duration-300 ${isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"} ${isSimpleMode ? "text-amber-500 fill-amber-500" : ""}`} />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex items-center justify-between flex-1">
                <span className="whitespace-nowrap overflow-hidden">Simple Mode</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-lg font-black uppercase tracking-tight transition-all ${
                  isSimpleMode 
                    ? "bg-amber-500 text-white shadow-sm shadow-amber-500/20" 
                    : "bg-gray-100 text-gray-400 dark:bg-gray-800"
                }`}>
                  {isSimpleMode ? "ON" : "OFF"}
                </span>
              </div>
            )}
          </button>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `w-full flex items-center transition-all duration-300 font-bold text-sm ${
                isSidebarCollapsed 
                  ? "p-2 justify-center rounded-lg mx-auto my-1" 
                  : "gap-3 px-3 py-2.5 rounded-xl border-2 my-1"
              } ${
                isActive
                  ? isSidebarCollapsed
                    ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                    : "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white border-transparent"
                  : isSidebarCollapsed
                    ? "text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white"
                    : "text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900"
              }`
            }
            title={isSidebarCollapsed ? "Settings" : undefined}
          >
            <div className={`flex items-center ${isSidebarCollapsed ? "justify-center w-8 h-8 rounded-lg transition-colors group-hover:bg-white dark:group-hover:bg-gray-800" : ""}`}>
              <Settings className={`transition-transform duration-300 ${isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"}`} />
            </div>
            {!isSidebarCollapsed && <span className="whitespace-nowrap overflow-hidden">Settings</span>}
          </NavLink>
          <button 
            onClick={() => useAuthStore.getState().signOut()}
            className={`w-full flex items-center transition-all duration-300 font-bold text-sm group ${
              isSidebarCollapsed 
                ? "p-2 justify-center rounded-xl mx-auto my-1 text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500" 
                : "gap-3 px-3 py-2.5 rounded-xl border-2 border-transparent text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 my-1"
            }`}
            title={isSidebarCollapsed ? "Logout" : undefined}
          >
            <div className={`flex items-center ${isSidebarCollapsed ? "justify-center w-8 h-8 rounded-lg transition-colors group-hover:bg-white dark:group-hover:bg-gray-800" : ""}`}>
              <LogOut className={`transition-transform duration-300 ${isSidebarCollapsed ? "w-5 h-5" : "w-4 h-4"}`} />
            </div>
            {!isSidebarCollapsed && <span className="whitespace-nowrap overflow-hidden">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};
