"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
	children: ReactNode;
	leftSidebar: ReactNode;
	rightSidebar: ReactNode;
	className?: string;
}

export function MainLayout({
	children,
	leftSidebar,
	rightSidebar,
	className,
}: MainLayoutProps) {
	return (
		<div
			className={cn(
				"mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 pt-6 pb-24 lg:grid-cols-[260px_1fr_300px] lg:pb-6",
				className,
			)}
		>
			{/* Left Sidebar */}
			{leftSidebar}

			{/* Center Content */}
			<main className="min-w-0 space-y-5">{children}</main>

			{/* Right Sidebar */}
			{rightSidebar}
		</div>
	);
}
