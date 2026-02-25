"use client";

import { useRef, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import useProfile, { MY_PROFILE_QUERY_KEY } from "@/hooks/useProfile";
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
import { STORAGE_BUCKETS, uploadFileToBucket } from "@/lib/supabase-storage";
import toast from "react-hot-toast";
import { PostWithAuthor } from "@/types/supabase";

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
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
	const avatarInputRef = useRef<HTMLInputElement>(null);
	const { profile } = useProfile();

	// Fetch user's posts
	const { data: myPosts = [] } = useQuery({
		queryKey: ["my-posts", user?.id],
		queryFn: async () => {
			if (!user) return [];
			const { data } = await supabase
				.from("posts")
				.select("*, profiles!posts_author_id_fkey(display_name, avatar_url)")
				.eq("author_id", user.id)
				.order("created_at", { ascending: false });
			return (data ?? []) as PostWithAuthor[];
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
				.select(
					"*, posts(*, profiles!posts_author_id_fkey(display_name, avatar_url))",
				)
				.eq("user_id", user.id)
				.order("created_at", { ascending: false });
			return (data ?? [])
				.map((s: any) => s.posts)
				.filter(Boolean) as PostWithAuthor[];
		},
		enabled: !!user && activeTab === "saved-posts",
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
			.update({ display_name: values.username })
			.eq("id", user.id);

		if (error) {
			toast.error("Failed to save settings");
		} else {
			toast.success("Settings saved successfully");
			queryClient.invalidateQueries({ queryKey: [MY_PROFILE_QUERY_KEY] });
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

	const handleAvatarUploadClick = () => {
		avatarInputRef.current?.click();
	};

	const handleAvatarFileSelected = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file || !user) return;
		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}

		try {
			setIsUploadingAvatar(true);
			const { publicUrl } = await uploadFileToBucket({
				bucket: STORAGE_BUCKETS.AVATARS,
				file,
				ownerId: user.id,
			});

			const { error } = await supabase
				.from("profiles")
				.update({ avatar_url: publicUrl })
				.eq("id", user.id);
			if (error) throw error;

			queryClient.invalidateQueries({ queryKey: [MY_PROFILE_QUERY_KEY] });
			toast.success("Avatar updated");
		} catch {
			toast.error("Failed to upload avatar");
		} finally {
			setIsUploadingAvatar(false);
			event.target.value = "";
		}
	};

	return (
		<>
			<input
				ref={avatarInputRef}
				type="file"
				accept="image/*"
				className="hidden"
				onChange={handleAvatarFileSelected}
			/>

			{/* Profile Header */}
			<ProfileHeader
				name={profile?.display_name ?? "User"}
				username={profile?.display_name ?? undefined}
				title={
					profile?.location
						? profile?.location
						: profile?.role === "admin"
							? "Administrator"
							: profile?.role === "moder"
								? "Moderator"
								: "Talk N Share Member"
				}
				avatarUrl={profile?.avatar_url ?? undefined}
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
								fullName: profile?.display_name ?? "",
								username: profile?.display_name ?? "",
								bio: "",
								}}
								onSave={handleSaveGeneral}
								onAvatarUpload={handleAvatarUploadClick}
								avatarUploading={isUploadingAvatar}
							/>
						)}
					{settingsTab === "account" && (
						<AccountSettings onDeleteAccount={handleDeleteAccount} />
					)}
				</SettingsLayout>
			)}
		</>
	);
}
