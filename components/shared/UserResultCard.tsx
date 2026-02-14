"use client";

import { Button } from "@/components/ui/button";
import { IconUserPlus } from "@tabler/icons-react";

interface UserResultCardProps {
	id: string;
	username: string;
	title?: string;
	avatarUrl?: string;
	bio?: string;
	onFollow?: (id: string) => void;
}

export function UserResultCard({
	id,
	username,
	title,
	avatarUrl,
	bio,
	onFollow,
}: UserResultCardProps) {
	return (
		<div className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm">
			{avatarUrl ? (
				<img
					src={avatarUrl}
					alt={username}
					className="size-12 shrink-0 rounded-full object-cover"
				/>
			) : (
				<div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
					{username[0]?.toUpperCase()}
				</div>
			)}
			<div className="min-w-0 flex-1">
				<div className="flex items-center justify-between gap-2">
					<div>
						<h3 className="font-semibold text-foreground">{username}</h3>
						{title && <p className="text-sm text-muted-foreground">{title}</p>}
					</div>
					{onFollow && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => onFollow(id)}
							className="h-8 rounded-full px-4"
						>
							<IconUserPlus className="mr-1.5 size-4" />
							Follow
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
