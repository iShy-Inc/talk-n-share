"use client";

import { cn } from "@/lib/utils";

interface NotificationItemProps {
	avatarUrl?: string;
	content: React.ReactNode;
	timeAgo: string;
	isRead?: boolean;
	onClick?: () => void;
}

export function NotificationItem({
	avatarUrl,
	content,
	timeAgo,
	isRead = false,
	onClick,
}: NotificationItemProps) {
	return (
		<button
			onClick={onClick}
			className={cn(
				"flex w-full items-center gap-3.5 border-b border-border/30 px-5 py-4 text-left transition-colors hover:bg-muted/50 last:border-0",
				!isRead && "bg-primary/5",
			)}
		>
			{avatarUrl ? (
				<img
					src={avatarUrl}
					alt=""
					className="size-10 shrink-0 rounded-full object-cover"
				/>
			) : (
				<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm">
					🔔
				</div>
			)}
			<div className="min-w-0 flex-1 text-sm text-foreground">{content}</div>
			<span className="shrink-0 text-xs text-muted-foreground">{timeAgo}</span>
		</button>
	);
}
