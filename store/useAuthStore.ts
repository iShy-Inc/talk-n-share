import { User, Session } from "@supabase/supabase-js";
import { create } from "zustand";

interface AuthState {
	user: User | null;
	activeSession: Session | null;
	setUser: (user: User | null) => void;
	setActiveSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	activeSession: null,
	setUser: (user: User | null) => set({ user }),
	setActiveSession: (session: Session | null) =>
		set({ activeSession: session }),
}));
