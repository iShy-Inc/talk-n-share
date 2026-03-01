"use client";

import { useEffect, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import {
	IconArrowsShuffle,
	IconBrain,
	IconPlayerPause,
	IconPlayerPlay,
	IconPlayerTrackNext,
	IconRepeat,
	IconSparkles,
	IconVolume,
	IconVolumeOff,
} from "@tabler/icons-react";
import { Disc3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import type { PlayerMood } from "@/hooks/useAmbientPlayer";
import { useAmbientPlayer } from "@/hooks/useAmbientPlayer";

const BREATHING_DURATION = 60;
const BREATHING_CYCLE = 12;
const MOOD_OPTIONS: {
	value: PlayerMood;
	label: string;
	compactLabel: string;
}[] = [
	{ value: "cafe", label: "Cafe", compactLabel: "Cafe" },
	{ value: "piano", label: "Piano", compactLabel: "Pno" },
	{ value: "rainy", label: "Rainy", compactLabel: "Rain" },
];

interface WidgetShellProps {
	title?: string;
	description?: string;
	icon: ComponentType<{ className?: string }>;
	className?: string;
	children: ReactNode;
}

function WidgetShell({
	title,
	description,
	icon: Icon,
	className,
	children,
}: WidgetShellProps) {
	return (
		<div
			className={cn(
				"overflow-hidden rounded-3xl border border-border/70 bg-card/90 p-4 shadow-sm",
				className,
			)}
		>
			<div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
				<Icon className="size-3.5 text-primary" />
				{title}
			</div>
			{description ? (
				<p className="mt-2 text-sm text-foreground">{description}</p>
			) : null}
			<div className="mt-4">{children}</div>
		</div>
	);
}

export function BreathingPauseWidget({ className }: { className?: string }) {
	const [breathingRemaining, setBreathingRemaining] = useState(0);
	const [isBreathingActive, setIsBreathingActive] = useState(false);

	useEffect(() => {
		if (!isBreathingActive || breathingRemaining <= 0) {
			return;
		}

		const timer = window.setInterval(() => {
			setBreathingRemaining((current) => {
				if (current <= 1) {
					setIsBreathingActive(false);
					return 0;
				}

				return current - 1;
			});
		}, 1000);

		return () => {
			window.clearInterval(timer);
		};
	}, [isBreathingActive, breathingRemaining]);

	const elapsed = BREATHING_DURATION - breathingRemaining;
	const cyclePosition = elapsed % BREATHING_CYCLE;
	let breathingLabel = "Sẵn sàng cho 1 phút thở chậm";

	if (breathingRemaining > 0) {
		if (cyclePosition < 4) {
			breathingLabel = "Hít vào thật chậm";
		} else if (cyclePosition < 8) {
			breathingLabel = "Giữ nhịp và thả lỏng vai";
		} else {
			breathingLabel = "Thở ra chậm hơn một chút";
		}
	}

	return (
		<WidgetShell
			title="Breathing Pause"
			description="Một phút để hạ nhịp và đưa sự chú ý về cơ thể."
			icon={IconBrain}
			className={cn(
				"bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.14),transparent_45%),hsl(var(--card))]",
				className,
			)}
		>
			<div className="flex items-center gap-4">
				<div
					className={cn(
						"flex size-16 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-background/80 text-sm font-semibold text-foreground transition-transform duration-1000",
						isBreathingActive ? "scale-110" : "scale-100",
					)}
				>
					{breathingRemaining > 0 ? `${breathingRemaining}s` : "1m"}
				</div>
				<div className="min-w-0">
					<p className="text-sm font-medium text-foreground">
						{breathingLabel}
					</p>
					<p className="mt-1 text-xs text-muted-foreground">
						Nhịp 4 giây hít vào, 4 giây giữ, 4 giây thở ra.
					</p>
				</div>
			</div>

			<div className="mt-4 flex flex-wrap gap-2">
				<Button
					type="button"
					variant={breathingRemaining > 0 ? "secondary" : "default"}
					onClick={() => {
						setBreathingRemaining(BREATHING_DURATION);
						setIsBreathingActive(true);
					}}
					className="rounded-full"
				>
					{breathingRemaining > 0 ? "Bắt đầu lại" : "Hít thật sâu"}
				</Button>

				<Button
					type="button"
					variant="outline"
					onClick={() => {
						if (breathingRemaining <= 0) {
							return;
						}
						setIsBreathingActive((current) => !current);
					}}
					disabled={breathingRemaining <= 0}
					className="rounded-full"
				>
					{isBreathingActive ? (
						<>
							<IconPlayerPause className="mr-1.5 size-4" />
							Tạm dừng
						</>
					) : (
						<>
							<IconPlayerPlay className="mr-1.5 size-4" />
							Tiếp tục
						</>
					)}
				</Button>
			</div>
		</WidgetShell>
	);
}

export function AmbientMusicWidget({ className }: { className?: string }) {
	const {
		audioRef,
		currentTrack,
		currentTime,
		duration,
		progress,
		volume,
		isPlaying,
		isShuffleEnabled,
		isRepeatEnabled,
		selectedMood,
		visibleHint,
		togglePlayback,
		playNextTrack,
		toggleShuffle,
		toggleRepeat,
		toggleMute,
		handleVolumeChange,
		showHint,
		setMood,
	} = useAmbientPlayer();

	const formatTime = (value: number) => {
		if (!Number.isFinite(value) || value <= 0) {
			return "0:00";
		}

		const minutes = Math.floor(value / 60);
		const seconds = Math.floor(value % 60)
			.toString()
			.padStart(2, "0");

		return `${minutes}:${seconds}`;
	};

	return (
		<>
			<audio ref={audioRef} preload="none">
				<source src={currentTrack.url} type="audio/mpeg" />
			</audio>

			<div
				className={cn(
					"rounded-[1.75rem] border border-border/60 bg-[linear-gradient(180deg,hsl(var(--card)),hsl(var(--muted)/0.35))] p-3.5 transition-all duration-300",
					isPlaying && "shadow-lg shadow-primary/8 ring-1 ring-primary/10",
					className,
				)}
			>
				<div className="flex items-center gap-3">
					<div
						className={cn(
							"relative flex size-14 shrink-0 items-center justify-center rounded-2xl border border-border/60",
							currentTrack.coverClassName,
							isPlaying && "shadow-md shadow-primary/10 ring-1 ring-primary/10",
						)}
					>
						<div className="absolute inset-1 rounded-[1rem] border border-white/5" />
						<div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.14),transparent_42%)]" />
						<div
							className={cn(
								"relative flex size-7 items-center justify-center rounded-full bg-background/90 text-primary transition-transform duration-500",
								isPlaying && "scale-110 animate-[spin_10s_linear_infinite]",
							)}
						>
							<Disc3 className="size-6" />
						</div>
					</div>

					<div className="min-w-0 flex-1">
						<div className="mb-1 flex items-center gap-2">
							<div className="flex h-3 items-end gap-0.5">
								<span
									className={cn(
										"inline-block w-0.5 rounded-full bg-primary/55 transition-all duration-300",
										isPlaying
											? "h-2 animate-[music-bars_0.9s_ease-in-out_infinite]"
											: "h-1",
									)}
								/>
								<span
									className={cn(
										"inline-block w-0.5 rounded-full bg-primary/70 transition-all duration-300",
										isPlaying
											? "h-3 animate-[music-bars_0.9s_ease-in-out_infinite]"
											: "h-1.5",
									)}
									style={isPlaying ? { animationDelay: "120ms" } : undefined}
								/>
								<span
									className={cn(
										"inline-block w-0.5 rounded-full bg-primary transition-all duration-300",
										isPlaying
											? "h-2.5 animate-[music-bars_0.9s_ease-in-out_infinite]"
											: "h-1",
									)}
									style={isPlaying ? { animationDelay: "240ms" } : undefined}
								/>
							</div>
							<span className="text-[11px] font-medium text-muted-foreground">
								{selectedMood === "rainy"
									? "Rainy Session"
									: currentTrack.group}
							</span>
						</div>
						<p className="truncate text-sm font-semibold text-foreground">
							{currentTrack.title}
						</p>
						<p className="truncate text-xs text-muted-foreground">
							{currentTrack.artist}
						</p>
						<div className="mt-2 inline-flex items-center rounded-full border border-border/60 bg-background/70 p-0.5">
							{MOOD_OPTIONS.map((moodOption) => (
								<button
									aria-label={moodOption.label}
									aria-pressed={selectedMood === moodOption.value}
									key={moodOption.value}
									type="button"
									onClick={() => setMood(moodOption.value)}
									className={cn(
										"h-5 rounded-full px-2 text-[9px] font-medium transition-colors",
										selectedMood === moodOption.value
											? "bg-foreground text-background"
											: "text-muted-foreground hover:text-foreground",
									)}
									title={moodOption.label}
								>
									<span className="hidden sr-only">{moodOption.label}</span>
									{moodOption.compactLabel}
								</button>
							))}
						</div>
					</div>

					<span className="shrink-0 rounded-full border border-border/60 bg-background/80 px-2 py-1 text-[10px] font-medium text-muted-foreground">
						{currentTrack.durationLabel}
					</span>
				</div>

				<div className="mt-4 h-1.5 overflow-hidden rounded-full bg-border/70">
					<div
						className="h-full rounded-full bg-primary transition-[width] duration-300"
						style={{ width: `${Math.min(progress, 100)}%` }}
					/>
				</div>

				<div className="mt-2 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
					<span>{formatTime(currentTime)}</span>
					<span>{formatTime(duration || 0)}</span>
				</div>

				<div className="mt-4 flex items-center justify-center gap-2">
					<div className="group relative">
						<Button
							type="button"
							size="icon-sm"
							variant={isShuffleEnabled ? "secondary" : "ghost"}
							onClick={() => {
								toggleShuffle();
								showHint("shuffle");
							}}
							className="rounded-full"
							title="Bật/Tắt phát ngẫu nhiên"
						>
							<IconArrowsShuffle className="size-4" />
						</Button>
						<span
							className={cn(
								"pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-2 py-1 text-[10px] font-medium whitespace-nowrap text-background opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100",
								visibleHint === "shuffle" && "opacity-100",
							)}
						>
							{isShuffleEnabled ? "Shuffle On" : "Shuffle"}
						</span>
					</div>

					<Button
						type="button"
						size="icon-sm"
						variant="ghost"
						onClick={playNextTrack}
						className="rounded-full"
						title="Chuyển bài"
					>
						<IconPlayerTrackNext className="size-4" />
					</Button>

					<Button
						type="button"
						size="icon"
						onClick={togglePlayback}
						className={cn(
							"rounded-full shadow-sm",
							isPlaying && "shadow-primary/15",
						)}
						title={isPlaying ? "Tạm dừng" : "Phát nhạc"}
					>
						{isPlaying ? (
							<IconPlayerPause className="size-4.5" />
						) : (
							<IconPlayerPlay className="size-4.5" />
						)}
					</Button>

					<Button
						type="button"
						size="icon-sm"
						variant="ghost"
						onClick={toggleMute}
						className="rounded-full"
						title={volume <= 0 ? "Bật tiếng" : "Tắt tiếng"}
					>
						{volume <= 0 ? (
							<IconVolumeOff className="size-4" />
						) : (
							<IconVolume className="size-4" />
						)}
					</Button>

					<div className="group relative">
						<Button
							type="button"
							size="icon-sm"
							variant={isRepeatEnabled ? "secondary" : "ghost"}
							onClick={() => {
								toggleRepeat();
								showHint("repeat");
							}}
							className="rounded-full"
							title="Bật/Tắt lặp lại"
						>
							<IconRepeat className="size-4" />
						</Button>
						<span
							className={cn(
								"pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-2 py-1 text-[10px] font-medium whitespace-nowrap text-background opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100",
								visibleHint === "repeat" && "opacity-100",
							)}
						>
							{isRepeatEnabled ? "Repeat On" : "Repeat"}
						</span>
					</div>
				</div>

				<div className="mt-4 flex items-center gap-3 rounded-2xl bg-background/70 px-3 py-2">
					<span className="text-[11px] font-medium text-muted-foreground">
						Vol
					</span>
					<input
						type="range"
						min={0}
						max={1}
						step={0.05}
						value={volume}
						onChange={(event) =>
							handleVolumeChange(Number(event.currentTarget.value))
						}
						className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border/70 accent-primary"
						aria-label="Âm lượng"
					/>
					<span className="w-9 text-right text-[11px] font-medium text-muted-foreground">
						{Math.round(volume * 100)}%
					</span>
				</div>
			</div>
		</>
	);
}

export function WellnessMobileSheet() {
	return (
		<div className="fixed bottom-20 left-4 z-[60] lg:hidden">
			<Sheet>
				<SheetTrigger asChild>
					<Button
						type="button"
						variant="secondary"
						className="rounded-full border border-border/80 bg-background/95 px-4 shadow-lg backdrop-blur"
					>
						<IconSparkles className="mr-2 size-4" />
						Chăm sóc bạn
					</Button>
				</SheetTrigger>
				<SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto">
					<SheetHeader className="text-left">
						<SheetTitle>Góc hồi phục nhanh</SheetTitle>
						<SheetDescription>
							Một vài công cụ nhỏ để bạn chậm lại và tự chăm sóc mình.
						</SheetDescription>
					</SheetHeader>

					<div className="mt-4 space-y-4">
						<AmbientMusicWidget />
						<BreathingPauseWidget />
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
}
