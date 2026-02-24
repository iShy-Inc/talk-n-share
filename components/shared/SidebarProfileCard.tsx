"use client";

import { Card, CardContent } from "@/components/ui/card";

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
	return (
		<Card className="overflow-hidden border-0 shadow-sm">
			<CardContent className="p-0">
				{/* Cover image */}
				<div className={`h-20 bg-gradient-to-br ${coverGradient}`} />

				{/* Avatar + Info */}
				<div className="-mt-9 text-center px-4 pb-4">
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

					<h3 className="mt-2 text-base font-semibold">{displayName}</h3>
					{title && <p className="text-sm text-muted-foreground">{title}</p>}
				</div>
			</CardContent>
		</Card>
	);
}
