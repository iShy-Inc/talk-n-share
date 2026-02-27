"use client";

import { ReactNode, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { createClient } from "@/utils/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import useProfile, { isProfileComplete } from "@/hooks/useProfile";
import {
	MainLayout,
	AppHeaderNav,
	AppLeftSidebar,
	AppRightSidebar,
} from "@/components/shared";
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
		queryKey: [
			"suggested-friends",
			user?.id,
			profile?.location,
			profile?.gender,
			profile?.zodiac,
			profile?.relationship,
		],
		queryFn: async () => {
			if (!user) return [];
			const { data, error } = await supabase
				.from("profiles")
				.select("id, display_name, avatar_url, location, gender, zodiac, relationship")
				.eq("is_public", true)
				.neq("id", user?.id ?? "")
				.limit(40);
			if (error) throw error;

			const current = {
				location: profile?.location ?? null,
				gender: profile?.gender ?? null,
				zodiac: profile?.zodiac ?? null,
				relationship: profile?.relationship ?? null,
			};

			const withCommon = (data ?? [])
				.map((u: any) => {
					let commonCount = 0;
					if (current.location && u.location === current.location) commonCount += 1;
					if (current.gender && u.gender === current.gender) commonCount += 1;
					if (current.zodiac && u.zodiac === current.zodiac) commonCount += 1;
					if (
						current.relationship &&
						u.relationship === current.relationship
					) {
						commonCount += 1;
					}
					return { ...u, commonCount };
				})
				.filter((u: any) => u.commonCount > 0)
				.sort((a: any, b: any) => b.commonCount - a.commonCount)
				.slice(0, 4);

			return withCommon.map((u: any) => ({
				id: u.id,
				name: u.display_name ?? "Người dùng",
				title: u.location ?? "Thành viên Talk N Share",
				avatar: u.avatar_url,
			})) as SuggestedFriend[];
		},
		enabled: !!user && !!profile,
	});

	if (user && !isLoadingProfile && !isProfileComplete(profile)) {
		return null;
	}

	return (
		<>
			<AppHeaderNav />
			<MainLayout
				hideSidebars={isMessagesPage}
				leftSidebar={isMessagesPage ? null : <AppLeftSidebar profile={profile} />}
				rightSidebar={
					isMessagesPage ? null : (
						<AppRightSidebar suggestedFriends={suggestedFriends} />
					)
				}
				className="pt-4"
			>
				{children}
			</MainLayout>
		</>
	);
}
