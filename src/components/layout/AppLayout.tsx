import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useUIStore } from "../../stores/useUIStore";
import { useEffect } from "react";

export const AppLayout = () => {
  const location = useLocation();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, setSidebarOpen]);

  return (
    <div className="flex h-[100dvh] bg-gray-50 dark:bg-gray-950 font-sans overflow-hidden">
      {/* Sidebar - Desktop & Mobile */}
      <Sidebar />

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header />
        <main className="flex-1 overflow-y-auto z-10 p-4 md:p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
