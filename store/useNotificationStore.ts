import { create } from "zustand";
import { Notification } from "@/types";

interface NotificationState {
	notifications: Notification[];
	unreadCount: number;
	addNotification: (notif: Notification) => void;
	setNotifications: (list: Notification[]) => void;
	markAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
	notifications: [],
	unreadCount: 0,
	addNotification: (notif) =>
		set((state) => ({
			notifications: [notif, ...state.notifications],
			unreadCount: state.unreadCount + 1,
		})),
	setNotifications: (list) =>
		set({
			notifications: list,
			unreadCount: list.filter((n) => !n.is_read).length,
		}),
	markAsRead: () => set({ unreadCount: 0 }),
}));
