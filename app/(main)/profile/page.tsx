"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import useProfile, { UserProfile } from "@/hooks/useProfile";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
	ProfileHeader,
	ProfileStat,
	ProfileTab,
} from "@/components/shared/ProfileHeader";
import { CreatePost } from "@/components/feed/CreatePost";
import { PostCard } from "@/components/feed/PostCard";
import { SuggestedFriendsFacebookCard } from "@/components/shared/SuggestedFriendsFacebookCard";
import { toast } from "sonner";
import { PostWithAuthor } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { startOrRequestConversation } from "@/lib/contact-messaging";
import { STORAGE_BUCKETS, uploadFileToBucket } from "@/lib/supabase-storage";
import {
	formatDateDDMM,
	formatDateDDMMYYYY,
	formatDateMMYYYY,
	formatDateYYYY,
} from "@/utils/helpers/date";
import type { SuggestedFriend } from "@/components/shared/SuggestedFriends";

const supabase = createClient();

const profileTabs: ProfileTab[] = [
	{ label: "Bài viết của tôi", value: "my-posts" },
	{ label: "Bài viết đã thích", value: "liked-posts" },
	{ label: "Bài viết đã repost", value: "reposted-posts" },
];

const visitorTabs: ProfileTab[] = [
	{ label: "Bài viết", value: "my-posts" },
	{ label: "Bài viết đã thích", value: "liked-posts" },
	{ label: "Bài viết đã repost", value: "reposted-posts" },
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

function ProfilePageContent() {
	const user = useAuthStore((state) => state.user);
	const router = useRouter();
	const searchParams = useSearchParams();
	const requestedProfileId = searchParams.get("userId");
	const isOwnProfile = !requestedProfileId || requestedProfileId === user?.id;
	const profileId = isOwnProfile ? user?.id : requestedProfileId;
	const requestedTab =
		searchParams.get("tab") === "liked-posts"
			? "liked-posts"
			: searchParams.get("tab") === "reposted-posts"
				? "reposted-posts"
				: "my-posts";
	const [activeTab, setActiveTab] = useState(requestedTab);
	const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
	const [reportReason, setReportReason] = useState("harassment");
	const [reportEvidenceUrl, setReportEvidenceUrl] = useState<string | null>(
		null,
	);
	const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
	const [isSubmittingReport, setIsSubmittingReport] = useState(false);
	const { profile: myProfile } = useProfile();

	const {
		data: visitedProfile = null,
		isLoading: isLoadingVisitedProfile,
	} = useQuery({
		queryKey: ["profile-by-id", requestedProfileId],
		queryFn: async () => {
			if (!requestedProfileId) return null;
			const { data, error } = await supabase
				.rpc("get_profile_for_viewer", {
					target_profile_id: requestedProfileId,
				})
				.maybeSingle();
			if (error) throw error;
			return data as UserProfile | null;
		},
		enabled: !!requestedProfileId && !isOwnProfile,
	});

	const { data: visitedProfilePostSnapshot = null } = useQuery({
		queryKey: ["profile-post-snapshot", requestedProfileId],
		queryFn: async () => {
			if (!requestedProfileId) return null;
			const { data, error } = await supabase
				.from("posts")
				.select("author_name, author_avatar")
				.eq("author_id", requestedProfileId)
				.order("created_at", { ascending: false })
				.limit(1)
				.maybeSingle();
			if (error) throw error;
			return (data ?? null) as {
				author_name?: string | null;
				author_avatar?: string | null;
			} | null;
		},
		enabled: !!requestedProfileId && !isOwnProfile,
	});

	const profile = isOwnProfile ? myProfile : visitedProfile;
	const fallbackProfileName = visitedProfilePostSnapshot?.author_name ?? undefined;
	const fallbackProfileAvatar =
		visitedProfilePostSnapshot?.author_avatar ?? undefined;
	const shouldHidePrivateInfo =
		!isOwnProfile &&
		!isLoadingVisitedProfile &&
		(visitedProfile === null || (profile?.is_public ?? true) === false);
	const isPrivateStatePending = !isOwnProfile && isLoadingVisitedProfile;
	const canViewActivityTabs =
		isOwnProfile || (!isPrivateStatePending && !shouldHidePrivateInfo);

	const effectiveActiveTab = canViewActivityTabs ? activeTab : "my-posts";

	useEffect(() => {
		setActiveTab(requestedTab);
	}, [requestedProfileId, requestedTab]);

	useEffect(() => {
		if (isOwnProfile && searchParams.get("tab") === "settings") {
			const section = searchParams.get("section");
			router.replace(
				section
					? `/profile/settings?section=${encodeURIComponent(section)}`
					: "/profile/settings",
			);
			return;
		}

		const currentSection = searchParams.get("section");
		if (!currentSection) return;

		const nextParams = new URLSearchParams(searchParams.toString());
		nextParams.delete("section");

		const nextQuery = nextParams.toString();
		router.replace(nextQuery ? `/profile?${nextQuery}` : "/profile");
	}, [isOwnProfile, router, searchParams]);

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
			return (data ?? []).map((post: any) => ({
				...post,
				author_name:
					post.profiles?.display_name ?? post.author_name ?? "Người dùng",
				author_avatar:
					post.profiles?.avatar_url ?? post.author_avatar ?? null,
			})) as PostWithAuthor[];
		},
		enabled:
			!!profileId &&
			effectiveActiveTab === "my-posts" &&
			!isPrivateStatePending &&
			!shouldHidePrivateInfo,
	});

	const { data: likedPosts = [] } = useQuery({
		queryKey: ["liked-posts", profileId],
		queryFn: async () => {
			if (!profileId) return [];
			const { data, error } = await supabase
				.from("likes")
				.select(
					"created_at, posts(*, profiles!posts_author_id_fkey(display_name, avatar_url, is_public, role))",
				)
				.eq("user_id", profileId)
				.order("created_at", { ascending: false });
			if (error) throw error;
			return (data ?? [])
				.map((item: any) => {
					const post = item.posts;
					if (!post) return null;
					return {
						...post,
						author_name:
							post.profiles?.display_name ?? post.author_name ?? "Người dùng",
						author_avatar:
							post.profiles?.avatar_url ?? post.author_avatar ?? null,
					};
				})
				.filter(Boolean) as PostWithAuthor[];
		},
		enabled:
			!!profileId &&
			canViewActivityTabs &&
			effectiveActiveTab === "liked-posts" &&
			!isPrivateStatePending,
	});

	const { data: repostedPosts = [] } = useQuery({
		queryKey: ["reposted-posts", profileId],
		queryFn: async () => {
			if (!profileId) return [];
			const { data, error } = await supabase
				.from("post_reposts")
				.select(
					"created_at, posts!post_reposts_post_id_fkey(*, profiles!posts_author_id_fkey(display_name, avatar_url, is_public, role))",
				)
				.eq("reposter_id", profileId)
				.order("created_at", { ascending: false });
			if (error) throw error;
			return (data ?? [])
				.map((item: any) => {
					const post = item.posts;
					if (!post) return null;
					return {
						...post,
						author_name:
							post.profiles?.display_name ?? post.author_name ?? "Người dùng",
						author_avatar:
							post.profiles?.avatar_url ?? post.author_avatar ?? null,
					};
				})
				.filter(Boolean) as PostWithAuthor[];
		},
		enabled:
			!!profileId &&
			canViewActivityTabs &&
			effectiveActiveTab === "reposted-posts" &&
			!isPrivateStatePending,
	});

	const { data: suggestedFriends = [] } = useQuery({
		queryKey: [
			"profile-inline-suggested-friends",
			user?.id,
			myProfile?.location,
			myProfile?.gender,
			myProfile?.zodiac,
			myProfile?.relationship,
			profileId,
		],
		queryFn: async () => {
			if (!user || !myProfile) return [];
			const { data, error } = await supabase
				.from("profiles")
				.select(
					"id, display_name, avatar_url, location, gender, zodiac, relationship",
				)
				.eq("is_public", true)
				.neq("id", user.id)
				.neq("id", profileId ?? "")
				.limit(40);
			if (error) throw error;

			const current = {
				location: myProfile.location ?? null,
				gender: myProfile.gender ?? null,
				zodiac: myProfile.zodiac ?? null,
				relationship: myProfile.relationship ?? null,
			};

			const scored = (data ?? [])
				.map((u: any) => {
					let commonCount = 0;
					if (current.location && u.location === current.location)
						commonCount += 1;
					if (current.gender && u.gender === current.gender) commonCount += 1;
					if (current.zodiac && u.zodiac === current.zodiac) commonCount += 1;
					if (current.relationship && u.relationship === current.relationship) {
						commonCount += 1;
					}
					return { ...u, commonCount };
				})
				.sort((a: any, b: any) => b.commonCount - a.commonCount);

			const picked = scored.some((u: any) => u.commonCount > 0)
				? scored.filter((u: any) => u.commonCount > 0)
				: scored;

			return picked.slice(0, 5).map((u: any) => ({
				id: u.id,
				name: u.display_name ?? "Người dùng",
				title: u.location ?? "Thành viên Talk N Share",
				avatar: u.avatar_url ?? undefined,
			})) as SuggestedFriend[];
		},
		enabled:
			!!user &&
			!!myProfile &&
			!!profileId &&
			!isOwnProfile &&
			effectiveActiveTab === "my-posts",
	});

	const stats: ProfileStat[] = shouldHidePrivateInfo
		? []
		: [
				{ label: "Bài viết", value: myPosts.length },
				{
					label: "Lượt thích",
					value: myPosts.reduce(
						(sum, post) => sum + (post.likes_count ?? 0),
						0,
					),
				},
			];

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
			router.push(`/messages?sessionId=${result.sessionId}`);
		} catch {
			toast.error("Không thể bắt đầu cuộc trò chuyện.");
		}
	};

	const handleReportEvidenceSelected = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		if (!user) {
			router.push("/login");
			return;
		}
		const file = event.target.files?.[0];
		if (!file) return;
		if (!file.type.startsWith("image/")) {
			toast.error("Vui lòng chọn file ảnh.");
			return;
		}

		try {
			setIsUploadingEvidence(true);
			const { publicUrl } = await uploadFileToBucket({
				bucket: STORAGE_BUCKETS.REPORT_EVIDENCE,
				file,
				ownerId: user.id,
			});
			setReportEvidenceUrl(publicUrl);
			toast.success("Đã tải ảnh bằng chứng.");
		} catch {
			toast.error("Không thể tải ảnh bằng chứng.");
		} finally {
			setIsUploadingEvidence(false);
			event.target.value = "";
		}
	};

	const handleSubmitProfileReport = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!user) {
			router.push("/login");
			return;
		}
		if (!profileId || isOwnProfile) return;
		if (!reportEvidenceUrl) {
			toast.error("Bắt buộc phải có ảnh bằng chứng.");
			return;
		}

		try {
			setIsSubmittingReport(true);
			const { error } = await supabase.from("reports").insert({
				reporter_id: user.id,
				reported_user_id: profileId,
				target_type: "user",
				target_id: null,
				reason: reportReason,
				status: "pending",
				evidence_image_url: reportEvidenceUrl,
			});
			if (error) throw error;

			toast.success("Đã gửi báo cáo người dùng.");
			setIsReportDialogOpen(false);
			setReportReason("harassment");
			setReportEvidenceUrl(null);
		} catch {
			toast.error("Gửi báo cáo thất bại.");
		} finally {
			setIsSubmittingReport(false);
		}
	};

	return (
		<>
			<ProfileHeader
				userId={profileId ?? undefined}
				name={profile?.display_name ?? fallbackProfileName ?? "Người dùng"}
				username={
					shouldHidePrivateInfo
						? undefined
						: (profile?.display_name ?? fallbackProfileName ?? undefined)
				}
				role={profile?.role}
				isPublic={profile?.is_public}
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
				avatarUrl={
					profile?.avatar_url ?? fallbackProfileAvatar
				}
				joinDate={shouldHidePrivateInfo ? undefined : profile?.created_at}
				bio={shouldHidePrivateInfo ? undefined : (profile?.bio ?? undefined)}
				birthday={
					shouldHidePrivateInfo || !profile?.birth_date
						? undefined
						: formatBirthDateByPrivacy(
								profile.birth_date,
								profile.birth_visibility,
							)
				}
				zodiac={
					shouldHidePrivateInfo || !profile?.zodiac ? undefined : profile.zodiac
				}
				relationship={
					shouldHidePrivateInfo
						? undefined
						: formatRelationship(profile?.relationship)
				}
				actionSlot={
					isOwnProfile ? (
						<Button asChild size="sm" variant="outline" className="rounded-full">
							<Link href="/profile/settings?section=general">Cài đặt</Link>
						</Button>
					) : (
						<div className="flex items-center gap-2">
							<Button
								onClick={handleSendMessage}
								size="sm"
								className="rounded-full"
							>
								Gửi tin nhắn
							</Button>
							<Button
								onClick={() => setIsReportDialogOpen(true)}
								size="sm"
								variant="outline"
								className="rounded-full border-amber-500/40 text-amber-700 hover:bg-amber-500/10 hover:text-amber-800"
							>
								Báo cáo
							</Button>
						</div>
					)
				}
				stats={stats}
				tabs={canViewActivityTabs ? (isOwnProfile ? profileTabs : visitorTabs) : []}
				activeTab={effectiveActiveTab}
				onTabChange={setActiveTab}
			/>

			{effectiveActiveTab === "my-posts" && (
				<div className="space-y-4">
					{isOwnProfile && !isPrivateStatePending && !shouldHidePrivateInfo && (
						<CreatePost />
					)}
					{isPrivateStatePending ? (
						<div className="rounded-2xl border border-border bg-card py-16 text-center">
							<p className="text-base font-medium text-muted-foreground">
								Đang tải hồ sơ...
							</p>
						</div>
					) : shouldHidePrivateInfo ? (
						<div className="rounded-2xl border border-border bg-card py-16 text-center">
							<p className="text-base font-medium text-muted-foreground">
								Đây là tài khoản riêng tư
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
						<>
							{!isOwnProfile && suggestedFriends.length > 0 && (
								<SuggestedFriendsFacebookCard
									friends={suggestedFriends}
									className="mb-2"
								/>
							)}
							{myPosts.map((post) => (
								<PostCard key={post.id} post={post} />
							))}
						</>
					)}
				</div>
			)}

			{canViewActivityTabs && effectiveActiveTab === "liked-posts" && (
				<div className="space-y-4">
					{likedPosts.length === 0 ? (
						<div className="rounded-2xl border border-border bg-card py-16 text-center">
							<p className="text-base font-medium text-muted-foreground">
								Chưa có bài viết đã thích
							</p>
							{isOwnProfile && (
								<p className="mt-1 text-sm text-muted-foreground/70">
									Thả tim bài viết từ bảng tin để xem lại tại đây
								</p>
							)}
						</div>
					) : (
						likedPosts.map((post) => <PostCard key={post.id} post={post} />)
					)}
				</div>
			)}

			{canViewActivityTabs && effectiveActiveTab === "reposted-posts" && (
				<div className="space-y-4">
					{repostedPosts.length === 0 ? (
						<div className="rounded-2xl border border-border bg-card py-16 text-center">
							<p className="text-base font-medium text-muted-foreground">
								Chưa có bài viết đã repost
							</p>
							{isOwnProfile && (
								<p className="mt-1 text-sm text-muted-foreground/70">
									Repost bài viết từ bảng tin để xem lại tại đây
								</p>
							)}
						</div>
					) : (
						repostedPosts.map((post) => (
							<PostCard key={post.id} post={post} />
						))
					)}
				</div>
			)}

			<Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<form onSubmit={handleSubmitProfileReport} className="space-y-4">
						<DialogHeader>
							<DialogTitle>Báo cáo người dùng</DialogTitle>
							<DialogDescription>
								Vui lòng cung cấp lý do và ảnh bằng chứng. Ảnh bằng chứng là bắt
								buộc.
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-2">
							<Label htmlFor="profile-report-reason">Lý do</Label>
							<select
								id="profile-report-reason"
								title="Lý do"
								className="h-9 w-full rounded-4xl border border-input bg-input/30 px-3 text-sm outline-none focus-visible:border-ring"
								value={reportReason}
								onChange={(e) => setReportReason(e.target.value)}
							>
								<option value="harassment">Quấy rối</option>
								<option value="hate_speech">Ngôn từ thù ghét</option>
								<option value="sexual_content">Nội dung nhạy cảm</option>
								<option value="threat">Đe dọa</option>
								<option value="scam">Lừa đảo</option>
								<option value="other">Khác</option>
							</select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="profile-report-evidence">
								Ảnh bằng chứng <span className="text-destructive">*</span>
							</Label>
							<Input
								id="profile-report-evidence"
								type="file"
								accept="image/*"
								required
								onChange={handleReportEvidenceSelected}
							/>
							{reportEvidenceUrl && (
								<a
									href={reportEvidenceUrl}
									target="_blank"
									rel="noreferrer"
									className="text-xs font-medium text-primary underline underline-offset-2"
								>
									Xem ảnh đã tải lên
								</a>
							)}
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsReportDialogOpen(false)}
							>
								Hủy
							</Button>
							<Button
								type="submit"
								disabled={
									isSubmittingReport ||
									isUploadingEvidence ||
									!reportEvidenceUrl ||
									!profileId ||
									isOwnProfile
								}
								className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							>
								Gửi báo cáo
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}

export default function ProfilePage() {
	return (
		<Suspense fallback={null}>
			<ProfilePageContent />
		</Suspense>
	);
}
