"use client";

import { IconMessageCircle2, IconPencil } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface ChatEmptyStateProps {
	onNewMessage?: () => void;
}

export function ChatEmptyState({ onNewMessage }: ChatEmptyStateProps) {
	return (
		<div className="flex h-full flex-1 items-center justify-center bg-background">
			<div className="max-w-sm text-center">
				<div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-[#0084ff]/15">
					<IconMessageCircle2 className="size-8 text-[#0084ff]" />
				</div>
				<h4 className="text-lg font-semibold text-foreground">Chọn một đoạn chat</h4>
				<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
					Mở cuộc trò chuyện có sẵn hoặc bắt đầu nhắn tin với người mới.
				</p>
				{onNewMessage && (
					<Button
						onClick={onNewMessage}
						className="mt-6 rounded-full bg-[#0084ff] px-6 hover:bg-[#0b74dd]"
						id="new-message-btn"
					>
						<IconPencil className="mr-2 size-4" />
						Tin nhắn mới
					</Button>
				)}
			</div>
		</div>
	);
}
