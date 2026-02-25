"use client";

import React, { useState } from "react";
import { useDashboardPosts } from "@/hooks/useDashboard";
import { PostWithAuthor } from "@/types/supabase";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	IconSearch,
	IconTrash,
	IconEdit,
	IconCheck,
	IconPhoto,
	IconHeart,
	IconMessage,
} from "@tabler/icons-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function PostsPage() {
	const { postsQuery, updatePost, deletePost, approvePost } =
		useDashboardPosts();
	const [search, setSearch] = useState("");
	const [editingPost, setEditingPost] = useState<PostWithAuthor | null>(null);
	const [editContent, setEditContent] = useState("");
	const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");

	const posts = postsQuery.data?.pages.flat() ?? [];

	const filteredPosts = posts.filter((post) => {
		const matchesSearch =
			(post.content ?? "").toLowerCase().includes(search.toLowerCase()) ||
			(post.profiles?.display_name ?? "")
				.toLowerCase()
				.includes(search.toLowerCase());
		if (filter === "approved")
			return matchesSearch && post.status === "approved";
		if (filter === "pending")
			return matchesSearch && post.status !== "approved";
		return matchesSearch;
	});

	const handleEdit = (post: PostWithAuthor) => {
		setEditingPost(post);
		setEditContent(post.content ?? "");
	};

	const handleSaveEdit = () => {
		if (!editingPost) return;
		updatePost.mutate(
			{ id: editingPost.id, content: editContent },
			{
				onSuccess: () => {
					toast.success("Post updated successfully");
					setEditingPost(null);
				},
				onError: () => toast.error("Failed to update post"),
			},
		);
	};

	const handleDelete = (postId: string) => {
		deletePost.mutate(postId, {
			onSuccess: () => toast.success("Post deleted successfully"),
			onError: () => toast.error("Failed to delete post"),
		});
	};

	const handleApprove = (postId: string) => {
		approvePost.mutate(postId, {
			onSuccess: () => toast.success("Post approved"),
			onError: () => toast.error("Failed to approve post"),
		});
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Posts</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Manage all posts on the platform
				</p>
			</div>

			{/* Toolbar */}
			<Card className="border-0 shadow-lg">
				<CardContent className="p-4">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
						<div className="relative flex-1">
							<IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder="Search posts..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="pl-9"
								id="search-posts"
							/>
						</div>
						<div className="flex gap-2">
							{(["all", "approved", "pending"] as const).map((f) => (
								<Button
									key={f}
									variant={filter === f ? "default" : "outline"}
									size="sm"
									onClick={() => setFilter(f)}
									id={`filter-${f}`}
								>
									{f.charAt(0).toUpperCase() + f.slice(1)}
								</Button>
							))}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Posts Table */}
			<Card className="border-0 shadow-lg overflow-hidden">
				<CardHeader>
					<CardTitle>All Posts ({filteredPosts.length})</CardTitle>
					<CardDescription>Review and moderate platform posts</CardDescription>
				</CardHeader>
				<CardContent className="p-0">
					{postsQuery.isLoading ? (
						<div className="space-y-4 p-6">
							{Array.from({ length: 5 }).map((_, i) => (
								<div
									key={i}
									className="h-20 animate-pulse rounded-xl bg-muted"
								/>
							))}
						</div>
					) : filteredPosts.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-16 text-center">
							<IconPhoto className="size-12 text-muted-foreground/40" />
							<p className="mt-3 text-sm font-medium text-muted-foreground">
								No posts found
							</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b border-border/50 bg-muted/30">
										<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
											Content
										</th>
										<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
											Author
										</th>
										<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
											Stats
										</th>
										<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
											Status
										</th>
										<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
											Date
										</th>
										<th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border/30">
									{filteredPosts.map((post) => (
										<tr
											key={post.id}
											className="group transition-colors hover:bg-muted/20"
										>
											<td className="max-w-xs px-6 py-4">
												<p className="line-clamp-2 text-sm">{post.content}</p>
												{post.image_url && (
													<Badge variant="outline" className="mt-1 gap-1">
														<IconPhoto className="size-3" />
														Image
													</Badge>
												)}
											</td>
											<td className="px-6 py-4">
												<div className="flex items-center gap-2">
													{post.profiles?.avatar_url ? (
														<img
															src={post.profiles.avatar_url}
															alt=""
															className="size-7 rounded-full object-cover"
														/>
													) : (
														<div className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-primary/50 to-primary text-[10px] font-bold text-white">
															{(post.profiles?.display_name ??
																"A")[0].toUpperCase()}
														</div>
													)}
													<span className="text-sm font-medium">
														{post.profiles?.display_name ?? "Anonymous"}
													</span>
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="flex items-center gap-3 text-sm text-muted-foreground">
													<span className="flex items-center gap-1">
														<IconHeart className="size-3.5" />
														{post.likes_count}
													</span>
													<span className="flex items-center gap-1">
														<IconMessage className="size-3.5" />
														{post.comments_count}
													</span>
												</div>
											</td>
											<td className="px-6 py-4">
												<Badge
													variant={
														post.status === "approved"
															? "default"
															: "destructive"
													}
												>
													{post.status === "approved" ? "Approved" : "Pending"}
												</Badge>
											</td>
											<td className="px-6 py-4 text-sm text-muted-foreground">
												{format(new Date(post.created_at), "MMM d, yyyy")}
											</td>
											<td className="px-6 py-4">
												<div className="flex items-center justify-end gap-1">
													{post.status !== "approved" && (
														<Button
															variant="ghost"
															size="icon-sm"
															onClick={() => handleApprove(post.id)}
															title="Approve"
															id={`approve-post-${post.id}`}
														>
															<IconCheck className="size-4 text-emerald-500" />
														</Button>
													)}
													<Button
														variant="ghost"
														size="icon-sm"
														onClick={() => handleEdit(post)}
														title="Edit"
														id={`edit-post-${post.id}`}
													>
														<IconEdit className="size-4" />
													</Button>
													<AlertDialog>
														<AlertDialogTrigger asChild>
															<Button
																variant="ghost"
																size="icon-sm"
																title="Delete"
																id={`delete-post-${post.id}`}
															>
																<IconTrash className="size-4 text-destructive" />
															</Button>
														</AlertDialogTrigger>
														<AlertDialogContent>
															<AlertDialogHeader>
																<AlertDialogTitle>Delete Post</AlertDialogTitle>
																<AlertDialogDescription>
																	Are you sure you want to delete this post?
																	This action cannot be undone.
																</AlertDialogDescription>
															</AlertDialogHeader>
															<AlertDialogFooter>
																<AlertDialogCancel>Cancel</AlertDialogCancel>
																<AlertDialogAction
																	variant="destructive"
																	onClick={() => handleDelete(post.id)}
																>
																	Delete
																</AlertDialogAction>
															</AlertDialogFooter>
														</AlertDialogContent>
													</AlertDialog>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Edit Modal */}
			<AlertDialog
				open={!!editingPost}
				onOpenChange={(open) => !open && setEditingPost(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Edit Post</AlertDialogTitle>
						<AlertDialogDescription>
							Modify the post content below
						</AlertDialogDescription>
					</AlertDialogHeader>
					<Textarea
						value={editContent}
						onChange={(e) => setEditContent(e.target.value)}
						rows={4}
						className="mt-2"
						id="edit-post-content"
					/>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setEditingPost(null)}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction onClick={handleSaveEdit}>
							Save Changes
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
