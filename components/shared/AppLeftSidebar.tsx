"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SidebarProfileCard } from "./SidebarProfileCard";
import { UserProfile } from "@/hooks/useProfile";
import {
	IconHome,
	IconUser,
	IconMessage,
	IconBell,
	IconSearch,
	IconSparkles,
	IconLogout,
} from "@tabler/icons-react";
import { useAuthStore } from "@/store/useAuthStore";
import { createClient } from "@/utils/supabase/client";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { useNotifications } from "@/hooks/useNotifications";

interface AppLeftSidebarProps {
	profile: UserProfile | null;
	className?: string;
}
const supabase = createClient();

const navItems = [
	{ label: "Home", href: "/", icon: IconHome },
	{ label: "Profile", href: "/profile", icon: IconUser },
	{ label: "Messages", href: "/messages", icon: IconMessage },
	{ label: "Notifications", href: "/notify", icon: IconBell },
	{ label: "Search", href: "/search", icon: IconSearch },
	{ label: "Match", href: "/match", icon: IconSparkles },
];

export function AppLeftSidebar({ profile, className }: AppLeftSidebarProps) {
	const user = useAuthStore((state) => state.user);
	const handleLogout = () => {
		supabase.auth.signOut();
		window.location.href = "/login";
		return;
	};
	const { unreadCount } = useUnreadMessages();
	const { unreadCount: unreadNotificationCount } = useNotifications();

	const pathname = usePathname();
	return (
		<aside className={cn("hidden lg:block", className)}>
			<div className="sticky top-6 space-y-4">
				<SidebarProfileCard
					displayName={profile?.display_name ?? "Guest"}
					title={
						profile?.location
							? profile?.location
							: profile?.role === "admin"
								? "Administrator"
								: profile?.role === "moder"
									? "Moderator"
									: "Talk N Share Member"
					}
					avatarUrl={profile?.avatar_url ?? undefined}
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
								<span className="flex items-center gap-2">
									{item.label}
									{item.href === "/messages" && unreadCount > 0 && (
										<span className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white">
											{unreadCount > 99 ? "99+" : unreadCount}
										</span>
									)}
									{item.href === "/notify" && unreadNotificationCount > 0 && (
										<span className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white">
											{unreadNotificationCount > 99
												? "99+"
												: unreadNotificationCount}
										</span>
									)}
								</span>
							</Link>
						);
					})}
					{user && (
						<Link
							href="#"
							onClick={handleLogout}
							className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors text-red-500 hover:bg-red-500/10 hover:text-red-500"
						>
							<IconLogout className="size-5" />
							Logout
						</Link>
					)}
				</nav>
			</div>
		</aside>
	);
}
