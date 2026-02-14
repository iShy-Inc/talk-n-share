import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";

const supabase = createClient();

export const useAuth = () => {
	const setAuth = useAuthStore((state) => state.setAuth);
	const setAuthLoading = useAuthStore((state) => state.setLoading);
	const status = useAuthStore((state) => state.status);
	const initialized = useAuthStore((state) => state.initialized);
	const user = useAuthStore((state) => state.user);
	const activeSession = useAuthStore((state) => state.activeSession);
	const [isHydrating, setIsHydrating] = useState(true);

	useEffect(() => {
		setAuthLoading();

		// 1. Get initial session
		const getSession = async () => {
			const {
				data: { session },
				error,
			} = await supabase.auth.getSession();
			if (error) {
				console.error("Error getting session:", error);
			}
			setAuth(session);
			setIsHydrating(false);
		};

		getSession();

		// 2. Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setAuth(session);
			setIsHydrating(false);
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [setAuth, setAuthLoading]);

	return {
		user,
		activeSession,
		status,
		initialized,
		loading: isHydrating || status === "loading" || !initialized,
		isAuthenticated: status === "authenticated",
	};
};
