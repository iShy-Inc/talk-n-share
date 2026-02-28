"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useDashboardComments } from "@/hooks/useDashboard";
import { CommentWithAuthor } from "@/types/supabase";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { GifPickerButton } from "@/components/shared/GifPickerButton";
import { fetchGiphyGifById, type GifSelection } from "@/lib/giphy";
import {
	IconSearch,
	IconTrash,
	IconEdit,
	IconMessageCircle,
	IconExternalLink,
	IconUser,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { formatDateDDMMYYYY } from "@/utils/helpers/date";

export default function CommentsPage() {
	const { commentsQuery, updateComment, deleteComment } =
		useDashboardComments();
	const [search, setSearch] = useState("");
	const [editingComment, setEditingComment] =
		useState<CommentWithAuthor | null>(null);
	const contentInputRef = useRef<HTMLTextAreaElement>(null);
	const [selectedGif, setSelectedGif] = useState<GifSelection | null>(null);
	const [editForm, setEditForm] = useState({
		author_id: "",
		post_id: "",
		parent_id: "",
		content: "",
	});

	const comments = commentsQuery.data ?? [];
	const filteredComments = comments.filter(
		(comment) =>
			(comment.content ?? "").toLowerCase().includes(search.toLowerCase()) ||
			(comment.author_name ?? "")
				.toLowerCase()
				.includes(search.toLowerCase()) ||
			comment.author_id.toLowerCase().includes(search.toLowerCase()),
	);

	const handleEdit = (comment: CommentWithAuthor) => {
		setEditingComment(comment);
		setEditForm({
			author_id: comment.author_id,
			post_id: comment.post_id,
			parent_id: comment.parent_id ?? "",
			content: comment.content ?? "",
		});
		setSelectedGif(null);
		if (comment.gif_provider === "giphy" && comment.gif_id) {
			void fetchGiphyGifById(comment.gif_id).then((gif) => {
				setSelectedGif(gif);
			});
		}
		requestAnimationFrame(() => {
			document
				.getElementById("edit-comment-panel")
				?.scrollIntoView({ behavior: "smooth", block: "start" });
		});
	};

	const handleSaveEdit = () => {
		if (!editingComment) return;
		updateComment.mutate(
			{
				id: editingComment.id,
				author_id: editForm.author_id,
				post_id: editForm.post_id,
				parent_id: editForm.parent_id || null,
				content: editForm.content || null,
				gif_provider: selectedGif?.provider ?? null,
				gif_id: selectedGif?.id ?? null,
			},
			{
				onSuccess: () => {
					toast.success("Comment updated successfully");
					setSelectedGif(null);
					setEditingComment(null);
				},
				onError: () => toast.error("Failed to update comment"),
			},
		);
	};

	const handleDelete = (commentId: string) => {
		deleteComment.mutate(commentId, {
			onSuccess: () => toast.success("Comment deleted successfully"),
			onError: () => toast.error("Failed to delete comment"),
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
				<h1 className="text-xl font-bold tracking-tight md:text-2xl">
					Comments
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Keep discussions healthy with quick editing and removal tools.
				</p>
			</div>

			{/* Toolbar */}
			<Card className="rounded-2xl border border-border/70 bg-card/90 shadow-sm">
				<CardContent className="p-4">
					<div className="relative">
						<IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Search comments by content, author, or author id..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-9"
							id="search-comments"
						/>
					</div>
				</CardContent>
			</Card>

			{editingComment && (
				<Card
					id="edit-comment-panel"
					className="rounded-2xl border border-border/70 bg-card/95 shadow-sm"
				>
					<CardHeader>
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<CardTitle>Edit Comment</CardTitle>
								<CardDescription>
									Edit comment fields inline and scroll the page naturally to
									review all fields.
								</CardDescription>
							</div>
							<Button
								variant="outline"
								type="button"
								onClick={() => setEditingComment(null)}
							>
								Close editor
							</Button>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="edit-comment-author-id">Author ID</Label>
								<Input
									id="edit-comment-author-id"
									value={editForm.author_id}
									disabled
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="edit-comment-post-id">Post ID</Label>
								<Input
									id="edit-comment-post-id"
									value={editForm.post_id}
									disabled
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="edit-comment-parent-id">Parent Comment ID</Label>
							<Input
								id="edit-comment-parent-id"
								value={editForm.parent_id}
								disabled
							/>
						</div>
						<div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
							<Label htmlFor="edit-comment-content" className="mb-2 block">
								Content
							</Label>
							<textarea
								ref={contentInputRef}
								value={editForm.content}
								onChange={(e) =>
									setEditForm({ ...editForm, content: e.target.value })
								}
								id="edit-comment-content"
								className="min-h-[110px] w-full resize-none rounded-2xl border border-transparent bg-muted/55 px-4 py-3 text-[15px] leading-relaxed placeholder:text-muted-foreground/80 focus:border-border focus:outline-none"
								placeholder="Chỉnh sửa nội dung bình luận..."
							/>
							<div className="mt-3 flex justify-end border-t border-border/70 pt-3">
								<EmojiPickerButton
									onSelect={handleSelectEmoji}
									panelSide="top"
								/>
							</div>
						</div>
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
												Chọn GIF ngay trong form sửa comment và xem trước bên
												cạnh để thao tác nhanh hơn.
											</p>
										</div>
										<div className="rounded-2xl border border-border/60 bg-background/70 p-3">
											<p className="text-sm font-medium text-foreground">
												{selectedGif?.title || "Chưa có GIF được gán"}
											</p>
											<p className="mt-1 text-xs text-muted-foreground">
												{selectedGif
													? "GIF này sẽ thay thế media hiện tại của comment khi lưu."
													: "Nếu không cần media, bạn có thể giữ comment ở dạng văn bản."}
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
														Đang xem trước trong comment editor
													</p>
												</div>
											</div>
										</div>
									) : (
										<div className="flex size-72 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-border/70 bg-background/60 px-6 text-center shadow-inner">
											<div className="space-y-1">
												<p className="text-sm font-medium text-foreground/85">
													Chưa chọn GIF
												</p>
												<p className="text-xs text-muted-foreground">
													Nhấn nút GIF để mở picker và xem trước tại đây.
												</p>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
						<div className="flex flex-col-reverse gap-2 border-t border-border/70 pt-4 sm:flex-row sm:justify-end">
							<Button
								variant="outline"
								type="button"
								onClick={() => setEditingComment(null)}
							>
								Cancel
							</Button>
							<Button onClick={handleSaveEdit}>Save Changes</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Comments Table */}
			<Card className="overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-sm">
				<CardHeader>
					<CardTitle>All Comments ({filteredComments.length})</CardTitle>
					<CardDescription>Review and moderate user comments</CardDescription>
				</CardHeader>
				<CardContent className="p-0">
					{commentsQuery.isLoading ? (
						<div className="space-y-4 p-6">
							{Array.from({ length: 5 }).map((_, i) => (
								<div
									key={i}
									className="h-16 animate-pulse rounded-xl bg-muted"
								/>
							))}
						</div>
					) : filteredComments.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-16 text-center">
							<IconMessageCircle className="size-12 text-muted-foreground/40" />
							<p className="mt-3 text-sm font-medium text-muted-foreground">
								No comments found
							</p>
						</div>
					) : (
						<>
							<div className="divide-y divide-border/40 p-4 md:hidden">
								{filteredComments.map((comment) => (
									<div key={comment.id} className="space-y-3 py-3">
										<div className="flex items-start justify-between gap-2">
											<div className="min-w-0">
												<div className="flex items-center gap-2">
													{comment.author_avatar ? (
														<img
															src={comment.author_avatar}
															alt=""
															className="size-7 rounded-full object-cover"
														/>
													) : (
														<div className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-600 text-[10px] font-bold text-white">
															{(comment.author_name ?? "A")[0]?.toUpperCase()}
														</div>
													)}
													<p className="truncate text-sm font-semibold">
														{comment.author_name ?? "Anonymous"}
													</p>
												</div>
												<p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
													<IconUser className="size-3.5" />
													{comment.author_id}
												</p>
											</div>
											<p className="shrink-0 text-xs text-muted-foreground">
												{formatDateDDMMYYYY(comment.created_at)}
											</p>
										</div>

										<p className="text-sm text-muted-foreground">
											{comment.content}
										</p>

										<div className="flex items-center justify-between gap-2">
											<Link
												href={`/#post-${comment.post_id}`}
												className="inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-2 hover:underline"
											>
												<IconExternalLink className="size-3.5" />
												Xem bài viết: {comment.post_id.slice(0, 8)}...
											</Link>
											<div className="flex items-center gap-1">
												<Button
													variant="ghost"
													size="icon-sm"
													onClick={() => handleEdit(comment)}
													title="Edit"
													id={`edit-comment-mobile-${comment.id}`}
												>
													<IconEdit className="size-4" />
												</Button>
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<Button
															variant="ghost"
															size="icon-sm"
															title="Delete"
															id={`delete-comment-mobile-${comment.id}`}
														>
															<IconTrash className="size-4 text-destructive" />
														</Button>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>
																Delete Comment
															</AlertDialogTitle>
															<AlertDialogDescription>
																Are you sure you want to delete this comment?
																This action cannot be undone.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Cancel</AlertDialogCancel>
															<AlertDialogAction
																variant="destructive"
																onClick={() => handleDelete(comment.id)}
															>
																Delete
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</div>
										</div>
									</div>
								))}
							</div>

							<div className="hidden overflow-x-auto md:block">
								<table className="w-full">
									<thead>
										<tr className="border-b border-border/50 bg-muted/30">
											<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
												Author
											</th>
											<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
												Author ID
											</th>
											<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
												Content
											</th>
											<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
												Post Link
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
										{filteredComments.map((comment) => (
											<tr
												key={comment.id}
												className="group transition-colors hover:bg-muted/30"
											>
												<td className="px-6 py-4">
													<div className="flex items-center gap-2">
														{comment.author_avatar ? (
															<img
																src={comment.author_avatar}
																alt=""
																className="size-7 rounded-full object-cover"
															/>
														) : (
															<div className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-600 text-[10px] font-bold text-white">
																{(comment.author_name ?? "A")[0]?.toUpperCase()}
															</div>
														)}
														<span className="text-sm font-medium">
															{comment.author_name ?? "Anonymous"}
														</span>
													</div>
												</td>
												<td className="px-6 py-4 text-xs text-muted-foreground">
													{comment.author_id}
												</td>
												<td className="max-w-md px-6 py-4">
													<p className="line-clamp-2 text-sm text-muted-foreground">
														{comment.content}
													</p>
												</td>
												<td className="px-6 py-4">
													<Link
														href={`/#post-${comment.post_id}`}
														className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
													>
														<IconExternalLink className="size-3" />
														{comment.post_id.slice(0, 8)}...
													</Link>
												</td>
												<td className="px-6 py-4 text-sm text-muted-foreground">
													{formatDateDDMMYYYY(comment.created_at)}
												</td>
												<td className="px-6 py-4">
													<div className="flex items-center justify-end gap-1">
														<Button
															variant="ghost"
															size="icon-sm"
															onClick={() => handleEdit(comment)}
															title="Edit"
															id={`edit-comment-${comment.id}`}
														>
															<IconEdit className="size-4" />
														</Button>
														<AlertDialog>
															<AlertDialogTrigger asChild>
																<Button
																	variant="ghost"
																	size="icon-sm"
																	title="Delete"
																	id={`delete-comment-${comment.id}`}
																>
																	<IconTrash className="size-4 text-destructive" />
																</Button>
															</AlertDialogTrigger>
															<AlertDialogContent>
																<AlertDialogHeader>
																	<AlertDialogTitle>
																		Delete Comment
																	</AlertDialogTitle>
																	<AlertDialogDescription>
																		Are you sure you want to delete this
																		comment? This action cannot be undone.
																	</AlertDialogDescription>
																</AlertDialogHeader>
																<AlertDialogFooter>
																	<AlertDialogCancel>Cancel</AlertDialogCancel>
																	<AlertDialogAction
																		variant="destructive"
																		onClick={() => handleDelete(comment.id)}
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
