"use client";

import { useState } from "react";
import { CommentItem } from "./CommentItem";
import { Input } from "@/components/ui/input";

export interface CommentData {
	id: string;
	authorName: string;
	authorAvatar?: string;
	authorRole?: string;
	content: string;
	timeAgo: string;
	isAuthor?: boolean;
}

interface CommentListProps {
	comments: CommentData[];
	currentUserAvatar?: string;
	onSubmitComment?: (content: string) => void;
	onReply?: (commentId: string) => void;
}

export function CommentList({
	comments,
	currentUserAvatar,
	onSubmitComment,
	onReply,
}: CommentListProps) {
	const [commentText, setCommentText] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!commentText.trim() || !onSubmitComment) return;
		onSubmitComment(commentText.trim());
		setCommentText("");
	};

	return (
		<div className="space-y-4">
			{/* Comment input */}
			{onSubmitComment && (
				<form onSubmit={handleSubmit} className="flex items-center gap-3">
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
						placeholder="Share your thoughts here..."
						className="rounded-xl"
						id="comment-input"
					/>
				</form>
			)}

			{/* Comment items */}
			{comments.map((comment) => (
				<CommentItem
					key={comment.id}
					authorName={comment.authorName}
					authorAvatar={comment.authorAvatar}
					authorRole={comment.authorRole}
					content={comment.content}
					timeAgo={comment.timeAgo}
					isAuthor={comment.isAuthor}
					onReply={onReply ? () => onReply(comment.id) : undefined}
				/>
			))}
		</div>
	);
}
