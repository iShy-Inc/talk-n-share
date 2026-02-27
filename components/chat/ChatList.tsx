"use client";

import { cn } from "@/lib/utils";
import { IconPencil } from "@tabler/icons-react";

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
	return (
		<div className="flex h-full flex-col border-r border-border">
			{contacts.map((contact) => (
				<button
					key={contact.id}
					onClick={() => onSelectContact(contact.id)}
					className={cn(
						"flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50",
						activeContactId === contact.id && "bg-muted",
					)}
					id={`chat-contact-${contact.id}`}
				>
					{contact.avatar ? (
						<img
							src={contact.avatar}
							alt=""
							className="size-11 shrink-0 rounded-full object-cover"
						/>
					) : (
						<div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
							{contact.name[0]?.toUpperCase()}
						</div>
					)}
					<div className="min-w-0 flex-1">
						<p className="truncate text-sm font-semibold">{contact.name}</p>
						{contact.lastMessage && (
							<p className="mt-0.5 truncate text-xs text-muted-foreground">
								{contact.lastMessage}
							</p>
						)}
					</div>
				</button>
			))}

			{onNewMessage && (
				<button
					onClick={onNewMessage}
					className="mt-auto flex items-center justify-center gap-2 border-t border-border px-4 py-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
					id="new-message-sidebar-btn"
				>
					<IconPencil className="size-4" />
					Tin nhắn mới
				</button>
			)}
		</div>
	);
}
