"use client";

import { useState } from "react";
import {
	IconCirclePlus,
	IconMoodSmile,
	IconSend,
	IconSticker2,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
	onSend: (message: string) => void;
	placeholder?: string;
	avatarUrl?: string;
	disabled?: boolean;
}

export function ChatInput({
	onSend,
	placeholder = "Nhập tin nhắn...",
	avatarUrl,
	disabled = false,
}: ChatInputProps) {
	const [message, setMessage] = useState("");

	const handleSend = () => {
		if (!message.trim() || disabled) return;
		onSend(message.trim());
		setMessage("");
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<div className="flex items-center gap-2 border-t border-border/70 bg-card px-3 py-2.5">
			<Button
				type="button"
				variant="ghost"
				size="icon"
				className="shrink-0 rounded-full text-primary"
				disabled={disabled}
			>
				<IconCirclePlus className="size-5" />
			</Button>
			{avatarUrl && (
				<img
					src={avatarUrl}
					alt=""
					className="size-9 shrink-0 rounded-full object-cover"
				/>
			)}
			<Input
				value={message}
				onChange={(e) => setMessage(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				disabled={disabled}
				className="h-10 rounded-full border-0 bg-muted"
				id="chat-message-input"
			/>
			<Button
				type="button"
				variant="ghost"
				size="icon"
				className="shrink-0 rounded-full text-primary"
				disabled={disabled}
			>
				<IconMoodSmile className="size-5" />
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="icon"
				className="shrink-0 rounded-full text-primary"
				disabled={disabled}
			>
				<IconSticker2 className="size-5" />
			</Button>
			<Button
				onClick={handleSend}
				disabled={!message.trim() || disabled}
				size="icon"
				className="shrink-0 rounded-full bg-[#0084ff] hover:bg-[#0b74dd]"
				id="chat-send-btn"
			>
				<IconSend className="size-4" />
			</Button>
		</div>
	);
}
