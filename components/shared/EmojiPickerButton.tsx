"use client";

import { useState } from "react";
import { IconMoodSmile } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
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
	panelSide?: "top" | "bottom";
}

export function EmojiPickerButton({
	onSelect,
	disabled = false,
	className,
	panelSide = "top",
}: EmojiPickerButtonProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className={cn("rounded-full text-primary", className)}
					disabled={disabled}
					aria-label="Mở emoji picker"
				>
					<IconMoodSmile className="size-5" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-80"
				align="end"
				side={panelSide === "top" ? "top" : "bottom"}
			>
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
			</PopoverContent>
		</Popover>
	);
}
