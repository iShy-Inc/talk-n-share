"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { createClient } from "@/utils/supabase/client";
import { useChat } from "@/hooks/useChat";
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
import { useQuery } from "@tanstack/react-query";

const supabase = createClient();

export default function MessagesPage() {
	const user = useAuthStore((state) => state.user);
	const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
	const [activeContact, setActiveContact] = useState<ChatContact | null>(null);
	const [showContactPicker, setShowContactPicker] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Fetch chat sessions for the current user
	const { data: sessions = [] } = useQuery({
		queryKey: ["chat-sessions", user?.id],
		queryFn: async () => {
			if (!user) return [];
			const { data, error } = await supabase
				.from("matches")
				.select("*, profiles(*)")
				.or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
				.order("created_at", { ascending: false });
			if (error) throw error;
			return data ?? [];
		},
		enabled: !!user,
	});

	// Fetch all users for contact picker
	const { data: allUsers = [] } = useQuery({
		queryKey: ["all-users-for-picker"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("profiles")
				.select("id, display_name, avatar_url")
				.neq("id", user?.id ?? "")
				.order("display_name");
			if (error) throw error;
			return data ?? [];
		},
		enabled: !!user && showContactPicker,
	});

	// Map sessions to ChatContact format
	const contacts: ChatContact[] = sessions.map((session: any) => {
		const isUser1 = session.user1_id === user?.id;
		const otherProfile = isUser1
			? session.user2_profile
			: session.user1_profile;
		return {
			id: session.id,
			name:
				otherProfile?.display_name ??
				session.profiles?.display_name ??
				"Unknown",
			avatar: otherProfile?.avatar_url ?? session.profiles?.avatar_url,
			lastMessage: session.last_message ?? "",
			isActive: session.id === activeSessionId,
		};
	});

	// Chat messages for active session
	const { messages, sendMessage } = useChat(activeSessionId ?? "");

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleSelectContact = (contactId: string) => {
		setActiveSessionId(contactId);
		const contact = contacts.find((c) => c.id === contactId);
		setActiveContact(contact ?? null);
		setShowContactPicker(false);
	};

	const handleNewMessage = () => {
		setShowContactPicker(true);
	};

	const handlePickContact = async (contact: PickerContact) => {
		if (!user) return;
		// Check if session exists
		const { data: existingSession } = await supabase
			.from("matches")
			.select("id")
			.or(
				`and(user1_id.eq.${user.id},user2_id.eq.${contact.id}),and(user1_id.eq.${contact.id},user2_id.eq.${user.id})`,
			)
			.single();

		if (existingSession) {
			handleSelectContact(existingSession.id);
		} else {
			// Create new session
			const { data: newSession } = await supabase
				.from("matches")
				.insert({ user1_id: user.id, user2_id: contact.id })
				.select()
				.single();
			if (newSession) {
				handleSelectContact(newSession.id);
			}
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

	const activeContactName = activeContact?.name ?? "Conversation";
	const showConversation = !!activeSessionId && !showContactPicker;
	const showList = !showConversation && !showContactPicker;

	return (
		<>
			<Card className="mx-auto h-[calc(100dvh-11.5rem)] min-h-[560px] w-full overflow-hidden border shadow-lg">
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
											setActiveContact(null);
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
			</Card>
		</>
	);
}
