"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NotificationItemProps {
	id: string;
	avatarUrl?: string;
	content: React.ReactNode;
	timeAgo: string;
	isRead?: boolean;
	onClick?: () => void;
	onRead?: (id: string) => void;
	onHide?: (id: string) => void;
	onDelete?: (id: string) => void;
}

export function NotificationItem({
	id,
	avatarUrl,
	content,
	timeAgo,
	isRead = false,
	onClick,
	onRead,
	onHide,
	onDelete,
}: NotificationItemProps) {
	return (
		<div
			className={cn(
				"border-b border-border/30 px-5 py-4 last:border-0",
				!isRead && "bg-primary/5",
			)}
		>
			<button
				onClick={onClick}
				className="flex w-full items-center gap-3.5 text-left transition-colors hover:bg-muted/50"
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
			<div className="mt-3 flex flex-wrap gap-2">
				{!isRead && (
					<Button
						size="xs"
						variant="outline"
						type="button"
						onClick={() => onRead?.(id)}
					>
						Đã đọc
					</Button>
				)}
				<Button
					size="xs"
					variant="outline"
					type="button"
					onClick={() => onHide?.(id)}
				>
					Ẩn
				</Button>
				<Button
					size="xs"
					variant="destructive"
					type="button"
					onClick={() => onDelete?.(id)}
				>
					Xóa
				</Button>
			</div>
		</div>
	);
}
