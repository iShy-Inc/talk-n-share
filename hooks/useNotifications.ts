import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { Notification } from "@/types/supabase";

const supabase = createClient();

export const useNotifications = () => {
	const userId = useAuthStore((state) => state.user?.id ?? "");
	const notifications = useNotificationStore((state) => state.notifications);
	const unreadCount = useNotificationStore((state) => state.unreadCount);
	const addNotification = useNotificationStore(
		(state) => state.addNotification,
	);
	const setNotifications = useNotificationStore(
		(state) => state.setNotifications,
	);
	const markAsReadLocal = useNotificationStore((state) => state.markAsRead);
	const reset = useNotificationStore((state) => state.reset);

	useEffect(() => {
		if (!userId) {
			reset();
			return;
		}

		const fetchInitial = async () => {
			const { data, error } = await supabase
				.from("notifications")
				.select("*")
				.eq("recipient_id", userId)
				.order("created_at", { ascending: false })
				.limit(50);

			if (error) {
				console.error("Failed to load notifications:", error.message);
				return;
			}

			setNotifications(data ?? []);
		};

		fetchInitial();

		const channel = supabase
			.channel(`notif:${userId}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "notifications",
					filter: `recipient_id=eq.${userId}`,
				},
				(payload) => {
					addNotification(payload.new as Notification);
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [userId, addNotification, setNotifications, reset]);

	const markAllAsRead = async () => {
		if (!userId || unreadCount === 0) return;

		const { error } = await supabase
			.from("notifications")
			.update({ is_read: true })
			.eq("recipient_id", userId)
			.eq("is_read", false);

		if (!error) markAsReadLocal();
	};

	const markOneAsRead = async (notificationId: string) => {
		const { error } = await supabase
			.from("notifications")
			.update({ is_read: true })
			.eq("id", notificationId);

		if (!error) markAsReadLocal(notificationId);
	};

	return {
		notifications,
		unreadCount,
		markAllAsRead,
		markOneAsRead,
	};
};

// Backward-compatible alias for old call sites.
export const useRealtimeNotifications = (_userId?: string) =>
	useNotifications();
