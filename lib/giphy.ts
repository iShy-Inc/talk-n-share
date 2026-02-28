"use client";

export type GifProvider = "giphy";

type GiphyAnalyticsEvent = {
	url?: string;
};

type GiphyAnalytics = {
	onclick?: GiphyAnalyticsEvent;
	onload?: GiphyAnalyticsEvent;
	onsent?: GiphyAnalyticsEvent;
};

type GiphyImageVariant = {
	url?: string;
	webp?: string;
};

type GiphyImages = {
	fixed_width?: GiphyImageVariant;
	fixed_width_still?: GiphyImageVariant;
	original?: GiphyImageVariant;
	original_still?: GiphyImageVariant;
};

type GiphyApiGif = {
	id: string;
	title?: string;
	images?: GiphyImages;
	analytics?: GiphyAnalytics;
};

type GiphyListResponse = {
	data?: GiphyApiGif[];
	meta?: {
		status?: number;
		msg?: string;
	};
};

type GiphySingleResponse = {
	data?: GiphyApiGif;
	meta?: {
		status?: number;
		msg?: string;
	};
};

export type GifSelection = {
	provider: "giphy";
	id: string;
	title: string;
	previewUrl: string;
	renderUrl: string;
	stillUrl: string | null;
	analytics: {
		onClickUrl: string | null;
		onLoadUrl: string | null;
		onSentUrl: string | null;
	};
};

const GIPHY_API_BASE_URL = "https://api.giphy.com/v1/gifs";
const DEFAULT_LIMIT = 24;
const DEFAULT_RATING = "pg-13";

const getApiKey = () => process.env.NEXT_PUBLIC_GIPHY_API_KEY?.trim() ?? "";

export const hasGiphyApiKey = () => getApiKey().length > 0;

const getImageUrl = (...variants: Array<GiphyImageVariant | undefined>) => {
	for (const variant of variants) {
		const candidate = variant?.webp ?? variant?.url;
		if (candidate) return candidate;
	}
	return null;
};

const normalizeGif = (gif: GiphyApiGif): GifSelection | null => {
	const previewUrl = getImageUrl(
		gif.images?.fixed_width,
		gif.images?.original,
	);
	const renderUrl = getImageUrl(gif.images?.original, gif.images?.fixed_width);

	if (!previewUrl || !renderUrl) return null;

	return {
		provider: "giphy",
		id: gif.id,
		title: gif.title?.trim() || "GIF",
		previewUrl,
		renderUrl,
		stillUrl: getImageUrl(
			gif.images?.fixed_width_still,
			gif.images?.original_still,
		),
		analytics: {
			onClickUrl: gif.analytics?.onclick?.url ?? null,
			onLoadUrl: gif.analytics?.onload?.url ?? null,
			onSentUrl: gif.analytics?.onsent?.url ?? null,
		},
	};
};

const fetchGiphyJson = async <T>(path: string, params: URLSearchParams) => {
	const apiKey = getApiKey();
	if (!apiKey) return null;

	params.set("api_key", apiKey);

	const response = await fetch(`${GIPHY_API_BASE_URL}${path}?${params.toString()}`, {
		cache: "no-store",
	});
	if (!response.ok) {
		throw new Error(`GIPHY request failed (${response.status})`);
	}
	return (await response.json()) as T;
};

export const searchGiphyGifs = async (query: string) => {
	const trimmedQuery = query.trim();
	if (!hasGiphyApiKey()) return [] as GifSelection[];

	const params = new URLSearchParams({
		limit: String(DEFAULT_LIMIT),
		rating: DEFAULT_RATING,
	});

	let payload: GiphyListResponse | null = null;
	if (trimmedQuery) {
		params.set("q", trimmedQuery);
		payload = await fetchGiphyJson<GiphyListResponse>("/search", params);
	} else {
		payload = await fetchGiphyJson<GiphyListResponse>("/trending", params);
	}

	if (!payload || payload.meta?.status !== 200 || !Array.isArray(payload.data)) {
		return [] as GifSelection[];
	}

	return payload.data
		.map((gif) => normalizeGif(gif))
		.filter((gif): gif is GifSelection => gif !== null);
};

export const fetchGiphyGifById = async (gifId: string) => {
	if (!gifId.trim() || !hasGiphyApiKey()) return null;

	const payload = await fetchGiphyJson<GiphySingleResponse>(
		`/${encodeURIComponent(gifId)}`,
		new URLSearchParams({ rating: DEFAULT_RATING }),
	);

	if (!payload || payload.meta?.status !== 200 || !payload.data) {
		return null;
	}

	return normalizeGif(payload.data);
};

const getSessionRandomId = () => {
	if (typeof window === "undefined") return null;
	const existing = window.sessionStorage.getItem("giphy-random-id");
	if (existing) return existing;
	const next =
		window.crypto?.randomUUID?.().replace(/-/g, "") ??
		Math.random().toString(36).slice(2) + Date.now().toString(36);
	window.sessionStorage.setItem("giphy-random-id", next);
	return next;
};

export const trackGiphyAction = async (actionUrl?: string | null) => {
	if (!actionUrl) return;
	try {
		const url = new URL(actionUrl);
		const randomId = getSessionRandomId();
		url.searchParams.set("ts", String(Date.now()));
		if (randomId) {
			url.searchParams.set("random_id", randomId);
		}
		await fetch(url.toString(), {
			method: "GET",
			mode: "no-cors",
			cache: "no-store",
		});
	} catch {
		// Analytics should never block UI flows.
	}
};

export const registerGiphySend = async (gifId: string) => {
	const gif = await fetchGiphyGifById(gifId);
	await trackGiphyAction(gif?.analytics.onSentUrl);
};
