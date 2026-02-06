import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

import { Notification } from "@/types";
import { useNotificationStore } from "@/store/useNotificationStore";

export const useRealtimeNotifications = (userId: string) => {
	const { addNotification, setNotifications } = useNotificationStore();

	useEffect(() => {
		if (!userId) return;

		// 1. Lấy thông báo cũ khi vào app
		const fetchInitial = async () => {
			const { data } = await supabase
				.from("notifications")
				.select("*")
				.eq("user_id", userId)
				.order("created_at", { ascending: false })
				.limit(20);
			if (data) setNotifications(data as Notification[]);
		};
		fetchInitial();

		// 2. Lắng nghe thông báo mới (Real-time)
		const channel = supabase
			.channel(`notif:${userId}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "notifications",
					filter: `user_id=eq.${userId}`,
				},
				(payload) => {
					addNotification(payload.new as Notification);
					// Có thể dùng thư viện react-hot-toast để hiện popup tại đây
					console.log("Thông báo mới:", payload.new.content);
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [userId]);
};
