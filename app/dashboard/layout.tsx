"use client";

import React, { useState, useEffect } from "react";
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
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

const sidebarLinks = [
	{
		label: "Overview",
		href: "/dashboard",
		icon: IconLayoutDashboard,
	},
	{
		label: "Posts",
		href: "/dashboard/posts",
		icon: IconArticle,
	},
	{
		label: "Users",
		href: "/dashboard/users",
		icon: IconUsers,
	},
	{
		label: "Comments",
		href: "/dashboard/comments",
		icon: IconMessageCircle,
	},
	{
		label: "Reports",
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
	const { user } = useAuthStore();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // null = loading

	useEffect(() => {
		const checkAdminRole = async () => {
			if (!user) {
				setIsAdmin(false);
				return;
			}

			const { data, error } = await supabase
				.from("profiles")
				.select("role")
				.eq("id", user.id)
				.single();

			if (error || data?.role !== "admin") {
				setIsAdmin(false);
			} else {
				setIsAdmin(true);
			}
		};

		checkAdminRole();
	}, [user]);

	// Loading state
	if (isAdmin === null) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="flex flex-col items-center gap-4 text-center">
					<div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
						<IconLoader2 className="size-8 animate-spin text-primary" />
					</div>
					<div>
						<p className="text-sm font-medium">Verifying access...</p>
						<p className="mt-1 text-xs text-muted-foreground">
							Checking your admin permissions
						</p>
					</div>
				</div>
			</div>
		);
	}

	// Unauthorized state
	if (!isAdmin) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="flex flex-col items-center gap-6 rounded-3xl border border-border/50 bg-card p-10 text-center shadow-xl">
					<div className="flex size-20 items-center justify-center rounded-2xl bg-destructive/10">
						<IconShieldLock className="size-10 text-destructive" />
					</div>
					<div>
						<h1 className="text-xl font-bold">Access Denied</h1>
						<p className="mt-2 max-w-sm text-sm text-muted-foreground">
							You don&apos;t have permission to access the admin dashboard. Only
							users with the <strong>admin</strong> role can view this page.
						</p>
					</div>
					<Button onClick={() => router.push("/")} variant="default" size="lg">
						<IconChevronLeft className="size-4" />
						Back to Home
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen bg-background">
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
					"fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
					sidebarOpen ? "translate-x-0" : "-translate-x-full",
				)}
			>
				{/* Sidebar Header */}
				<div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
					<Link href="/dashboard" className="flex items-center gap-3">
						<div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md">
							<IconLayoutDashboard className="size-5" />
						</div>
						<div>
							<h1 className="text-sm font-semibold text-sidebar-foreground">
								Talk N Share
							</h1>
							<p className="text-xs text-muted-foreground">Admin Dashboard</p>
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
					{sidebarLinks.map((link) => {
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
										? "bg-sidebar-primary/10 text-sidebar-primary shadow-sm"
										: "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
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
				<div className="border-t border-sidebar-border p-4">
					<Link
						href="/"
						className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
					>
						<IconChevronLeft className="size-4" />
						Back to App
					</Link>
				</div>
			</aside>

			{/* Main area */}
			<div className="flex flex-1 flex-col">
				{/* Top bar */}
				<header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-md">
					<Button
						onClick={() => setSidebarOpen(true)}
						className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground lg:hidden"
					>
						<IconMenu2 className="size-5" />
					</Button>
					<div className="flex-1" />
					<div className="flex items-center gap-2">
						<div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/60 to-primary" />
					</div>
				</header>

				{/* Content */}
				<main className="flex-1 overflow-y-auto p-6">{children}</main>
			</div>
		</div>
	);
}
