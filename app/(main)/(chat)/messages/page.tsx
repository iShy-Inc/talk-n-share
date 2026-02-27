"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { createClient } from "@/utils/supabase/client";
import { useChat } from "@/hooks/useChat";
import useProfile from "@/hooks/useProfile";
import type { Message } from "@/types/supabase";
import { ChatEmptyState } from "@/components/chat/ChatEmptyState";
import { ChatList, ChatContact } from "@/components/chat/ChatList";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { ContactPicker, PickerContact } from "@/components/chat/ContactPicker";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconArrowLeft } from "@tabler/icons-react";
import { format } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { startOrRequestConversation } from "@/lib/contact-messaging";
import toast from "react-hot-toast";
import { markMessagesAsSeen } from "@/hooks/useUnreadMessages";

const supabase = createClient();

export default function MessagesPage() {
	const user = useAuthStore((state) => state.user);
	const { profile } = useProfile();
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();
	const initialSessionId = searchParams.get("sessionId");
	const [activeSessionId, setActiveSessionId] = useState<string | null>(
		initialSessionId,
	);
	const [showContactPicker, setShowContactPicker] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Fetch chat sessions for the current user
	const { data: contacts = [] } = useQuery({
		queryKey: ["chat-sessions", user?.id],
		queryFn: async () => {
			if (!user) return [];
			const { data: sessions, error } = await supabase
				.from("matches")
				.select("*")
				.or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
				.order("created_at", { ascending: false });
			if (error) throw error;
			const sessionIds = (sessions ?? []).map((session) => session.id);
			if (sessionIds.length === 0) return [];

			const { data: latestMessages, error: latestMessagesError } =
				await supabase
					.from("messages")
					.select("match_id, content, created_at, sender_id")
					.in("match_id", sessionIds)
					.order("created_at", { ascending: false });
			if (latestMessagesError) throw latestMessagesError;

			const latestBySession = new Map<
				string,
				(typeof latestMessages)[number]
			>();
			const latestReceivedBySession = new Map<
				string,
				(typeof latestMessages)[number]
			>();
			for (const message of latestMessages ?? []) {
				if (!latestBySession.has(message.match_id)) {
					latestBySession.set(message.match_id, message);
				}
				if (
					message.sender_id !== user.id &&
					!latestReceivedBySession.has(message.match_id)
				) {
					latestReceivedBySession.set(message.match_id, message);
				}
			}

			const otherUserIds = Array.from(
				new Set(
					(sessions ?? []).map((session) =>
						session.user1_id === user.id ? session.user2_id : session.user1_id,
					),
				),
			);

			if (otherUserIds.length === 0) return [];

			const { data: profiles, error: profilesError } = await supabase
				.from("profiles")
				.select("id, display_name, avatar_url, is_public")
				.in("id", otherUserIds);
			if (profilesError) throw profilesError;

			const profileMap = new Map(
				(profiles ?? []).map((profile) => [profile.id, profile]),
			);

			return (sessions ?? [])
				.map((session) => {
					const otherId =
						session.user1_id === user.id ? session.user2_id : session.user1_id;
					const otherProfile = profileMap.get(otherId);
					const latest = latestBySession.get(session.id);
					const latestReceived = latestReceivedBySession.get(session.id);
					return {
						id: session.id,
						name: otherProfile?.display_name ?? "Unknown",
						avatar: otherProfile?.avatar_url ?? undefined,
						lastMessage: latest?.content ?? "",
						latestMessageAt: latest?.created_at ?? session.created_at,
						latestReceivedAt: latestReceived?.created_at ?? null,
						isPublic: otherProfile?.is_public ?? true,
					} as ChatContact;
				})
				.sort((a, b) => {
					const receivedA = a.latestReceivedAt
						? new Date(a.latestReceivedAt).getTime()
						: 0;
					const receivedB = b.latestReceivedAt
						? new Date(b.latestReceivedAt).getTime()
						: 0;
					if (receivedB !== receivedA) return receivedB - receivedA;

					const latestA = a.latestMessageAt
						? new Date(a.latestMessageAt).getTime()
						: 0;
					const latestB = b.latestMessageAt
						? new Date(b.latestMessageAt).getTime()
						: 0;
					return latestB - latestA;
				});
		},
		enabled: !!user,
	});

	// Fetch all users for contact picker
	const { data: allUsers = [] } = useQuery({
		queryKey: ["all-users-for-picker"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("profiles")
				.select("id, display_name, avatar_url, is_public")
				.neq("id", user?.id ?? "")
				.order("display_name");
			if (error) throw error;
			return data ?? [];
		},
		enabled: !!user && showContactPicker,
	});

	// Chat messages for active session
	const { messages, sendMessage } = useChat(activeSessionId ?? "");

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	useEffect(() => {
		if (!user) return;
		markMessagesAsSeen(user.id);
		queryClient.invalidateQueries({
			queryKey: ["unread-messages-count", user.id],
		});
	}, [user, activeSessionId, messages.length, queryClient]);

	useEffect(() => {
		if (!user) return;
		const channel = supabase
			.channel(`chat-sessions-live:${user.id}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "messages",
				},
				(payload) => {
					const matchId = (payload.new as { match_id?: string }).match_id;
					if (!matchId) return;
					if (!contacts.some((contact) => contact.id === matchId)) return;
					queryClient.invalidateQueries({
						queryKey: ["chat-sessions", user.id],
					});
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [user, contacts, queryClient]);

	const handleSelectContact = (contactId: string) => {
		setActiveSessionId(contactId);
		setShowContactPicker(false);
	};

	const handleNewMessage = () => {
		setShowContactPicker(true);
	};

	const handlePickContact = async (contact: PickerContact) => {
		if (!user) return;
		try {
			const target = allUsers.find((person) => person.id === contact.id);
			const result = await startOrRequestConversation({
				viewerId: user.id,
				viewerDisplayName: profile?.display_name,
				targetUserId: contact.id,
				targetDisplayName: target?.display_name,
				targetIsPublic: target?.is_public,
			});
			if (result.kind === "request_sent") {
				toast.success("Message request sent to this private user.");
				setShowContactPicker(false);
				return;
			}
			handleSelectContact(result.sessionId);
		} catch {
			toast.error("Unable to start conversation.");
		}
		setShowContactPicker(false);
	};

	const handleSendMessage = (content: string) => {
		if (!activeSessionId || !user) return;
		sendMessage(content, user.id);
	};

	const pickerContacts: PickerContact[] = allUsers.map((u: any) => ({
		id: u.id,
		name: u.display_name ?? "User",
		avatar: u.avatar_url,
	}));

	const { data: participantPrivacyMap = {} } = useQuery({
		queryKey: ["chat-participants-privacy", activeSessionId],
		queryFn: async () => {
			if (!activeSessionId) return {};
			const { data: session, error: sessionError } = await supabase
				.from("matches")
				.select("user1_id, user2_id")
				.eq("id", activeSessionId)
				.maybeSingle();
			if (sessionError || !session) return {};

			const ids = [session.user1_id, session.user2_id];
			const { data: profiles, error: profilesError } = await supabase
				.from("profiles")
				.select("id, is_public")
				.in("id", ids);
			if (profilesError) return {};

			return Object.fromEntries(
				(profiles ?? []).map((entry) => [entry.id, entry.is_public ?? true]),
			) as Record<string, boolean>;
		},
		enabled: !!activeSessionId,
	});

	const activeContactName =
		contacts.find((contact) => contact.id === activeSessionId)?.name ??
		"Conversation";
	const showConversation = !!activeSessionId && !showContactPicker;
	const showList = !showConversation && !showContactPicker;

	return (
		<>
			<div className="mb-3">
				<Button asChild variant="outline" size="sm" className="rounded-xl">
					<Link href="/">
						<IconArrowLeft className="mr-2 size-4" />
						Back to Home
					</Link>
				</Button>
			</div>
			<div className="mx-auto h-[calc(100dvh-11.5rem)] min-h-[560px] w-full overflow-hidden border shadow-lg rounded-xl">
				<div className="flex h-full">
					<div
						className={`h-full border-r border-border/80 bg-card lg:block lg:w-80 ${
							showList ? "block w-full" : "hidden"
						}`}
					>
						<div className="border-b border-border/80 px-5 py-4">
							<h3 className="text-base font-semibold">Messages</h3>
							<p className="mt-0.5 text-xs text-muted-foreground">
								{contacts.length} conversation{contacts.length !== 1 ? "s" : ""}
							</p>
						</div>
						<div className="h-[calc(100%-65px)] overflow-y-auto">
							<ChatList
								contacts={contacts}
								activeContactId={activeSessionId ?? undefined}
								onSelectContact={handleSelectContact}
								onNewMessage={handleNewMessage}
							/>
						</div>
					</div>

					<div
						className={`h-full bg-background/40 lg:flex lg:flex-1 lg:flex-col ${
							showList ? "hidden lg:flex" : "flex w-full flex-col"
						}`}
					>
						{showContactPicker ? (
							<div className="flex h-full flex-col items-center justify-center p-4 sm:p-6">
								<div className="w-full max-w-md">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setShowContactPicker(false)}
										className="mb-4"
									>
										<IconArrowLeft className="mr-2 size-4" />
										Back
									</Button>
									<ContactPicker
										contacts={pickerContacts}
										onSelect={handlePickContact}
									/>
								</div>
							</div>
						) : showConversation ? (
							<div className="flex h-full flex-col">
								<div className="flex items-center gap-3 border-b border-border/80 bg-card px-4 py-3 sm:px-5">
									<Button
										variant="ghost"
										size="icon-sm"
										onClick={() => {
											setActiveSessionId(null);
										}}
										className="lg:hidden"
										id="back-to-conversations"
									>
										<IconArrowLeft className="size-4" />
									</Button>
									<div>
										<p className="text-sm font-semibold">{activeContactName}</p>
										<p className="text-xs text-muted-foreground">
											{messages.length} message
											{messages.length !== 1 ? "s" : ""}
										</p>
									</div>
								</div>

								<div className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-background to-muted/20 p-4 sm:p-6">
									{messages.length === 0 ? (
										<div className="flex h-full items-center justify-center">
											<p className="text-center text-sm text-muted-foreground">
												No messages yet. Start the conversation.
											</p>
										</div>
									) : (
										messages.map((msg: Message) => (
											<ChatBubble
												key={msg.id}
												content={msg.content ?? ""}
												timestamp={format(new Date(msg.created_at), "h:mm a")}
												variant={
													msg.sender_id === user?.id ? "sent" : "received"
												}
												note={
													msg.sender_id !== user?.id &&
													participantPrivacyMap[msg.sender_id] === false
														? "Careful to scam: verify identity and avoid unknown links."
														: undefined
												}
											/>
										))
									)}
									<div ref={messagesEndRef} />
								</div>

								<div className="bg-card">
									<ChatInput onSend={handleSendMessage} avatarUrl={undefined} />
								</div>
							</div>
						) : (
							<ChatEmptyState onNewMessage={handleNewMessage} />
						)}
					</div>
				</div>
			</div>
		</>
	);
}
