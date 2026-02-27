"use client";

import React, { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
	const [editContent, setEditContent] = useState("");

	const comments = commentsQuery.data ?? [];
	const filteredComments = comments.filter(
		(comment) =>
			(comment.content ?? "").toLowerCase().includes(search.toLowerCase()) ||
			(comment.author_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
			comment.author_id.toLowerCase().includes(search.toLowerCase()),
	);

	const handleEdit = (comment: CommentWithAuthor) => {
		setEditingComment(comment);
		setEditContent(comment.content ?? "");
	};

	const handleSaveEdit = () => {
		if (!editingComment) return;
		updateComment.mutate(
			{ id: editingComment.id, content: editContent },
			{
				onSuccess: () => {
					toast.success("Comment updated successfully");
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

	return (
		<div className="animate-fade-up space-y-4 md:space-y-6">
			<div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm md:p-5">
				<h1 className="text-xl font-bold tracking-tight md:text-2xl">Comments</h1>
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
															<AlertDialogTitle>Delete Comment</AlertDialogTitle>
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
										<tr key={comment.id} className="group transition-colors hover:bg-muted/30">
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

			{/* Edit Comment Modal */}
			<AlertDialog
				open={!!editingComment}
				onOpenChange={(open) => !open && setEditingComment(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Edit Comment</AlertDialogTitle>
						<AlertDialogDescription>
							Modify the comment content below
						</AlertDialogDescription>
					</AlertDialogHeader>
					<Textarea
						value={editContent}
						onChange={(e) => setEditContent(e.target.value)}
						rows={3}
						className="mt-2"
						id="edit-comment-content"
					/>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setEditingComment(null)}>
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
