"use client";

import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AuthHomeLink({ className }: { className?: string }) {
	return (
		<Button
			asChild
			variant="outline"
			size="sm"
			className={cn(
				"rounded-full border-border/70 bg-background/90 backdrop-blur-sm",
				className,
			)}
		>
			<Link href="/">
				<IconArrowLeft className="size-4" />
				Trang chủ
			</Link>
		</Button>
	);
}
