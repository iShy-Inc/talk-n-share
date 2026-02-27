"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { IconLoader2 } from "@tabler/icons-react";

interface MatchLoadingProps {
	onCancel: () => void;
	elapsedSeconds: number;
	minWaitSeconds: number;
}

const PSYCHOLOGY_TIPS = [
	"Psychology fact: smiling can reduce stress signals in your brain.",
	"Tip: asking open-ended questions builds stronger social connection.",
	"Psychology fact: people feel closer after sharing small personal stories.",
	"Tip: matching communication pace can improve conversation comfort.",
	"Psychology fact: curiosity often creates better first impressions than perfection.",
	"Tip: use names naturally in chat to increase warmth and trust.",
	"Psychology fact: short positive feedback loops improve conversation flow.",
	"Tip: empathy statements make others feel heard and understood.",
];

export function MatchLoading({
	onCancel,
	elapsedSeconds,
	minWaitSeconds,
}: MatchLoadingProps) {
	const [tipIndex, setTipIndex] = useState(0);

	useEffect(() => {
		const timer = window.setInterval(() => {
			setTipIndex((prev) => (prev + 1) % PSYCHOLOGY_TIPS.length);
		}, 10000);

		return () => {
			window.clearInterval(timer);
		};
	}, []);

	const remaining = Math.max(minWaitSeconds - elapsedSeconds, 0);

	return (
		<div className="flex flex-col items-center justify-center space-y-8 p-12 text-center">
			<div className="relative flex size-32 items-center justify-center">
				<div className="absolute inset-0 animate-ping rounded-full bg-primary/20 opacity-75 duration-1000"></div>
				<div className="absolute inset-4 animate-ping rounded-full bg-primary/30 opacity-75 duration-[1.5s]"></div>
				<div className="relative flex size-24 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl">
					<IconLoader2 className="size-10 animate-spin" />
				</div>
			</div>

			<div className="space-y-2">
				<h3 className="text-xl font-bold">Finding a Match...</h3>
				<p className="text-muted-foreground">
					We are looking for someone who matches your preferences.
				</p>
				<p className="text-sm font-medium text-primary">
					Waiting: {elapsedSeconds}s / {minWaitSeconds}s
				</p>
				{remaining > 0 && (
					<p className="text-xs text-muted-foreground">
						Keep waiting at least {remaining}s more for best results.
					</p>
				)}
			</div>

			<div className="w-full rounded-xl border border-border/70 bg-muted/30 p-3 text-left">
				<p className="text-xs uppercase tracking-wide text-muted-foreground">
					Psychology tip
				</p>
				<p className="mt-1 text-sm text-foreground">
					{PSYCHOLOGY_TIPS[tipIndex]}
				</p>
			</div>

			<Button
				variant="outline"
				onClick={onCancel}
				className="rounded-full px-8"
			>
				Cancel Search
			</Button>
		</div>
	);
}
