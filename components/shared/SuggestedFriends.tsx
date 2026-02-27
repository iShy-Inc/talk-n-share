"use client";

import Link from "next/link";
import { IconPlus } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface SuggestedFriend {
	id: string;
	name: string;
	title: string;
	avatar?: string;
}

interface SuggestedFriendsProps {
	friends: SuggestedFriend[];
	onAdd?: (friendId: string) => void;
}

export function SuggestedFriends({ friends, onAdd }: SuggestedFriendsProps) {
	return (
		<Card className="border-0 shadow-sm">
			<CardContent className="px-5 py-0">
				<h3 className="py-4 text-lg font-semibold">Suggested Friends</h3>

				<div className="space-y-0 divide-y divide-border/50">
					{friends.map((friend) => (
						<div key={friend.id} className="flex items-center gap-3 py-2">
							<Link
								href={`/profile?userId=${friend.id}`}
								className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1 py-1 transition-colors hover:bg-muted/40"
							>
								{friend.avatar ? (
									<img
										src={friend.avatar}
										alt=""
										className="size-10 shrink-0 rounded-full object-cover"
									/>
								) : (
									<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
										{friend.name[0]?.toUpperCase()}
									</div>
								)}
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-medium">{friend.name}</p>
									<p className="truncate text-xs text-muted-foreground">
										{friend.title}
									</p>
								</div>
							</Link>
							{onAdd && (
								<Button
									variant="secondary"
									size="icon-sm"
									onClick={() => onAdd(friend.id)}
									className="shrink-0"
									id={`add-friend-${friend.id}`}
								>
									<IconPlus className="size-4" />
								</Button>
							)}
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
