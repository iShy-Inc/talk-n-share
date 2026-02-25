"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";

const supabase = createClient();

export const MY_PROFILE_QUERY_KEY = "my-profile";

export type UserProfile = {
	id: string;
	display_name?: string | null;
	email?: string | null;
	location?: string | null;
	avatar_url?: string | null;
	role?: "admin" | "moder" | "user" | null;
	username?: string | null;
	region?: string | null;
	birth_date?: string | null;
	is_public?: boolean | null;
	zodiac?: string | null;
	gender?: "male" | "female" | "others" | null;
};

export const isProfileComplete = (profile: UserProfile | null) => {
	if (!profile) return false;
	return !!(
		profile.display_name &&
		profile.avatar_url &&
		profile.birth_date &&
		profile.location &&
		profile.zodiac &&
		profile.gender &&
		profile.is_public !== null &&
		profile.is_public !== undefined
	);
};

const useProfile = () => {
	const { user } = useAuthStore();

	const { data: profile = null, isLoading: loading } = useQuery({
		queryKey: [MY_PROFILE_QUERY_KEY, user?.id],
		queryFn: async () => {
			if (!user) return null;
			const { data, error } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", user.id)
				.maybeSingle();
			if (error) throw error;
			return data as UserProfile;
		},
		enabled: !!user,
	});

	return { profile, loading };
};

export default useProfile;
