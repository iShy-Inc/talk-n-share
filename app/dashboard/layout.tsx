"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
	IconLayoutDashboard,
	IconArticle,
	IconUsers,
	IconMessageCircle,
	IconFlag,
	IconMenu2,
	IconX,
	IconChevronLeft,
	IconShieldLock,
	IconLoader2,
	IconShield,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useAdminRole } from "@/hooks/useAdminRole";

const sidebarLinks = [
	{
		label: "Tổng quan",
		href: "/dashboard",
		icon: IconLayoutDashboard,
	},
	{
		label: "Bài viết",
		href: "/dashboard/posts",
		icon: IconArticle,
	},
	{
		label: "Người dùng",
		href: "/dashboard/users",
		icon: IconUsers,
	},
	{
		label: "Bình luận",
		href: "/dashboard/comments",
		icon: IconMessageCircle,
	},
	{
		label: "Báo cáo",
		href: "/dashboard/reports",
		icon: IconFlag,
	},
];

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const router = useRouter();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const { hasAccess, isModer, loading, role } = useAdminRole();

	const filteredSidebarLinks = sidebarLinks.filter((link) => {
		if (isModer && link.href === "/dashboard/users") return false;
		return true;
	});
	const currentSection =
		filteredSidebarLinks.find(
			(link) =>
				pathname === link.href ||
				(link.href !== "/dashboard" && pathname.startsWith(link.href)),
		)?.label ?? "Bảng điều khiển";

	// Loading state
	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="flex flex-col items-center gap-4 text-center">
					<div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
						<IconLoader2 className="size-8 animate-spin text-primary" />
					</div>
					<div>
						<p className="text-sm font-medium">Đang xác minh quyền truy cập...</p>
						<p className="mt-1 text-xs text-muted-foreground">
							Đang kiểm tra quyền quản trị của bạn
						</p>
					</div>
				</div>
			</div>
		);
	}

	// Unauthorized state
	if (!hasAccess) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="flex flex-col items-center gap-6 rounded-3xl border border-border/50 bg-card p-10 text-center shadow-xl">
					<div className="flex size-20 items-center justify-center rounded-2xl bg-destructive/10">
						<IconShieldLock className="size-10 text-destructive" />
					</div>
					<div>
						<h1 className="text-xl font-bold">Truy cập bị từ chối</h1>
						<p className="mt-2 max-w-sm text-sm text-muted-foreground">
							Bạn không có quyền truy cập bảng điều khiển.
						</p>
					</div>
					<Button onClick={() => router.push("/")} variant="default" size="lg">
						<IconChevronLeft className="size-4" />
						Về trang chủ
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.08),transparent_38%),radial-gradient(circle_at_85%_0%,hsl(var(--ring)/0.08),transparent_35%),hsl(var(--background))]">
			{/* Mobile overlay */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={cn(
					"fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border/70 bg-sidebar/95 backdrop-blur-md transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
					sidebarOpen ? "translate-x-0" : "-translate-x-full",
				)}
			>
				{/* Sidebar Header */}
				<div className="flex h-16 items-center justify-between border-b border-sidebar-border/70 px-6">
					<Link href="/dashboard" className="flex items-center gap-3">
						<div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md">
							<IconLayoutDashboard className="size-5" />
						</div>
						<div className="space-y-0.5">
							<h1 className="text-sm font-semibold text-sidebar-foreground">
								Talk N Share
							</h1>
							<p className="text-xs text-muted-foreground">
								{isModer ? "Không gian kiểm duyệt" : "Không gian quản trị"}
							</p>
						</div>
					</Link>
					<Button
						onClick={() => setSidebarOpen(false)}
						className="rounded-lg p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:hidden"
					>
						<IconX className="size-5" />
					</Button>
				</div>

				{/* Nav links */}
				<nav className="flex-1 space-y-1 px-3 py-4">
					{filteredSidebarLinks.map((link) => {
						const isActive =
							pathname === link.href ||
							(link.href !== "/dashboard" && pathname.startsWith(link.href));
						return (
							<Link
								key={link.href}
								href={link.href}
								onClick={() => setSidebarOpen(false)}
								className={cn(
									"group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
									isActive
										? "bg-sidebar-primary/12 text-sidebar-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.25)]"
										: "text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
								)}
							>
								<link.icon
									className={cn(
										"size-5 transition-colors",
										isActive
											? "text-sidebar-primary"
											: "text-muted-foreground group-hover:text-sidebar-accent-foreground",
									)}
								/>
								{link.label}
								{isActive && (
									<div className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
								)}
							</Link>
						);
					})}
				</nav>

				{/* Sidebar Footer */}
				<div className="border-t border-sidebar-border/70 p-4">
					<Link
						href="/"
						className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
					>
						<IconChevronLeft className="size-4" />
						Quay lại ứng dụng
					</Link>
				</div>
			</aside>

			{/* Main area */}
			<div className="flex min-w-0 flex-1 flex-col">
				{/* Top bar */}
				<header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/70 bg-background/70 px-3 backdrop-blur-md sm:px-4 lg:px-6">
					<Button
						onClick={() => setSidebarOpen(true)}
						className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground lg:hidden"
					>
						<IconMenu2 className="size-5" />
					</Button>
					<div className="flex-1">
						<p className="text-sm font-semibold">{currentSection}</p>
					</div>
					<div className="flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1.5 text-xs text-muted-foreground">
						<IconShield className="size-3.5" />
						<span className="capitalize">{role ?? "kiểm duyệt"}</span>
					</div>
				</header>

				{/* Content */}
				<main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
					<div className="mx-auto w-full max-w-7xl">{children}</div>
				</main>
			</div>
		</div>
	);
}
