"use client";

import Link from "next/link";
import { IconUserPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import type { SuggestedFriend } from "@/components/shared/SuggestedFriends";

interface SuggestedFriendsFacebookCardProps {
	friends: SuggestedFriend[];
	title?: string;
	className?: string;
}

export function SuggestedFriendsFacebookCard({
	friends,
	title = "Những người bạn có thể biết",
	className,
}: SuggestedFriendsFacebookCardProps) {
	if (friends.length === 0) return null;

	return (
		<div className={className}>
			<div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
				<div className="flex items-center justify-between px-4 py-3">
					<p className="text-sm font-semibold">{title}</p>
					<Link
						href="/search"
						className="text-xs font-medium text-primary hover:underline"
					>
						Xem tất cả
					</Link>
				</div>
				<div className="grid grid-flow-col auto-cols-[160px] gap-3 overflow-x-auto px-3 pb-3 md:auto-cols-[190px]">
					{friends.map((friend) => (
						<div
							key={friend.id}
							className="overflow-hidden rounded-xl border border-border/70 bg-background"
						>
							<Link href={`/profile?userId=${friend.id}`} className="block">
								{friend.avatar ? (
									<img
										src={friend.avatar}
										alt={friend.name}
										className="h-28 w-full object-cover md:h-32"
									/>
								) : (
									<div className="flex h-28 w-full items-center justify-center bg-primary/10 text-2xl font-bold text-primary md:h-32">
										{friend.name[0]?.toUpperCase()}
									</div>
								)}
							</Link>
							<div className="space-y-2 px-3 py-2.5">
								<p className="truncate text-sm font-semibold">{friend.name}</p>
								<p className="truncate text-xs text-muted-foreground">
									{friend.title}
								</p>
								<Button asChild size="sm" className="h-8 w-full rounded-md">
									<Link href={`/profile?userId=${friend.id}`}>
										<IconUserPlus className="mr-1 size-4" />
										Xem hồ sơ
									</Link>
								</Button>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
