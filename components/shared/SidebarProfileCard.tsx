"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconRefresh } from "@tabler/icons-react";
import { useProfileCover } from "@/hooks/useProfileCover";

interface SidebarProfileCardProps {
	displayName: string;
	title?: string;
	avatarUrl?: string;
	coverGradient?: string;
}

export function SidebarProfileCard({
	displayName,
	title,
	avatarUrl,
	coverGradient = "from-muted to-muted/50",
}: SidebarProfileCardProps) {
	const { coverUrl, activeCoverUrl, refreshCover, markCoverAsFailed } =
		useProfileCover();

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
					{avatarUrl ? (
						<img
							src={avatarUrl}
							alt={displayName}
							className="relative z-10 mx-auto size-[72px] rounded-full border-4 border-card object-cover"
						/>
					) : (
						<div className="relative z-10 mx-auto flex size-[72px] items-center justify-center rounded-full border-4 border-card bg-primary/10 text-xl font-bold text-primary">
							{displayName[0]?.toUpperCase()}
						</div>
					)}

					<h3 className="mt-2 text-base font-semibold">{displayName}</h3>
					{title && <p className="text-sm text-muted-foreground">{title}</p>}
				</div>
			</CardContent>
		</Card>
	);
}
