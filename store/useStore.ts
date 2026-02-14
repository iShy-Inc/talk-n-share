import { create } from "zustand";

interface AppState {
	isSidebarOpen: boolean;
	setSidebarOpen: (open: boolean) => void;
	toggleSidebar: () => void;
}

export const useStore = create<AppState>((set) => ({
	isSidebarOpen: false,
	setSidebarOpen: (open) => set({ isSidebarOpen: open }),
	toggleSidebar: () =>
		set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
