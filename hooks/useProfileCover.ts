"use client";

import { useMemo, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useProfileCoverStore } from "@/store/useProfileCoverStore";

const FALLBACK_COVER_IMAGES = [
	"https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&h=320&q=80",
	"https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1200&h=320&q=80",
	"https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&h=320&q=80",
	"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&h=320&q=80",
	"https://images.unsplash.com/photo-1493244040629-496f6d136cc3?auto=format&fit=crop&w=1200&h=320&q=80",
	"https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=1200&h=320&q=80",
	"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&h=320&q=80",
	"https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?auto=format&fit=crop&w=1200&h=320&q=80",
	"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&h=320&q=80",
	"https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1200&h=320&q=80",
	"https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&h=320&q=80",
	"https://images.unsplash.com/photo-1464822759844-d150baec0494?auto=format&fit=crop&w=1200&h=320&q=80",
	"https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1200&h=320&q=80",
	"https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&h=320&q=80",
	"https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&h=320&q=80",
	"https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&h=320&q=80",
	"https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&h=320&q=80",
	"https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&h=320&q=80",
	"https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1200&h=320&q=80",
	"https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&h=320&q=80",
] as const;

const getSeedNumber = (value: string) => {
	let hash = 0;
	for (let index = 0; index < value.length; index += 1) {
		hash = (hash * 31 + value.charCodeAt(index)) % 2147483647;
	}
	return Math.abs(hash);
};

export const useProfileCover = () => {
	const user = useAuthStore((state) => state.user);
	const activeSession = useAuthStore((state) => state.activeSession);
	const bumpCoverNonce = useProfileCoverStore((state) => state.bumpCoverNonce);
	const sessionKey = `${user?.id ?? "guest"}-${activeSession?.refresh_token ?? "anon"}`;
	const refreshNonce = useProfileCoverStore(
		(state) => state.coverNonceBySession[sessionKey] ?? 0,
	);
	const [failedCoverUrl, setFailedCoverUrl] = useState<string | null>(null);

	const sessionSignature = `${sessionKey}-${refreshNonce}`;
	const coverUrl = useMemo(
		() =>
			`https://source.unsplash.com/featured/1200x320?landscape,nature,sky,city&sig=${sessionSignature}`,
		[sessionSignature],
	);
	const fallbackCoverUrl = useMemo(() => {
		const seed = getSeedNumber(sessionSignature);
		return FALLBACK_COVER_IMAGES[seed % FALLBACK_COVER_IMAGES.length];
	}, [sessionSignature]);
	const activeCoverUrl =
		failedCoverUrl === coverUrl ? fallbackCoverUrl : coverUrl;

	const refreshCover = () => {
		setFailedCoverUrl(null);
		bumpCoverNonce(sessionKey);
	};

	const markCoverAsFailed = () => {
		setFailedCoverUrl(coverUrl);
	};

	return {
		coverUrl,
		activeCoverUrl,
		refreshCover,
		markCoverAsFailed,
	};
};
