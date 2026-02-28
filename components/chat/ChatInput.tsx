"use client";

import { useRef, useState } from "react";
import { IconSend } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmojiPickerButton } from "@/components/shared/EmojiPickerButton";
import { GifPickerButton } from "@/components/shared/GifPickerButton";
import type { GifSelection } from "@/lib/giphy";

interface ChatInputProps {
	onSend: (message: string, gif?: GifSelection | null) => void;
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
	const [selectedGif, setSelectedGif] = useState<GifSelection | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleSend = () => {
		if ((!message.trim() && !selectedGif) || disabled) return;
		onSend(message.trim(), selectedGif);
		setMessage("");
		setSelectedGif(null);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const handleSelectEmoji = (emoji: string) => {
		const input = inputRef.current;
		const selectionStart = input?.selectionStart ?? message.length;
		const selectionEnd = input?.selectionEnd ?? message.length;
		const nextMessage =
			message.slice(0, selectionStart) + emoji + message.slice(selectionEnd);
		const nextCursor = selectionStart + emoji.length;

		setMessage(nextMessage);

		requestAnimationFrame(() => {
			inputRef.current?.focus({ preventScroll: true });
			inputRef.current?.setSelectionRange(nextCursor, nextCursor);
		});
	};

	return (
		<div className="border-t border-border/70 bg-card px-3 py-2.5">
			{selectedGif && (
				<div className="mb-2 flex items-start gap-2 rounded-2xl border border-border/70 bg-muted/30 p-2">
					<img
						src={selectedGif.previewUrl}
						alt={selectedGif.title}
						className="h-20 w-20 rounded-xl object-cover"
					/>
					<div className="flex min-w-0 flex-1 items-start justify-between gap-2">
						<p className="truncate text-xs text-muted-foreground">
							GIF đã chọn
						</p>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							disabled={disabled}
							onClick={() => setSelectedGif(null)}
						>
							Xóa
						</Button>
					</div>
				</div>
			)}
			<div className="flex items-center gap-2">
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
				<GifPickerButton
					onSelect={setSelectedGif}
					disabled={disabled}
					className="rounded-full px-3"
					label="GIF"
				/>
				<EmojiPickerButton
					onSelect={handleSelectEmoji}
					disabled={disabled}
				/>
				<Button
					onClick={handleSend}
					disabled={(!message.trim() && !selectedGif) || disabled}
					size="icon"
					className="shrink-0 rounded-full bg-[#0084ff] hover:bg-[#0b74dd]"
					id="chat-send-btn"
				>
					<IconSend className="size-4" />
				</Button>
			</div>
		</div>
	);
}
