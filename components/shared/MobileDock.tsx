"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	IconHome,
	IconUser,
	IconMessage,
	IconBell,
	IconSearch,
	IconSparkles,
	IconLogout,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { createClient } from "@/utils/supabase/client";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { useNotifications } from "@/hooks/useNotifications";

const navItems = [
	{ label: "Home", href: "/", icon: IconHome },
	{ label: "Profile", href: "/profile", icon: IconUser },
	{ label: "Messages", href: "/messages", icon: IconMessage },
	{ label: "Notifications", href: "/notify", icon: IconBell },
	{ label: "Search", href: "/search", icon: IconSearch },
	{ label: "Match", href: "/match", icon: IconSparkles },
];
const supabase = createClient();

export function MobileDock() {
	const pathname = usePathname();
	const user = useAuthStore((state) => state.user);
	const { unreadCount: unreadMessageCount } = useUnreadMessages();
	const { unreadCount: unreadNotificationCount } = useNotifications();
	const handleLogout = () => {
		supabase.auth.signOut();
		window.location.href = "/login";
		return;
	};
	// Don't show on auth pages or dashboard
	if (
		pathname.startsWith("/login") ||
		pathname.startsWith("/signup") ||
		pathname.startsWith("/onboarding") ||
		pathname.startsWith("/dashboard")
	) {
		return null;
	}

	return (
		<div className="fixed bottom-4 left-4 right-4 z-50 lg:hidden">
			<nav className="flex items-center justify-around rounded-2xl border border-border/50 bg-background/80 p-2 shadow-lg backdrop-blur-md">
				{navItems.map((item) => {
					const isActive =
						pathname === item.href ||
						(item.href !== "/" && pathname.startsWith(item.href));

					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"relative flex flex-col items-center justify-center gap-0.5 rounded-xl px-4 py-2 text-xs font-medium transition-all duration-300",
								isActive
									? "bg-primary/10 text-primary"
									: "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
							)}
						>
							<item.icon
								className={cn(
									"size-6 transition-transform",
									isActive && "scale-110",
								)}
								stroke={isActive ? 2.5 : 2}
							/>
							<span
								className={cn(
									"text-[10px]",
									isActive ? "font-semibold" : "font-normal",
								)}
							>
								{item.label}
							</span>
							{item.href === "/messages" && unreadMessageCount > 0 && (
								<span className="absolute right-2 top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
									{unreadMessageCount > 99 ? "99+" : unreadMessageCount}
								</span>
							)}
							{item.href === "/notify" && unreadNotificationCount > 0 && (
								<span className="absolute right-2 top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
									{unreadNotificationCount > 99
										? "99+"
										: unreadNotificationCount}
								</span>
							)}
						</Link>
					);
				})}
				{user && (
					<Link
						href="#"
						onClick={handleLogout}
						className="text-red-500 hover:text-red-600 flex flex-col items-center justify-center gap-0.5 rounded-xl px-4 py-2 text-xs font-medium transition-all duration-300"
					>
						<IconLogout className="size-5" />
						Logout
					</Link>
				)}
			</nav>
		</div>
	);
}
