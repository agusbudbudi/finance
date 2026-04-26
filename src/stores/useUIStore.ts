import { create } from "zustand";

const SIMPLE_MODE_KEY = "finance_simple_mode";

interface UIState {
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  isSimpleMode: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
  toggleSidebarCollapse: () => void;
  toggleSimpleMode: () => void;
  setSimpleMode: (val: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  isSidebarCollapsed: false,
  isSimpleMode: localStorage.getItem(SIMPLE_MODE_KEY) === "true",
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleSidebarCollapse: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  toggleSimpleMode: () =>
    set((state) => {
      const next = !state.isSimpleMode;
      localStorage.setItem(SIMPLE_MODE_KEY, String(next));
      return { isSimpleMode: next };
    }),
  setSimpleMode: (val) => {
    localStorage.setItem(SIMPLE_MODE_KEY, String(val));
    set({ isSimpleMode: val });
  },
}));
