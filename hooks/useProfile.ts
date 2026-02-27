"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";
import type { Profile } from "@/types/supabase";

const supabase = createClient();

export const MY_PROFILE_QUERY_KEY = "my-profile";

export type UserProfile = Profile;

export const isProfileComplete = (profile: UserProfile | null) => {
	if (!profile) return false;
	return !!(
		profile.display_name &&
		profile.location &&
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
			return data as UserProfile | null;
		},
		enabled: !!user,
	});

	return { profile, loading };
};

export default useProfile;
