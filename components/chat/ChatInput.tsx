"use client";

import { useState } from "react";
import { IconSend } from "@tabler/icons-react";
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
	placeholder = "Message ...",
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
		<div className="flex items-center gap-3 border-t border-border px-4 py-3">
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
				className="rounded-full"
				id="chat-message-input"
			/>
			<Button
				onClick={handleSend}
				disabled={!message.trim() || disabled}
				size="icon"
				className="shrink-0 rounded-full"
				id="chat-send-btn"
			>
				<IconSend className="size-4" />
			</Button>
		</div>
	);
}
