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
import { PrivacySettingsForm } from "@/components/shared/PrivacySettingsForm";
import { AccountSettings } from "@/components/shared/AccountSettings";
import { ThemeSettings } from "@/components/shared/ThemeSettings";
import { PostCard } from "@/components/feed/PostCard";
import {
	AvatarCategoryKey,
	getAvatarCategoryForUrl,
} from "@/lib/avatar-options";
import { getZodiacSign } from "@/lib/zodiac";
import { toast } from "sonner";
import { PostWithAuthor } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { startOrRequestConversation } from "@/lib/contact-messaging";
import {
	formatDateDDMM,
	formatDateDDMMYYYY,
	formatDateMMYYYY,
	formatDateYYYY,
} from "@/utils/helpers/date";

const supabase = createClient();

const profileTabs: ProfileTab[] = [
	{ label: "Bài viết của tôi", value: "my-posts" },
	{ label: "Bài viết đã lưu", value: "saved-posts" },
	{ label: "Cài đặt", value: "settings" },
];

const visitorTabs: ProfileTab[] = [
	{ label: "Bài viết", value: "my-posts" },
	{ label: "Bài viết đã lưu", value: "saved-posts" },
];

const settingsMenuItems: SettingsMenuItem[] = [
	{ label: "Chung", value: "general" },
	{ label: "Riêng tư", value: "privacy" },
	{ label: "Giao diện", value: "appearance" },
	{ label: "Tài khoản", value: "account" },
	{ label: "Đăng xuất", value: "logout" },
];

const formatBirthDateByPrivacy = (
	value?: string | null,
	visibility?: string | null,
) => {
	if (!value) return "Không có";

	if (visibility === "year_only") {
		return formatDateYYYY(value);
	}
	if (visibility === "month_year") {
		return formatDateMMYYYY(value);
	}
	if (visibility === "day_month") {
		return formatDateDDMM(value);
	}
	return formatDateDDMMYYYY(value);
};

	const formatRelationship = (value?: string | null) => {
	if (!value) return undefined;
	if (value === "in_relationship") return "Đang trong mối quan hệ";
	if (value === "private") return "Không muốn tiết lộ";
	return value.charAt(0).toUpperCase() + value.slice(1);
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
					"*, profiles!posts_author_id_fkey(display_name, avatar_url, is_public, role)",
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
					"*, posts(*, profiles!posts_author_id_fkey(display_name, avatar_url, is_public, role))",
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
				{ label: "Bài viết", value: myPosts.length },
				{
					label: "Lượt thích",
					value: myPosts.reduce((sum, post) => sum + (post.likes_count ?? 0), 0),
				},
			];

	const handleSaveGeneral = async (values: {
		display_name: string;
		bio: string;
		avatarUrl: string;
		location: string;
	}) => {
		if (!user) return;

		const { error } = await supabase
			.from("profiles")
			.update({
				display_name: values.display_name,
				bio: values.bio || null,
				avatar_url: values.avatarUrl || null,
				location: values.location || null,
			})
			.eq("id", user.id);

		if (error) {
			toast.error("Không thể lưu cài đặt");
		} else {
			toast.success("Đã lưu cài đặt thành công");
			queryClient.invalidateQueries({ queryKey: [MY_PROFILE_QUERY_KEY] });
		}
	};

	const handleSavePrivacy = async (values: {
		birth_date: string;
		birth_visibility: string;
		relationship: string;
		is_public: boolean;
	}) => {
		if (!user) return;

		const isSwitchingToPublic =
			(myProfile?.is_public ?? true) === false && values.is_public;
		if (isSwitchingToPublic) {
			const confirmed = window.confirm(
				"Chuyển sang công khai sẽ làm thông tin hồ sơ hiển thị với người khác. Tiếp tục?",
			);
			if (!confirmed) {
				toast("Hồ sơ của bạn vẫn ở chế độ riêng tư.");
				return;
			}
		}

		const { error } = await supabase
			.from("profiles")
			.update({
				birth_date: values.birth_date || null,
				birth_visibility: values.birth_visibility || "full",
				relationship: values.relationship || "private",
				zodiac: values.birth_date ? getZodiacSign(values.birth_date) : null,
				is_public: values.is_public,
			})
			.eq("id", user.id);

		if (error) {
			toast.error("Không thể lưu cài đặt");
		} else {
			toast.success("Đã lưu cài đặt thành công");
			queryClient.invalidateQueries({ queryKey: [MY_PROFILE_QUERY_KEY] });
		}
	};

	const handleDeleteAccount = async () => {
		toast.error(
			"Xóa tài khoản cần quản trị viên xử lý. Vui lòng liên hệ hỗ trợ.",
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
				toast.success("Đã gửi yêu cầu nhắn tin tới tài khoản riêng tư này.");
				return;
			}
			router.push(`/messages?sessionId=${result.sessionId}`);
		} catch {
			toast.error("Không thể bắt đầu cuộc trò chuyện.");
		}
	};

	return (
		<>
			<ProfileHeader
				name={profile?.display_name ?? "Người dùng"}
				username={shouldHidePrivateInfo ? undefined : profile?.display_name ?? undefined}
				role={shouldHidePrivateInfo ? null : profile?.role}
				title={
					shouldHidePrivateInfo
						? undefined
						: profile?.location
							? profile.location
							: profile?.role === "admin"
								? "Quản trị viên"
								: profile?.role === "moder"
									? "Kiểm duyệt viên"
									: "Thành viên Talk N Share"
				}
				avatarUrl={shouldHidePrivateInfo ? undefined : profile?.avatar_url ?? undefined}
				joinDate={profile?.created_at}
				bio={shouldHidePrivateInfo ? undefined : profile?.bio ?? undefined}
				birthday={
					shouldHidePrivateInfo || !profile?.birth_date
						? undefined
						: formatBirthDateByPrivacy(profile.birth_date, profile.birth_visibility)
				}
				zodiac={
					shouldHidePrivateInfo || !profile?.zodiac
						? undefined
						: profile.zodiac
				}
				relationship={
					shouldHidePrivateInfo
						? undefined
						: formatRelationship(profile?.relationship)
				}
				actionSlot={
					!isOwnProfile ? (
						<Button onClick={handleSendMessage} size="sm" className="rounded-full">
							Gửi tin nhắn
						</Button>
					) : undefined
				}
				stats={stats}
				tabs={isOwnProfile ? profileTabs : visitorTabs}
				activeTab={effectiveActiveTab}
				onTabChange={setActiveTab}
			/>

			{effectiveActiveTab === "my-posts" && (
				<div className="space-y-4">
					{shouldHidePrivateInfo ? (
						<div className="rounded-2xl border border-border bg-card py-16 text-center">
							<p className="text-base font-medium text-muted-foreground">
								Đây là hồ sơ riêng tư
							</p>
						</div>
					) : myPosts.length === 0 ? (
						<div className="rounded-2xl border border-border bg-card py-16 text-center">
							<p className="text-base font-medium text-muted-foreground">
								{isOwnProfile
									? "Bạn chưa đăng bài nào"
									: "Người dùng này chưa đăng bài nào"}
							</p>
							{isOwnProfile && (
								<p className="mt-1 text-sm text-muted-foreground/70">
									Hãy chia sẻ suy nghĩ của bạn trên bảng tin!
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
								? "Đây là hồ sơ riêng tư"
								: "Bài viết đã lưu là riêng tư"}
						</p>
					</div>
				</div>
			)}

			{isOwnProfile && effectiveActiveTab === "saved-posts" && (
				<div className="space-y-4">
					{savedPosts.length === 0 ? (
						<div className="rounded-2xl border border-border bg-card py-16 text-center">
							<p className="text-base font-medium text-muted-foreground">
								Chưa có bài viết đã lưu
							</p>
							<p className="mt-1 text-sm text-muted-foreground/70">
								Lưu bài viết từ bảng tin để xem lại sau
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
								}}
							selectedAvatar={effectiveAvatar}
							selectedAvatarCategory={effectiveAvatarCategory}
							onAvatarSelect={setSelectedAvatar}
							onAvatarCategoryChange={setSelectedAvatarCategory}
							onSave={handleSaveGeneral}
						/>
					)}
					{settingsTab === "privacy" && (
						<PrivacySettingsForm
							key={`${profile?.id ?? "profile"}-${profile?.updated_at ?? "init"}-privacy`}
								initialValues={{
									birth_date: profile?.birth_date ?? "",
									birth_visibility: profile?.birth_visibility ?? "full",
									relationship: profile?.relationship ?? "private",
									is_public: profile?.is_public,
								}}
							onSave={handleSavePrivacy}
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
