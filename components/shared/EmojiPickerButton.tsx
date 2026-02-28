"use client";

import { useEffect, useRef, useState } from "react";
import { IconMoodSmile } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EMOJI_GROUPS = [
	{
		label: "Phổ biến",
		items: [
			"😀",
			"😄",
			"😁",
			"😂",
			"🤣",
			"😊",
			"🙂",
			"😉",
			"😍",
			"🥰",
			"😘",
			"😎",
			"🤗",
			"🤩",
			"😇",
			"😋",
		],
	},
	{
		label: "Cảm xúc",
		items: [
			"😭",
			"😢",
			"🥲",
			"😤",
			"😡",
			"🤯",
			"😱",
			"😨",
			"😴",
			"🥱",
			"🤔",
			"🙄",
			"😵",
			"😬",
			"😶",
			"🫠",
		],
	},
	{
		label: "Phản hồi",
		items: [
			"👍",
			"👎",
			"👏",
			"🙌",
			"🙏",
			"💪",
			"🤝",
			"👌",
			"✌️",
			"🤞",
			"🫶",
			"👀",
			"🙈",
			"🙉",
			"🙊",
			"👋",
		],
	},
	{
		label: "Vui vẻ",
		items: [
			"🎉",
			"🔥",
			"💖",
			"💯",
			"✨",
			"🌈",
			"🍀",
			"🎶",
			"🎵",
			"🌟",
			"💫",
			"☀️",
			"🌙",
			"⭐",
			"🎁",
			"🎈",
		],
	},
	{
		label: "Đời sống",
		items: [
			"☕",
			"🍵",
			"🍜",
			"🍕",
			"🍔",
			"🍟",
			"🍓",
			"🍉",
			"🌸",
			"🌿",
			"🌴",
			"🏝️",
			"🏖️",
			"✈️",
			"🚗",
			"🏠",
		],
	},
	{
		label: "Biểu tượng",
		items: [
			"❤️",
			"🧡",
			"💛",
			"💚",
			"💙",
			"💜",
			"🖤",
			"🤍",
			"💔",
			"❣️",
			"💕",
			"💞",
			"💓",
			"💗",
			"💘",
			"💝",
		],
	},
];

interface EmojiPickerButtonProps {
	onSelect: (emoji: string) => void;
	disabled?: boolean;
	className?: string;
}

export function EmojiPickerButton({
	onSelect,
	disabled = false,
	className,
}: EmojiPickerButtonProps) {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isOpen) return;

		const handlePointerDown = (event: MouseEvent) => {
			if (!containerRef.current?.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handlePointerDown);
		return () => {
			document.removeEventListener("mousedown", handlePointerDown);
		};
	}, [isOpen]);

	return (
		<div ref={containerRef} className={cn("relative shrink-0", className)}>
			<Button
				type="button"
				variant="ghost"
				size="icon"
				className="rounded-full text-primary"
				disabled={disabled}
				onClick={() => setIsOpen((prev) => !prev)}
				aria-label="Mở emoji picker"
			>
				<IconMoodSmile className="size-5" />
			</Button>

			{isOpen && (
				<div className="absolute bottom-12 right-0 z-50 w-80 rounded-2xl border border-border/80 bg-card p-3 shadow-xl">
					<div className="mb-2 text-xs font-medium text-muted-foreground">
						Chọn emoji
					</div>
					<div className="max-h-80 space-y-3 overflow-y-auto pr-1">
						{EMOJI_GROUPS.map((group) => (
							<div key={group.label}>
								<div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
									{group.label}
								</div>
								<div className="grid grid-cols-8 gap-1">
									{group.items.map((emoji) => (
										<button
											key={emoji}
											type="button"
											onClick={() => {
												onSelect(emoji);
												setIsOpen(false);
											}}
											className="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition hover:bg-muted"
											aria-label={`Chèn ${emoji}`}
										>
											{emoji}
										</button>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
