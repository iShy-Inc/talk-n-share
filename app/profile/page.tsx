"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
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
import { PostCard } from "@/components/feed/PostCard";
import { SuggestedFriend } from "@/components/shared/SuggestedFriends";
import {
	MainLayout,
	AppLeftSidebar,
	AppRightSidebar,
} from "@/components/shared";
import toast from "react-hot-toast";
import { Post } from "@/types";

const supabase = createClient();

const profileTabs: ProfileTab[] = [
	{ label: "My Posts", value: "my-posts" },
	{ label: "Saved Posts", value: "saved-posts" },
	{ label: "Settings", value: "settings" },
];

const settingsMenuItems: SettingsMenuItem[] = [
	{ label: "General", value: "general" },
	{ label: "Account", value: "account" },
	{ label: "Logout", value: "logout" },
];

export default function ProfilePage() {
	const user = useAuthStore((state) => state.user);
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("my-posts");
	const [settingsTab, setSettingsTab] = useState("general");

	// Fetch current user profile
	const { data: profile } = useQuery({
		queryKey: ["my-profile", user?.id],
		queryFn: async () => {
			if (!user) return null;
			const { data } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", user.id)
				.single();
			return data;
		},
		enabled: !!user,
	});

	// Fetch user's posts
	const { data: myPosts = [] } = useQuery({
		queryKey: ["my-posts", user?.id],
		queryFn: async () => {
			if (!user) return [];
			const { data } = await supabase
				.from("posts")
				.select("*, profiles(username, avatar_url)")
				.eq("author_id", user.id)
				.order("created_at", { ascending: false });
			return (data ?? []) as Post[];
		},
		enabled: !!user && activeTab === "my-posts",
	});

	// Fetch saved posts (user bookmarks)
	const { data: savedPosts = [] } = useQuery({
		queryKey: ["saved-posts", user?.id],
		queryFn: async () => {
			if (!user) return [];
			const { data } = await supabase
				.from("saved_posts")
				.select("*, posts(*, profiles(username, avatar_url))")
				.eq("user_id", user.id)
				.order("created_at", { ascending: false });
			return (data ?? []).map((s: any) => s.posts).filter(Boolean) as Post[];
		},
		enabled: !!user && activeTab === "saved-posts",
	});

	// Fetch suggested friends
	const { data: suggestedFriends = [] } = useQuery({
		queryKey: ["suggested-friends-profile"],
		queryFn: async () => {
			const { data } = await supabase
				.from("profiles")
				.select("id, username, avatar_url, region")
				.neq("id", user?.id ?? "")
				.limit(4);
			return (data ?? []).map((u: any) => ({
				id: u.id,
				name: u.username ?? "User",
				title: u.region ?? "Talk N Share Member",
				avatar: u.avatar_url,
			})) as SuggestedFriend[];
		},
		enabled: !!user,
	});

	// Profile stats
	const stats: ProfileStat[] = [
		{ label: "Posts", value: myPosts.length },
		{ label: "Followers", value: 0 },
		{ label: "Following", value: 0 },
	];

	// Handle save settings
	const handleSaveGeneral = async (values: {
		fullName: string;
		username: string;
		bio: string;
	}) => {
		if (!user) return;
		const { error } = await supabase
			.from("profiles")
			.update({ username: values.username })
			.eq("id", user.id);

		if (error) {
			toast.error("Failed to save settings");
		} else {
			toast.success("Settings saved successfully");
			queryClient.invalidateQueries({ queryKey: ["my-profile"] });
		}
	};

	const handleDeleteAccount = async () => {
		// Placeholder — actual deletion requires server-side logic
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

	return (
		<MainLayout
			leftSidebar={<AppLeftSidebar profile={profile ?? null} />}
			rightSidebar={<AppRightSidebar suggestedFriends={suggestedFriends} />}
		>
			{/* Profile Header */}
			<ProfileHeader
				name={profile?.username ?? "User"}
				username={profile?.username}
				title={profile?.region ?? "Talk N Share Member"}
				avatarUrl={profile?.avatar_url}
				stats={stats}
				tabs={profileTabs}
				activeTab={activeTab}
				onTabChange={setActiveTab}
			/>

			{/* Tab Content */}
			{activeTab === "my-posts" && (
				<div className="space-y-4">
					{myPosts.length === 0 ? (
						<div className="rounded-2xl border border-border bg-card py-16 text-center">
							<p className="text-base font-medium text-muted-foreground">
								You haven&apos;t posted anything yet
							</p>
							<p className="mt-1 text-sm text-muted-foreground/70">
								Share your thoughts on the feed!
							</p>
						</div>
					) : (
						myPosts.map((post) => <PostCard key={post.id} post={post} />)
					)}
				</div>
			)}

			{activeTab === "saved-posts" && (
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

			{activeTab === "settings" && (
				<SettingsLayout
					menuItems={settingsMenuItems}
					activeItem={settingsTab}
					onMenuChange={handleSettingsMenuChange}
				>
					{settingsTab === "general" && (
						<GeneralSettingsForm
							initialValues={{
								fullName: profile?.username ?? "",
								username: profile?.username ?? "",
								bio: "",
							}}
							onSave={handleSaveGeneral}
						/>
					)}
					{settingsTab === "account" && (
						<AccountSettings onDeleteAccount={handleDeleteAccount} />
					)}
				</SettingsLayout>
			)}
		</MainLayout>
	);
}
