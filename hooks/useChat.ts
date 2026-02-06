import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export interface Message {
	id: string;
	created_at: string;
	session_id: string;
	content: string;
	msg_type: string;
}

export const useChat = (sessionId: string) => {
	const [messages, setMessages] = useState<Message[]>([]);

	// Fetch old messages & Subscribe real-time
	useEffect(() => {
		if (!sessionId) return;

		// Fetch old messages
		const fetchMessages = async () => {
			const { data } = await supabase
				.from("messages")
				.select("*")
				.eq("session_id", sessionId)
				.order("created_at", { ascending: true });
			setMessages(data || []);
		};

		fetchMessages();

		// Listen to new messages
		const channel = supabase
			.channel(`chat:${sessionId}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "messages",
					filter: `session_id=eq.${sessionId}`,
				},
				(payload) => {
					setMessages((prev) => [...prev, payload.new as Message]);
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [sessionId]);

	// Send message
	const sendMessage = async (content: string, type = "text") => {
		await supabase.from("messages").insert([
			{
				session_id: sessionId,
				content,
				msg_type: type,
			},
		]);
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
