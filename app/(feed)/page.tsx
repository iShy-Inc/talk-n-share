"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePosts } from "@/hooks/usePosts";
import { useAuthStore } from "@/store/useAuthStore";
import { CreatePost } from "@/components/feed/CreatePost";
import { PostCard } from "@/components/feed/PostCard";
import { CommentList, CommentData } from "@/components/feed/CommentList";
import { SuggestedFriend } from "@/components/shared/SuggestedFriends";
import {
	MainLayout,
	AppLeftSidebar,
	AppRightSidebar,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";

const supabase = createClient();

export default function FeedPage() {
	const { user } = useAuthStore();
	const router = useRouter();
	const { posts, fetchNextPage, hasNextPage } = usePosts();
	const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

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

	// Fetch suggested friends
	const { data: suggestedFriends = [] } = useQuery({
		queryKey: ["suggested-friends"],
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

	// Fetch comments for expanded post
	const { data: comments = [] } = useQuery({
		queryKey: ["post-comments", expandedPostId],
		queryFn: async () => {
			if (!expandedPostId) return [];
			const { data } = await supabase
				.from("comments")
				.select("*, profiles(username, avatar_url)")
				.eq("post_id", expandedPostId)
				.order("created_at", { ascending: true });
			return (data ?? []).map((c: any) => ({
				id: c.id,
				authorName: c.profiles?.username ?? c.author_name ?? "Anonymous",
				authorAvatar: c.profiles?.avatar_url ?? c.author_avatar,
				content: c.content,
				timeAgo: new Date(c.created_at).toLocaleDateString(),
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
			author_name: profile?.username ?? "Anonymous",
			author_id: user.id,
		});
	};

	return (
		<MainLayout
			leftSidebar={<AppLeftSidebar profile={profile ?? null} />}
			rightSidebar={<AppRightSidebar suggestedFriends={suggestedFriends} />}
		>
			{user ? (
				<CreatePost />
			) : (
				<div className="mb-6 rounded-xl border border-border bg-card p-6 text-center shadow-sm">
					<h3 className="text-lg font-semibold">Join the conversation</h3>
					<p className="mb-4 text-sm text-muted-foreground">
						Sign in to share your thoughts and connect with others.
					</p>
					<Button onClick={() => router.push("/login")}>
						Sign In / Sign Up
					</Button>
				</div>
			)}

			{posts.length === 0 && (
				<div className="rounded-2xl border border-border bg-card py-16 text-center">
					<p className="text-lg font-medium text-muted-foreground">
						No posts yet
					</p>
					<p className="mt-1 text-sm text-muted-foreground/70">
						Be the first to share something!
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
									currentUserAvatar={profile?.avatar_url}
									onSubmitComment={handleAddComment}
									onReply={() => {}}
								/>
								<button
									onClick={() => setExpandedPostId(null)}
									className="mt-3 text-xs text-muted-foreground hover:text-foreground"
								>
									Hide comments
								</button>
							</div>
						) : (
							post.comments_count > 0 && (
								<button
									onClick={() => setExpandedPostId(post.id)}
									className="mt-1 text-xs text-muted-foreground hover:text-foreground"
								>
									View {post.comments_count} comment
									{post.comments_count !== 1 ? "s" : ""}
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
						Load more
					</Button>
				</div>
			)}
		</MainLayout>
	);
}
