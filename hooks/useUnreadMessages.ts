"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";

const supabase = createClient();
const keyFor = (userId: string) => `messages-last-seen:${userId}`;

export const markMessagesAsSeen = (userId: string) => {
	if (typeof window === "undefined") return;
	localStorage.setItem(keyFor(userId), new Date().toISOString());
};

const getOrInitLastSeenAt = (userId: string) => {
	if (typeof window === "undefined") return null;
	const key = keyFor(userId);
	const existing = localStorage.getItem(key);
	if (existing) return existing;
	const now = new Date().toISOString();
	localStorage.setItem(key, now);
	return now;
};

export const useUnreadMessages = () => {
	const user = useAuthStore((state) => state.user);
	const queryClient = useQueryClient();

	const { data: unreadCount = 0 } = useQuery({
		queryKey: ["unread-messages-count", user?.id],
		queryFn: async () => {
			if (!user) return 0;
			const lastSeenAt = getOrInitLastSeenAt(user.id);
			if (!lastSeenAt) return 0;

			const { data: sessions, error: sessionsError } = await supabase
				.from("matches")
				.select("id")
				.or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
			if (sessionsError) throw sessionsError;

			const sessionIds = (sessions ?? []).map((session) => session.id);
			if (sessionIds.length === 0) return 0;

			const { count, error: messagesError } = await supabase
				.from("messages")
				.select("id", { count: "exact", head: true })
				.in("match_id", sessionIds)
				.neq("sender_id", user.id)
				.gt("created_at", lastSeenAt);
			if (messagesError) throw messagesError;

			return count ?? 0;
		},
		enabled: !!user,
	});

	useEffect(() => {
		if (!user) return;
		const channel = supabase
			.channel(`unread-messages:${user.id}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "messages",
				},
				(payload) => {
					const senderId = (payload.new as { sender_id?: string }).sender_id;
					if (senderId && senderId !== user.id) {
						queryClient.invalidateQueries({
							queryKey: ["unread-messages-count", user.id],
						});
					}
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [user, queryClient]);

	return { unreadCount };
};
