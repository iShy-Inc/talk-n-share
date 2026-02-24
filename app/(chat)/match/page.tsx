"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { createClient } from "@/utils/supabase/client";
import {
	MatchOptions,
	MatchLoading,
	ActiveMatchChat,
	MatchCriteria,
} from "@/components/match";
import { useChat } from "@/hooks/useChat";
import { ChatSession } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { IconMessage } from "@tabler/icons-react";
import toast from "react-hot-toast";

const supabase = createClient();

type MatchStatus = "options" | "loading" | "active";

export default function MatchPage() {
	const user = useAuthStore((state) => state.user);
	const router = useRouter();
	const [status, setStatus] = useState<MatchStatus>("options");
	const [sessionId, setSessionId] = useState<string | null>(null);
	const [sessionData, setSessionData] = useState<ChatSession | null>(null);
	const [partnerProfile, setPartnerProfile] = useState<any>(null);

	const { messages, sendMessage } = useChat(sessionId ?? "");

	// Find a match
	const handleStartMatch = async (criteria: MatchCriteria) => {
		if (!user) return;
		setStatus("loading");

		try {
			// Mock matching delay
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// 1. Find a random user to match with (excluding self)
			// In a real app, this would query a matching_queue table
			const { data: profiles, error } = await supabase
				.from("profiles")
				.select("*")
				.neq("id", user.id)
				.limit(50); // Fetch a batch to pick random

			if (error || !profiles || profiles.length === 0) {
				toast.error("No matches found given your criteria. Try again!");
				setStatus("options");
				return;
			}

			// Filter by criteria locally for demo
			let candidates = profiles;
			if (criteria.type === "gender" && criteria.value !== "any") {
				candidates = candidates.filter((p) => p.gender === criteria.value);
			} else if (criteria.type === "location" && criteria.value !== "any") {
				// Simulating location match based on region
				// candidates = candidates.filter(...)
			}

			if (candidates.length === 0) {
				toast.error("No matches found. Try broadening criteria.");
				setStatus("options");
				return;
			}

			const randomPartner =
				candidates[Math.floor(Math.random() * candidates.length)];

			// 2. Create a new chat session
			// Schema requirements: type, status, is_revealed, user1_liked, user2_liked
			const { data: session, error: createError } = await supabase
				.from("matches")
				.insert({
					user1_id: user.id,
					user2_id: randomPartner.id,
					type: "match",
					status: "active",
					is_revealed: false,
					user1_liked: false,
					user2_liked: false,
				})
				.select()
				.single();

			if (createError) throw createError;

			setSessionId(session.id);
			setSessionData(session as ChatSession);
			setPartnerProfile(randomPartner);
			setStatus("active");
		} catch (err) {
			console.error("Matching error:", err);
			toast.error("Failed to start match.");
			setStatus("options");
		}
	};

	// Handle End Chat
	const handleEndChat = async () => {
		if (!sessionId) return;

		await supabase
			.from("matches")
			.update({ status: "ended" })
			.eq("id", sessionId);

		setSessionId(null);
		setSessionData(null);
		setPartnerProfile(null);
		setStatus("options");
		toast.success("Chat ended.");
	};

	// Handle Like
	const handleLike = async () => {
		if (!sessionId || !sessionData || !user) return;

		const isUser1 = user.id === sessionData.user1_id;
		const updates: any = {};

		if (isUser1) updates.user1_liked = true;
		else updates.user2_liked = true;

		// Check if reveal effectively happens (optimistic)
		const otherLiked = isUser1
			? sessionData.user2_liked
			: sessionData.user1_liked;
		if (otherLiked) {
			updates.is_revealed = true;
			toast.success("It's a match! Identities revealed.");
		} else {
			toast.success("You liked your partner!");
		}

		const { data, error } = await supabase
			.from("matches")
			.update(updates)
			.eq("id", sessionId)
			.select()
			.single();

		if (data) setSessionData(data as ChatSession);
	};

	// Listen for session updates (partner likes, reveal)
	useEffect(() => {
		if (!sessionId) return;

		const channel = supabase
			.channel(`session:${sessionId}`)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "matches",
					filter: `id=eq.${sessionId}`,
				},
				(payload) => {
					setSessionData(payload.new as ChatSession);
					if (payload.new.is_revealed && !sessionData?.is_revealed) {
						toast.success("Allocated! Identities revealed.");
					}
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [sessionId, sessionData?.is_revealed]);

	// View History
	const goToHistory = () => {
		router.push("/messages");
	};

	// Handle Sending Message
	const handleMatchSendMessage = (content: string) => {
		if (!user) return;
		sendMessage(content, user.id);
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4 md:p-8">
			<div className="relative mx-auto h-[600px] w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
				{/* Top Bar for navigation if not in active chat */}
				{status !== "active" && (
					<div className="absolute top-4 right-4 z-10">
						<Button
							variant="ghost"
							size="sm"
							onClick={goToHistory}
							className="text-muted-foreground hover:text-foreground"
						>
							<IconMessage className="mr-2 size-4" />
							History
						</Button>
					</div>
				)}

				{status === "options" && (
					<MatchOptions onStartMatch={handleStartMatch} />
				)}

				{status === "loading" && (
					<MatchLoading onCancel={() => setStatus("options")} />
				)}

				{status === "active" && sessionData && user && (
					<ActiveMatchChat
						messages={messages}
						currentUserId={user.id}
						partnerLiked={
							user.id === sessionData.user1_id
								? (sessionData.user2_liked ?? false)
								: (sessionData.user1_liked ?? false)
						}
						userLiked={
							user.id === sessionData.user1_id
								? (sessionData.user1_liked ?? false)
								: (sessionData.user2_liked ?? false)
						}
						isRevealed={sessionData.is_revealed}
						partnerProfile={partnerProfile}
						onSendMessage={handleMatchSendMessage}
						onLike={handleLike}
						onEndChat={handleEndChat}
					/>
				)}
			</div>
		</div>
	);
}
