"use client";

import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";
import { Disc3 } from "lucide-react";
import { useAmbientPlayer } from "@/hooks/useAmbientPlayer";
import { cn } from "@/lib/utils";

export function FloatingAmbientPlayerControl() {
	const { currentTrack, isPlaying, togglePlayback } = useAmbientPlayer();

	return (
		<div className="pointer-events-none fixed right-4 bottom-24 z-50 hidden md:block md:right-6 md:bottom-6 group overflow-hidden">
			<button
				type="button"
				onClick={() => {
					void togglePlayback();
				}}
				className="pointer-events-auto flex items-center gap-2 rounded-full border border-border/70 bg-background/92 px-2.5 py-2 shadow-lg backdrop-blur-md transition-transform hover:scale-[1.02]"
				aria-label={isPlaying ? "Tạm dừng nhạc" : "Phát nhạc"}
				title={isPlaying ? "Tạm dừng nhạc" : "Phát nhạc"}
			>
				<span
					className={cn(
						"flex size-8 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,hsl(var(--primary)/0.18),transparent_48%),hsl(var(--muted)/0.75)] text-primary transition-transform duration-500",
						isPlaying && "animate-[spin_8s_linear_infinite]",
					)}
				>
					<Disc3 className="size-4.5" />
				</span>
				<span className="transition-all duration-500 ease-in-out w-0 group-hover:w-fit -translate-x-[200%] group-hover:translate-x-0 max-w-28 truncate text-xs font-medium text-foreground">
					{currentTrack.title}
				</span>
				<span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
					{isPlaying ? (
						<IconPlayerPause className="size-4" />
					) : (
						<IconPlayerPlay className="ml-0.5 size-4" />
					)}
				</span>
			</button>
		</div>
	);
}
