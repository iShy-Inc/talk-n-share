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
import { ProfileVisibilityIcon } from "@/components/shared/ProfileVisibilityIcon";
import { useIsUserOnline } from "@/hooks/usePresence";
import { PresenceDot } from "@/components/shared/PresenceDot";

export interface ProfileStat {
	label: string;
	value: number | string;
}

export interface ProfileTab {
	label: string;
	value: string;
}

interface ProfileHeaderProps {
	userId?: string;
	name: string;
	username?: string;
	role?: Profile["role"] | null;
	isPublic?: boolean | null;
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
	userId,
	name,
	username,
	role,
	isPublic,
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
	const isOnline = useIsUserOnline(userId);

	const formattedJoinDate = formatDateDDMMYYYY(joinDate);
	const normalizedBio = bio?.trim() ?? "";
	const shouldTruncateBio = normalizedBio.length > BIO_PREVIEW_CHAR_LIMIT;
	const bioPreview = shouldTruncateBio
		? `${normalizedBio.slice(0, BIO_PREVIEW_CHAR_LIMIT).trimEnd()}...`
		: normalizedBio;

	return (
		<div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
			<div className="relative z-0 h-28 w-full overflow-hidden bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.45),transparent_55%),radial-gradient(circle_at_80%_10%,hsl(var(--ring)/0.35),transparent_50%),linear-gradient(135deg,hsl(var(--primary)/0.18),hsl(var(--background)))] md:h-36">
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
					className="absolute top-3 right-3 z-10 size-7 rounded-full bg-black/55 text-white hover:bg-black/70 md:top-auto md:right-3 md:bottom-3"
					onClick={refreshCover}
					title="Làm mới ảnh bìa"
				>
					<IconRefresh className="size-4" />
				</Button>
			</div>

			<div className="relative z-10 px-4 pb-4 md:px-7">
				<div className="relative z-20 -mt-10 flex items-end gap-4 md:-mt-14">
					<div className="relative z-20 shrink-0">
						{avatarUrl ? (
							<img
								src={avatarUrl}
								alt={name}
								className="size-20 rounded-full border-4 border-card object-cover md:size-28"
							/>
						) : (
							<div className="flex size-20 items-center justify-center rounded-full border-4 border-card bg-primary/10 text-3xl font-bold text-primary md:size-28 md:text-4xl">
								{name[0]?.toUpperCase()}
							</div>
						)}
						{userId && (
							<PresenceDot
								isOnline={isOnline}
								className="size-4 md:size-5"
							/>
						)}
					</div>
				</div>

				<div className="mt-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-2">
							<h2 className="min-w-0 break-words text-lg font-bold tracking-tight md:text-xl">
								{name}
							</h2>
							<ProfileVisibilityIcon isPublic={isPublic} />
							<RoleVerifiedBadge role={role} />
						</div>
						{username && (
							<p className="mt-1 break-all text-sm text-foreground/75">
								@{username}
							</p>
						)}
					</div>
					{(actionSlot || joinDate) && (
						<div className="flex w-full flex-col gap-2 text-xs text-foreground/70 md:w-auto md:shrink-0 md:items-end">
							{actionSlot ? (
								<div className="w-full md:w-auto [&>*]:w-full md:[&>*]:w-auto">
									{actionSlot}
								</div>
							) : null}
							{joinDate && (
								<span className="inline-flex items-center gap-1.5 md:justify-end">
									<IconCalendarMonth className="size-4" />
									Tham gia từ {formattedJoinDate}
								</span>
							)}
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
					<div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-foreground/70 md:gap-x-4 md:gap-y-1">
						{title && (
							<span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 md:rounded-none md:bg-transparent md:px-0 md:py-0">
								<IconMapPin className="size-4" />
								{title}
							</span>
						)}
						{birthday && (
							<span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 md:rounded-none md:bg-transparent md:px-0 md:py-0">
								<IconCalendarMonth className="size-4" />
								{birthday}
							</span>
						)}
						{zodiac && (
							<span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 md:rounded-none md:bg-transparent md:px-0 md:py-0">
								<IconSparkles className="size-4" />
								{zodiac}
							</span>
						)}
						{relationship && (
							<span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 md:rounded-none md:bg-transparent md:px-0 md:py-0">
								<IconHeart className="size-4" />
								{relationship}
							</span>
						)}
					</div>
				)}

				{stats.length > 0 && (
					<div className="mt-4 grid grid-cols-2 gap-2 md:flex md:flex-wrap md:items-center md:gap-5">
						{stats.map((stat) => (
							<div
								key={stat.label}
								className="rounded-xl bg-muted/45 px-3 py-2 text-sm md:rounded-none md:bg-transparent md:px-0 md:py-0"
							>
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
					<div className="flex gap-1 overflow-x-auto px-2 py-2 md:grid md:grid-cols-2 md:gap-0 md:px-0 md:py-0 lg:grid-cols-3">
						{tabs.map((tab) => (
							<button
								key={tab.value}
								onClick={() => onTabChange?.(tab.value)}
								className={cn(
									"group relative shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ease-out md:rounded-none md:px-3 md:py-3",
									activeTab === tab.value
										? "bg-accent/35 text-foreground"
										: "text-muted-foreground hover:bg-accent/55 hover:text-foreground hover:-translate-y-0.5",
								)}
								id={`profile-tab-${tab.value}`}
							>
								<span className="inline-block transition-all duration-200 ease-out group-hover:tracking-[0.01em] group-hover:translate-y-[-1px]">
									{tab.label}
								</span>
								{activeTab === tab.value && (
									<span className="absolute bottom-1 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-primary transition-all duration-200 md:bottom-0 md:w-12" />
								)}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
