import { create } from "zustand";
import { Notification } from "@/types/supabase";

type NotificationSender = {
	display_name: string | null;
	avatar_url: string | null;
};

export type AppNotification = Notification & {
	sender?: NotificationSender | null;
};

interface NotificationState {
	notifications: AppNotification[];
	unreadCount: number;
	activeRecipientId: string | null;
	upsertNotification: (notif: AppNotification) => void;
	setNotifications: (list: AppNotification[]) => void;
	markAsRead: (notificationId?: string) => void;
	removeNotification: (notificationId: string) => void;
	reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
	notifications: [],
	unreadCount: 0,
	activeRecipientId: null,
	upsertNotification: (notif) =>
		set((state) => ({
			notifications: [notif, ...state.notifications.filter((n) => n.id !== notif.id)],
			unreadCount: [
				notif,
				...state.notifications.filter((n) => n.id !== notif.id),
			].filter((n) => !n.is_read).length,
		})),
	setNotifications: (list) =>
		set({
			notifications: list,
			unreadCount: list.filter((n) => !n.is_read).length,
			activeRecipientId: list[0]?.recipient_id ?? null,
		}),
	markAsRead: (notificationId) =>
		set((state) => {
			if (!notificationId) {
				return {
					notifications: state.notifications.map((n) => ({
						...n,
						is_read: true,
					})),
					unreadCount: 0,
				};
			}

			const notifications = state.notifications.map((n) =>
				n.id === notificationId ? { ...n, is_read: true } : n,
			);

			return {
				notifications,
				unreadCount: notifications.filter((n) => !n.is_read).length,
			};
		}),
	removeNotification: (notificationId) =>
		set((state) => {
			const notifications = state.notifications.filter(
				(n) => n.id !== notificationId,
			);
			return {
				notifications,
				unreadCount: notifications.filter((n) => !n.is_read).length,
			};
		}),
	reset: () =>
		set({
			notifications: [],
			unreadCount: 0,
			activeRecipientId: null,
		}),
}));
