import { create } from "zustand";

interface AppState {
	// Define global state here
	isSidebarOpen: boolean;
	toggleSidebar: () => void;
}

export const useStore = create<AppState>((set) => ({
	isSidebarOpen: false,
	toggleSidebar: () =>
		set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
