"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { usePosts } from "@/hooks/usePosts";
import { useAuthStore } from "@/store/useAuthStore";
import useProfile from "@/hooks/useProfile";
import { CreatePost } from "@/components/feed/CreatePost";
import { FeedEngagementCard } from "@/components/feed/FeedEngagementCard";
import { StoryIdeasSection } from "@/components/feed/StoryIdeasSection";
import { PostCard } from "@/components/feed/PostCard";
import { CommentList, CommentData } from "@/components/feed/CommentList";
import { SuggestedFriend } from "@/components/shared/SuggestedFriends";
import { SuggestedFriendsFacebookCard } from "@/components/shared/SuggestedFriendsFacebookCard";
import { SidebarFooter } from "@/components/shared/SidebarFooter";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatDateDDMMYYYY } from "@/utils/helpers/date";

const supabase = createClient();

const hashString = (input: string) => {
	let hash = 0;
	for (let i = 0; i < input.length; i += 1) {
		hash = (hash * 31 + input.charCodeAt(i)) % 2147483647;
	}
	return Math.abs(hash);
};

export default function FeedPage() {
	const user = useAuthStore((state) => state.user);
	const router = useRouter();
	const { posts, fetchNextPage, hasNextPage } = usePosts();
	const { profile } = useProfile();
	const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
	const visibleExpandedPostId = user ? expandedPostId : null;

	// Fetch comments for expanded post
	const { data: comments = [] } = useQuery({
		queryKey: ["post-comments", visibleExpandedPostId],
		queryFn: async () => {
			if (!visibleExpandedPostId) return [];
			const { data } = await supabase
				.from("comments")
				.select("*, profiles(display_name, avatar_url, is_public)")
				.eq("post_id", visibleExpandedPostId)
				.order("created_at", { ascending: true });
			return (data ?? []).map((c: any) => ({
				id: c.id,
				authorId: c.author_id,
				authorIsPublic: c.profiles?.is_public ?? null,
				authorName: c.profiles?.display_name ?? c.author_name ?? "Người dùng",
				authorAvatar: c.profiles?.avatar_url ?? c.author_avatar,
				content: c.content,
				timeAgo: formatDateDDMMYYYY(c.created_at),
			})) as CommentData[];
		},
		enabled: !!visibleExpandedPostId,
	});

	const handleAddComment = async (content: string) => {
		if (!user) {
			router.push("/login");
			return;
		}
		if (!expandedPostId) return;
		await supabase.from("comments").insert({
			post_id: expandedPostId,
			content,
			author_id: user.id,
		});
	};

	const { data: suggestedFriends = [] } = useQuery({
		queryKey: [
			"feed-inline-suggested-friends",
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
				.neq("id", user.id)
				.limit(40);
			if (error) throw error;

			const current = {
				location: profile?.location ?? null,
				gender: profile?.gender ?? null,
				zodiac: profile?.zodiac ?? null,
				relationship: profile?.relationship ?? null,
			};

			return (data ?? [])
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
				.slice(0, 4)
				.map((u: any) => ({
					id: u.id,
					name: u.display_name ?? "Người dùng",
					title: u.location ?? "Thành viên Talk N Share",
					avatar: u.avatar_url ?? undefined,
				})) as SuggestedFriend[];
		},
		enabled: !!user && !!profile,
	});

	const inlineSuggestedInsertIndex = useMemo(() => {
		if (posts.length < 3) return null;
		const min = Math.max(1, Math.floor(posts.length * 0.35));
		const max = Math.max(min, Math.floor(posts.length * 0.7));
		const seedSource = `${user?.id ?? "guest"}-${posts
			.slice(0, 3)
			.map((p) => p.id)
			.join("-")}`;
		const hashed = hashString(seedSource);
		return min + (hashed % (max - min + 1));
	}, [posts, user?.id]);

	const shouldShowInlineSuggested =
		user && suggestedFriends.length > 0 && inlineSuggestedInsertIndex !== null;

	const postItemsWithInlineSuggested = useMemo(() => {
		if (!shouldShowInlineSuggested) {
			return posts.map((post) => ({ type: "post" as const, post }));
		}

		return posts.flatMap((post, index) => {
			const items: Array<
				| { type: "post"; post: (typeof posts)[number] }
				| { type: "suggested" }
			> = [{ type: "post", post }];

			if (
				inlineSuggestedInsertIndex !== null &&
				index === Math.min(inlineSuggestedInsertIndex, posts.length - 1)
			) {
				items.push({ type: "suggested" });
			}
			return items;
		});
	}, [posts, shouldShowInlineSuggested, inlineSuggestedInsertIndex]);

	return (
		<>
			{user ? (
				<>
					<CreatePost />
					<FeedEngagementCard />
					<StoryIdeasSection />
				</>
			) : (
				<div className="mb-6 rounded-xl border border-border bg-card p-6 text-center shadow-sm">
					<h3 className="text-lg font-semibold">Tham gia cuộc trò chuyện</h3>
					<p className="mb-4 text-sm text-muted-foreground">
						Đăng nhập để chia sẻ suy nghĩ và kết nối với mọi người.
					</p>
					<Button onClick={() => router.push("/login")}>
						Đăng nhập / Đăng ký
					</Button>
				</div>
			)}

			{posts.length === 0 && (
				<div className="rounded-2xl border border-border bg-card py-16 text-center">
					<p className="text-lg font-medium text-muted-foreground">
						Chưa có bài viết nào
					</p>
					<p className="mt-1 text-sm text-muted-foreground/70">
						Hãy là người đầu tiên chia sẻ điều gì đó!
					</p>
				</div>
			)}

			{postItemsWithInlineSuggested.map((item, idx) => {
				if (item.type === "suggested") {
					return (
						<div key={`inline-suggested-${idx}`} className="my-2">
							<SuggestedFriendsFacebookCard
								friends={suggestedFriends}
								className="md:hidden"
							/>
						</div>
					);
				}

				const post = item.post;
				return (
					<div key={post.id}>
						<PostCard post={post} />

						{/* Comment toggle */}
						<div className="px-1">
							{visibleExpandedPostId === post.id ? (
								<div className="mt-2 rounded-xl border border-border bg-card p-4">
									<CommentList
										comments={comments}
										currentUserAvatar={profile?.avatar_url ?? undefined}
										onSubmitComment={handleAddComment}
										onReply={() => {}}
									/>
									<button
										onClick={() => setExpandedPostId(null)}
										className="mt-3 text-xs text-muted-foreground hover:text-foreground"
									>
										Ẩn bình luận
									</button>
								</div>
							) : (
								(post.comments_count ?? 0) > 0 && (
									<button
										onClick={() => {
											if (!user) {
												router.push("/login");
												return;
											}
											setExpandedPostId(post.id);
										}}
										className="mt-1 text-xs text-muted-foreground hover:text-foreground"
									>
										Xem {post.comments_count} bình luận
									</button>
								)
							)}
						</div>
					</div>
				);
			})}

			{hasNextPage && (
				<div className="flex justify-center py-4">
					<Button
						variant="outline"
						onClick={() => fetchNextPage()}
						className="rounded-full px-6"
						id="load-more-posts"
					>
						Tải thêm
					</Button>
				</div>
			)}

			<div className="lg:hidden">
				<SidebarFooter />
			</div>
		</>
	);
}
