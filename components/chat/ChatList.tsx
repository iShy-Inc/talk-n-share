"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { IconEdit, IconSearch } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface ChatContact {
	id: string;
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
}

export function ChatList({
	contacts,
	activeContactId,
	onSelectContact,
	onNewMessage,
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
			<div className="border-b border-border/70 px-4 pb-3 pt-4">
				<div className="mb-3 flex items-center justify-between gap-2">
					<h2 className="text-2xl font-bold tracking-tight">Đoạn chat</h2>
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
				</div>
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
			</div>

			<div className="flex-1 overflow-y-auto px-2 py-2">
				{filteredContacts.map((contact) => (
					<button
						key={contact.id}
						onClick={() => onSelectContact(contact.id)}
						className={cn(
							"flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/70",
							activeContactId === contact.id && "bg-primary/10",
						)}
						id={`chat-contact-${contact.id}`}
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
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-semibold">{contact.name}</p>
							<p className="mt-0.5 truncate text-xs text-muted-foreground">
								{contact.lastMessage || "Bắt đầu cuộc trò chuyện"}
							</p>
						</div>
						<span className="shrink-0 text-[11px] text-muted-foreground">
							{formatShortTime(contact.latestMessageAt)}
						</span>
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
