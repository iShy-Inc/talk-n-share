"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useRealtimeNotifications } from "@/hooks/useNotifications";
import {
	NotificationList,
	NotificationData,
} from "@/components/shared/NotificationList";
import { SuggestedFriend } from "@/components/shared/SuggestedFriends";
import {
	MainLayout,
	AppLeftSidebar,
	AppRightSidebar,
} from "@/components/shared";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

const supabase = createClient();

export default function NotifyPage() {
	const { user } = useAuthStore();
	const { notifications, markAsRead } = useNotificationStore();

	// Initialize real-time notifications
	useRealtimeNotifications(user?.id ?? "");

	// Fetch current user profile
	const { data: profile } = useQuery({
		queryKey: ["my-profile", user?.id],
		queryFn: async () => {
			if (!user) return null;
			const { data } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", user.id)
				.single();
			return data;
		},
		enabled: !!user,
	});

	// Fetch suggested friends
	const { data: suggestedFriends = [] } = useQuery({
		queryKey: ["suggested-friends-notify"],
		queryFn: async () => {
			const { data } = await supabase
				.from("profiles")
				.select("id, username, avatar_url, region")
				.neq("id", user?.id ?? "")
				.limit(4);
			return (data ?? []).map((u: any) => ({
				id: u.id,
				name: u.username ?? "User",
				title: u.region ?? "Talk N Share Member",
				avatar: u.avatar_url,
			})) as SuggestedFriend[];
		},
		enabled: !!user,
	});

	// Map notifications to component format
	const notificationItems: NotificationData[] = notifications.map((n) => ({
		id: n.id,
		content: <p dangerouslySetInnerHTML={{ __html: n.content }} />,
		timeAgo: formatDistanceToNow(new Date(n.created_at), {
			addSuffix: true,
		}),
		isRead: n.is_read,
	}));

	const handleClickNotification = (id: string) => {
		// Mark notifications as read when clicking
		markAsRead();
	};

	return (
		<MainLayout
			leftSidebar={<AppLeftSidebar profile={profile ?? null} />}
			rightSidebar={<AppRightSidebar suggestedFriends={suggestedFriends} />}
		>
			<NotificationList
				notifications={notificationItems}
				onClickNotification={handleClickNotification}
			/>
		</MainLayout>
	);
}
