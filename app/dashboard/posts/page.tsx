"use client";

import React, { useRef, useState } from "react";
import { useDashboardPosts } from "@/hooks/useDashboard";
import { Post, PostWithAuthor } from "@/types/supabase";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { EmojiPickerButton } from "@/components/shared/EmojiPickerButton";
import {
	IconSearch,
	IconTrash,
	IconEdit,
	IconCheck,
	IconPhoto,
	IconHeart,
	IconMessage,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { formatDateDDMMYYYY } from "@/utils/helpers/date";
import { GifPickerButton } from "@/components/shared/GifPickerButton";
import { fetchGiphyGifById, type GifSelection } from "@/lib/giphy";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export default function PostsPage() {
	const { postsQuery, updatePost, deletePost, approvePost } =
		useDashboardPosts();
	const [search, setSearch] = useState("");
	const [editingPost, setEditingPost] = useState<PostWithAuthor | null>(null);
	const contentInputRef = useRef<HTMLTextAreaElement>(null);
	const [selectedGif, setSelectedGif] = useState<GifSelection | null>(null);
	const [editForm, setEditForm] = useState({
		author_id: "",
		content: "",
		image_url: "",
		status: "pending",
	});
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
		setEditForm({
			author_id: post.author_id,
			content: post.content ?? "",
			image_url: post.image_url ?? "",
			status: post.status ?? "pending",
		});
		setSelectedGif(null);
		if (post.gif_provider === "giphy" && post.gif_id) {
			void fetchGiphyGifById(post.gif_id).then((gif) => {
				setSelectedGif(gif);
			});
		}
		requestAnimationFrame(() => {
			document
				.getElementById("edit-post-panel")
				?.scrollIntoView({ behavior: "smooth", block: "start" });
		});
	};

	const handleSaveEdit = () => {
		if (!editingPost) return;
		updatePost.mutate(
			{
				id: editingPost.id,
				author_id: editForm.author_id,
				content: editForm.content || null,
				image_url: editForm.image_url || null,
				gif_provider: selectedGif?.provider ?? null,
				gif_id: selectedGif?.id ?? null,
				status: editForm.status as Post["status"],
			},
			{
				onSuccess: () => {
					toast.success("Post updated successfully");
					setSelectedGif(null);
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

	const handleSelectEmoji = (emoji: string) => {
		const input = contentInputRef.current;
		const selectionStart = input?.selectionStart ?? editForm.content.length;
		const selectionEnd = input?.selectionEnd ?? editForm.content.length;
		const nextContent =
			editForm.content.slice(0, selectionStart) +
			emoji +
			editForm.content.slice(selectionEnd);
		const nextCursor = selectionStart + emoji.length;

		setEditForm((prev) => ({ ...prev, content: nextContent }));

		requestAnimationFrame(() => {
			contentInputRef.current?.focus({ preventScroll: true });
			contentInputRef.current?.setSelectionRange(nextCursor, nextCursor);
		});
	};

	return (
		<div className="animate-fade-up space-y-4 md:space-y-6">
			<div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm md:p-5">
				<h1 className="text-xl font-bold tracking-tight md:text-2xl">Posts</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Review published and pending posts in one cleaner moderation queue.
				</p>
			</div>

			{/* Toolbar */}
			<Card className="rounded-2xl border border-border/70 bg-card/90 shadow-sm">
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
						<div className="flex gap-2 rounded-xl border border-border/60 bg-muted/20 p-1">
							{(["all", "approved", "pending"] as const).map((f) => (
								<Button
									key={f}
									variant={filter === f ? "default" : "outline"}
									size="sm"
									onClick={() => setFilter(f)}
									className="rounded-lg"
									id={`filter-${f}`}
								>
									{f.charAt(0).toUpperCase() + f.slice(1)}
								</Button>
							))}
						</div>
					</div>
				</CardContent>
			</Card>

			{editingPost && (
				<Card
					id="edit-post-panel"
					className="rounded-2xl border border-border/70 bg-card/95 shadow-sm"
				>
					<CardHeader>
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<CardTitle>Edit Post</CardTitle>
								<CardDescription>
									Edit post fields in-page. The page scroll handles long forms
									more reliably than overlays.
								</CardDescription>
							</div>
							<Button
								variant="outline"
								type="button"
								onClick={() => setEditingPost(null)}
							>
								Close editor
							</Button>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<label htmlFor="edit-post-author" className="text-sm font-medium">
								Author ID
							</label>
							<Input
								id="edit-post-author"
								value={editForm.author_id}
								disabled
							/>
						</div>
						<div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
							<label
								htmlFor="edit-post-content"
								className="mb-2 block text-sm font-medium"
							>
								Content
							</label>
							<textarea
								ref={contentInputRef}
								value={editForm.content}
								onChange={(e) =>
									setEditForm({ ...editForm, content: e.target.value })
								}
								id="edit-post-content"
								className="min-h-[120px] w-full resize-none rounded-2xl border border-transparent bg-muted/55 px-4 py-3 text-[15px] leading-relaxed placeholder:text-muted-foreground/80 focus:border-border focus:outline-none"
								placeholder="Chỉnh sửa nội dung bài viết..."
							/>
							<div className="mt-3 flex justify-end border-t border-border/70 pt-3">
								<EmojiPickerButton
									onSelect={handleSelectEmoji}
									panelSide="top"
								/>
							</div>
						</div>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<label
									htmlFor="edit-post-image"
									className="text-sm font-medium"
								>
									Image URL
								</label>
								<Input
									id="edit-post-image"
									value={editForm.image_url}
									onChange={(e) =>
										setEditForm({ ...editForm, image_url: e.target.value })
									}
								/>
							</div>
							<div className="space-y-2">
								<label
									htmlFor="edit-post-status"
									className="text-sm font-medium"
								>
									Status
								</label>
								<Select
									value={editForm.status}
									onValueChange={(value) =>
										setEditForm({ ...editForm, status: value })
									}
								>
									<SelectTrigger id="edit-post-status">
										<SelectValue placeholder="Chọn trạng thái" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="approved">Approved</SelectItem>
										<SelectItem value="pending">Pending</SelectItem>
										<SelectItem value="rejected">Rejected</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="space-y-3">
							<div className="overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/20 shadow-sm">
								<div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center">
									<div className="space-y-4">
										<div className="flex flex-wrap items-center gap-2">
											<Badge
												variant={selectedGif ? "default" : "outline"}
												className="rounded-full px-3 py-1"
											>
												{selectedGif ? "GIF đã chọn" : "Chưa có GIF"}
											</Badge>
											<Badge
												variant="secondary"
												className="rounded-full px-3 py-1"
											>
												GIPHY
											</Badge>
										</div>
										<div className="space-y-2">
											<div>
												<p className="text-sm font-medium">GIF Preview</p>
												<p className="mt-1 text-sm text-muted-foreground">
													Sử dụng bộ chọn có sẵn để đổi GIF nhanh
												</p>
											</div>
											<div className="rounded-2xl border border-border/60 bg-background/70 p-3">
												<p className="text-sm font-medium text-foreground">
													{selectedGif?.title || "Chưa có GIF được gán"}
												</p>
												<p className="mt-1 text-xs text-muted-foreground">
													{selectedGif
														? "GIF hiện tại sẽ được lưu cùng bài viết khi bạn nhấn Save Changes."
														: "Bạn có thể để trống nếu bài viết chỉ cần nội dung văn bản hoặc ảnh."}
												</p>
											</div>
										</div>
										<div className="flex flex-wrap items-center gap-2">
											<GifPickerButton
												onSelect={setSelectedGif}
												className="rounded-full px-4"
											/>
											{selectedGif && (
												<Button
													type="button"
													variant="outline"
													size="sm"
													className="rounded-full"
													onClick={() => setSelectedGif(null)}
												>
													Xóa GIF
												</Button>
											)}
										</div>
									</div>
									<div className="flex justify-center lg:justify-end">
										{selectedGif ? (
											<div className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-[0_20px_45px_-24px_rgba(15,23,42,0.5)]">
												<div className="relative">
													<img
														src={selectedGif.previewUrl}
														alt={selectedGif.title}
														className="size-72 object-cover"
													/>
													<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
													<div className="absolute inset-x-0 bottom-0 space-y-1 px-4 py-4">
														<p className="truncate text-sm font-semibold text-white">
															{selectedGif.title || "GIF"}
														</p>
														<p className="text-xs text-white/80">
															Dang xem truoc trong post editor
														</p>
													</div>
												</div>
											</div>
										) : (
											<div className="flex size-72 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-border/70 bg-background/60 px-6 text-center shadow-inner">
												<div className="space-y-1">
													<p className="text-sm font-medium text-foreground/85">
														Chua chon GIF
													</p>
													<p className="text-xs text-muted-foreground">
														Nhan nut GIF de mo picker va xem truoc tai day.
													</p>
												</div>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
						{editForm.image_url && (
							<div className="space-y-2">
								<label className="text-sm font-medium">Image Preview</label>
								<img
									src={editForm.image_url}
									alt="Post preview"
									className="h-56 w-full rounded-xl border border-border/70 object-cover"
								/>
							</div>
						)}
						<div className="flex flex-col-reverse gap-2 border-t border-border/70 pt-4 sm:flex-row sm:justify-end">
							<Button
								variant="outline"
								type="button"
								onClick={() => setEditingPost(null)}
							>
								Hủy
							</Button>
							<Button onClick={handleSaveEdit}>Lưu thay đổi</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Posts Table */}
			<Card className="rounded-2xl border border-border/70 bg-card/90 shadow-sm overflow-hidden">
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
								Không tìm thấy bài viết
							</p>
						</div>
					) : (
						<>
							<div className="space-y-3 p-4 md:hidden">
								{filteredPosts.map((post) => (
									<div
										key={post.id}
										className="rounded-xl border border-border/60 bg-background/70 p-3"
									>
										<div className="flex items-start justify-between gap-2">
											<div className="min-w-0">
												<p className="line-clamp-2 text-sm">{post.content}</p>
												<div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
													<span>
														{post.profiles?.display_name ?? "Anonymous"}
													</span>
													<span>•</span>
													<span>{formatDateDDMMYYYY(post.created_at)}</span>
												</div>
											</div>
											<Badge
												variant={
													post.status === "approved" ? "default" : "destructive"
												}
											>
												{post.status === "approved" ? "Đã duyệt" : "Pending"}
											</Badge>
										</div>
										<div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
											<span className="flex items-center gap-1">
												<IconHeart className="size-3.5" />
												{post.likes_count}
											</span>
											<span className="flex items-center gap-1">
												<IconMessage className="size-3.5" />
												{post.comments_count}
											</span>
										</div>
										{post.image_url && (
											<div className="mt-2">
												<img
													src={post.image_url}
													alt="Post preview"
													className="h-32 w-full rounded-lg border border-border/60 object-cover"
												/>
											</div>
										)}
										<div className="mt-2 flex items-center justify-end gap-1">
											{post.status !== "approved" && (
												<Button
													variant="ghost"
													size="icon-sm"
													onClick={() => handleApprove(post.id)}
													title="Approve"
													id={`approve-post-mobile-${post.id}`}
												>
													<IconCheck className="size-4 text-emerald-500" />
												</Button>
											)}
											<Button
												variant="ghost"
												size="icon-sm"
												onClick={() => handleEdit(post)}
												title="Edit"
												id={`edit-post-mobile-${post.id}`}
											>
												<IconEdit className="size-4" />
											</Button>
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button
														variant="ghost"
														size="icon-sm"
														title="Delete"
														id={`delete-post-mobile-${post.id}`}
													>
														<IconTrash className="size-4 text-destructive" />
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>Delete Post</AlertDialogTitle>
														<AlertDialogDescription>
															Are you sure you want to delete this post? This
															action cannot be undone.
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
									</div>
								))}
							</div>

							<div className="hidden overflow-x-auto md:block">
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
												className="group transition-colors hover:bg-muted/30"
											>
												<td className="max-w-xs px-6 py-4">
													<p className="line-clamp-2 text-sm">{post.content}</p>
													{post.image_url && (
														<div className="mt-2 space-y-2">
															<Badge variant="outline" className="gap-1">
																<IconPhoto className="size-3" />
																Image
															</Badge>
															<img
																src={post.image_url}
																alt="Post preview"
																className="h-20 w-32 rounded-md border border-border/60 object-cover"
															/>
														</div>
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
														{post.status === "approved"
															? "Đã duyệt"
															: "Pending"}
													</Badge>
												</td>
												<td className="px-6 py-4 text-sm text-muted-foreground">
													{formatDateDDMMYYYY(post.created_at)}
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
																	<AlertDialogTitle>
																		Delete Post
																	</AlertDialogTitle>
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
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
