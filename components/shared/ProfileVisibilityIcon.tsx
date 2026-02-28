"use client";

import { Globe, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileVisibilityIconProps {
	isPublic?: boolean | null;
	className?: string;
}

export function ProfileVisibilityIcon({
	isPublic = true,
	className,
}: ProfileVisibilityIconProps) {
	if (isPublic) {
		return (
			<span
				className="inline-flex"
				aria-label="Tài khoản công khai"
				title="Tài khoản công khai"
			>
				<Globe className={cn("size-4 text-emerald-600", className)} />
			</span>
		);
	}

	return (
		<span
			className="inline-flex"
			aria-label="Tài khoản riêng tư"
			title="Tài khoản riêng tư"
		>
			<Lock className={cn("size-4 text-amber-600", className)} />
		</span>
	);
}
