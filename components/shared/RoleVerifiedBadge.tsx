"use client";

import { BadgeCheck, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/supabase";

interface RoleVerifiedBadgeProps {
	role?: Profile["role"] | null;
	className?: string;
}

export function RoleVerifiedBadge({ role, className }: RoleVerifiedBadgeProps) {
	if (role === "admin") {
		return (
			<span
				className={cn(
					"inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-2 py-0.5 text-[11px] font-medium text-sky-700 dark:text-sky-300",
					className,
				)}
				title="Quản trị viên đã xác minh"
			>
				<ShieldCheck className="size-3.5" />
				Admin
			</span>
		);
	}

	if (role === "moder") {
		return (
			<span
				className={cn(
					"inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300",
					className,
				)}
				title="Kiểm duyệt viên đã xác minh"
			>
				<BadgeCheck className="size-3.5" />
				Moderator
			</span>
		);
	}

	return null;
}
