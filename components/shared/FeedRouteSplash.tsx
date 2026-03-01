"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AppLogo } from "@/components/shared/AppLogo";
import { cn } from "@/lib/utils";

const ENTERED_FEED_PATH = "/";
const SPLASH_VISIBLE_MS = 520;
const SPLASH_TOTAL_MS = 860;

export function FeedRouteSplash() {
	const pathname = usePathname();
	const previousPathnameRef = useRef<string | null>(null);
	const [isVisible, setIsVisible] = useState(false);
	const [isExiting, setIsExiting] = useState(false);

	useEffect(() => {
		const previousPathname = previousPathnameRef.current;
		previousPathnameRef.current = pathname;

		if (pathname !== ENTERED_FEED_PATH) {
			return;
		}

		if (previousPathname === ENTERED_FEED_PATH) {
			return;
		}

		const showTimer = window.setTimeout(() => {
			setIsVisible(true);
			setIsExiting(false);
		}, 0);
		const exitTimer = window.setTimeout(() => {
			setIsExiting(true);
		}, SPLASH_VISIBLE_MS);
		const hideTimer = window.setTimeout(() => {
			setIsVisible(false);
		}, SPLASH_TOTAL_MS);

		return () => {
			window.clearTimeout(showTimer);
			window.clearTimeout(exitTimer);
			window.clearTimeout(hideTimer);
		};
	}, [pathname]);

	if (pathname !== ENTERED_FEED_PATH || !isVisible) {
		return null;
	}

	return (
		<div
			aria-hidden="true"
			className={cn(
				"pointer-events-none fixed inset-0 z-[140] flex items-center justify-center overflow-hidden bg-background/88 backdrop-blur-md",
				"transition-opacity duration-300 motion-reduce:transition-none",
				isExiting ? "opacity-0" : "opacity-100",
			)}
		>
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.16),_transparent_42%),radial-gradient(circle_at_bottom,_hsl(var(--primary)/0.10),_transparent_38%)]" />

			<div
				className={cn(
					"relative flex min-w-[220px] flex-col items-center px-8 py-8",
					// "relative flex min-w-[220px] flex-col items-center rounded-[2rem] border border-border/60 bg-card/90 px-8 py-8 shadow-2xl ring-1 ring-foreground/5",
					"transition-all duration-500 motion-reduce:transition-none",
					isExiting
						? "translate-y-2 scale-95 opacity-0"
						: "translate-y-0 scale-100 opacity-100",
				)}
			>
				<div className="absolute inset-0" />
				<div className="relative flex flex-col items-center gap-4">
					<div className="p-4 shadow-lg animate-glow-pulse motion-reduce:animate-none">
						<AppLogo
							showText={false}
							imageClassName="h-14 w-auto animate-float-soft motion-reduce:animate-none"
						/>
					</div>
					<h2
						className={cn(
							"text-center text-4xl font-bold tracking-tight text-transparent",
							"bg-linear-to-r from-foreground via-primary to-foreground bg-clip-text animate-shiny-text motion-reduce:animate-none",
						)}
					>
						Talk N Share
					</h2>
					<p className="text-sm text-muted-foreground">
						Khám phá, chia sẻ và kết nối
					</p>
				</div>
			</div>
		</div>
	);
}
