import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { createClient } from "@/utils/supabase/client";

export function useAdminRole() {
	const user = useAuthStore((state) => state.user);
	const [role, setRole] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const checkRole = async () => {
			if (!user) {
				setRole(null);
				setLoading(false);
				return;
			}
			const supabase = createClient();

			const { data, error } = await supabase
				.from("profiles")
				.select("role")
				.eq("id", user.id)
				.single();

			if (error || !data) {
				setRole(null);
			} else {
				setRole(data.role);
			}
			setLoading(false);
		};

		checkRole();
	}, [user]);

	return {
		role,
		loading,
		isAdmin: role === "admin",
		isModer: role === "moder",
		hasAccess: role === "admin" || role === "moder",
	};
}
