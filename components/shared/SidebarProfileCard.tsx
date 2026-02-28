"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconRefresh } from "@tabler/icons-react";
import { useProfileCover } from "@/hooks/useProfileCover";
import { RoleVerifiedBadge } from "@/components/shared/RoleVerifiedBadge";
import { ProfileVisibilityIcon } from "@/components/shared/ProfileVisibilityIcon";
import type { Profile } from "@/types/supabase";
import { useIsUserOnline } from "@/hooks/usePresence";
import { PresenceDot } from "@/components/shared/PresenceDot";

interface SidebarProfileCardProps {
	userId?: string;
	displayName: string;
	title?: string;
	avatarUrl?: string;
	coverGradient?: string;
	role?: Profile["role"] | null;
	isPublic?: boolean | null;
}

export function SidebarProfileCard({
	userId,
	displayName,
	title,
	avatarUrl,
	coverGradient = "from-muted to-muted/50",
	role,
	isPublic,
}: SidebarProfileCardProps) {
	const { coverUrl, activeCoverUrl, refreshCover, markCoverAsFailed } =
		useProfileCover();
	const isOnline = useIsUserOnline(userId);

	return (
		<Card className="!gap-0 !py-0 overflow-hidden border-0 shadow-sm">
			<CardContent className="p-0">
				{/* Cover image */}
				<div
					className={`relative z-0 h-20 overflow-hidden bg-linear-to-br ${coverGradient}`}
				>
					<div
						className="h-full w-full bg-cover bg-center"
						style={{ backgroundImage: `url(${activeCoverUrl})` }}
					/>
					<img
						src={coverUrl}
						alt=""
						aria-hidden
						className="hidden"
						onError={markCoverAsFailed}
					/>
					<Button
						type="button"
						size="icon-xs"
						variant="secondary"
						className="absolute right-2 top-2 size-6 rounded-full bg-black/45 text-white hover:bg-black/60"
						onClick={refreshCover}
						title="Refresh cover image"
					>
						<IconRefresh className="size-3.5" />
					</Button>
				</div>

				{/* Avatar + Info */}
				<div className="relative z-10 -mt-9 px-4 pb-4 text-center">
					<div className="relative z-10 mx-auto w-fit">
						{avatarUrl ? (
							<img
								src={avatarUrl}
								alt={displayName}
								className="mx-auto size-[72px] rounded-full border-4 border-card object-cover"
							/>
						) : (
							<div className="mx-auto flex size-[72px] items-center justify-center rounded-full border-4 border-card bg-primary/10 text-xl font-bold text-primary">
								{displayName[0]?.toUpperCase()}
							</div>
						)}
						{userId && <PresenceDot isOnline={isOnline} className="size-4" />}
					</div>

					<div className="mt-2 flex items-center justify-center gap-2">
						<h3
							className="max-w-[11rem] truncate text-base font-semibold"
							title={displayName}
						>
							{displayName}
						</h3>
						<ProfileVisibilityIcon isPublic={isPublic} />
						<RoleVerifiedBadge role={role} />
					</div>
					{title && <p className="text-sm text-muted-foreground">{title}</p>}
				</div>
			</CardContent>
		</Card>
	);
}
