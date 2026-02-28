"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	hasGiphyApiKey,
	searchGiphyGifs,
	trackGiphyAction,
	type GifSelection,
} from "@/lib/giphy";
import { cn } from "@/lib/utils";

interface GifPickerButtonProps {
	onSelect: (gif: GifSelection) => void;
	disabled?: boolean;
	className?: string;
	label?: string;
}

export function GifPickerButton({
	onSelect,
	disabled = false,
	className,
	label = "GIF",
}: GifPickerButtonProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState("");
	const deferredQuery = useDeferredValue(query);
	const [results, setResults] = useState<GifSelection[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);

	useEffect(() => {
		if (!isOpen || !hasGiphyApiKey()) {
			setResults([]);
			setLoadError(null);
			return;
		}

		let isCancelled = false;

		const loadResults = async () => {
			setIsLoading(true);
			setLoadError(null);
			try {
				const nextResults = await searchGiphyGifs(deferredQuery);
				if (!isCancelled) {
					setResults(nextResults);
				}
			} catch {
				if (!isCancelled) {
					setResults([]);
					setLoadError("Không tải được GIF từ GIPHY.");
				}
			} finally {
				if (!isCancelled) {
					setIsLoading(false);
				}
			}
		};

		void loadResults();

		return () => {
			isCancelled = true;
		};
	}, [deferredQuery, isOpen]);

	return (
		<>
			<Button
				type="button"
				variant="outline"
				disabled={disabled || !hasGiphyApiKey()}
				onClick={() => setIsOpen(true)}
				className={className}
			>
				{label}
			</Button>

			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent
					className="z-[320] max-w-2xl"
					overlayClassName="z-[310]"
				>
					<DialogHeader>
						<DialogTitle>Chọn GIF</DialogTitle>
						<DialogDescription>
							Tìm và gửi GIF trực tiếp từ GIPHY.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-3">
						<Input
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Tìm GIF trên GIPHY..."
						/>

						<div className="max-h-[420px] overflow-y-auto rounded-xl border border-border/70 p-2">
							{isLoading ? (
								<div className="flex min-h-32 items-center justify-center text-sm text-muted-foreground">
									Đang tải GIF...
								</div>
							) : loadError ? (
								<div className="flex min-h-32 items-center justify-center text-sm text-destructive">
									{loadError}
								</div>
							) : results.length === 0 ? (
								<div className="flex min-h-32 items-center justify-center text-sm text-muted-foreground">
									Không có GIF phù hợp.
								</div>
							) : (
								<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
									{results.map((gif) => (
										<button
											key={gif.id}
											type="button"
											onClick={() => {
												void trackGiphyAction(gif.analytics.onClickUrl);
												onSelect(gif);
												setIsOpen(false);
											}}
											className="overflow-hidden rounded-xl border border-border/70 transition hover:border-primary/50 hover:shadow-sm"
										>
											<img
												src={gif.previewUrl}
												alt={gif.title}
												className="h-32 w-full object-cover"
											/>
										</button>
									))}
								</div>
							)}
						</div>

						<a
							href="https://developers.giphy.com/docs/api/"
							target="_blank"
							rel="noreferrer"
							className={cn(
								"block text-center text-xs font-medium text-muted-foreground hover:text-foreground",
							)}
						>
							Powered by GIPHY
						</a>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
