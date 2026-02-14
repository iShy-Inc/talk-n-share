import { User, Session } from "@supabase/supabase-js";
import { create } from "zustand";

export type AuthStatus = "idle" | "loading" | "authenticated" | "anonymous";

interface AuthState {
	user: User | null;
	activeSession: Session | null;
	status: AuthStatus;
	initialized: boolean;
	setAuth: (session: Session | null) => void;
	setLoading: () => void;
	clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	activeSession: null,
	status: "idle",
	initialized: false,
	setAuth: (session) =>
		set({
			activeSession: session,
			user: session?.user ?? null,
			status: session ? "authenticated" : "anonymous",
			initialized: true,
		}),
	setLoading: () => set({ status: "loading" }),
	clearAuth: () =>
		set({
			user: null,
			activeSession: null,
			status: "anonymous",
			initialized: true,
		}),
}));
