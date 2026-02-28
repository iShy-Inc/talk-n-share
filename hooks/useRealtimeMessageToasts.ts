"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";

const supabase = createClient();

type IncomingMessagePayload = {
	id: string;
	match_id: string;
	sender_id?: string;
	content?: string | null;
	image_url?: string | null;
};

const fetchSenderName = async (senderId?: string) => {
	if (!senderId) return null;
	const { data } = await supabase
		.from("profiles")
		.select("display_name")
		.eq("id", senderId)
		.maybeSingle();
	return data?.display_name?.trim() || null;
};

export const useRealtimeMessageToasts = () => {
	const userId = useAuthStore((state) => state.user?.id ?? "");
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();
	const shownMessageIdsRef = useRef<Set<string>>(new Set());

	useEffect(() => {
		if (!userId) {
			shownMessageIdsRef.current.clear();
			return;
		}

		const activeSessionId =
			pathname.startsWith("/messages") ? searchParams.get("sessionId") : null;

		const channel = supabase
			.channel(`message-toasts:${userId}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "messages",
				},
				async (payload) => {
					const next = payload.new as IncomingMessagePayload;
					if (!next?.id || !next.match_id || next.sender_id === userId) return;
					if (shownMessageIdsRef.current.has(next.id)) return;

					queryClient.invalidateQueries({
						queryKey: ["unread-messages-count", userId],
					});

					if (activeSessionId === next.match_id) {
						shownMessageIdsRef.current.add(next.id);
						return;
					}

					const senderName = await fetchSenderName(next.sender_id);
					const description =
						next.content?.trim() ||
						(next.image_url ? "Đã gửi một hình ảnh." : "Bạn có tin nhắn mới.");

					shownMessageIdsRef.current.add(next.id);
					toast(senderName ? `Tin nhắn mới từ ${senderName}` : "Tin nhắn mới", {
						description,
						action: {
							label: "Mở",
							onClick: () => {
								window.location.href = `/messages?sessionId=${next.match_id}`;
							},
						},
					});
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [pathname, queryClient, searchParams, userId]);
};
