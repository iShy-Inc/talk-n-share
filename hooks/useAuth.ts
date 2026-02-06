import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";

const supabase = createClient();

export const useAuth = () => {
	const { setUser, setActiveSession, user } = useAuthStore();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// 1. Get initial session
		const getSession = async () => {
			const {
				data: { session },
				error,
			} = await supabase.auth.getSession();
			if (error) {
				console.error("Error getting session:", error);
			}
			if (session) {
				setUser(session.user);
				setActiveSession(session);
			}
			setLoading(false);
		};

		getSession();

		// 2. Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (session) {
				setUser(session.user);
				setActiveSession(session);
			} else {
				setUser(null);
				setActiveSession(null);
			}
			setLoading(false);
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	return { user, loading };
};
