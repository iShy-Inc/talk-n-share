"use client";

import Link from "next/link";
import { ProfileVisibilityIcon } from "@/components/shared/ProfileVisibilityIcon";

interface CommentItemProps {
	authorName: string;
	authorId?: string;
	authorIsPublic?: boolean | null;
	authorAvatar?: string;
	authorRole?: string;
	content: string;
	timeAgo: string;
	isAuthor?: boolean;
	onReply?: () => void;
}

export function CommentItem({
	authorName,
	authorId,
	authorIsPublic,
	authorAvatar,
	authorRole,
	content,
	timeAgo,
	isAuthor = false,
	onReply,
}: CommentItemProps) {
	const authorProfileHref = authorId ? `/profile?userId=${authorId}` : null;

	return (
		<div className="flex gap-3 rounded-xl border border-border/70 bg-card p-4">
			{authorProfileHref ? (
				<Link href={authorProfileHref} className="shrink-0">
					{authorAvatar ? (
						<img
							src={authorAvatar}
							alt=""
							className="size-10 rounded-full object-cover"
						/>
					) : (
						<div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
							{authorName[0]?.toUpperCase()}
						</div>
					)}
				</Link>
			) : (
				<>
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
				</>
			)}

			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					{authorProfileHref ? (
						<>
							<Link
								href={authorProfileHref}
								className="truncate text-sm font-semibold hover:underline"
							>
								{authorName}
							</Link>
							<ProfileVisibilityIcon isPublic={authorIsPublic} />
						</>
					) : (
						<>
							<span className="text-sm font-semibold">{authorName}</span>
							<ProfileVisibilityIcon isPublic={authorIsPublic} />
						</>
					)}
					{isAuthor && (
						<span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
							Tác giả
						</span>
					)}
					<span className="ml-auto text-xs text-foreground/70">
						{timeAgo}
					</span>
				</div>

				{authorRole && (
					<span className="mt-0.5 block text-xs text-foreground/70">
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
						Trả lời
					</button>
				)}
			</div>
		</div>
	);
}
