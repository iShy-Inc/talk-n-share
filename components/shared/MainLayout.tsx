"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
	children: ReactNode;
	leftSidebar: ReactNode;
	rightSidebar: ReactNode;
	hideSidebars?: boolean;
	className?: string;
}

export function MainLayout({
	children,
	leftSidebar,
	rightSidebar,
	hideSidebars = false,
	className,
}: MainLayoutProps) {
	return (
		<div
			className={cn(
				"mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 pt-6 pb-24 lg:pb-6",
				hideSidebars ? "lg:max-w-5xl" : "lg:grid-cols-[260px_1fr_300px]",
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
