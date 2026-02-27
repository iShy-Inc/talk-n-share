"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePosts } from "@/hooks/usePosts";
import { useAuthStore } from "@/store/useAuthStore";
import useProfile from "@/hooks/useProfile";
import { CreatePost } from "@/components/feed/CreatePost";
import { FeedEngagementCard } from "@/components/feed/FeedEngagementCard";
import { StoryIdeasSection } from "@/components/feed/StoryIdeasSection";
import { PostCard } from "@/components/feed/PostCard";
import { CommentList, CommentData } from "@/components/feed/CommentList";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatDateDDMMYYYY } from "@/utils/helpers/date";

const supabase = createClient();

export default function FeedPage() {
	const user = useAuthStore((state) => state.user);
	const router = useRouter();
	const { posts, fetchNextPage, hasNextPage } = usePosts();
	const { profile } = useProfile();
	const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

	// Fetch comments for expanded post
	const { data: comments = [] } = useQuery({
		queryKey: ["post-comments", expandedPostId],
		queryFn: async () => {
			if (!expandedPostId) return [];
			const { data } = await supabase
				.from("comments")
				.select("*, profiles(display_name, avatar_url)")
				.eq("post_id", expandedPostId)
				.order("created_at", { ascending: true });
			return (data ?? []).map((c: any) => ({
				id: c.id,
				authorName: c.profiles?.display_name ?? c.author_name ?? "Anonymous",
				authorAvatar: c.profiles?.avatar_url ?? c.author_avatar,
				content: c.content,
				timeAgo: formatDateDDMMYYYY(c.created_at),
			})) as CommentData[];
		},
		enabled: !!expandedPostId,
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

			{posts.map((post) => (
				<div key={post.id}>
					<PostCard post={post} />

					{/* Comment toggle */}
					<div className="px-1">
						{expandedPostId === post.id ? (
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
									onClick={() => setExpandedPostId(post.id)}
									className="mt-1 text-xs text-muted-foreground hover:text-foreground"
								>
									Xem {post.comments_count} bình luận
								</button>
							)
						)}
					</div>
				</div>
			))}

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
		</>
	);
}
