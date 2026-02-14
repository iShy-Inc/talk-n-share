"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
}

export function NotificationList({
	notifications,
	onClickNotification,
}: NotificationListProps) {
	return (
		<Card className="overflow-hidden border shadow-sm">
			<CardHeader className="border-b border-border px-5 py-4">
				<CardTitle className="text-base">Notifications</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				{notifications.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<span className="text-3xl">🔔</span>
						<p className="mt-2 text-sm text-muted-foreground">
							No notifications yet
						</p>
					</div>
				) : (
					notifications.map((notification) => (
						<NotificationItem
							key={notification.id}
							avatarUrl={notification.avatarUrl}
							content={notification.content}
							timeAgo={notification.timeAgo}
							isRead={notification.isRead}
							onClick={() => onClickNotification?.(notification.id)}
						/>
					))
				)}
			</CardContent>
		</Card>
	);
}
