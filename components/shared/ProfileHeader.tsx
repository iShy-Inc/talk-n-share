"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	IconMapPin,
	IconCalendarMonth,
	IconRefresh,
	IconSparkles,
	IconHeart,
} from "@tabler/icons-react";
import { useProfileCover } from "@/hooks/useProfileCover";
import { formatDateDDMMYYYY } from "@/utils/helpers/date";
import type { Profile } from "@/types/supabase";
import { RoleVerifiedBadge } from "@/components/shared/RoleVerifiedBadge";

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
	role?: Profile["role"] | null;
	title?: string;
	avatarUrl?: string;
	joinDate?: string;
	bio?: string;
	birthday?: string;
	zodiac?: string;
	relationship?: string;
	actionSlot?: ReactNode;
	stats?: ProfileStat[];
	tabs?: ProfileTab[];
	activeTab?: string;
	onTabChange?: (tab: string) => void;
}

const BIO_PREVIEW_CHAR_LIMIT = 220;

export function ProfileHeader({
	name,
	username,
	role,
	title,
	avatarUrl,
	joinDate,
	bio,
	birthday,
	zodiac,
	relationship,
	actionSlot,
	stats = [],
	tabs = [],
	activeTab,
	onTabChange,
}: ProfileHeaderProps) {
	const { coverUrl, activeCoverUrl, markCoverAsFailed, refreshCover } =
		useProfileCover();
	const [isBioExpanded, setIsBioExpanded] = useState(false);

	const formattedJoinDate = formatDateDDMMYYYY(joinDate);
	const normalizedBio = bio?.trim() ?? "";
	const shouldTruncateBio = normalizedBio.length > BIO_PREVIEW_CHAR_LIMIT;
	const bioPreview = shouldTruncateBio
		? `${normalizedBio.slice(0, BIO_PREVIEW_CHAR_LIMIT).trimEnd()}...`
		: normalizedBio;

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
					className="absolute right-3 bottom-3 z-10 size-7 rounded-full bg-black/55 text-white hover:bg-black/70 md:top-3 md:bottom-auto"
					onClick={refreshCover}
					title="Làm mới ảnh bìa"
				>
					<IconRefresh className="size-4" />
				</Button>
			</div>

			<div className="relative z-10 px-5 pb-4 md:px-7">
				<div className="relative z-20 -mt-14 flex items-end gap-4">
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
				</div>

				<div className="flex justify-between items-center mt-3">
					<div className="mt-0">
						<div className="flex items-center gap-2">
							<h2 className="text-xl font-bold tracking-tight">{name}</h2>
							<RoleVerifiedBadge role={role} />
						</div>
						{username && <p className="text-sm text-foreground/75">@{username}</p>}
					</div>
					{joinDate && (
						<div className="mt-2 flex flex-col items-end gap-2 text-xs text-foreground/70">
							{actionSlot}
							<span className="inline-flex items-center gap-1.5">
								<IconCalendarMonth className="size-4" />
								Tham gia từ {formattedJoinDate}
							</span>
						</div>
					)}
				</div>

				{bio && (
					<div className="mt-3">
						<p className="max-w-full whitespace-pre-line break-words text-sm text-foreground [overflow-wrap:anywhere]">
							{isBioExpanded ? normalizedBio : bioPreview}
						</p>
						{shouldTruncateBio && (
							<button
								type="button"
								onClick={() => setIsBioExpanded((prev) => !prev)}
								className="mt-1 text-sm font-medium text-foreground/75 transition-colors hover:text-foreground"
							>
								{isBioExpanded ? "Thu gọn" : "Hiện thêm"}
							</button>
						)}
					</div>
				)}

					{(title || birthday || zodiac || relationship) && (
						<div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground/70">
						{title && (
							<span className="inline-flex items-center gap-1.5">
								<IconMapPin className="size-4" />
								{title}
							</span>
						)}
						{birthday && (
							<span className="inline-flex items-center gap-1.5">
								<IconCalendarMonth className="size-4" />
								Sinh nhật: {birthday}
							</span>
						)}
						{zodiac && (
							<span className="inline-flex items-center gap-1.5">
								<IconSparkles className="size-4" />
								{zodiac}
							</span>
						)}
						{relationship && (
							<span className="inline-flex items-center gap-1.5">
								<IconHeart className="size-4" />
								{relationship}
							</span>
						)}
					</div>
				)}

				{stats.length > 0 && (
					<div className="mt-4 flex flex-wrap items-center gap-5">
						{stats.map((stat) => (
							<div key={stat.label} className="text-sm">
								<span className="font-semibold text-foreground">
									{stat.value}
								</span>
								<span className="ml-1 text-foreground/70">{stat.label}</span>
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
