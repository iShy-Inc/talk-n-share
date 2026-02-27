"use client";

import { cn } from "@/lib/utils";

interface ChatBubbleProps {
	content: string;
	timestamp: string;
	senderName?: string;
	variant: "sent" | "received";
	note?: string;
}

export function ChatBubble({
	content,
	timestamp,
	senderName,
	variant,
	note,
}: ChatBubbleProps) {
	return (
		<div
			className={cn(
				"flex w-full",
				variant === "sent" ? "justify-end" : "justify-start",
			)}
		>
			<div
				className={cn(
					"max-w-[80%] rounded-3xl px-4 py-2.5 text-sm shadow-sm md:max-w-[70%]",
					variant === "sent"
						? "rounded-br-md bg-[#0084ff] text-white"
						: "rounded-bl-md border border-border/80 bg-card text-foreground",
				)}
			>
				{senderName && variant === "received" && (
					<p className="mb-1 text-xs font-semibold">{senderName}</p>
				)}
				<p className="leading-relaxed">{content}</p>
				<span
					className={cn(
						"mt-1.5 block text-[11px]",
						variant === "sent" ? "text-white/90" : "text-foreground/70",
					)}
				>
					{timestamp}
				</span>
				{note && (
					<p className="mt-1.5 text-[11px] text-amber-700 dark:text-amber-300">
						{note}
					</p>
				)}
			</div>
		</div>
	);
}
