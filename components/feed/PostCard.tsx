"use client";

import {
	MessageSquare,
	Heart,
	Share2,
	MoreHorizontal,
	Flag,
	Trash2,
	Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogClose,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { PostWithAuthor } from "@/types/supabase";
import { usePosts } from "@/hooks/usePosts";
import { createClient } from "@/utils/supabase/client";
import { STORAGE_BUCKETS, uploadFileToBucket } from "@/lib/supabase-storage";
import { CommentItem } from "@/components/feed/CommentItem";
import {
	useInfiniteQuery,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { getAnonymousDisplayName } from "@/lib/anonymous-name";
import { RoleVerifiedBadge } from "@/components/shared/RoleVerifiedBadge";

interface PostCardProps {
	post: PostWithAuthor;
}

type CommentRow = {
	id: string;
	parent_id: string | null;
	content: string | null;
	created_at: string;
	profiles?: {
		display_name?: string | null;
		avatar_url?: string | null;
		is_public?: boolean | null;
	} | null;
};

type BaseCommentData = {
	id: string;
	authorName: string;
	authorAvatar?: string;
	authorRole?: string;
	content: string;
	timeAgo: string;
	isAuthor?: boolean;
};

type ThreadComment = BaseCommentData & {
	parentId: string | null;
	createdAt: string;
	children: ThreadComment[];
};

const COMMENTS_PAGE_SIZE = 20;
const POST_PREVIEW_CHAR_LIMIT = 280;

export function PostCard({ post }: PostCardProps) {
	const user = useAuthStore((state) => state.user);
	const router = useRouter();
	const supabase = createClient();
	const queryClient = useQueryClient();
	const loadMoreRef = useRef<HTMLDivElement | null>(null);

	const [editContent, setEditContent] = useState(post.content);
	const [isEditing, setIsEditing] = useState(false);
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
	const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
	const [isPostDetailOpen, setIsPostDetailOpen] = useState(false);
	const [reportReason, setReportReason] = useState("spam");
	const [reportEvidenceUrl, setReportEvidenceUrl] = useState<string | null>(
		null,
	);
	const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
	const [isSubmittingReport, setIsSubmittingReport] = useState(false);
	const [newComment, setNewComment] = useState("");
	const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
	const [isSubmittingComment, setIsSubmittingComment] = useState(false);
	const [isLiked, setIsLiked] = useState(false);
	const [isTogglingLike, setIsTogglingLike] = useState(false);
	const [isReposting, setIsReposting] = useState(false);
	const [isReposted, setIsReposted] = useState(false);
	const [isContentExpanded, setIsContentExpanded] = useState(false);
	const [likeCount, setLikeCount] = useState(post.likes_count ?? 0);
	const [commentCount, setCommentCount] = useState(post.comments_count ?? 0);
	const { updatePost, deletePost } = usePosts();
	const isAuthor = user?.id === post.author_id;
	const shouldMaskAuthor =
		!isAuthor && (post.profiles?.is_public ?? true) === false;
	const displayName = shouldMaskAuthor
		? getAnonymousDisplayName(post.author_id)
		: (post.profiles?.display_name ?? "Anonymous");

	const { data: likedByMe = false } = useQuery({
		queryKey: ["post-liked-by-me", post.id, user?.id],
		queryFn: async () => {
			if (!user) return false;
			const { data, error } = await supabase
				.from("likes")
				.select("post_id")
				.eq("post_id", post.id)
				.eq("user_id", user.id)
				.maybeSingle();
			if (error) throw error;
			return !!data;
		},
		enabled: !!user,
	});

	useEffect(() => {
		setIsLiked(likedByMe);
	}, [likedByMe]);

	const { data: repostedByMe = false } = useQuery({
		queryKey: ["post-reposted-by-me", post.id, user?.id],
		queryFn: async () => {
			if (!user) return false;
			const { data, error } = await supabase
				.from("post_reposts")
				.select("post_id")
				.eq("post_id", post.id)
				.eq("reposter_id", user.id)
				.maybeSingle();
			if (error) throw error;
			return !!data;
		},
		enabled: !!user,
	});

	useEffect(() => {
		setIsReposted(repostedByMe);
	}, [repostedByMe]);

	const {
		data: commentsPages,
		isLoading: isLoadingComments,
		isFetchingNextPage,
		fetchNextPage,
		hasNextPage,
		refetch: refetchComments,
	} = useInfiniteQuery({
		queryKey: ["post-comments-thread", post.id],
		initialPageParam: 0,
		queryFn: async ({ pageParam }) => {
			const from = pageParam as number;
			const to = from + COMMENTS_PAGE_SIZE - 1;
			const { data, error } = await supabase
				.from("comments")
				.select("id, parent_id, content, created_at, profiles(display_name, avatar_url)")
				.eq("post_id", post.id)
				.order("created_at", { ascending: true })
				.range(from, to);
			if (error) throw error;
			return (data ?? []) as CommentRow[];
		},
		getNextPageParam: (lastPage, allPages) => {
			if (lastPage.length < COMMENTS_PAGE_SIZE) return undefined;
			return allPages.length * COMMENTS_PAGE_SIZE;
		},
		enabled: isPostDetailOpen,
	});

	const threadedComments = useMemo(() => {
		const loadedComments = commentsPages?.pages.flat() ?? [];
		const map = new Map<string, ThreadComment>();
		const roots: ThreadComment[] = [];

		for (const c of loadedComments) {
			map.set(c.id, {
				id: c.id,
				parentId: c.parent_id,
				authorName: c.profiles?.display_name ?? "Anonymous",
				authorAvatar: c.profiles?.avatar_url ?? undefined,
				content: c.content ?? "",
				timeAgo: formatDistanceToNow(new Date(c.created_at), { addSuffix: true }),
				createdAt: c.created_at,
				children: [],
			});
		}

		for (const item of map.values()) {
			if (item.parentId && map.has(item.parentId)) {
				map.get(item.parentId)!.children.push(item);
			} else {
				roots.push(item);
			}
		}

		const sortTree = (items: ThreadComment[]) => {
			items.sort(
				(a, b) =>
					new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
			);
			items.forEach((child) => sortTree(child.children));
		};
		sortTree(roots);
		return roots;
	}, [commentsPages]);

	useEffect(() => {
		if (!isPostDetailOpen || !hasNextPage || !loadMoreRef.current) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ root: null, threshold: 0.2 },
		);

		observer.observe(loadMoreRef.current);
		return () => observer.disconnect();
	}, [isPostDetailOpen, hasNextPage, isFetchingNextPage, fetchNextPage]);

	const handleAuthAction = (e: React.MouseEvent) => {
		if (!user) {
			e.preventDefault();
			e.stopPropagation();
			router.push("/login");
			return false;
		}
		return true;
	};

	const handleUpdatePost = (e: React.FormEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsConfirmOpen(true);
	};

	const executeUpdate = () => {
		if (!isAuthor) return;
		updatePost.mutate(
			{ id: post.id, content: editContent },
			{
				onSuccess: () => {
					toast.success("Post updated successfully");
					setIsEditing(false);
					setIsConfirmOpen(false);
				},
				onError: () => {
					toast.error("Failed to update post");
					setIsConfirmOpen(false);
				},
			},
		);
	};

	const executeDelete = () => {
		if (!isAuthor) return;
		deletePost.mutate(post.id, {
			onSuccess: () => {
				toast.success("Post deleted successfully");
				setIsDeleteConfirmOpen(false);
			},
			onError: () => {
				toast.error("Failed to delete post");
				setIsDeleteConfirmOpen(false);
			},
		});
	};

	const handleReportEvidenceSelected = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file || !user) return;
		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
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
			toast.success("Evidence image uploaded");
		} catch {
			toast.error("Failed to upload evidence image");
		} finally {
			setIsUploadingEvidence(false);
			event.target.value = "";
		}
	};

	const handleSubmitReport = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!user) {
			router.push("/login");
			return;
		}

		try {
			setIsSubmittingReport(true);
			const { error } = await supabase.from("reports").insert({
				reporter_id: user.id,
				reported_user_id: post.author_id,
				target_id: post.id,
				target_type: "post",
				reason: reportReason,
				status: "pending",
				evidence_image_url: reportEvidenceUrl,
			});
			if (error) throw error;

			toast.success("Report submitted");
			setIsReportDialogOpen(false);
			setReportReason("spam");
			setReportEvidenceUrl(null);
		} catch {
			toast.error("Failed to submit report");
		} finally {
			setIsSubmittingReport(false);
		}
	};

	const handleToggleLike = async (e: React.MouseEvent) => {
		if (!handleAuthAction(e) || !user || isTogglingLike) return;
		try {
			setIsTogglingLike(true);
			if (isLiked) {
				const { error: unlikeError } = await supabase
					.from("likes")
					.delete()
					.eq("post_id", post.id)
					.eq("user_id", user.id);
				if (unlikeError) throw unlikeError;

				const nextLikes = Math.max(likeCount - 1, 0);
				const { error: updatePostError } = await supabase
					.from("posts")
					.update({ likes_count: nextLikes })
					.eq("id", post.id);
				if (updatePostError) throw updatePostError;

				setLikeCount(nextLikes);
				setIsLiked(false);
			} else {
				const { error: likeError } = await supabase.from("likes").insert({
					post_id: post.id,
					user_id: user.id,
				});
				if (likeError) throw likeError;

				const nextLikes = likeCount + 1;
				const { error: updatePostError } = await supabase
					.from("posts")
					.update({ likes_count: nextLikes })
					.eq("id", post.id);
				if (updatePostError) throw updatePostError;

				setLikeCount(nextLikes);
				setIsLiked(true);
			}

			queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
			queryClient.invalidateQueries({ queryKey: ["saved-posts", user.id] });
			queryClient.invalidateQueries({
				queryKey: ["post-liked-by-me", post.id, user.id],
			});
		} catch {
			toast.error("Failed to update like");
		} finally {
			setIsTogglingLike(false);
		}
	};

	const handleSubmitComment = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) {
			router.push("/login");
			return;
		}
		if (!newComment.trim() || isSubmittingComment) return;

		try {
			setIsSubmittingComment(true);
			const { error: commentError } = await supabase.from("comments").insert({
				post_id: post.id,
				content: newComment.trim(),
				author_id: user.id,
				parent_id: replyToCommentId,
			});
			if (commentError) throw commentError;

			const nextCount = commentCount + 1;
			const { error: updatePostError } = await supabase
				.from("posts")
				.update({ comments_count: nextCount })
				.eq("id", post.id);
			if (updatePostError) throw updatePostError;

			setCommentCount(nextCount);
			setNewComment("");
			setReplyToCommentId(null);
			await refetchComments();
			queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
		} catch {
			toast.error("Failed to submit comment");
		} finally {
			setIsSubmittingComment(false);
		}
	};

	const handleRepost = async (e: React.MouseEvent) => {
		if (!handleAuthAction(e) || !user || isReposting) return;
		try {
			setIsReposting(true);
			if (isReposted) {
				const { error } = await supabase
					.from("post_reposts")
					.delete()
					.eq("post_id", post.id)
					.eq("reposter_id", user.id);
				if (error) throw error;
				setIsReposted(false);
				toast.success("Repost removed.");
			} else {
				const { error } = await supabase.from("post_reposts").insert({
					post_id: post.id,
					reposter_id: user.id,
				});
				if (error) throw error;
				setIsReposted(true);
				toast.success("Reposted successfully");
			}
			queryClient.invalidateQueries({ queryKey: ["post-reposted-by-me", post.id, user.id] });
		} catch {
			toast.error("Failed to repost");
		} finally {
			setIsReposting(false);
		}
	};

	const postContent = post.content ?? "";
	const shouldTruncateContent = postContent.length > POST_PREVIEW_CHAR_LIMIT;
	const previewContent = shouldTruncateContent
		? `${postContent.slice(0, POST_PREVIEW_CHAR_LIMIT).trimEnd()}...`
		: postContent;

	const renderThread = (items: ThreadComment[], depth = 0) =>
		items.map((comment) => (
			<div key={comment.id} className={depth > 0 ? "ml-8 mt-2" : "mt-3"}>
				<CommentItem
					authorName={comment.authorName}
					authorAvatar={comment.authorAvatar}
					content={comment.content}
					timeAgo={comment.timeAgo}
					onReply={() => setReplyToCommentId(comment.id)}
				/>
				{comment.children.length > 0 && renderThread(comment.children, depth + 1)}
			</div>
		));

	return (
		<div
			id={`post-${post.id}`}
			className="mb-4 w-full rounded-xl border bg-card p-4 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md"
		>
			<div className="mb-3 flex items-start justify-between">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-secondary">
						{post?.profiles?.avatar_url ? (
							<Image
								src={post?.profiles?.avatar_url}
								alt={displayName}
								width={40}
								height={40}
								className="object-cover"
							/>
						) : (
							<span className="text-xl">{displayName}</span>
						)}
					</div>
					<div>
						<div className="flex items-center gap-2">
							<h3 className="text-sm font-semibold">{displayName}</h3>
							{!shouldMaskAuthor && (
								<RoleVerifiedBadge role={post.profiles?.role ?? null} />
							)}
						</div>
						<p className="text-xs text-muted-foreground">
							{formatDistanceToNow(new Date(post.created_at), {
								addSuffix: true,
							})}
						</p>
					</div>
				</div>
				{isAuthor && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon-sm" className="rounded-full">
								<MoreHorizontal size={20} />
								<span className="sr-only">More</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-44">
							<DropdownMenuItem
								onSelect={() => setIsEditing(true)}
								className="cursor-pointer"
							>
								<Pencil size={16} className="mr-2" />
								Edit post
							</DropdownMenuItem>
							<DropdownMenuItem
								onSelect={() => setIsDeleteConfirmOpen(true)}
								className="cursor-pointer text-destructive focus:text-destructive"
							>
								<Trash2 size={16} className="mr-2" />
								Xóa bài viết
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>

			<div className="mb-4">
				<p className="overflow-hidden whitespace-pre-wrap break-words text-base leading-relaxed [overflow-wrap:anywhere]">
					{isContentExpanded ? postContent : previewContent}
				</p>
				{shouldTruncateContent && (
					<button
						type="button"
						onClick={() => setIsContentExpanded((prev) => !prev)}
						className="mt-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
					>
						{isContentExpanded ? "Show less" : "Show more"}
					</button>
				)}
				{post.image_url && (
					<button
						type="button"
						onClick={() => setIsPostDetailOpen(true)}
						className="relative mt-3 block h-64 w-full overflow-hidden rounded-lg"
					>
						<Image
							src={post.image_url}
							alt="Post content"
							fill
							className="object-cover transition-transform duration-200 hover:scale-[1.02]"
						/>
					</button>
				)}
			</div>

			<Dialog open={isPostDetailOpen} onOpenChange={setIsPostDetailOpen}>
				<DialogContent
					className="h-[96vh] max-w-[99vw] gap-0 overflow-hidden p-0 lg:max-w-[96vw]"
					showCloseButton
				>
					<DialogTitle className="sr-only">Post Detail</DialogTitle>
					<div className="grid h-full grid-cols-1 lg:grid-cols-[minmax(0,2.4fr)_300px] xl:grid-cols-[minmax(0,2.8fr)_320px]">
						<div className="relative min-h-[55vh] bg-black lg:min-h-full">
							{post.image_url ? (
								<Image
									src={post.image_url}
									alt="Post image preview"
									fill
									className="object-contain"
								/>
							) : (
								<div className="flex h-full items-center justify-center p-8 text-sm text-muted-foreground">
									{post.content}
								</div>
							)}
						</div>

						<div className="flex h-full flex-col border-l border-border bg-background">
							<div className="border-b border-border px-4 py-3">
								<p className="text-sm font-semibold">
									{displayName}
								</p>
								<p className="text-xs text-muted-foreground">
									{formatDistanceToNow(new Date(post.created_at), {
										addSuffix: true,
									})}
								</p>
								{post.content && (
									<p className="mt-2 text-sm text-foreground">{post.content}</p>
								)}
							</div>

							<div className="flex-1 overflow-y-auto px-4 py-3">
								{isLoadingComments ? (
									<p className="text-sm text-muted-foreground">
										Loading comments...
									</p>
								) : threadedComments.length > 0 ? (
									<div>{renderThread(threadedComments)}</div>
								) : (
									<p className="text-sm text-muted-foreground">
										No comments yet
									</p>
								)}

								<div ref={loadMoreRef} className="h-6" />
								{isFetchingNextPage && (
									<p className="text-xs text-muted-foreground">
										Loading more comments...
									</p>
								)}
							</div>

							<div className="border-t border-border p-3">
								{replyToCommentId && (
									<div className="mb-2 flex items-center justify-between rounded-md bg-muted px-2 py-1 text-xs">
										<span>Replying to comment</span>
										<button
											type="button"
											onClick={() => setReplyToCommentId(null)}
											className="text-primary"
										>
											Cancel
										</button>
									</div>
								)}
								<form onSubmit={handleSubmitComment} className="flex gap-2">
									<Input
										value={newComment}
										onChange={(e) => setNewComment(e.target.value)}
										placeholder="Write a comment..."
									/>
									<Button
										type="submit"
										disabled={!newComment.trim() || isSubmittingComment}
									>
										Send
									</Button>
								</form>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			<Dialog open={isEditing} onOpenChange={setIsEditing}>
				<DialogContent>
					<form onSubmit={handleUpdatePost}>
						<DialogHeader>
							<DialogTitle>Cập nhật bài viết</DialogTitle>
							<DialogDescription>Update your post content</DialogDescription>
						</DialogHeader>
						<FieldGroup className="py-4">
							<Field>
								<Label htmlFor="content">Content</Label>
								<Input
									id="content"
									name="content"
									defaultValue={post?.content || ""}
									onChange={(e) => {
										setEditContent(e.target.value);
									}}
								/>
							</Field>
						</FieldGroup>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline" type="button">
									Cancel
								</Button>
							</DialogClose>
							<Button type="submit">Update</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
				<DialogContent>
					<form onSubmit={handleSubmitReport}>
						<DialogHeader>
							<DialogTitle>Báo cáo bài viết</DialogTitle>
							<DialogDescription>
								Share why this post should be reviewed.
							</DialogDescription>
						</DialogHeader>
						<div className="py-4">
							<Label htmlFor={`report-reason-${post.id}`}>Reason</Label>
							<select
								id={`report-reason-${post.id}`}
								value={reportReason}
								onChange={(e) => setReportReason(e.target.value)}
								className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
							>
								<option value="spam">Spam</option>
								<option value="harassment">Harassment</option>
								<option value="hate">Hate Speech</option>
								<option value="violence">Violence</option>
								<option value="other">Other</option>
							</select>

							<div className="mt-4">
								<Label htmlFor={`report-evidence-${post.id}`}>
									Evidence Image (optional)
								</Label>
								<Input
									id={`report-evidence-${post.id}`}
									type="file"
									accept="image/*"
									className="mt-2"
									onChange={handleReportEvidenceSelected}
								/>
								{reportEvidenceUrl && (
									<p className="mt-2 text-xs text-muted-foreground">
										Evidence attached
									</p>
								)}
							</div>
						</div>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline" type="button">
									Cancel
								</Button>
							</DialogClose>
							<Button
								type="submit"
								disabled={isUploadingEvidence || isSubmittingReport}
							>
								Submit Report
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Are you sure you want to update this post?
						</AlertDialogTitle>
						<AlertDialogDescription>
							This action will override the current content of your post.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={executeUpdate}>
							Confirm
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog
				open={isDeleteConfirmOpen}
				onOpenChange={setIsDeleteConfirmOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Are you sure you want to delete this post?
						</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete your
							post.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={executeDelete}
							className="border-transparent bg-red-500 text-white hover:bg-red-600 focus:ring-red-500"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<div className="flex items-center justify-between border-t pt-3">
				<div className="flex gap-4">
					<button
						className={`group flex items-center gap-1.5 text-sm transition-colors ${
							isLiked
								? "text-red-500"
								: "text-muted-foreground hover:text-red-500"
						}`}
						title="Like"
						onClick={handleToggleLike}
					>
						<Heart size={18} className={isLiked ? "fill-current" : ""} />
						<span>{likeCount}</span>
					</button>
					<button
						className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-blue-500"
						title="Comment"
						onClick={(e) => {
							if (!handleAuthAction(e)) return;
							setIsPostDetailOpen(true);
						}}
					>
						<MessageSquare size={18} />
						<span>{commentCount}</span>
					</button>
				</div>
				<div className="flex gap-4">
					<button
						className={`transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
							isReposted
								? "text-emerald-600"
								: "text-muted-foreground hover:text-foreground"
						}`}
						title={isReposted ? "Unrepost" : "Repost"}
						onClick={handleRepost}
						disabled={isReposting}
					>
						<Share2 size={18} />
					</button>
					<button
						className="text-muted-foreground hover:text-foreground"
						title="Report"
						onClick={(e) => {
							if (!handleAuthAction(e)) return;
							setIsReportDialogOpen(true);
						}}
					>
						<Flag size={18} />
					</button>
				</div>
			</div>
		</div>
	);
}
