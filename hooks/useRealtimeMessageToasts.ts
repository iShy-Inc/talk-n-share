"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";
import type { Database } from "@/types/supabase";

const supabase = createClient();

type IncomingMessagePayload = {
	id: string;
	match_id: string;
	sender_id?: string;
	content?: string | null;
	gif_id?: string | null;
	image_url?: string | null;
};

type SessionToastMeta = {
	displayName: string | null;
	sessionType: string | null;
	isRevealed: boolean;
};

const fetchSessionToastMeta = async (matchId: string) => {
	try {
		const { data, error } = await supabase.rpc("get_chat_session_for_viewer", {
			target_session_id: matchId,
		});

		if (error) {
			throw error;
		}

		const session = ((data?.[0] ?? null) as
			| Database["public"]["Functions"]["get_chat_session_for_viewer"]["Returns"][number]
			| null) ?? null;

		if (!session) {
			return {
				displayName: null,
				sessionType: null,
				isRevealed: false,
			} satisfies SessionToastMeta;
		}

		if (session.session_type === "match" && session.is_revealed === false) {
			return {
				displayName: null,
				sessionType: "match",
				isRevealed: false,
			} satisfies SessionToastMeta;
		}

		return {
			displayName: session.display_name?.trim() ?? null,
			sessionType: session.session_type ?? null,
			isRevealed: session.is_revealed ?? false,
		} satisfies SessionToastMeta;
	} catch {
		// Fall back to the safest possible toast metadata when session details are unavailable.
		return {
			displayName: null,
			sessionType: null,
			isRevealed: false,
		} satisfies SessionToastMeta;
	}
};

export const useRealtimeMessageToasts = () => {
	const userId = useAuthStore((state) => state.user?.id ?? "");
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();
	const shownMessageIdsRef = useRef<Set<string>>(new Set());
	const sessionMetaCacheRef = useRef<Map<string, SessionToastMeta>>(new Map());

	useEffect(() => {
		if (!userId) {
			shownMessageIdsRef.current.clear();
			sessionMetaCacheRef.current.clear();
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

					const cachedMeta = sessionMetaCacheRef.current.get(next.match_id);
					const sessionMeta =
						cachedMeta &&
						(cachedMeta.sessionType !== "match" || cachedMeta.isRevealed)
							? cachedMeta
							: await fetchSessionToastMeta(next.match_id);
					sessionMetaCacheRef.current.set(next.match_id, sessionMeta);

					const shouldHideSenderName =
						sessionMeta.sessionType === "match"
							? !sessionMeta.isRevealed
							: false;
					const description = shouldHideSenderName
						? "Bạn có một tin nhắn từ người ghép đôi ẩn danh."
						: next.content?.trim() ||
							(next.gif_id ? "Đã gửi một GIF." : null) ||
							(next.image_url
								? "Đã gửi một hình ảnh."
								: "Bạn có tin nhắn mới.");

					shownMessageIdsRef.current.add(next.id);
					toast(
						shouldHideSenderName
							? "Tin nhắn ẩn danh mới"
							: sessionMeta.displayName
								? `Tin nhắn mới từ ${sessionMeta.displayName}`
								: "Tin nhắn mới",
						{
							description,
							action: {
								label: "Mở",
								onClick: () => {
									window.location.href = `/messages?sessionId=${next.match_id}`;
								},
							},
						},
					);
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [pathname, queryClient, searchParams, userId]);
};
