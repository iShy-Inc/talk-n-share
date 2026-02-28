import { createClient } from "@/utils/supabase/client";
import type { PostgrestError } from "@supabase/supabase-js";

type ContactMessagingParams = {
	viewerId: string;
	viewerDisplayName?: string | null;
	targetUserId: string;
	targetDisplayName?: string | null;
	targetIsPublic?: boolean | null;
};

type ContactMessagingResult = { kind: "session_ready"; sessionId: string };

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
		sessionId: string;
		senderDisplayName?: string | null;
	},
) => {
	const senderName = values.senderDisplayName?.trim() || "Someone";
	await tryInsertNotification(supabase, {
		recipient_id: values.recipientId,
		sender_id: values.senderId,
		link: `/messages?sessionId=${values.sessionId}`,
		content: `${senderName} started a conversation with you.`,
		reference_id: values.sessionId,
	});
};

export const startOrRequestConversation = async ({
	viewerId,
	viewerDisplayName,
	targetUserId,
}: ContactMessagingParams): Promise<ContactMessagingResult> => {
	const supabase = createClient();

	const { data: existingSession, error: existingSessionError } = await supabase
		.from("matches")
		.select("id")
		.or(
			`and(user1_id.eq.${viewerId},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${viewerId})`,
		)
		.eq("type", "direct")
		.maybeSingle();

	if (existingSessionError) throw existingSessionError;
	if (existingSession?.id) {
		return { kind: "session_ready", sessionId: existingSession.id };
	}

	const { data: sessionId, error: createSessionError } = await supabase.rpc(
		"create_or_get_direct_chat",
		{
			target_user_id: targetUserId,
		},
	);

	if (createSessionError) throw createSessionError;
	if (!sessionId) {
		throw new Error("Direct chat session was not created");
	}

	await notifyConversationStarted(supabase, {
		recipientId: targetUserId,
		senderId: viewerId,
		sessionId,
		senderDisplayName: viewerDisplayName,
	});
	return { kind: "session_ready", sessionId };
};
