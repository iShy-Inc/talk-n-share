"use client";

import { Suspense, useState, useEffect, useRef } from "react";
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
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	IconArrowLeft,
	IconDots,
	IconFlag3,
	IconUserCircle,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { startOrRequestConversation } from "@/lib/contact-messaging";
import { STORAGE_BUCKETS, uploadFileToBucket } from "@/lib/supabase-storage";
import { toast } from "sonner";
import { markMessagesAsSeen } from "@/hooks/useUnreadMessages";
import { ProfileVisibilityIcon } from "@/components/shared/ProfileVisibilityIcon";

const supabase = createClient();

function MessagesPageContent() {
	const user = useAuthStore((state) => state.user);
	const { profile } = useProfile();
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();
	const initialSessionId = searchParams.get("sessionId");
	const [activeSessionId, setActiveSessionId] = useState<string | null>(
		initialSessionId,
	);
	const [showContactPicker, setShowContactPicker] = useState(false);
	const [chatListWidth, setChatListWidth] = useState(300);
	const [isResizingChatList, setIsResizingChatList] = useState(false);
	const [isChatListCollapsed, setIsChatListCollapsed] = useState(false);
	const [isMobileInfoOpen, setIsMobileInfoOpen] = useState(false);
	const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
	const [reportReason, setReportReason] = useState("harassment");
	const [reportEvidenceUrl, setReportEvidenceUrl] = useState<string | null>(
		null,
	);
	const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
	const [isSubmittingReport, setIsSubmittingReport] = useState(false);
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
						userId: otherId,
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
				.eq("is_public", true)
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

	useEffect(() => {
		if (!isResizingChatList) return;

		const handleMouseMove = (event: MouseEvent) => {
			const nextWidth = Math.min(Math.max(event.clientX, 280), 520);
			setChatListWidth(nextWidth);
		};

		const handleMouseUp = () => {
			setIsResizingChatList(false);
		};

		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);
		document.body.style.cursor = "col-resize";
		document.body.style.userSelect = "none";

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
		};
	}, [isResizingChatList]);

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
				toast.success("Đã gửi yêu cầu nhắn tin tới tài khoản riêng tư này.");
				setShowContactPicker(false);
				return;
			}
			handleSelectContact(result.sessionId);
		} catch {
			toast.error("Không thể bắt đầu cuộc trò chuyện.");
		}
		setShowContactPicker(false);
	};

	const handleSendMessage = (content: string) => {
		if (!activeSessionId || !user) return;
		sendMessage(content, user.id);
	};

	const pickerContacts: PickerContact[] = allUsers.map((u: any) => ({
		id: u.id,
		name: u.display_name ?? "Người dùng",
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

	const activeContact = contacts.find(
		(contact) => contact.id === activeSessionId,
	);
	const activeContactName = activeContact?.name ?? "Cuộc trò chuyện";
	const activeContactUserId = activeContact?.userId ?? null;
	const showConversation = !!activeSessionId && !showContactPicker;
	const showList = !showConversation && !showContactPicker;

	useEffect(() => {
		if (!showConversation) {
			setIsMobileInfoOpen(false);
		}
	}, [showConversation]);

	const handleReportEvidenceSelected = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file || !user) return;
		if (!file.type.startsWith("image/")) {
			toast.error("Vui lòng chọn file ảnh.");
			return;
		}

		try {
			setIsUploadingEvidence(true);
			const { publicUrl } = await uploadFileToBucket({
				bucket: STORAGE_BUCKETS.REPORT_EVIDENCE,
				file,
				ownerId: user.id,
			});
			setReportEvidenceUrl(publicUrl);
			toast.success("Đã tải ảnh bằng chứng.");
		} catch {
			toast.error("Không thể tải ảnh bằng chứng.");
		} finally {
			setIsUploadingEvidence(false);
			event.target.value = "";
		}
	};

	const handleSubmitContactReport = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!user || !activeContactUserId) return;
		if (!reportEvidenceUrl) {
			toast.error("Bắt buộc phải có ảnh bằng chứng.");
			return;
		}

		try {
			setIsSubmittingReport(true);
			const { error } = await supabase.from("reports").insert({
				reporter_id: user.id,
				reported_user_id: activeContactUserId,
				target_id: activeSessionId,
				target_type: "user",
				reason: reportReason,
				status: "pending",
				evidence_image_url: reportEvidenceUrl,
			});
			if (error) throw error;

			toast.success("Đã gửi báo cáo người dùng.");
			setIsReportDialogOpen(false);
			setReportReason("harassment");
			setReportEvidenceUrl(null);
		} catch {
			toast.error("Không thể gửi báo cáo.");
		} finally {
			setIsSubmittingReport(false);
		}
	};

	const conversationInfoContent = (
		<>
			<div className="flex flex-col items-center border-b border-border/70 pb-4">
				{activeContact?.avatar ? (
					<img
						src={activeContact.avatar}
						alt=""
						className="size-20 rounded-full object-cover"
					/>
				) : (
					<div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
						{activeContactName[0]?.toUpperCase()}
					</div>
				)}
				<div className="mt-3 flex items-center gap-1.5">
					<p className="text-base font-semibold">{activeContactName}</p>
					<ProfileVisibilityIcon isPublic={activeContact?.isPublic} />
				</div>
				<p className="text-xs text-foreground/70">{messages.length} tin nhắn</p>
			</div>
			<div className="pt-4 text-sm text-foreground/70">
				<p className="rounded-xl bg-accent p-3">
					Hãy cẩn thận khi trò chuyện với người lạ.
				</p>
				<div className="mt-4 grid gap-2">
					<Button
						asChild
						variant="outline"
						className="justify-start rounded-xl"
						disabled={!activeContactUserId}
					>
						<Link
							href={
								activeContactUserId
									? `/profile?userId=${activeContactUserId}`
									: "#"
							}
						>
							<IconUserCircle className="mr-2 size-4" />
							Xem trang cá nhân
						</Link>
					</Button>
					<Button
						type="button"
						variant="outline"
						className="justify-start rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
						onClick={() => {
							setIsMobileInfoOpen(false);
							setIsReportDialogOpen(true);
						}}
						disabled={!activeContactUserId}
					>
						<IconFlag3 className="mr-2 size-4" />
						Báo cáo người dùng
					</Button>
				</div>
			</div>
		</>
	);

	return (
		<>
			<div className="mb-2">
				<Button asChild variant="outline" size="sm" className="rounded-xl">
					<Link href="/">
						<IconArrowLeft className="mr-2 size-4" />
						Về trang chủ
					</Link>
				</Button>
			</div>
			<div className="mx-auto rounded-xl h-[calc(100dvh-8.8rem)] min-h-[620px] w-full overflow-hidden border-border border-1 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
				<div className="flex h-full">
					<div
						className={`h-full border-r border-border/60 bg-card lg:block lg:shrink-0 lg:w-[var(--chat-list-width)] ${
							showList ? "block w-full" : "hidden"
						}`}
						style={
							{
								"--chat-list-width": `${isChatListCollapsed ? 92 : chatListWidth}px`,
							} as Record<string, string>
						}
					>
						<ChatList
							contacts={contacts}
							activeContactId={activeSessionId ?? undefined}
							onSelectContact={handleSelectContact}
							onNewMessage={handleNewMessage}
							compact={isChatListCollapsed}
							onToggleCompact={() => setIsChatListCollapsed((prev) => !prev)}
						/>
					</div>
					{!isChatListCollapsed && (
						<div
							className="group relative hidden h-full w-1 cursor-col-resize bg-border/30 transition-colors hover:bg-primary/25 lg:block"
							onMouseDown={() => setIsResizingChatList(true)}
							role="separator"
							aria-orientation="vertical"
							aria-label="Resize chat list"
						>
							<span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-border/60 transition-colors group-hover:bg-primary/70" />
						</div>
					)}

					<div
						className={`h-full bg-background lg:flex lg:flex-1 lg:flex-col ${
							showList ? "hidden lg:flex" : "flex w-full flex-col"
						}`}
					>
						{showContactPicker ? (
							<div className="flex h-full flex-col items-center justify-center bg-card p-4 sm:p-6">
								<div className="w-full max-w-md">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setShowContactPicker(false)}
										className="mb-4"
									>
										<IconArrowLeft className="mr-2 size-4" />
										Quay lại
									</Button>
									<ContactPicker
										contacts={pickerContacts}
										onSelect={handlePickContact}
									/>
								</div>
							</div>
						) : showConversation ? (
							<div className="flex h-full flex-col">
								<div className="flex items-center justify-between border-b border-border/70 bg-card px-3 py-2.5 sm:px-4">
									<div className="flex items-center gap-3">
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
										{activeContact?.avatar ? (
											<img
												src={activeContact.avatar}
												alt=""
												className="size-10 rounded-full object-cover"
											/>
										) : (
											<div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
												{activeContactName[0]?.toUpperCase()}
											</div>
										)}
										<div>
											<div className="flex items-center gap-1.5">
												<p className="text-sm font-semibold">
													{activeContactName}
												</p>
												<ProfileVisibilityIcon
													isPublic={activeContact?.isPublic}
												/>
											</div>
										</div>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="icon-sm"
										className="rounded-full xl:hidden"
										onClick={() => setIsMobileInfoOpen(true)}
										aria-label="Mở thông tin cuộc trò chuyện"
									>
										<IconDots className="size-4 text-[#0084ff]" />
									</Button>
								</div>

								<div className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-4 sm:p-6">
									{messages.length === 0 ? (
										<div className="flex h-full items-center justify-center">
											<p className="text-center text-sm text-foreground/70">
												Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện.
											</p>
										</div>
									) : (
										messages.map((msg: Message) => (
											<ChatBubble
												key={msg.id}
												content={msg.content ?? ""}
												timestamp={format(new Date(msg.created_at), "HH:mm")}
												variant={
													msg.sender_id === user?.id ? "sent" : "received"
												}
												note={
													msg.sender_id !== user?.id &&
													participantPrivacyMap[msg.sender_id] === false
														? "Cẩn thận lừa đảo: hãy xác minh danh tính và tránh bấm link lạ."
														: undefined
												}
											/>
										))
									)}
									<div ref={messagesEndRef} />
								</div>

								<div className="bg-card px-1 pb-1">
									<ChatInput
										onSend={handleSendMessage}
										avatarUrl={profile?.avatar_url ?? undefined}
									/>
								</div>
							</div>
						) : (
							<ChatEmptyState onNewMessage={handleNewMessage} />
						)}
					</div>

						{showConversation && (
							<div className="hidden w-[300px] border-l border-border/70 bg-card p-4 xl:block">
								{conversationInfoContent}
							</div>
						)}
					</div>
				</div>
				<Dialog open={isMobileInfoOpen} onOpenChange={setIsMobileInfoOpen}>
					<DialogContent
						showCloseButton={false}
						className="top-auto left-0 bottom-0 max-w-none translate-x-0 translate-y-0 gap-0 rounded-b-none rounded-t-[1.75rem] p-4 sm:max-w-none xl:hidden"
					>
						<DialogHeader className="sr-only">
							<DialogTitle>Thông tin cuộc trò chuyện</DialogTitle>
						</DialogHeader>
						{conversationInfoContent}
					</DialogContent>
				</Dialog>
				<Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
				<DialogContent>
					<form onSubmit={handleSubmitContactReport}>
						<DialogHeader>
							<DialogTitle>Báo cáo người dùng</DialogTitle>
							<DialogDescription>
								Cung cấp lý do và ảnh bằng chứng để đội ngũ kiểm duyệt xem xét.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div>
								<Label htmlFor="chat-report-reason">Lý do</Label>
								<select
									id="chat-report-reason"
									title="Lý do báo cáo"
									value={reportReason}
									onChange={(e) => setReportReason(e.target.value)}
									className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
								>
									<option value="harassment">Quấy rối</option>
									<option value="impersonation">Mạo danh</option>
									<option value="hate">Thù ghét</option>
									<option value="spam">Spam</option>
									<option value="other">Khác</option>
								</select>
							</div>
							<div>
								<Label htmlFor="chat-report-evidence">Ảnh bằng chứng</Label>
								<Input
									id="chat-report-evidence"
									type="file"
									accept="image/*"
									className="mt-2"
									onChange={handleReportEvidenceSelected}
								/>
								<p className="mt-2 text-xs text-muted-foreground">
									Bắt buộc phải tải ảnh bằng chứng để gửi báo cáo.
								</p>
								{reportEvidenceUrl && (
									<p className="mt-1 text-xs text-primary">
										Đã đính kèm ảnh bằng chứng.
									</p>
								)}
							</div>
						</div>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline" type="button">
									Hủy
								</Button>
							</DialogClose>
							<Button
								type="submit"
								disabled={
									isUploadingEvidence ||
									isSubmittingReport ||
									!reportEvidenceUrl
								}
							>
								Gửi báo cáo
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}

export default function MessagesPage() {
	return (
		<Suspense fallback={null}>
			<MessagesPageContent />
		</Suspense>
	);
}
