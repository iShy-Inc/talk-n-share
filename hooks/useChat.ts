import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Message } from "@/types/supabase";
import { registerGiphySend, type GifSelection } from "@/lib/giphy";

const supabase = createClient();

export const useChat = (matchId: string) => {
	const [messages, setMessages] = useState<Message[]>([]);

	// Fetch old messages & Subscribe real-time
	useEffect(() => {
		if (!matchId) return;

		// Fetch old messages
		const fetchMessages = async () => {
			const { data } = await supabase
				.from("messages")
				.select("*")
				.eq("match_id", matchId)
				.order("created_at", { ascending: true });
			setMessages((data as Message[]) || []);
		};

		fetchMessages();

		// Listen to new messages
		const channel = supabase
			.channel(`chat:${matchId}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "messages",
					filter: `match_id=eq.${matchId}`,
				},
				(payload) => {
					setMessages((prev) => [...prev, payload.new as Message]);
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [matchId]);

	// Send message
	const sendMessage = async (
		content: string,
		sender_id: string,
		type = "text",
		gif?: GifSelection | null,
		targetMatchId?: string,
	) => {
		const normalizedContent = content.trim() || null;
		const resolvedMatchId = targetMatchId ?? matchId;
		if (!normalizedContent && !gif) return;
		if (!resolvedMatchId) return;

		await supabase.from("messages").insert([
			{
				match_id: resolvedMatchId,
				content: normalizedContent,
				// Keep the row type compatible with existing DB constraints.
				// GIF rendering relies on gif_provider/gif_id, not the type column.
				type,
				sender_id,
				gif_provider: gif?.provider ?? null,
				gif_id: gif?.id ?? null,
			},
		]);

		if (gif?.provider === "giphy") {
			void registerGiphySend(gif.id);
		}
	};

	// Update message
	const updateMessage = async (message: Message) => {
		await supabase.from("messages").update(message).eq("id", message.id);
	};

	// Delete message
	const deleteMessage = async (messageId: string) => {
		await supabase.from("messages").delete().eq("id", messageId);
	};

	return { messages, sendMessage, updateMessage, deleteMessage };
};
