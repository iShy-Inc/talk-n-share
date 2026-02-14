"use client";

import { cn } from "@/lib/utils";

interface CommentItemProps {
	authorName: string;
	authorAvatar?: string;
	authorRole?: string;
	content: string;
	timeAgo: string;
	isAuthor?: boolean;
	onReply?: () => void;
}

export function CommentItem({
	authorName,
	authorAvatar,
	authorRole,
	content,
	timeAgo,
	isAuthor = false,
	onReply,
}: CommentItemProps) {
	return (
		<div className="flex gap-3 rounded-xl bg-muted/50 p-4">
			{authorAvatar ? (
				<img
					src={authorAvatar}
					alt=""
					className="size-10 shrink-0 rounded-full object-cover"
				/>
			) : (
				<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
					{authorName[0]?.toUpperCase()}
				</div>
			)}

			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<span className="text-sm font-semibold">{authorName}</span>
					{isAuthor && (
						<span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
							Author
						</span>
					)}
					<span className="ml-auto text-xs text-muted-foreground">
						{timeAgo}
					</span>
				</div>

				{authorRole && (
					<span className="mt-0.5 block text-xs text-muted-foreground">
						{authorRole}
					</span>
				)}

				<p className="mt-2 text-sm leading-relaxed text-foreground">
					{content}
				</p>

				{onReply && (
					<button
						onClick={onReply}
						className="mt-2 text-[13px] font-medium text-primary hover:underline"
					>
						Reply
					</button>
				)}
			</div>
		</div>
	);
}
