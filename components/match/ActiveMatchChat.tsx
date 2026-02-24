"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import {
	IconHeart,
	IconX,
	IconAlertTriangle,
	IconUserCheck,
} from "@tabler/icons-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Message } from "@/types/supabase";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ActiveMatchChatProps {
	messages: Message[];
	currentUserId: string;
	partnerLiked: boolean;
	userLiked: boolean;
	isRevealed: boolean;
	partnerProfile?: {
		display_name: string;
		avatar_url?: string;
		location?: string;
	};
	onSendMessage: (content: string) => void;
	onLike: () => void;
	onEndChat: () => void;
}

export function ActiveMatchChat({
	messages,
	currentUserId,
	partnerLiked,
	userLiked,
	isRevealed,
	partnerProfile,
	onSendMessage,
	onLike,
	onEndChat,
}: ActiveMatchChatProps) {
	const [showEndDialog, setShowEndDialog] = useState(false);

	return (
		<div className="flex h-full flex-col bg-background">
			{/* Match Header */}
			<div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 shadow-sm">
				<div className="flex items-center gap-3">
					{isRevealed && partnerProfile?.avatar_url ? (
						<img
							src={partnerProfile.avatar_url}
							alt={partnerProfile.display_name}
							className="size-10 rounded-full object-cover"
						/>
					) : (
						<div className="flex size-10 items-center justify-center rounded-full bg-secondary text-xl">
							🕵️
						</div>
					)}
					<div>
						<h3 className="font-semibold">
							{isRevealed ? partnerProfile?.display_name : "Anonymous Partner"}
						</h3>
						<p className="text-xs text-muted-foreground">
							{isRevealed
								? partnerProfile?.location || "Revealed!"
								: "Identity hidden"}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					{isRevealed ? (
						<span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2.5 py-1 rounded-full">
							<IconUserCheck className="size-3" />
							Matched
						</span>
					) : (
						<>
							{partnerLiked && !userLiked && (
								<span className="hidden sm:inline-block text-xs text-primary animate-pulse font-medium mr-2">
									Partner likes you!
								</span>
							)}
							<Button
								size="icon"
								variant={userLiked ? "secondary" : "ghost"}
								className={cn(
									"rounded-full transition-all",
									userLiked
										? "bg-red-100 text-red-500 hover:bg-red-200 dark:bg-red-900/30"
										: "text-muted-foreground hover:text-red-500",
								)}
								onClick={onLike}
								disabled={userLiked}
								title="Like to reveal"
							>
								<IconHeart
									className={cn("size-5", userLiked && "fill-current")}
								/>
							</Button>
						</>
					)}

					<AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
						<AlertDialogTrigger asChild>
							<Button
								size="sm"
								variant="ghost"
								className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
							>
								<IconX className="mr-1 size-4" />
								End
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>End this chat?</AlertDialogTitle>
								<AlertDialogDescription>
									Are you sure you want to disconnect? You won&apos;t be able to
									message this person again unless you&apos;ve both revealed
									your identities.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction
									onClick={onEndChat}
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
								>
									End Chat
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</div>

			{/* Info Banner */}
			{!isRevealed && (
				<div className="bg-muted/30 px-4 py-2 text-center text-xs text-muted-foreground">
					<IconAlertTriangle className="mr-1.5 inline-block size-3.5 align-text-bottom" />
					Like each other to reveal identities and save this chat.
				</div>
			)}

			{/* Messages Area */}
			<div className="flex-1 space-y-4 overflow-y-auto p-4 scroller-thin">
				{messages.length === 0 && (
					<div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground opacity-50">
						<div className="mb-4 text-4xl">👋</div>
						<p>Say hello to your new match!</p>
					</div>
				)}
				{messages.map((msg) => (
					<ChatBubble
						key={msg.id}
						content={msg.content ?? ""}
						timestamp={format(new Date(msg.created_at), "h:mm a")}
						variant={msg.sender_id === currentUserId ? "sent" : "received"}
					/>
				))}
			</div>

			{/* Input Area */}
			<ChatInput onSend={onSendMessage} />
		</div>
	);
}
