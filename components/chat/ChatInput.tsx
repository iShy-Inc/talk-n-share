"use client";

import { useRef, useState } from "react";
import { IconMoodSmile, IconSend } from "@tabler/icons-react";
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
	const inputRef = useRef<HTMLInputElement>(null);

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

	const handleOpenEmojiKeyboard = () => {
		if (disabled) return;

		const input = inputRef.current;
		if (!input) return;

		input.focus({ preventScroll: true });
		const cursorPosition = input.value.length;
		input.setSelectionRange(cursorPosition, cursorPosition);

		const pickerInput = input as HTMLInputElement & {
			showPicker?: () => void;
		};
		if (typeof pickerInput.showPicker === "function") {
			try {
				pickerInput.showPicker();
				return;
			} catch {
				// Some browsers expose the API but do not support it for text inputs.
			}
		}

		const nav = window.navigator as Navigator & {
			virtualKeyboard?: { show?: () => void };
		};
		nav.virtualKeyboard?.show?.();
	};

	return (
		<div className="flex items-center gap-2 border-t border-border/70 bg-card px-3 py-2.5">
			{avatarUrl && (
				<img
					src={avatarUrl}
					alt=""
					className="size-9 shrink-0 rounded-full object-cover"
				/>
			)}
			<Input
				ref={inputRef}
				value={message}
				onChange={(e) => setMessage(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				disabled={disabled}
				className="h-10 rounded-full border border-border/70 bg-background"
				id="chat-message-input"
				enterKeyHint="send"
			/>
			<Button
				type="button"
				variant="ghost"
				size="icon"
				className="shrink-0 rounded-full text-primary"
				disabled={disabled}
				onClick={handleOpenEmojiKeyboard}
				aria-label="Mở bàn phím emoji"
			>
				<IconMoodSmile className="size-5" />
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
