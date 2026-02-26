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
				"flex",
				variant === "sent" ? "justify-end" : "justify-start",
			)}
		>
			<div
				className={cn(
					"max-w-[60%] rounded-2xl px-4 py-3 text-sm",
					variant === "sent"
						? "bg-primary text-primary-foreground"
						: "bg-muted text-foreground",
				)}
			>
				{senderName && variant === "received" && (
					<p className="mb-1 text-xs font-semibold">{senderName}</p>
				)}
				<p className="leading-relaxed">{content}</p>
				<span
					className={cn(
						"mt-1.5 block text-[11px]",
						variant === "sent" ? "opacity-70" : "text-muted-foreground",
					)}
				>
					{timestamp}
				</span>
				{note && <p className="mt-1.5 text-[11px] text-amber-700">{note}</p>}
			</div>
		</div>
	);
}
