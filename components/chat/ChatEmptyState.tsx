"use client";

import { IconInbox, IconPencil } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface ChatEmptyStateProps {
	onNewMessage?: () => void;
}

export function ChatEmptyState({ onNewMessage }: ChatEmptyStateProps) {
	return (
		<div className="flex h-full flex-1 items-center justify-center bg-card">
			<div className="max-w-sm text-center">
				<div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
					<IconInbox className="size-8 text-primary/60" />
				</div>
				<h4 className="text-lg font-semibold text-foreground">Your messages</h4>
				<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
					Select a person to display their chat or start a new conversation.
				</p>
				{onNewMessage && (
					<Button
						onClick={onNewMessage}
						className="mt-6 rounded-full px-6"
						id="new-message-btn"
					>
						<IconPencil className="mr-2 size-4" />
						New message
					</Button>
				)}
			</div>
		</div>
	);
}
