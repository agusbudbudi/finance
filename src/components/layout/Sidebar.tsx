import { NavLink } from "react-router-dom";
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
  const { isSidebarOpen } = useUIStore();

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 lg:static lg:flex w-64 flex-col bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-900 transition-transform duration-300 ease-in-out
      ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
    `}>
      {/* Brand Section */}
      <div className="flex items-center gap-2.5 px-4 py-5">
        <img
          src="/finance-logo.png"
          alt="Finance Logo"
          className="h-8 w-8 object-contain shrink-0"
        />
        <div>
          <h1 className="text-lg font-black text-gray-900 dark:text-white tracking-tighter leading-none">
            FINANCE<span className="text-primary-500">.</span>
          </h1>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider leading-none mt-1">
            Personal System
          </p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 space-y-1 mt-4">
        <p className="px-3 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
          Main Menu
        </p>
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              `group flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-300 border-2 ${
                isActive
                  ? "bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/20 "
                  : "text-gray-500 border-transparent hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white"
              }`
            }
          >
            <div className="flex items-center gap-3">
              <item.icon
                className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110`}
              />
              <span className="font-bold text-sm tracking-tight">
                {item.name}
              </span>
            </div>
            {/* removed broken status check */}
          </NavLink>
        ))}
      </nav>

      {/* Secondary Actions & Premium Banner */}
      <div className="p-4 space-y-4">
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

        <div className="space-y-1">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-bold text-sm ${
                isActive
                  ? "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white"
                  : "text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900"
              }`
            }
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </NavLink>
          <button 
            onClick={() => useAuthStore.getState().signOut()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-bold text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};
