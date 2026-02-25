"use client";

import { useNotifications } from "@/hooks/useNotifications";
import {
	NotificationList,
	NotificationData,
} from "@/components/shared/NotificationList";
import { formatDistanceToNow } from "date-fns";

export default function NotifyPage() {
	const { notifications, markOneAsRead } = useNotifications();

	// Map notifications to component format
	const notificationItems: NotificationData[] = notifications.map((n) => ({
		id: n.id,
		content: <p dangerouslySetInnerHTML={{ __html: n.content }} />,
		timeAgo: formatDistanceToNow(new Date(n.created_at), {
			addSuffix: true,
		}),
		isRead: n.is_read ?? false,
	}));

	const handleClickNotification = (id: string) => {
		markOneAsRead(id);
	};

	return (
		<NotificationList
			notifications={notificationItems}
			onClickNotification={handleClickNotification}
		/>
	);
}
