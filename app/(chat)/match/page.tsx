"use client";

import { useEffect, useEffectEvent, useState } from "react";
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
import type { Database } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { IconHome, IconMessage } from "@tabler/icons-react";
import { toast } from "sonner";

const supabase = createClient();
const MIN_WAIT_SECONDS = 60;
const POLL_INTERVAL_MS = 5000;
const MATCH_SESSION_RETRY_COUNT = 3;
const MATCH_SESSION_RETRY_DELAY_MS = 300;

type MatchStatus = "options" | "loading" | "active";
type MatchSessionView =
	Database["public"]["Functions"]["get_chat_session_for_viewer"]["Returns"][number];

export default function MatchPage() {
	const user = useAuthStore((state) => state.user);
	const router = useRouter();
	const { profile, loading: isLoadingProfile } = useProfile();
	const [status, setStatus] = useState<MatchStatus>("options");
	const [sessionId, setSessionId] = useState<string | null>(null);
	const [sessionData, setSessionData] = useState<MatchSessionView | null>(null);
	const [partnerProfile, setPartnerProfile] = useState<any>(null);
	const [pendingCriteria, setPendingCriteria] = useState<MatchCriteria | null>(
		null,
	);
	const [elapsedSeconds, setElapsedSeconds] = useState(0);

	const { messages, sendMessage } = useChat(sessionId ?? "");

	const loadMatchSession = useEffectEvent(async (matchedId: string) => {
		if (!user) return false;

		let session: MatchSessionView | null = null;

		for (let attempt = 0; attempt < MATCH_SESSION_RETRY_COUNT; attempt += 1) {
			const { data, error: sessionError } = await supabase
				.rpc("get_chat_session_for_viewer", {
					target_session_id: matchedId,
				});
			if (sessionError) {
				throw sessionError;
			}
			const nextSession = (data?.[0] ?? null) as MatchSessionView | null;
			if (nextSession) {
				session = nextSession;
				break;
			}
			if (attempt < MATCH_SESSION_RETRY_COUNT - 1) {
				await new Promise((resolve) =>
					window.setTimeout(resolve, MATCH_SESSION_RETRY_DELAY_MS),
				);
			}
		}

		if (!session) {
			return false;
		}
		if (session.session_type !== "match") {
			console.warn("Ignoring non-match session returned by find_match_v2", {
				matchedId,
				type: session.session_type,
			});
			return false;
		}
		if (session.status && session.status !== "active") {
			return false;
		}

		let partner = null;
		if (session.is_revealed) {
			const { data: partnerData, error: partnerError } = await supabase
				.rpc("get_profile_for_viewer", {
					target_profile_id: session.other_user_id,
				})
				.maybeSingle();
			if (partnerError) throw partnerError;
			partner = partnerData ?? null;
		}

		setSessionId(session.id);
		setSessionData(session as MatchSessionView);
		setPartnerProfile(partner ?? null);
		setPendingCriteria(null);
		setElapsedSeconds(0);
		setStatus("active");
		return true;
	});

	useEffect(() => {
		if (!user || isLoadingProfile) return;
		if (!isProfileComplete(profile)) {
			router.replace("/onboarding");
		}
	}, [user, isLoadingProfile, profile, router]);

	useEffect(() => {
		if (!user || isLoadingProfile || !isProfileComplete(profile)) return;
		if (status !== "options" || sessionId) return;

		let isCancelled = false;

		const restoreActiveMatch = async () => {
			const { data: sessions, error } = await supabase.rpc(
				"get_chat_sessions_for_viewer",
			);
			const existingSession =
				sessions?.find(
					(session) =>
						session.session_type === "match" && session.status === "active",
				) ?? null;

			if (error || !existingSession?.id || isCancelled) return;

			try {
				await loadMatchSession(existingSession.id);
			} catch (restoreError) {
				console.error("Failed to restore active match:", restoreError);
			}
		};

		void restoreActiveMatch();

		return () => {
			isCancelled = true;
		};
	}, [user, isLoadingProfile, profile, sessionId, status]);

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
		toast("Đã hủy tìm kiếm ghép đôi.");
	};

	useEffect(() => {
		if (!user || status !== "loading" || !pendingCriteria) return;

		let isDisposed = false;
		const startedAt = Date.now();

		const tryFindMatch = async () => {
			try {
				const { data: matchedId, error: matchError } = await supabase.rpc(
					"find_match_v2",
					{
						current_user_id: user.id,
						p_gender: pendingCriteria.gender,
						p_region: pendingCriteria.location,
						p_zodiac: pendingCriteria.zodiac,
					},
				);
				if (matchError) throw matchError;
				if (matchedId) {
					await loadMatchSession(matchedId);
				}
			} catch (error) {
				console.error("Matching error:", error);
				if (isDisposed) return;
				toast.error("Hiện tại chưa thể ghép đôi.");
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
				toast("Không tìm thấy người phù hợp trong 60 giây. Hãy thử lại.");
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

		const { error } = await supabase
			.rpc("end_match_for_viewer", {
				target_session_id: sessionId,
			})
			.maybeSingle();
		if (error) {
			toast.error("Không thể kết thúc cuộc trò chuyện.");
			return;
		}

		setSessionId(null);
		setSessionData(null);
		setPartnerProfile(null);
		setStatus("options");
		toast.success("Đã kết thúc cuộc trò chuyện.");
	};

	// Handle Like
	const handleLike = async () => {
		if (!sessionId || !sessionData || !user) return;

		const isUser1 = user.id === sessionData.user1_id;

		// Check if reveal effectively happens (optimistic)
		const otherLiked = isUser1
			? sessionData.user2_liked
			: sessionData.user1_liked;
		if (otherLiked) {
			toast.success("Ghép đôi thành công! Danh tính đã được hiển thị.");
		} else {
			toast.success("Bạn đã bày tỏ thích với đối phương!");
		}

		const { error } = await supabase
			.rpc("like_match_for_viewer", {
				target_session_id: sessionId,
			})
			.maybeSingle();
		if (error) {
			toast.error("Không thể cập nhật trạng thái ghép đôi.");
			return;
		}

		const { data } = await supabase
			.rpc("get_chat_session_for_viewer", {
				target_session_id: sessionId,
			})
			.maybeSingle();

		if (data) {
			setSessionData(data as MatchSessionView);
			if (data.is_revealed && !partnerProfile) {
				const { data: partner } = await supabase
					.rpc("get_profile_for_viewer", {
						target_profile_id: data.other_user_id,
					})
					.maybeSingle();
				setPartnerProfile(partner ?? null);
			}
		}
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
					const nextSession = payload.new as {
						status?: string | null;
						is_revealed?: boolean;
					};
					if (nextSession.status && nextSession.status !== "active") {
						setSessionId(null);
						setSessionData(null);
						setPartnerProfile(null);
						setStatus("options");
						toast("Cuộc trò chuyện ghép đôi đã kết thúc.");
						return;
					}
					void loadMatchSession(sessionId);
					if (nextSession.is_revealed && !sessionData?.is_revealed) {
						toast.success("Ghép đôi thành công! Danh tính đã được hiển thị.");
					}
				},
			)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "ended_match_sessions",
					filter: `session_id=eq.${sessionId}`,
				},
				() => {
					setSessionId(null);
					setSessionData(null);
					setPartnerProfile(null);
					setStatus("options");
					toast("Cuộc trò chuyện ghép đôi đã kết thúc.");
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
				<div className="pointer-events-none fixed left-0 right-0 top-4 z-10 flex items-center justify-between px-4">
					<Button
						variant="outline"
						size="sm"
						onClick={() => router.push("/")}
						className="pointer-events-auto text-muted-foreground hover:text-foreground z-50"
					>
						<IconHome className="mr-2 size-4" />
						Trang chủ
					</Button>

					{status !== "active" && (
						<Button
							variant="outline"
							size="sm"
							onClick={goToHistory}
							className="pointer-events-auto text-muted-foreground hover:text-foreground z-50"
						>
							<IconMessage className="mr-2 size-4" />
							Lịch sử
						</Button>
					)}
				</div>

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
						partnerUserId={
							user.id === sessionData.user1_id
								? sessionData.user2_id
								: sessionData.user1_id
						}
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
