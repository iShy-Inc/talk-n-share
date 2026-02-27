"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
	IconChevronLeft,
	IconChevronRight,
	IconEdit,
	IconSearch,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface ChatContact {
	id: string;
	userId: string;
	name: string;
	avatar?: string;
	lastMessage?: string;
	latestMessageAt?: string | null;
	latestReceivedAt?: string | null;
	isActive?: boolean;
	isPublic?: boolean;
}

interface ChatListProps {
	contacts: ChatContact[];
	activeContactId?: string;
	onSelectContact: (contactId: string) => void;
	onNewMessage?: () => void;
	compact?: boolean;
	onToggleCompact?: () => void;
}

export function ChatList({
	contacts,
	activeContactId,
	onSelectContact,
	onNewMessage,
	compact = false,
	onToggleCompact,
}: ChatListProps) {
	const [search, setSearch] = useState("");

	const filteredContacts = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return contacts;
		return contacts.filter(
			(contact) =>
				contact.name.toLowerCase().includes(q) ||
				(contact.lastMessage ?? "").toLowerCase().includes(q),
		);
	}, [contacts, search]);

	const formatShortTime = (value?: string | null) => {
		if (!value) return "";
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return "";
		return date.toLocaleTimeString("vi-VN", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="flex h-full flex-col bg-card">
			<div className={cn("border-b border-border/70 px-4 pt-4", compact ? "pb-4" : "pb-3")}>
				<div className={cn("flex items-center gap-2", compact ? "justify-center" : "mb-3 justify-between")}>
					{!compact && <h2 className="text-2xl font-bold tracking-tight">Đoạn chat</h2>}
					<div className="flex items-center gap-2">
						{onNewMessage && (
							<Button
								type="button"
								size="icon"
								variant="secondary"
								onClick={onNewMessage}
								className="rounded-full"
								id="new-message-sidebar-btn"
								title="Tin nhắn mới"
							>
								<IconEdit className="size-4" />
							</Button>
						)}
						{onToggleCompact && (
							<Button
								type="button"
								size="icon"
								variant="secondary"
								onClick={onToggleCompact}
								className="rounded-full"
								id="toggle-chat-list-compact"
								title={compact ? "Mở rộng danh sách chat" : "Thu gọn danh sách chat"}
							>
								{compact ? (
									<IconChevronRight className="size-4" />
								) : (
									<IconChevronLeft className="size-4" />
								)}
							</Button>
						)}
					</div>
				</div>
				{!compact && (
					<div className="relative">
						<IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Tìm kiếm trên Messenger"
							className="h-10 rounded-full border border-border/70 bg-background pl-9"
							id="chat-list-search"
						/>
					</div>
				)}
			</div>

			<div className={cn("flex-1 overflow-y-auto py-2", compact ? "px-1.5" : "px-2")}>
				{filteredContacts.map((contact) => (
					<button
						key={contact.id}
						onClick={() => onSelectContact(contact.id)}
						className={cn(
							"flex w-full items-center rounded-xl transition-colors hover:bg-muted/70",
							compact ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5 text-left",
							activeContactId === contact.id && "bg-primary/10",
						)}
						id={`chat-contact-${contact.id}`}
						title={compact ? contact.name : undefined}
					>
						{contact.avatar ? (
							<img
								src={contact.avatar}
								alt=""
								className="size-12 shrink-0 rounded-full object-cover"
							/>
						) : (
							<div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
								{contact.name[0]?.toUpperCase()}
							</div>
						)}
						{!compact && (
							<>
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-semibold">{contact.name}</p>
									<p className="mt-0.5 truncate text-xs text-muted-foreground">
										{contact.lastMessage || "Bắt đầu cuộc trò chuyện"}
									</p>
								</div>
								<span className="shrink-0 text-[11px] text-muted-foreground">
									{formatShortTime(contact.latestMessageAt)}
								</span>
							</>
						)}
					</button>
				))}
				{filteredContacts.length === 0 && (
					<p className="py-8 text-center text-sm text-muted-foreground">
						Không tìm thấy cuộc trò chuyện
					</p>
				)}
			</div>
		</div>
	);
}
