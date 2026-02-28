"use client";

import { useState } from "react";
import { CommentItem } from "./CommentItem";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GifPickerButton } from "@/components/shared/GifPickerButton";
import type { GifSelection } from "@/lib/giphy";

export interface CommentData {
	id: string;
	authorName: string;
	authorId?: string;
	authorIsPublic?: boolean | null;
	authorAvatar?: string;
	authorRole?: string;
	content: string;
	gifId?: string;
	gifProvider?: string;
	timeAgo: string;
	isAuthor?: boolean;
}

export type CommentDraft = {
	content: string;
	gif?: GifSelection | null;
};

interface CommentListProps {
	comments: CommentData[];
	currentUserAvatar?: string;
	onSubmitComment?: (draft: CommentDraft) => void;
	onReply?: (commentId: string) => void;
}

export function CommentList({
	comments,
	currentUserAvatar,
	onSubmitComment,
	onReply,
}: CommentListProps) {
	const [commentText, setCommentText] = useState("");
	const [selectedGif, setSelectedGif] = useState<GifSelection | null>(null);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if ((!commentText.trim() && !selectedGif) || !onSubmitComment) return;
		onSubmitComment({ content: commentText.trim(), gif: selectedGif });
		setCommentText("");
		setSelectedGif(null);
	};

	return (
		<div className="space-y-4">
			{/* Comment input */}
			{onSubmitComment && (
				<form onSubmit={handleSubmit} className="space-y-3">
					{selectedGif && (
						<div className="flex items-start gap-2 rounded-xl border border-border/70 bg-muted/30 p-2">
							<img
								src={selectedGif.previewUrl}
								alt={selectedGif.title}
								className="h-16 w-16 rounded-lg object-cover"
							/>
							<div className="flex min-w-0 flex-1 items-start justify-between gap-2">
								<span className="text-xs text-muted-foreground">GIF đã chọn</span>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => setSelectedGif(null)}
								>
									Xóa
								</Button>
							</div>
						</div>
					)}
					<div className="flex items-center gap-3">
						{currentUserAvatar ? (
							<img
								src={currentUserAvatar}
								alt=""
								className="size-9 shrink-0 rounded-full object-cover"
							/>
						) : (
							<div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm">
								👤
							</div>
						)}
						<Input
							value={commentText}
							onChange={(e) => setCommentText(e.target.value)}
							placeholder="Viết bình luận của bạn..."
							className="rounded-xl"
							id="comment-input"
						/>
						<GifPickerButton onSelect={setSelectedGif} className="rounded-xl" />
						<Button
							type="submit"
							disabled={!commentText.trim() && !selectedGif}
						>
							Gửi
						</Button>
					</div>
				</form>
			)}

			{/* Comment items */}
			{comments.map((comment) => (
				<CommentItem
					key={comment.id}
					authorName={comment.authorName}
					authorId={comment.authorId}
					authorIsPublic={comment.authorIsPublic}
					authorAvatar={comment.authorAvatar}
					authorRole={comment.authorRole}
					content={comment.content}
					gifId={comment.gifId}
					gifProvider={comment.gifProvider}
					timeAgo={comment.timeAgo}
					isAuthor={comment.isAuthor}
					onReply={onReply ? () => onReply(comment.id) : undefined}
				/>
			))}
		</div>
	);
}
