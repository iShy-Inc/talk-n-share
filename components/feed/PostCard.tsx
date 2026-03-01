"use client";

import {
	MessageSquare,
	Heart,
	Share2,
	MoreHorizontal,
	Flag,
	Trash2,
	Pencil,
	Expand,
	X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import type { PostWithAuthor, Profile } from "@/types/supabase";
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
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { RoleVerifiedBadge } from "@/components/shared/RoleVerifiedBadge";
import { ProfileVisibilityIcon } from "@/components/shared/ProfileVisibilityIcon";
import { EmojiPickerButton } from "@/components/shared/EmojiPickerButton";
import { GifPickerButton } from "@/components/shared/GifPickerButton";
import { GiphyGif } from "@/components/shared/GiphyGif";
import { registerGiphySend, type GifSelection } from "@/lib/giphy";

interface PostCardProps {
	post: PostWithAuthor;
}

type CommentRow = {
	id: string;
	author_id: string;
	parent_id: string | null;
	content: string | null;
	created_at: string;
	edited_at: string | null;
	gif_id: string | null;
	gif_provider: string | null;
	profiles?: {
		display_name?: string | null;
		avatar_url?: string | null;
		is_public?: boolean | null;
	} | null;
};

type BaseCommentData = {
	id: string;
	authorId: string;
	authorName: string;
	authorIsPublic?: boolean | null;
	authorAvatar?: string;
	authorRole?: string;
	content: string;
	gifId?: string;
	gifProvider?: string;
	timeAgo: string;
	isAuthor?: boolean;
	isOwnComment?: boolean;
	isEdited?: boolean;
};

type ThreadComment = BaseCommentData & {
	parentId: string | null;
	createdAt: string;
	children: ThreadComment[];
};

type ReportTarget = {
	type: "post" | "comment";
	targetId: string;
	reportedUserId: string | null;
};

const COMMENTS_PAGE_SIZE = 20;
const POST_PREVIEW_CHAR_LIMIT = 280;
const POST_DIALOG_PREVIEW_CHAR_LIMIT = 900;

export function PostCard({ post }: PostCardProps) {
	const user = useAuthStore((state) => state.user);
	const router = useRouter();
	const supabase = createClient();
	const queryClient = useQueryClient();
	const loadMoreRef = useRef<HTMLDivElement | null>(null);
	const commentInputRef = useRef<HTMLInputElement | null>(null);

	const [editContent, setEditContent] = useState(post.content);
	const [isEditing, setIsEditing] = useState(false);
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
	const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
	const [isPostDetailOpen, setIsPostDetailOpen] = useState(false);
	const [reportReason, setReportReason] = useState("spam");
	const [reportEvidenceUrl, setReportEvidenceUrl] = useState<string | null>(
		null,
	);
	const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
	const [isSubmittingReport, setIsSubmittingReport] = useState(false);
	const [newComment, setNewComment] = useState("");
	const [selectedCommentGif, setSelectedCommentGif] =
		useState<GifSelection | null>(null);
	const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
	const [isSubmittingComment, setIsSubmittingComment] = useState(false);
	const [editingThreadCommentId, setEditingThreadCommentId] = useState<
		string | null
	>(null);
	const [editingThreadCommentContent, setEditingThreadCommentContent] =
		useState("");
	const [editingThreadCommentHasGif, setEditingThreadCommentHasGif] =
		useState(false);
	const [isSavingCommentEdit, setIsSavingCommentEdit] = useState(false);
	const [commentPendingDelete, setCommentPendingDelete] =
		useState<ThreadComment | null>(null);
	const [isLiked, setIsLiked] = useState(false);
	const [isTogglingLike, setIsTogglingLike] = useState(false);
	const [isReposting, setIsReposting] = useState(false);
	const [isReposted, setIsReposted] = useState(false);
	const [isContentExpanded, setIsContentExpanded] = useState(false);
	const [isDialogContentExpanded, setIsDialogContentExpanded] = useState(false);
	const [likeCount, setLikeCount] = useState(post.likes_count ?? 0);
	const [commentCount, setCommentCount] = useState(post.comments_count ?? 0);
	const { updatePost, deletePost } = usePosts();
	const isAuthor = user?.id === post.author_id;

	const { data: maskedAuthorProfile = null } = useQuery({
		queryKey: ["masked-post-author-profile", post.author_id],
		queryFn: async () => {
			const { data, error } = await supabase
				.rpc("get_profile_for_viewer", {
					target_profile_id: post.author_id,
				})
				.maybeSingle();
			if (error) throw error;
			return data as Profile | null;
		},
		enabled: !post.profiles?.display_name,
	});

	const displayName =
		post.profiles?.display_name ??
		maskedAuthorProfile?.display_name ??
		post.author_name ??
		"Người dùng";
	const authorAvatarUrl =
		post.profiles?.avatar_url ??
		maskedAuthorProfile?.avatar_url ??
		post.author_avatar;
	const authorIsPublic =
		post.profiles?.is_public ??
		maskedAuthorProfile?.is_public ??
		(post.author_name || post.author_avatar ? false : null);
	const authorRole = post.profiles?.role ?? maskedAuthorProfile?.role ?? null;

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

	const { data: exactCommentCount } = useQuery({
		queryKey: ["post-comment-count", post.id],
		queryFn: async () => {
			const { count, error } = await supabase
				.from("comments")
				.select("id", { count: "exact", head: true })
				.eq("post_id", post.id);
			if (error) throw error;
			return count ?? 0;
		},
	});

	const { data: myPreviewCommentRows = [], refetch: refetchMyPreviewComments } =
		useQuery({
			queryKey: ["post-my-comments-preview", post.id, user?.id],
			queryFn: async () => {
				if (!user) return [];
				const { data, error } = await supabase
					.from("comments")
					.select(
						"id, author_id, parent_id, content, created_at, edited_at, gif_id, gif_provider, profiles(display_name, avatar_url, is_public)",
					)
					.eq("post_id", post.id)
					.eq("author_id", user.id)
					.order("created_at", { ascending: false })
					.limit(3);
				if (error) throw error;
				return (data ?? []) as CommentRow[];
			},
			enabled: !!user && commentCount > 0,
		});

	useEffect(() => {
		setIsLiked(likedByMe);
	}, [likedByMe]);

	useEffect(() => {
		if (typeof exactCommentCount === "number") {
			setCommentCount(exactCommentCount);
		}
	}, [exactCommentCount]);

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
				.select(
					"id, author_id, parent_id, content, created_at, edited_at, gif_id, gif_provider, profiles(display_name, avatar_url, is_public)",
				)
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
				authorId: c.author_id,
				parentId: c.parent_id,
				authorName: c.profiles?.display_name ?? "Người dùng",
				authorIsPublic: c.profiles?.is_public ?? null,
				authorAvatar: c.profiles?.avatar_url ?? undefined,
				content: c.content ?? "",
				gifId: c.gif_id ?? undefined,
				gifProvider: c.gif_provider ?? undefined,
				isOwnComment: user?.id === c.author_id,
				isEdited: Boolean(c.edited_at),
				timeAgo: formatDistanceToNow(new Date(c.created_at), {
					addSuffix: true,
				}),
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
	}, [commentsPages, user?.id]);

	const myPreviewComments = useMemo(
		() =>
			myPreviewCommentRows.map(
				(comment) =>
					({
						id: comment.id,
						authorId: comment.author_id,
						parentId: comment.parent_id,
						authorName: comment.profiles?.display_name ?? "Người dùng",
						authorIsPublic: comment.profiles?.is_public ?? null,
						authorAvatar: comment.profiles?.avatar_url ?? undefined,
						content: comment.content ?? "",
						gifId: comment.gif_id ?? undefined,
						gifProvider: comment.gif_provider ?? undefined,
						isOwnComment: true,
						isEdited: Boolean(comment.edited_at),
						timeAgo: formatDistanceToNow(new Date(comment.created_at), {
							addSuffix: true,
						}),
						createdAt: comment.created_at,
						children: [],
					}) satisfies ThreadComment,
			),
		[myPreviewCommentRows],
	);

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

	useEffect(() => {
		if (!isPostDetailOpen) return;

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setIsPostDetailOpen(false);
				setIsDialogContentExpanded(false);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [isPostDetailOpen]);

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
		if (!user || !reportTarget) {
			router.push("/login");
			return;
		}

		try {
			setIsSubmittingReport(true);
			const { error } = await supabase.from("reports").insert({
				reporter_id: user.id,
				reported_user_id: reportTarget.reportedUserId,
				target_id: reportTarget.targetId,
				target_type: reportTarget.type,
				reason: reportReason,
				status: "pending",
				evidence_image_url: reportEvidenceUrl,
			});
			if (error) throw error;

			toast.success("Report submitted");
			setReportTarget(null);
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
			queryClient.invalidateQueries({ queryKey: ["liked-posts", user.id] });
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
		if ((!newComment.trim() && !selectedCommentGif) || isSubmittingComment)
			return;

		try {
			setIsSubmittingComment(true);
			const { error: commentError } = await supabase.from("comments").insert({
				post_id: post.id,
				content: newComment.trim() || null,
				author_id: user.id,
				parent_id: replyToCommentId,
				gif_provider: selectedCommentGif?.provider ?? null,
				gif_id: selectedCommentGif?.id ?? null,
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
			setSelectedCommentGif(null);
			setReplyToCommentId(null);
			if (selectedCommentGif?.provider === "giphy") {
				void registerGiphySend(selectedCommentGif.id);
			}
			await refetchMyPreviewComments();
			await refetchComments();
			queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
			queryClient.invalidateQueries({
				queryKey: ["post-comment-count", post.id],
			});
		} catch {
			toast.error("Failed to submit comment");
		} finally {
			setIsSubmittingComment(false);
		}
	};

	const handleSelectCommentEmoji = (emoji: string) => {
		const input = commentInputRef.current;
		const selectionStart = input?.selectionStart ?? newComment.length;
		const selectionEnd = input?.selectionEnd ?? newComment.length;
		const nextComment =
			newComment.slice(0, selectionStart) +
			emoji +
			newComment.slice(selectionEnd);
		const nextCursor = selectionStart + emoji.length;

		setNewComment(nextComment);

		requestAnimationFrame(() => {
			commentInputRef.current?.focus({ preventScroll: true });
			commentInputRef.current?.setSelectionRange(nextCursor, nextCursor);
		});
	};

	const startEditingComment = (comment: ThreadComment) => {
		setEditingThreadCommentId(comment.id);
		setEditingThreadCommentContent(comment.content);
		setEditingThreadCommentHasGif(
			Boolean(comment.gifId && comment.gifProvider),
		);
	};

	const handleSaveCommentEdit = async (commentId: string) => {
		if (!user || isSavingCommentEdit) {
			return;
		}

		const nextContent = editingThreadCommentContent.trim();
		if (!nextContent && !editingThreadCommentHasGif) {
			toast.error("Bình luận không thể để trống.");
			return;
		}

		try {
			setIsSavingCommentEdit(true);
			const { error } = await supabase
				.from("comments")
				.update({
					content: nextContent || null,
				})
				.eq("id", commentId)
				.eq("author_id", user.id);
			if (error) throw error;

			setEditingThreadCommentId(null);
			setEditingThreadCommentContent("");
			setEditingThreadCommentHasGif(false);
			await refetchMyPreviewComments();
			await refetchComments();
			toast.success("Đã cập nhật bình luận.");
		} catch {
			toast.error("Không thể cập nhật bình luận.");
		} finally {
			setIsSavingCommentEdit(false);
		}
	};

	const handleDeleteComment = async () => {
		if (!user || !commentPendingDelete) {
			return;
		}

		try {
			const { error } = await supabase.rpc("delete_comment_for_viewer", {
				target_comment_id: commentPendingDelete.id,
			});
			if (error) throw error;

			const nextCount = Math.max(commentCount - 1, 0);
			setCommentCount(nextCount);
			if (replyToCommentId === commentPendingDelete.id) {
				setReplyToCommentId(null);
			}
			if (editingThreadCommentId === commentPendingDelete.id) {
				setEditingThreadCommentId(null);
				setEditingThreadCommentContent("");
				setEditingThreadCommentHasGif(false);
			}
			setCommentPendingDelete(null);
			await refetchMyPreviewComments();
			await refetchComments();
			queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
			queryClient.invalidateQueries({
				queryKey: ["post-comment-count", post.id],
			});
			toast.success("Đã xóa bình luận.");
		} catch {
			toast.error("Không thể xóa bình luận này.");
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
			queryClient.invalidateQueries({
				queryKey: ["post-reposted-by-me", post.id, user.id],
			});
			queryClient.invalidateQueries({ queryKey: ["reposted-posts", user.id] });
		} catch {
			toast.error("Failed to repost");
		} finally {
			setIsReposting(false);
		}
	};

	const postContent = post.content ?? "";
	const hasPostGif = post.gif_provider === "giphy" && Boolean(post.gif_id);
	const hasPostImage = Boolean(post.image_url);
	const hasPostContent = postContent.trim().length > 0;
	const shouldTruncateContent = postContent.length > POST_PREVIEW_CHAR_LIMIT;
	const previewContent = shouldTruncateContent
		? `${postContent.slice(0, POST_PREVIEW_CHAR_LIMIT).trimEnd()}...`
		: postContent;
	const shouldTruncateDialogContent =
		postContent.length > POST_DIALOG_PREVIEW_CHAR_LIMIT;
	const dialogPreviewContent = shouldTruncateDialogContent
		? `${postContent.slice(0, POST_DIALOG_PREVIEW_CHAR_LIMIT).trimEnd()}...`
		: postContent;

	const getReplyTargetId = (comment: ThreadComment) =>
		comment.parentId ?? comment.id;

	const renderCommentInlineEditor = (commentId: string) => (
		<div className="mt-2 rounded-xl border border-border/70 bg-card p-3">
			<div className="space-y-3">
				<Input
					value={editingThreadCommentContent}
					onChange={(event) =>
						setEditingThreadCommentContent(event.target.value)
					}
					placeholder="Chỉnh sửa bình luận..."
					className="border-border/80 bg-background"
				/>
				<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => {
							setEditingThreadCommentId(null);
							setEditingThreadCommentContent("");
							setEditingThreadCommentHasGif(false);
						}}
					>
						Hủy
					</Button>
					<Button
						type="button"
						size="sm"
						onClick={() => handleSaveCommentEdit(commentId)}
						disabled={isSavingCommentEdit}
					>
						{isSavingCommentEdit ? "Đang lưu..." : "Lưu"}
					</Button>
				</div>
			</div>
		</div>
	);

	const renderThread = (items: ThreadComment[], depth = 0) =>
		items.map((comment) => (
			<div
				key={comment.id}
				className={
					depth > 0 ? "mt-2 border-l border-border/70 pl-3 sm:pl-4" : "mt-3"
				}
			>
				<CommentItem
					authorName={comment.authorName}
					authorId={comment.authorId}
					authorIsPublic={comment.authorIsPublic}
					authorAvatar={comment.authorAvatar}
					content={comment.content}
					gifId={comment.gifId}
					gifProvider={comment.gifProvider}
					timeAgo={comment.timeAgo}
					isEdited={comment.isEdited}
					onReply={() => setReplyToCommentId(getReplyTargetId(comment))}
					onEdit={
						comment.isOwnComment
							? () => startEditingComment(comment)
							: undefined
					}
					onDelete={
						comment.isOwnComment
							? () => setCommentPendingDelete(comment)
							: undefined
					}
					onReport={
						comment.isOwnComment
							? undefined
							: () => {
									if (!user) {
										router.push("/login");
										return;
									}
									setReportTarget({
										type: "comment",
										targetId: comment.id,
										reportedUserId: comment.authorId,
									});
								}
					}
				/>
				{editingThreadCommentId === comment.id
					? renderCommentInlineEditor(comment.id)
					: null}
				{comment.children.length > 0 &&
					renderThread(comment.children, depth + 1)}
			</div>
		));

	const closePostDetail = () => {
		setIsPostDetailOpen(false);
		setIsDialogContentExpanded(false);
	};

	return (
		<div
			id={`post-${post.id}`}
			className="mb-4 w-full rounded-xl border bg-card p-4 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md"
		>
			<div className="mb-3 flex items-start justify-between">
				<div className="flex items-center gap-3">
					<Link
						href={`/profile?userId=${post.author_id}`}
						className="flex items-center gap-3"
					>
						<div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-secondary">
							{authorAvatarUrl ? (
								<Image
									src={authorAvatarUrl}
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
								<h3 className="text-sm font-semibold hover:underline">
									{displayName}
								</h3>
								<ProfileVisibilityIcon isPublic={authorIsPublic} />
								<RoleVerifiedBadge role={authorRole} />
							</div>
							<p className="text-xs text-foreground/70">
								{formatDistanceToNow(new Date(post.created_at), {
									addSuffix: true,
								})}
							</p>
						</div>
					</Link>
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
						className="mt-1 text-sm font-medium text-foreground/75 transition-colors hover:text-foreground"
					>
						{isContentExpanded ? "Show less" : "Show more"}
					</button>
				)}
				{hasPostGif ? (
					<button
						type="button"
						onClick={() => setIsPostDetailOpen(true)}
						className="group mt-4 block w-full overflow-hidden rounded-2xl border border-border/70 bg-muted/20 p-2 transition-transform duration-200 active:scale-[0.995]"
					>
						<span className="hidden sr-only">GIF</span>
						<div className="relative flex min-h-48 w-full items-center justify-center overflow-hidden rounded-xl bg-background/80 p-2">
							<GiphyGif
								gifId={post.gif_id!}
								className="h-auto max-h-[24rem] w-full rounded-xl object-contain transition-transform duration-300 group-hover:scale-[1.01] sm:max-h-[28rem]"
							/>
							<div className="pointer-events-none absolute right-3 top-3">
								<span className="inline-flex items-center justify-center rounded-full bg-black/60 p-1.5 text-white/95 opacity-90 shadow-sm backdrop-blur-sm transition-all duration-200 group-hover:scale-105 group-hover:opacity-100">
									<Expand className="size-3.5" />
								</span>
							</div>
						</div>
					</button>
				) : post.image_url ? (
					<button
						type="button"
						onClick={() => setIsPostDetailOpen(true)}
						className="group mt-3 block w-full overflow-hidden rounded-2xl border border-border/70 bg-muted/20 p-2 transition-transform duration-200 active:scale-[0.995]"
					>
						<span className="hidden sr-only">Ảnh</span>
						<div className="relative flex min-h-48 w-full items-center justify-center overflow-hidden rounded-xl bg-background/80 p-2">
							<Image
								src={post.image_url}
								alt="Post content"
								width={1200}
								height={1200}
								className="h-auto max-h-[24rem] w-full object-contain transition-transform duration-300 group-hover:scale-[1.01] sm:max-h-[28rem]"
							/>
							<div className="pointer-events-none absolute right-3 top-3">
								<span className="inline-flex items-center justify-center rounded-full bg-black/60 p-1.5 text-white/95 opacity-90 shadow-sm backdrop-blur-sm transition-all duration-200 group-hover:scale-105 group-hover:opacity-100">
									<Expand className="size-3.5" />
								</span>
							</div>
						</div>
					</button>
				) : null}
			</div>

			{isPostDetailOpen &&
				typeof window !== "undefined" &&
				createPortal(
					<div
						className="fixed inset-0 z-[260] bg-black/70"
						onClick={closePostDetail}
					>
						<div className="flex h-full w-full items-center justify-center p-0 sm:p-3">
							<div
								role="dialog"
								aria-modal="true"
								onClick={(event) => event.stopPropagation()}
								className="relative flex h-[100dvh] w-[100vw] flex-col overflow-hidden bg-background text-foreground sm:h-[96dvh] sm:w-[96vw] sm:rounded-xl sm:border sm:border-border/80 lg:h-[92dvh] lg:w-[80vw] xl:w-[1200px]"
							>
								<Button
									type="button"
									variant="secondary"
									size="icon-sm"
									onClick={closePostDetail}
									className="absolute right-3 top-3 z-20 rounded-full bg-black/55 text-white hover:bg-black/70"
								>
									<X className="size-4" />
								</Button>
								<div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1.35fr)_minmax(260px,0.65fr)] lg:grid-cols-[minmax(0,70%)_minmax(0,30%)] lg:grid-rows-[minmax(0,1fr)]">
									<div className="min-h-0 bg-gradient-to-b from-black via-black/95 to-black p-3 sm:p-4">
										{hasPostGif ? (
											<div className="h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-background/5 p-3 backdrop-blur-sm">
												<div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-black/75 p-4">
													<GiphyGif
														gifId={post.gif_id!}
														className="max-h-full max-w-full rounded-xl object-contain"
													/>
													{hasPostContent && (
														<div className="absolute inset-x-0 bottom-0 z-10 overflow-hidden bg-gradient-to-b from-black/55 via-black/80 to-black/95">
															<ScrollArea className="h-[30dvh] min-h-28 w-full max-h-[45%]">
																<div className="flex min-w-0 flex-col items-center p-5 text-sm text-white/95">
																	<p className="mx-auto max-w-3xl whitespace-pre-wrap break-words text-center [overflow-wrap:anywhere] [word-break:break-word]">
																		{isDialogContentExpanded
																			? postContent
																			: dialogPreviewContent}
																	</p>
																	{shouldTruncateDialogContent && (
																		<button
																			type="button"
																			onClick={() =>
																				setIsDialogContentExpanded(
																					(prev) => !prev,
																				)
																			}
																			className="mt-3 rounded-md px-2 py-1 text-sm font-semibold text-white hover:bg-white/15"
																		>
																			{isDialogContentExpanded
																				? "Thu gọn"
																				: "Hiện thêm"}
																		</button>
																	)}
																</div>
															</ScrollArea>
														</div>
													)}
												</div>
											</div>
										) : hasPostImage ? (
											<div className="h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-background/5 p-3 backdrop-blur-sm">
												<div className="relative h-full w-full overflow-hidden rounded-2xl bg-black/75">
													<Image
														src={post.image_url!}
														alt="Post image preview"
														fill
														className="object-contain"
													/>
													{hasPostContent && (
														<div className="absolute inset-x-0 bottom-0 z-10 overflow-hidden bg-gradient-to-b from-black/55 via-black/80 to-black/95">
															<ScrollArea className="h-[30dvh] min-h-28 w-full max-h-[45%]">
																<div className="flex min-w-0 flex-col items-center p-5 text-sm text-white/95">
																	<p className="mx-auto max-w-3xl whitespace-pre-wrap break-words text-center [overflow-wrap:anywhere] [word-break:break-word]">
																		{isDialogContentExpanded
																			? postContent
																			: dialogPreviewContent}
																	</p>
																	{shouldTruncateDialogContent && (
																		<button
																			type="button"
																			onClick={() =>
																				setIsDialogContentExpanded(
																					(prev) => !prev,
																				)
																			}
																			className="mt-3 rounded-md px-2 py-1 text-sm font-semibold text-white hover:bg-white/15"
																		>
																			{isDialogContentExpanded
																				? "Thu gọn"
																				: "Hiện thêm"}
																		</button>
																	)}
																</div>
															</ScrollArea>
														</div>
													)}
												</div>
											</div>
										) : (
											<div className="h-full w-full bg-gradient-to-b from-black/75 via-black/85 to-black/95">
												<ScrollArea className="h-full w-full">
													<div className="grid min-h-full min-w-0 place-items-center p-8 text-sm text-white/95">
														<div className="flex w-full max-w-3xl flex-col items-center">
															<p className="whitespace-pre-wrap break-words text-center [overflow-wrap:anywhere] [word-break:break-word]">
																{isDialogContentExpanded
																	? postContent
																	: dialogPreviewContent}
															</p>
															{shouldTruncateDialogContent && (
																<button
																	type="button"
																	onClick={() =>
																		setIsDialogContentExpanded((prev) => !prev)
																	}
																	className="mt-3 rounded-md px-2 py-1 text-sm font-semibold text-white hover:bg-white/15"
																>
																	{isDialogContentExpanded
																		? "Thu gọn"
																		: "Hiện thêm"}
																</button>
															)}
														</div>
													</div>
												</ScrollArea>
											</div>
										)}
									</div>

									<div className="relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden border-t border-border/80 bg-background lg:border-l lg:border-t-0">
										<div className="min-w-0 border-b border-border/80 bg-background px-4 py-3">
											<p className="truncate text-sm font-semibold">
												{displayName}
											</p>
											<p className="text-xs text-foreground/75">
												{formatDistanceToNow(new Date(post.created_at), {
													addSuffix: true,
												})}
											</p>
										</div>

										<ScrollArea className="h-0 min-h-0 min-w-0 flex-1">
											<div className="px-4 py-3">
												{isLoadingComments ? (
													<p className="text-sm text-foreground/75">
														Loading comments...
													</p>
												) : threadedComments.length > 0 ? (
													<div>{renderThread(threadedComments)}</div>
												) : (
													<p className="text-sm text-foreground/75">
														Không có bình luận
													</p>
												)}

												<div ref={loadMoreRef} className="h-6" />
												{isFetchingNextPage && (
													<p className="text-xs text-foreground/75">
														Đang tải thêm bình luận...
													</p>
												)}
											</div>
										</ScrollArea>

										<div className="shrink-0 border-t border-border/80 bg-background p-3">
											{replyToCommentId && (
												<div className="mb-2 flex items-center justify-between rounded-md bg-accent px-2 py-1 text-xs">
													<span>Trả lời bình luận</span>
													<button
														type="button"
														onClick={() => setReplyToCommentId(null)}
														className="text-primary"
													>
														Cancel
													</button>
												</div>
											)}
											<form
												onSubmit={handleSubmitComment}
												className="flex gap-2"
											>
												<div className="flex-1 space-y-2">
													{selectedCommentGif && (
														<div className="rounded-2xl border border-border/70 bg-muted/20 p-2">
															<div className="flex items-center gap-2 rounded-xl bg-background/80 p-2">
																<div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted/30 p-1.5">
																	<img
																		src={selectedCommentGif.previewUrl}
																		alt={selectedCommentGif.title}
																		className="h-full w-full rounded-lg object-contain"
																	/>
																</div>
																<div className="flex min-w-0 flex-1 items-start justify-between gap-2">
																	<div className="min-w-0">
																		<p className="text-xs font-medium text-foreground/80">
																			GIF đã chọn
																		</p>
																		<p className="truncate text-[11px] text-muted-foreground">
																			{selectedCommentGif.title}
																		</p>
																	</div>
																	<button
																		type="button"
																		onClick={() => setSelectedCommentGif(null)}
																		className="text-xs font-medium text-primary"
																	>
																		Xóa
																	</button>
																</div>
															</div>
														</div>
													)}
													<Input
														ref={commentInputRef}
														value={newComment}
														onChange={(e) => setNewComment(e.target.value)}
														placeholder="Write a comment..."
														className="border-border/80 bg-background"
													/>
												</div>
												<GifPickerButton
													onSelect={setSelectedCommentGif}
													disabled={isSubmittingComment}
													className="self-start"
												/>
												<EmojiPickerButton
													onSelect={handleSelectCommentEmoji}
													disabled={isSubmittingComment}
												/>
												<Button
													type="submit"
													disabled={
														(!newComment.trim() && !selectedCommentGif) ||
														isSubmittingComment
													}
													className="font-semibold"
												>
													Send
												</Button>
											</form>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>,
					document.body,
				)}

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

			<Dialog
				open={!!reportTarget}
				onOpenChange={(open) => {
					if (!open) {
						setReportTarget(null);
						setReportReason("spam");
						setReportEvidenceUrl(null);
					}
				}}
			>
				<DialogContent
					overlayClassName="z-[310] bg-black/80"
					className="z-[320]"
				>
					<form onSubmit={handleSubmitReport}>
						<DialogHeader>
							<DialogTitle>
								{reportTarget?.type === "comment"
									? "Báo cáo bình luận"
									: "Báo cáo bài viết"}
							</DialogTitle>
							<DialogDescription>
								{reportTarget?.type === "comment"
									? "Chia sẻ lý do vì sao bình luận này cần được xem xét."
									: "Share why this post should be reviewed."}
							</DialogDescription>
						</DialogHeader>
						<div className="py-4">
							<Label
								htmlFor={`report-reason-${reportTarget?.targetId ?? post.id}`}
							>
								Reason
							</Label>
							<select
								id={`report-reason-${reportTarget?.targetId ?? post.id}`}
								title="Report reason"
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
								<Label
									htmlFor={`report-evidence-${reportTarget?.targetId ?? post.id}`}
								>
									Evidence Image (optional)
								</Label>
								<Input
									id={`report-evidence-${reportTarget?.targetId ?? post.id}`}
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

			<AlertDialog
				open={!!commentPendingDelete}
				onOpenChange={(open) => {
					if (!open) {
						setCommentPendingDelete(null);
					}
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xóa bình luận này?</AlertDialogTitle>
						<AlertDialogDescription>
							Hành động này sẽ gỡ bình luận của bạn khỏi cuộc trò chuyện và
							không thể hoàn tác.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Hủy</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteComment}
							className="border-transparent bg-red-500 text-white hover:bg-red-600 focus:ring-red-500"
						>
							Xóa bình luận
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<div className="flex flex-wrap items-center gap-2 border-t pt-3">
				<button
					className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm transition-colors ${
						isLiked
							? "bg-red-500/10 text-red-500"
							: "text-foreground/70 hover:bg-muted hover:text-red-500"
					}`}
					title="Like"
					onClick={handleToggleLike}
				>
					<Heart size={18} className={isLiked ? "fill-current" : ""} />
					<span>{likeCount}</span>
				</button>

				<button
					className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm text-foreground/70 transition-colors hover:bg-muted hover:text-blue-500"
					title="Comment"
					onClick={(e) => {
						if (!handleAuthAction(e)) return;
						setIsPostDetailOpen(true);
					}}
				>
					<MessageSquare size={18} />
					<span>{commentCount}</span>
				</button>

				<button
					className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
						isReposted
							? "bg-emerald-600/10 text-emerald-600"
							: "text-foreground/70 hover:bg-muted hover:text-foreground"
					}`}
					title={isReposted ? "Unrepost" : "Repost"}
					onClick={handleRepost}
					disabled={isReposting}
				>
					<Share2 size={18} />
				</button>

				{!isAuthor && (
					<button
						className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
						title="Report"
						onClick={(e) => {
							if (!handleAuthAction(e)) return;
							setReportTarget({
								type: "post",
								targetId: post.id,
								reportedUserId: post.author_id,
							});
						}}
					>
						<Flag size={18} />
					</button>
				)}
			</div>

			{myPreviewComments.length > 0 && (
				<div className="mt-3 border-t border-border/70 pt-3">
					<div className="mb-2 flex items-center justify-between gap-2">
						<p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/60">
							Bình luận của bạn
						</p>
						{commentCount > myPreviewComments.length ? (
							<button
								type="button"
								onClick={() => setIsPostDetailOpen(true)}
								className="text-xs font-medium text-primary hover:underline"
							>
								Xem tất cả
							</button>
						) : null}
					</div>
					<div className="space-y-2">
						{myPreviewComments.map((comment) => (
							<div key={comment.id}>
								<CommentItem
									authorName={comment.authorName}
									authorId={comment.authorId}
									authorIsPublic={comment.authorIsPublic}
									authorAvatar={comment.authorAvatar}
									content={comment.content}
									gifId={comment.gifId}
									gifProvider={comment.gifProvider}
									timeAgo={comment.timeAgo}
									isAuthor={comment.authorId === post.author_id}
									isEdited={comment.isEdited}
									onEdit={() => startEditingComment(comment)}
									onDelete={() => setCommentPendingDelete(comment)}
								/>
								{editingThreadCommentId === comment.id
									? renderCommentInlineEditor(comment.id)
									: null}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
