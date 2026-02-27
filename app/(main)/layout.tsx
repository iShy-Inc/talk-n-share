"use client";

import { ReactNode, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { createClient } from "@/utils/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import useProfile, { isProfileComplete } from "@/hooks/useProfile";
import { MainLayout, AppLeftSidebar, AppRightSidebar } from "@/components/shared";
import { SuggestedFriend } from "@/components/shared/SuggestedFriends";

const supabase = createClient();

export default function MainRoutesLayout({
	children,
}: {
	children: ReactNode;
}) {
	const user = useAuthStore((state) => state.user);
	const pathname = usePathname();
	const router = useRouter();
	const { profile, loading: isLoadingProfile } = useProfile();
	const isMessagesPage = pathname.startsWith("/messages");

	useEffect(() => {
		if (!user || isLoadingProfile) return;
		if (!isProfileComplete(profile) && pathname !== "/onboarding") {
			router.replace("/onboarding");
		}
	}, [user, isLoadingProfile, profile, pathname, router]);

	const { data: suggestedFriends = [] } = useQuery({
		queryKey: ["suggested-friends", user?.id],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("profiles")
				.select("id, display_name, avatar_url, location")
				.neq("id", user?.id ?? "")
				.limit(4);
			if (error) throw error;
			return (data ?? []).map((u: any) => ({
				id: u.id,
				name: u.display_name ?? "User",
				title: u.location ?? "Talk N Share Member",
				avatar: u.avatar_url,
			})) as SuggestedFriend[];
		},
		enabled: !!user,
	});

	if (user && !isLoadingProfile && !isProfileComplete(profile)) {
		return null;
	}

	return (
		<MainLayout
			hideSidebars={isMessagesPage}
			leftSidebar={isMessagesPage ? null : <AppLeftSidebar profile={profile} />}
			rightSidebar={
				isMessagesPage ? null : (
					<AppRightSidebar suggestedFriends={suggestedFriends} />
				)
			}
		>
			{children}
		</MainLayout>
	);
}
