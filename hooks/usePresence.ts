"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";

const supabase = createClient();
const ONLINE_WINDOW_MS = 2 * 60 * 1000;
const PRESENCE_REFETCH_MS = 30 * 1000;
const HEARTBEAT_MS = 60 * 1000;

export const isUserOnlineByLastSeen = (lastSeenAt?: string | null) => {
	if (!lastSeenAt) return false;
	const lastSeenTime = new Date(lastSeenAt).getTime();
	if (Number.isNaN(lastSeenTime)) return false;
	return Date.now() - lastSeenTime <= ONLINE_WINDOW_MS;
};

export const usePresenceMap = (userIds: Array<string | null | undefined>) => {
	const normalizedIds = Array.from(
		new Set(userIds.filter((id): id is string => !!id)),
	);

	const { data = [] } = useQuery({
		queryKey: ["presence", normalizedIds.join(",")],
		queryFn: async () => {
			if (normalizedIds.length === 0) return [];
			const { data, error } = await supabase
				.from("profiles")
				.select("id, last_seen_at")
				.in("id", normalizedIds);
			if (error) throw error;
			return data ?? [];
		},
		enabled: normalizedIds.length > 0,
		refetchInterval: PRESENCE_REFETCH_MS,
	});

	const presenceMap = Object.fromEntries(
		normalizedIds.map((id) => [id, false]),
	) as Record<string, boolean>;

	for (const profile of data) {
		presenceMap[profile.id] = isUserOnlineByLastSeen(profile.last_seen_at);
	}

	return presenceMap;
};

export const useIsUserOnline = (userId?: string | null) => {
	const presenceMap = usePresenceMap([userId]);
	if (!userId) return false;
	return presenceMap[userId] ?? false;
};

export const usePresenceHeartbeat = () => {
	const userId = useAuthStore((state) => state.user?.id ?? "");

	useEffect(() => {
		if (!userId || typeof document === "undefined") return;

		let isDisposed = false;
		let isPinging = false;

		const ping = async () => {
			if (isDisposed || isPinging) return;
			isPinging = true;
			try {
				await supabase.rpc("heartbeat_presence");
			} catch (error) {
				console.error("Failed to send presence heartbeat:", error);
			} finally {
				isPinging = false;
			}
		};

		void ping();

		const intervalId = window.setInterval(() => {
			if (document.visibilityState === "visible") {
				void ping();
			}
		}, HEARTBEAT_MS);

		const handleVisible = () => {
			if (document.visibilityState === "visible") {
				void ping();
			}
		};

		window.addEventListener("focus", handleVisible);
		document.addEventListener("visibilitychange", handleVisible);

		return () => {
			isDisposed = true;
			window.clearInterval(intervalId);
			window.removeEventListener("focus", handleVisible);
			document.removeEventListener("visibilitychange", handleVisible);
		};
	}, [userId]);
};
