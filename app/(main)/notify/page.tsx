"use client";

import { useNotifications } from "@/hooks/useNotifications";
import {
	NotificationList,
	NotificationData,
} from "@/components/shared/NotificationList";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

export default function NotifyPage() {
	const {
		notifications,
		markOneAsRead,
		markAllAsRead,
		hideNotification,
		deleteNotification,
	} = useNotifications();
	const router = useRouter();

	// Map notifications to component format
	const notificationItems: NotificationData[] = notifications.map((n) => ({
		id: n.id,
		avatarUrl: n.sender?.avatar_url ?? undefined,
		content: <p>{n.content}</p>,
		timeAgo: formatDistanceToNow(new Date(n.created_at), {
			addSuffix: true,
		}),
		isRead: n.is_read ?? false,
	}));

	const handleClickNotification = async (id: string) => {
		await markOneAsRead(id);
		const clicked = notifications.find((item) => item.id === id);
		if (clicked?.link) {
			router.push(clicked.link);
		}
	};

	return (
		<NotificationList
			notifications={notificationItems}
			onClickNotification={handleClickNotification}
			onReadNotification={markOneAsRead}
			onHideNotification={hideNotification}
			onDeleteNotification={deleteNotification}
			onReadAll={markAllAsRead}
		/>
	);
}
