"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { fetchGiphyGifById, trackGiphyAction, type GifSelection } from "@/lib/giphy";

interface GiphyGifProps {
	gifId: string;
	className?: string;
	alt?: string;
}

export function GiphyGif({
	gifId,
	className,
	alt = "GIF",
}: GiphyGifProps) {
	const [gif, setGif] = useState<GifSelection | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const hasTrackedLoadRef = useRef(false);

	useEffect(() => {
		let isCancelled = false;

		const loadGif = async () => {
			setGif(null);
			setIsLoading(true);
			try {
				const nextGif = await fetchGiphyGifById(gifId);
				if (!isCancelled) {
					setGif(nextGif);
				}
			} catch {
				if (!isCancelled) {
					setGif(null);
				}
			} finally {
				if (!isCancelled) {
					setIsLoading(false);
					hasTrackedLoadRef.current = false;
				}
			}
		};

		void loadGif();

		return () => {
			isCancelled = true;
		};
	}, [gifId]);

	if (!gif && isLoading) {
		return (
			<div
				className={cn(
					"flex min-h-24 items-center justify-center rounded-xl bg-muted/40 text-xs text-muted-foreground",
					className,
				)}
			>
				Đang tải GIF...
			</div>
		);
	}

	if (!gif) {
		return (
			<div
				className={cn(
					"flex min-h-24 items-center justify-center rounded-xl bg-muted/40 text-xs text-muted-foreground",
					className,
				)}
			>
				Không tải được GIF
			</div>
		);
	}

	return (
		<img
			src={gif.renderUrl}
			alt={alt || gif.title}
			className={className}
			onLoad={() => {
				if (hasTrackedLoadRef.current) return;
				hasTrackedLoadRef.current = true;
				void trackGiphyAction(gif.analytics.onLoadUrl);
			}}
			onClick={() => {
				void trackGiphyAction(gif.analytics.onClickUrl);
			}}
		/>
	);
}
