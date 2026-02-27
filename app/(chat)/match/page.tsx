"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import useProfile, { isProfileComplete } from "@/hooks/useProfile";
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
const MIN_WAIT_SECONDS = 60;
const POLL_INTERVAL_MS = 5000;

type MatchStatus = "options" | "loading" | "active";

export default function MatchPage() {
	const user = useAuthStore((state) => state.user);
	const router = useRouter();
	const { profile, loading: isLoadingProfile } = useProfile();
	const [status, setStatus] = useState<MatchStatus>("options");
	const [sessionId, setSessionId] = useState<string | null>(null);
	const [sessionData, setSessionData] = useState<ChatSession | null>(null);
	const [partnerProfile, setPartnerProfile] = useState<any>(null);
	const [pendingCriteria, setPendingCriteria] = useState<MatchCriteria | null>(
		null,
	);
	const [elapsedSeconds, setElapsedSeconds] = useState(0);

	const { messages, sendMessage } = useChat(sessionId ?? "");

	useEffect(() => {
		if (!user || isLoadingProfile) return;
		if (!isProfileComplete(profile)) {
			router.replace("/onboarding");
		}
	}, [user, isLoadingProfile, profile, router]);

	// Find a match
	const handleStartMatch = (criteria: MatchCriteria) => {
		if (!user) return;
		setPendingCriteria(criteria);
		setElapsedSeconds(0);
		setStatus("loading");
	};

	const handleCancelMatching = async () => {
		if (!user) return;
		await supabase.from("matching_queue").delete().eq("user_id", user.id);
		setPendingCriteria(null);
		setElapsedSeconds(0);
		setStatus("options");
		toast("Matching cancelled.");
	};

	useEffect(() => {
		if (!user || status !== "loading" || !pendingCriteria) return;

		let isDisposed = false;
		const startedAt = Date.now();

		const activateMatchedSession = async (matchedId: string) => {
			const { data: session, error: sessionError } = await supabase
				.from("matches")
				.select("*")
				.eq("id", matchedId)
				.maybeSingle();
			if (sessionError || !session) {
				throw sessionError ?? new Error("Matched session not found");
			}

			const partnerId =
				session.user1_id === user.id ? session.user2_id : session.user1_id;
			const { data: partner, error: partnerError } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", partnerId)
				.maybeSingle();
			if (partnerError) throw partnerError;

			if (isDisposed) return;
			setSessionId(session.id);
			setSessionData(session as ChatSession);
			setPartnerProfile(partner ?? null);
			setPendingCriteria(null);
			setElapsedSeconds(0);
			setStatus("active");
		};

		const tryFindMatch = async () => {
			try {
				const { data: matchedId, error: matchError } = await supabase.rpc(
					"find_match_v2",
					{
						current_user_id: user.id,
						p_gender: pendingCriteria.gender,
						p_region: pendingCriteria.location,
						p_zodiac: pendingCriteria.interests,
					},
				);
				if (matchError) throw matchError;
				if (matchedId) {
					await activateMatchedSession(matchedId);
				}
			} catch (error) {
				console.error("Matching error:", error);
				if (isDisposed) return;
				toast.error("Failed to match right now.");
				setStatus("options");
				setPendingCriteria(null);
				setElapsedSeconds(0);
			}
		};

		void tryFindMatch();

		const pollId = window.setInterval(() => {
			void tryFindMatch();
		}, POLL_INTERVAL_MS);

		const tickerId = window.setInterval(() => {
			const elapsed = Math.floor((Date.now() - startedAt) / 1000);
			if (isDisposed) return;
			setElapsedSeconds(elapsed);

			if (elapsed >= MIN_WAIT_SECONDS) {
				isDisposed = true;
				void supabase.from("matching_queue").delete().eq("user_id", user.id);
				toast("No match found in 60 seconds. Try again.");
				setStatus("options");
				setPendingCriteria(null);
				setElapsedSeconds(0);
				window.clearInterval(pollId);
				window.clearInterval(tickerId);
			}
		}, 1000);

		return () => {
			isDisposed = true;
			window.clearInterval(pollId);
			window.clearInterval(tickerId);
		};
	}, [user, status, pendingCriteria]);

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
					<MatchLoading
						onCancel={handleCancelMatching}
						elapsedSeconds={elapsedSeconds}
						minWaitSeconds={MIN_WAIT_SECONDS}
					/>
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
