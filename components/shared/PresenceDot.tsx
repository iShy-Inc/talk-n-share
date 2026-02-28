"use client";

import { cn } from "@/lib/utils";

interface PresenceDotProps {
	isOnline: boolean;
	className?: string;
}

export function PresenceDot({ isOnline, className }: PresenceDotProps) {
	return (
		<span
			className={cn(
				"absolute bottom-0 right-0 block rounded-full ring-2 ring-background",
				isOnline ? "bg-emerald-500" : "bg-slate-400",
				className,
			)}
			aria-hidden
			title={isOnline ? "Online" : "Offline"}
		/>
	);
}
