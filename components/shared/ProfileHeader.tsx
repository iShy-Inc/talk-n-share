"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IconMapPin, IconCalendarMonth, IconRefresh } from "@tabler/icons-react";
import { useProfileCover } from "@/hooks/useProfileCover";

export interface ProfileStat {
	label: string;
	value: number | string;
}

export interface ProfileTab {
	label: string;
	value: string;
}

interface ProfileHeaderProps {
	name: string;
	username?: string;
	title?: string;
	avatarUrl?: string;
	stats?: ProfileStat[];
	tabs?: ProfileTab[];
	activeTab?: string;
	onTabChange?: (tab: string) => void;
}

export function ProfileHeader({
	name,
	username,
	title,
	avatarUrl,
	stats = [],
	tabs = [],
	activeTab,
	onTabChange,
}: ProfileHeaderProps) {
	const { coverUrl, activeCoverUrl, markCoverAsFailed, refreshCover } =
		useProfileCover();

	return (
		<div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
			<div className="relative z-0 h-36 w-full overflow-hidden bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.45),transparent_55%),radial-gradient(circle_at_80%_10%,hsl(var(--ring)/0.35),transparent_50%),linear-gradient(135deg,hsl(var(--primary)/0.18),hsl(var(--background)))]">
				<div
					className="absolute inset-0 bg-cover bg-center"
					style={{ backgroundImage: `url(${activeCoverUrl})` }}
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
				<img
					src={coverUrl}
					alt=""
					aria-hidden
					className="hidden"
					onError={markCoverAsFailed}
				/>
				<Button
					type="button"
					size="icon-xs"
					variant="secondary"
					className="absolute right-3 top-3 z-10 size-7 rounded-full bg-black/45 text-white hover:bg-black/60"
					onClick={refreshCover}
					title="Refresh cover image"
				>
					<IconRefresh className="size-4" />
				</Button>
			</div>

			<div className="relative z-10 px-5 pb-4 md:px-7">
				<div className="relative z-20 -mt-14 flex items-end justify-between gap-4">
					{avatarUrl ? (
						<img
							src={avatarUrl}
							alt={name}
							className="relative z-20 size-28 shrink-0 rounded-full border-4 border-card object-cover"
						/>
					) : (
						<div className="relative z-20 flex size-28 shrink-0 items-center justify-center rounded-full border-4 border-card bg-primary/10 text-4xl font-bold text-primary">
							{name[0]?.toUpperCase()}
						</div>
					)}
					<div className="mb-2 hidden text-xs text-muted-foreground sm:flex sm:items-center sm:gap-2">
						<IconCalendarMonth className="size-4" />
						<span>Joined Talk N Share</span>
					</div>
				</div>

				<div className="mt-3">
					<h2 className="text-xl font-bold tracking-tight">{name}</h2>
					{username && (
						<p className="text-sm text-muted-foreground">@{username}</p>
					)}
				</div>

				{title && (
					<p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
						<IconMapPin className="size-4" />
						<span>{title}</span>
					</p>
				)}

				{stats.length > 0 && (
					<div className="mt-4 flex flex-wrap items-center gap-5">
						{stats.map((stat) => (
							<div key={stat.label} className="text-sm">
								<span className="font-semibold text-foreground">{stat.value}</span>
								<span className="ml-1 text-muted-foreground">{stat.label}</span>
							</div>
						))}
					</div>
				)}
			</div>

			{tabs.length > 0 && (
				<div className="border-t border-border">
					<div className="grid grid-cols-2 sm:grid-cols-3">
						{tabs.map((tab) => (
							<button
								key={tab.value}
								onClick={() => onTabChange?.(tab.value)}
								className={cn(
									"relative px-3 py-3 text-sm font-medium transition-colors",
									activeTab === tab.value
										? "text-foreground"
										: "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
								)}
								id={`profile-tab-${tab.value}`}
							>
								{tab.label}
								{activeTab === tab.value && (
									<span className="absolute bottom-0 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-primary" />
								)}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
