"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconMessageCircle } from "@tabler/icons-react";
import { RoleVerifiedBadge } from "@/components/shared/RoleVerifiedBadge";
import { ProfileVisibilityIcon } from "@/components/shared/ProfileVisibilityIcon";
import type { Profile } from "@/types/supabase";
import { useIsUserOnline } from "@/hooks/usePresence";
import { PresenceDot } from "@/components/shared/PresenceDot";

interface UserResultCardProps {
	id: string;
	username: string;
	role?: Profile["role"] | null;
	isPublic?: boolean | null;
	title?: string;
	avatarUrl?: string;
	bio?: string;
	onSendMessage?: (id: string) => void;
}

export function UserResultCard({
	id,
	username,
	role,
	isPublic,
	title,
	avatarUrl,
	bio,
	onSendMessage,
}: UserResultCardProps) {
	const isOnline = useIsUserOnline(id);

	return (
		<div className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm">
			<div className="relative shrink-0">
				{avatarUrl ? (
					<img
						src={avatarUrl}
						alt={username}
						className="size-12 rounded-full object-cover"
					/>
				) : (
					<div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
						{username[0]?.toUpperCase()}
					</div>
				)}
				<PresenceDot isOnline={isOnline} className="size-3.5" />
			</div>
			<div className="min-w-0 flex-1">
				<div className="flex items-center justify-between gap-2">
					<div>
						<Link href={`/profile?userId=${id}`}>
							<div className="flex items-center gap-2">
								<h3 className="font-semibold text-foreground hover:underline">
									{username}
								</h3>
								<ProfileVisibilityIcon isPublic={isPublic} />
								<RoleVerifiedBadge role={role} />
							</div>
						</Link>
						{title && <p className="text-sm text-muted-foreground">{title}</p>}
					</div>
					{onSendMessage && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => onSendMessage(id)}
							className="h-8 rounded-full px-4"
						>
							<IconMessageCircle className="mr-1.5 size-4" />
							Gửi tin nhắn
						</Button>
					)}
				</div>
				{bio && (
					<p className="mt-2 text-sm text-muted-foreground line-clamp-2">
						{bio}
					</p>
				)}
			</div>
		</div>
	);
}
