import { createClient } from "@/utils/supabase/client";
import type { PostgrestError } from "@supabase/supabase-js";

type ContactMessagingParams = {
	viewerId: string;
	viewerDisplayName?: string | null;
	targetUserId: string;
	targetDisplayName?: string | null;
	targetIsPublic?: boolean | null;
};

type ContactMessagingResult =
	| { kind: "request_sent" }
	| { kind: "session_ready"; sessionId: string };

const tryInsertNotification = async (
	supabase: ReturnType<typeof createClient>,
	values: {
		recipient_id: string;
		sender_id: string;
		link: string;
		content: string;
		reference_id: string;
	},
) => {
	const candidateTypes = [
		"message",
		"match",
		"system",
		"general",
		"info",
		"alert",
	];
	let lastError: PostgrestError | null = null;

	for (const type of candidateTypes) {
		const { error } = await supabase.from("notifications").insert({
			...values,
			type,
		});
		if (!error) return;
		lastError = error;
		if (error.code !== "23514") throw error;
	}

	if (lastError) throw lastError;
};

const notifyConversationStarted = async (
	supabase: ReturnType<typeof createClient>,
	values: {
		recipientId: string;
		senderId: string;
		senderDisplayName?: string | null;
	},
) => {
	const senderName = values.senderDisplayName?.trim() || "Someone";
	await tryInsertNotification(supabase, {
		recipient_id: values.recipientId,
		sender_id: values.senderId,
		link: "/messages",
		content: `${senderName} started a conversation with you.`,
		reference_id: values.senderId,
	});
};

export const startOrRequestConversation = async ({
	viewerId,
	viewerDisplayName,
	targetUserId,
	targetDisplayName,
	targetIsPublic,
}: ContactMessagingParams): Promise<ContactMessagingResult> => {
	const supabase = createClient();

	if (targetIsPublic === false) {
		const senderName = viewerDisplayName?.trim() || "Someone";
		const receiverName = targetDisplayName?.trim() || "you";
		const content = `${senderName} is trying to contact ${receiverName}. Please be careful of scams and unknown links.`;
		await tryInsertNotification(supabase, {
			recipient_id: targetUserId,
			sender_id: viewerId,
			link: "/messages",
			content,
			reference_id: viewerId,
		});
		return { kind: "request_sent" };
	}

	const { data: existingSession, error: existingSessionError } = await supabase
		.from("matches")
		.select("id")
		.or(
			`and(user1_id.eq.${viewerId},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${viewerId})`,
		)
		.maybeSingle();

	if (existingSessionError) throw existingSessionError;
	if (existingSession?.id) {
		return { kind: "session_ready", sessionId: existingSession.id };
	}

	const { data: newSession, error: newSessionError } = await supabase
		.from("matches")
		.insert({
			user1_id: viewerId,
			user2_id: targetUserId,
			type: "match",
			status: "active",
			is_revealed: false,
			user1_liked: false,
			user2_liked: false,
		})
		.select("id")
		.single();

	if (newSessionError) throw newSessionError;
	await notifyConversationStarted(supabase, {
		recipientId: targetUserId,
		senderId: viewerId,
		senderDisplayName: viewerDisplayName,
	});
	return { kind: "session_ready", sessionId: newSession.id };
};
