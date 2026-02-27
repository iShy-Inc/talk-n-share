"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import useProfile, { MY_PROFILE_QUERY_KEY, UserProfile } from "@/hooks/useProfile";
import { createClient } from "@/utils/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ProfileHeader,
	ProfileStat,
	ProfileTab,
} from "@/components/shared/ProfileHeader";
import {
	SettingsLayout,
	SettingsMenuItem,
} from "@/components/shared/SettingsLayout";
import { GeneralSettingsForm } from "@/components/shared/GeneralSettingsForm";
import { AccountSettings } from "@/components/shared/AccountSettings";
import { ThemeSettings } from "@/components/shared/ThemeSettings";
import { PostCard } from "@/components/feed/PostCard";
import {
	AvatarCategoryKey,
	getAvatarCategoryForUrl,
} from "@/lib/avatar-options";
import { getZodiacSign } from "@/lib/zodiac";
import toast from "react-hot-toast";
import { PostWithAuthor } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { startOrRequestConversation } from "@/lib/contact-messaging";

const supabase = createClient();

const profileTabs: ProfileTab[] = [
	{ label: "My Posts", value: "my-posts" },
	{ label: "Saved Posts", value: "saved-posts" },
	{ label: "Settings", value: "settings" },
];

const visitorTabs: ProfileTab[] = [
	{ label: "Posts", value: "my-posts" },
	{ label: "Saved Posts", value: "saved-posts" },
];

const settingsMenuItems: SettingsMenuItem[] = [
	{ label: "General", value: "general" },
	{ label: "Appearance", value: "appearance" },
	{ label: "Account", value: "account" },
	{ label: "Logout", value: "logout" },
];

const formatBirthDate = (value?: string | null) => {
	if (!value) return "N/A";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "N/A";
	return date.toLocaleDateString();
};

export default function ProfilePage() {
	const user = useAuthStore((state) => state.user);
	const router = useRouter();
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();
	const requestedProfileId = searchParams.get("userId");
	const isOwnProfile = !requestedProfileId || requestedProfileId === user?.id;
	const profileId = isOwnProfile ? user?.id : requestedProfileId;
	const [activeTab, setActiveTab] = useState(
		searchParams.get("tab") === "settings" && isOwnProfile
			? "settings"
			: searchParams.get("tab") === "saved-posts"
				? "saved-posts"
				: "my-posts",
	);
	const [settingsTab, setSettingsTab] = useState(
		searchParams.get("section") ?? "general",
	);
	const [selectedAvatar, setSelectedAvatar] = useState("");
	const [selectedAvatarCategory, setSelectedAvatarCategory] =
		useState<AvatarCategoryKey>("people");
	const { profile: myProfile } = useProfile();

	const { data: visitedProfile = null } = useQuery({
		queryKey: ["profile-by-id", requestedProfileId],
		queryFn: async () => {
			if (!requestedProfileId) return null;
			const { data, error } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", requestedProfileId)
				.maybeSingle();
			if (error) throw error;
			return data as UserProfile | null;
		},
		enabled: !!requestedProfileId && !isOwnProfile,
	});

	const profile = isOwnProfile ? myProfile : visitedProfile;
	const effectiveAvatar = selectedAvatar || profile?.avatar_url || "";
	const effectiveAvatarCategory = selectedAvatar
		? selectedAvatarCategory
		: getAvatarCategoryForUrl(profile?.avatar_url);
	const shouldHidePrivateInfo =
		!isOwnProfile && (profile?.is_public ?? true) === false;

	const effectiveActiveTab =
		!isOwnProfile && activeTab === "settings" ? "my-posts" : activeTab;

	const { data: myPosts = [] } = useQuery({
		queryKey: ["my-posts", profileId],
		queryFn: async () => {
			if (!profileId) return [];
			const { data } = await supabase
				.from("posts")
				.select(
					"*, profiles!posts_author_id_fkey(display_name, avatar_url, is_public)",
				)
				.eq("author_id", profileId)
				.order("created_at", { ascending: false });
			return (data ?? []) as PostWithAuthor[];
		},
		enabled:
			!!profileId &&
			effectiveActiveTab === "my-posts" &&
			!shouldHidePrivateInfo,
	});

	const { data: savedPosts = [] } = useQuery({
		queryKey: ["saved-posts", user?.id],
		queryFn: async () => {
			if (!user) return [];
			const { data } = await supabase
				.from("likes")
				.select(
					"*, posts(*, profiles!posts_author_id_fkey(display_name, avatar_url, is_public))",
				)
				.eq("user_id", user.id)
				.order("created_at", { ascending: false });
			return (data ?? [])
				.map((s) => s.posts)
				.filter(Boolean) as PostWithAuthor[];
		},
		enabled: !!user && isOwnProfile && effectiveActiveTab === "saved-posts",
	});

	const stats: ProfileStat[] = shouldHidePrivateInfo
		? []
		: [
				{ label: "Posts", value: myPosts.length },
				{ label: "Followers", value: 0 },
				{ label: "Following", value: 0 },
			];

	const handleSaveGeneral = async (values: {
		display_name: string;
		bio: string;
		avatarUrl: string;
		location: string;
		birth_date: string;
		is_public: boolean;
	}) => {
		if (!user) return;

		const isSwitchingToPublic = (myProfile?.is_public ?? true) === false && values.is_public;
		if (isSwitchingToPublic) {
			const confirmed = window.confirm(
				"Switching to public will make your profile information visible to others. Continue?",
			);
			if (!confirmed) {
				toast("Your profile is still private.");
				return;
			}
		}

		const { error } = await supabase
			.from("profiles")
			.update({
				display_name: values.display_name,
				bio: values.bio || null,
				avatar_url: values.avatarUrl || null,
				location: values.location || null,
				birth_date: values.birth_date || null,
				zodiac: values.birth_date ? getZodiacSign(values.birth_date) : null,
				is_public: values.is_public,
			})
			.eq("id", user.id);

		if (error) {
			toast.error("Failed to save settings");
		} else {
			toast.success("Settings saved successfully");
			queryClient.invalidateQueries({ queryKey: [MY_PROFILE_QUERY_KEY] });
		}
	};

	const handleDeleteAccount = async () => {
		toast.error(
			"Account deletion requires admin action. Please contact support.",
		);
	};

	const handleSettingsMenuChange = (value: string) => {
		if (value === "logout") {
			supabase.auth.signOut();
			window.location.href = "/login";
			return;
		}
		setSettingsTab(value);
	};

	const handleSendMessage = async () => {
		if (!user) {
			router.push("/login");
			return;
		}
		if (!profileId || isOwnProfile) return;
		try {
			const result = await startOrRequestConversation({
				viewerId: user.id,
				viewerDisplayName: myProfile?.display_name,
				targetUserId: profileId,
				targetDisplayName: profile?.display_name,
				targetIsPublic: profile?.is_public,
			});
			if (result.kind === "request_sent") {
				toast.success("Message request sent to this private user.");
				return;
			}
			router.push(`/messages?sessionId=${result.sessionId}`);
		} catch {
			toast.error("Unable to start conversation.");
		}
	};

	return (
		<>
			<ProfileHeader
				name={profile?.display_name ?? "User"}
				username={shouldHidePrivateInfo ? undefined : profile?.display_name ?? undefined}
				title={
					shouldHidePrivateInfo
						? undefined
						: profile?.location
							? profile.location
							: profile?.role === "admin"
								? "Administrator"
								: profile?.role === "moder"
									? "Moderator"
									: "Talk N Share Member"
				}
				avatarUrl={shouldHidePrivateInfo ? undefined : profile?.avatar_url ?? undefined}
				stats={stats}
				tabs={isOwnProfile ? profileTabs : visitorTabs}
				activeTab={effectiveActiveTab}
				onTabChange={setActiveTab}
			/>

			{!isOwnProfile && (
				<div className="mt-4">
					<Button onClick={handleSendMessage} className="rounded-xl">
						Send Message
					</Button>
				</div>
			)}

			{!shouldHidePrivateInfo && (profile?.birth_date || profile?.zodiac) && (
				<div className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
					<h3 className="text-sm font-semibold text-foreground">
						Birthday & Zodiac
					</h3>
					<div className="mt-2 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
						<p>
							<span className="font-medium text-foreground">Birthday:</span>{" "}
							{formatBirthDate(profile?.birth_date)}
						</p>
						<p>
							<span className="font-medium text-foreground">Zodiac:</span>{" "}
							{profile?.zodiac || "N/A"}
						</p>
					</div>
				</div>
			)}

			{effectiveActiveTab === "my-posts" && (
				<div className="space-y-4">
					{shouldHidePrivateInfo ? (
						<div className="rounded-2xl border border-border bg-card py-16 text-center">
							<p className="text-base font-medium text-muted-foreground">
								This is a private profile
							</p>
						</div>
					) : myPosts.length === 0 ? (
						<div className="rounded-2xl border border-border bg-card py-16 text-center">
							<p className="text-base font-medium text-muted-foreground">
								{isOwnProfile
									? "You haven't posted anything yet"
									: "This user hasn't posted anything yet"}
							</p>
							{isOwnProfile && (
								<p className="mt-1 text-sm text-muted-foreground/70">
									Share your thoughts on the feed!
								</p>
							)}
						</div>
					) : (
						myPosts.map((post) => <PostCard key={post.id} post={post} />)
					)}
				</div>
			)}

			{!isOwnProfile && effectiveActiveTab === "saved-posts" && (
				<div className="space-y-4">
					<div className="rounded-2xl border border-border bg-card py-16 text-center">
						<p className="text-base font-medium text-muted-foreground">
							{shouldHidePrivateInfo
								? "This is a private profile"
								: "Saved posts are private"}
						</p>
					</div>
				</div>
			)}

			{isOwnProfile && effectiveActiveTab === "saved-posts" && (
				<div className="space-y-4">
					{savedPosts.length === 0 ? (
						<div className="rounded-2xl border border-border bg-card py-16 text-center">
							<p className="text-base font-medium text-muted-foreground">
								No saved posts yet
							</p>
							<p className="mt-1 text-sm text-muted-foreground/70">
								Save posts from the feed to revisit them later
							</p>
						</div>
					) : (
						savedPosts.map((post) => <PostCard key={post.id} post={post} />)
					)}
				</div>
			)}

			{isOwnProfile && effectiveActiveTab === "settings" && (
				<SettingsLayout
					menuItems={settingsMenuItems}
					activeItem={settingsTab}
					onMenuChange={handleSettingsMenuChange}
				>
					{settingsTab === "general" && (
						<GeneralSettingsForm
							key={`${profile?.id ?? "profile"}-${profile?.updated_at ?? "init"}`}
							initialValues={{
								display_name: profile?.display_name ?? "",
								bio: profile?.bio ?? "",
								location: profile?.location ?? "",
								birth_date: profile?.birth_date ?? "",
								zodiac: profile?.zodiac ?? "",
								is_public: profile?.is_public,
							}}
							selectedAvatar={effectiveAvatar}
							selectedAvatarCategory={effectiveAvatarCategory}
							onAvatarSelect={setSelectedAvatar}
							onAvatarCategoryChange={setSelectedAvatarCategory}
							onSave={handleSaveGeneral}
						/>
					)}
					{settingsTab === "account" && (
						<AccountSettings onDeleteAccount={handleDeleteAccount} />
					)}
					{settingsTab === "appearance" && <ThemeSettings />}
				</SettingsLayout>
			)}
		</>
	);
}
