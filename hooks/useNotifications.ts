import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";
import {
	AppNotification,
	useNotificationStore,
} from "@/store/useNotificationStore";

const supabase = createClient();
const hiddenKeyFor = (userId: string) => `notifications-hidden:${userId}`;

const getHiddenIds = (userId: string) => {
	if (!userId || typeof window === "undefined") return new Set<string>();
	try {
		const raw = localStorage.getItem(hiddenKeyFor(userId));
		if (!raw) return new Set<string>();
		return new Set<string>(JSON.parse(raw) as string[]);
	} catch {
		return new Set<string>();
	}
};

const setHiddenIds = (userId: string, ids: Set<string>) => {
	if (!userId || typeof window === "undefined") return;
	localStorage.setItem(hiddenKeyFor(userId), JSON.stringify(Array.from(ids)));
};

const fetchSenderProfile = async (senderId?: string | null) => {
	if (!senderId) return null;
	const { data } = await supabase
		.from("profiles")
		.select("display_name, avatar_url")
		.eq("id", senderId)
		.maybeSingle();
	return data ?? null;
};

export const useNotificationBootstrap = () => {
	const userId = useAuthStore((state) => state.user?.id ?? "");
	const upsertNotification = useNotificationStore(
		(state) => state.upsertNotification,
	);
	const setNotifications = useNotificationStore(
		(state) => state.setNotifications,
	);
	const reset = useNotificationStore((state) => state.reset);

	useEffect(() => {
		if (!userId) {
			reset();
			return;
		}

		const fetchInitial = async () => {
			const { data, error } = await supabase
				.from("notifications")
				.select(
					"*, sender:profiles!notifications_sender_id_fkey(display_name, avatar_url)",
				)
				.eq("recipient_id", userId)
				.order("created_at", { ascending: false })
				.limit(50);

			if (error) {
				console.error("Failed to load notifications:", error.message);
				return;
			}

			setNotifications((data ?? []) as AppNotification[]);
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
				async (payload) => {
					const next = payload.new as AppNotification;
					const sender = await fetchSenderProfile(next.sender_id);
					upsertNotification({ ...next, sender });
				},
			)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "notifications",
					filter: `recipient_id=eq.${userId}`,
				},
				async (payload) => {
					const next = payload.new as AppNotification;
					const sender = await fetchSenderProfile(next.sender_id);
					upsertNotification({ ...next, sender });
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [userId, upsertNotification, setNotifications, reset]);
};

export const useNotifications = () => {
	const userId = useAuthStore((state) => state.user?.id ?? "");
	const notifications = useNotificationStore((state) => state.notifications);
	const unreadCount = useNotificationStore((state) => state.unreadCount);
	const markAsReadLocal = useNotificationStore((state) => state.markAsRead);
	const removeNotificationLocal = useNotificationStore(
		(state) => state.removeNotification,
	);

	const hiddenIds = getHiddenIds(userId);
	const visibleNotifications = notifications.filter((n) => !hiddenIds.has(n.id));

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
		if (!userId) return;
		const { error } = await supabase
			.from("notifications")
			.update({ is_read: true })
			.eq("id", notificationId)
			.eq("recipient_id", userId);

		if (!error) markAsReadLocal(notificationId);
	};

	const hideNotification = (notificationId: string) => {
		if (!userId) return;
		const nextHidden = getHiddenIds(userId);
		nextHidden.add(notificationId);
		setHiddenIds(userId, nextHidden);
		removeNotificationLocal(notificationId);
	};

	const deleteNotification = async (notificationId: string) => {
		if (!userId) return;
		const { error } = await supabase
			.from("notifications")
			.delete()
			.eq("id", notificationId)
			.eq("recipient_id", userId);
		if (error) return;

		const nextHidden = getHiddenIds(userId);
		if (nextHidden.has(notificationId)) {
			nextHidden.delete(notificationId);
			setHiddenIds(userId, nextHidden);
		}
		removeNotificationLocal(notificationId);
	};

	return {
		notifications: visibleNotifications,
		unreadCount,
		markAllAsRead,
		markOneAsRead,
		hideNotification,
		deleteNotification,
	};
};

// Backward-compatible alias for old call sites.
export const useRealtimeNotifications = (_userId?: string) =>
	useNotificationBootstrap();
