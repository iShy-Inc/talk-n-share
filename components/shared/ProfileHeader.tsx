"use client";

import { cn } from "@/lib/utils";

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
	return (
		<div className="rounded-2xl border border-border bg-card px-6 py-6 shadow-sm md:px-8">
			{/* Top section */}
			<div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
				{/* User info */}
				<div className="flex items-center gap-4">
					{avatarUrl ? (
						<img
							src={avatarUrl}
							alt={name}
							className="size-16 shrink-0 rounded-full object-cover"
						/>
					) : (
						<div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
							{name[0]?.toUpperCase()}
						</div>
					)}
					<div>
						<h2 className="text-lg font-semibold">
							{name}
							{username && (
								<span className="ml-1 text-sm font-normal text-muted-foreground">
									/ @{username}
								</span>
							)}
						</h2>
						{title && <p className="text-sm text-muted-foreground">{title}</p>}
					</div>
				</div>

				{/* Stats */}
				{stats.length > 0 && (
					<div className="flex gap-8 sm:gap-10">
						{stats.map((stat) => (
							<div key={stat.label} className="text-center">
								<span className="block text-xl font-semibold">
									{stat.value}
								</span>
								<span className="text-xs text-muted-foreground">
									{stat.label}
								</span>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Tabs */}
			{tabs.length > 0 && (
				<div className="mt-6 flex gap-8 border-t border-border pt-4">
					{tabs.map((tab) => (
						<button
							key={tab.value}
							onClick={() => onTabChange?.(tab.value)}
							className={cn(
								"pb-2 text-sm transition-colors",
								activeTab === tab.value
									? "border-b-2 border-foreground font-semibold text-foreground"
									: "text-muted-foreground hover:text-foreground",
							)}
							id={`profile-tab-${tab.value}`}
						>
							{tab.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
