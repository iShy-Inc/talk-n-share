import { create } from "zustand";
import { Notification } from "@/types";

interface NotificationState {
	notifications: Notification[];
	unreadCount: number;
	activeRecipientId: string | null;
	addNotification: (notif: Notification) => void;
	setNotifications: (list: Notification[]) => void;
	markAsRead: (notificationId?: string) => void;
	reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
	notifications: [],
	unreadCount: 0,
	activeRecipientId: null,
	addNotification: (notif) =>
		set((state) => ({
			notifications: [notif, ...state.notifications.filter((n) => n.id !== notif.id)],
			unreadCount:
				state.unreadCount + (notif.is_read === false || notif.is_read === null ? 1 : 0),
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
					notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
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
	reset: () =>
		set({
			notifications: [],
			unreadCount: 0,
			activeRecipientId: null,
		}),
}));
