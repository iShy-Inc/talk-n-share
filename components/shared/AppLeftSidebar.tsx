"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SidebarProfileCard } from "./SidebarProfileCard";
import {
	IconHome,
	IconUser,
	IconMessage,
	IconBell,
	IconSearch,
	IconSparkles,
} from "@tabler/icons-react";

interface AppLeftSidebarProps {
	profile: {
		display_name?: string;
		email?: string;
		location?: string;
		avatar_url?: string;
		role?: "admin" | "moder" | "user";
	} | null;
	className?: string;
}

const navItems = [
	{ label: "Home", href: "/", icon: IconHome },
	{ label: "Profile", href: "/profile", icon: IconUser },
	{ label: "Messages", href: "/messages", icon: IconMessage },
	{ label: "Notifications", href: "/notify", icon: IconBell },
	{ label: "Search", href: "/search", icon: IconSearch },
	{ label: "Match", href: "/match", icon: IconSparkles },
];

export function AppLeftSidebar({ profile, className }: AppLeftSidebarProps) {
	const pathname = usePathname();
	console.log(profile);
	return (
		<aside className={cn("hidden lg:block", className)}>
			<div className="sticky top-6 space-y-4">
				<SidebarProfileCard
					displayName={profile?.display_name ?? profile?.email ?? "Guest"}
					title={
						profile?.location
							? profile?.location
							: profile?.role === "admin"
								? "Administrator"
								: profile?.role === "moder"
									? "Moderator"
									: "Talk N Share Member"
					}
					avatarUrl={profile?.avatar_url}
				/>

				<nav className="space-y-1">
					{navItems.map((item) => {
						const isActive =
							pathname === item.href ||
							(item.href !== "/" && pathname.startsWith(item.href));
						return (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									"flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors",
									isActive
										? "bg-muted font-semibold text-foreground"
										: "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
								)}
							>
								<item.icon className="size-5" />
								{item.label}
							</Link>
						);
					})}
				</nav>
			</div>
		</aside>
	);
}
