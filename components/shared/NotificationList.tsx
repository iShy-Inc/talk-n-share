"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "./NotificationItem";

export interface NotificationData {
	id: string;
	avatarUrl?: string;
	content: React.ReactNode;
	timeAgo: string;
	isRead?: boolean;
}

interface NotificationListProps {
	notifications: NotificationData[];
	onClickNotification?: (id: string) => void;
	onReadNotification?: (id: string) => void;
	onHideNotification?: (id: string) => void;
	onDeleteNotification?: (id: string) => void;
	onReadAll?: () => void;
}

export function NotificationList({
	notifications,
	onClickNotification,
	onReadNotification,
	onHideNotification,
	onDeleteNotification,
	onReadAll,
}: NotificationListProps) {
	const unreadCount = notifications.filter((item) => !item.isRead).length;

	return (
		<Card className="overflow-hidden border shadow-sm mt-12 md:mt-0">
			<CardHeader className="flex flex-row items-center justify-between border-b border-border px-5 py-4">
				<CardTitle className="text-base">Thông báo</CardTitle>
				<Button
					size="xs"
					variant="outline"
					type="button"
					onClick={onReadAll}
					disabled={unreadCount === 0}
				>
					Đánh dấu đã đọc tất cả
				</Button>
			</CardHeader>
			<CardContent className="p-0">
				{notifications.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<span className="text-3xl">🔔</span>
						<p className="mt-2 text-sm text-muted-foreground">
							Chưa có thông báo nào
						</p>
					</div>
				) : (
					notifications.map((notification) => (
						<NotificationItem
							key={notification.id}
							id={notification.id}
							avatarUrl={notification.avatarUrl}
							content={notification.content}
							timeAgo={notification.timeAgo}
							isRead={notification.isRead}
							onClick={() => onClickNotification?.(notification.id)}
							onRead={onReadNotification}
							onHide={onHideNotification}
							onDelete={onDeleteNotification}
						/>
					))
				)}
			</CardContent>
		</Card>
	);
}
