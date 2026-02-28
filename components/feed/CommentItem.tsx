"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ProfileVisibilityIcon } from "@/components/shared/ProfileVisibilityIcon";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

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
	const { data: maskedAuthorProfile = null } = useQuery({
		queryKey: ["masked-comment-author-profile", authorId],
		queryFn: async () => {
			if (!authorId) return null;
			const { data, error } = await supabase
				.rpc("get_profile_for_viewer", {
					target_profile_id: authorId,
				})
				.maybeSingle();
			if (error) throw error;
			return data;
		},
		enabled:
			!!authorId &&
			(!authorName ||
				authorName === "Anonymous" ||
				!authorAvatar ||
				authorIsPublic === null ||
				authorIsPublic === undefined),
	});

	const resolvedAuthorName =
		maskedAuthorProfile?.display_name ??
		(authorName && authorName !== "Anonymous" ? authorName : undefined) ??
		"Người dùng";
	const resolvedAuthorAvatar = maskedAuthorProfile?.avatar_url ?? authorAvatar;
	const resolvedAuthorIsPublic =
		maskedAuthorProfile?.is_public ?? authorIsPublic ?? null;
	const resolvedAuthorRole = maskedAuthorProfile?.role ?? authorRole;
	const authorProfileHref = authorId ? `/profile?userId=${authorId}` : null;

	return (
		<div className="flex gap-3 rounded-xl border border-border/70 bg-card p-4">
			{authorProfileHref ? (
				<Link href={authorProfileHref} className="shrink-0">
					{resolvedAuthorAvatar ? (
						<img
							src={resolvedAuthorAvatar}
							alt=""
							className="size-10 rounded-full object-cover"
						/>
					) : (
						<div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
							{resolvedAuthorName[0]?.toUpperCase()}
						</div>
					)}
				</Link>
			) : (
				<>
					{resolvedAuthorAvatar ? (
						<img
							src={resolvedAuthorAvatar}
							alt=""
							className="size-10 shrink-0 rounded-full object-cover"
						/>
					) : (
						<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
							{resolvedAuthorName[0]?.toUpperCase()}
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
								{resolvedAuthorName}
							</Link>
							<ProfileVisibilityIcon isPublic={resolvedAuthorIsPublic} />
						</>
					) : (
						<>
							<span className="text-sm font-semibold">{resolvedAuthorName}</span>
							<ProfileVisibilityIcon isPublic={resolvedAuthorIsPublic} />
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

				{resolvedAuthorRole && (
					<span className="mt-0.5 block text-xs text-foreground/70">
						{resolvedAuthorRole}
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
