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
	IconMoon,
	IconSun,
	IconLayoutDashboard,
	IconMenu2,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/store/useAuthStore";
import { createClient } from "@/utils/supabase/client";
import { IconLogout } from "@tabler/icons-react";
import useProfile from "@/hooks/useProfile";

const navItems = [
	{ href: "/", icon: IconHome, key: "home" },
	{ href: "/search", icon: IconSearch, key: "search" },
	{ href: "/match", icon: IconSparkles, key: "match" },
	{ href: "/messages", icon: IconMessage, key: "messages" },
	{ href: "/notify", icon: IconBell, key: "notify" },
	{ href: "/profile", icon: IconUser, key: "profile" },
];

export function MobileDock() {
	const pathname = usePathname();
	const user = useAuthStore((state) => state.user);
	const { profile } = useProfile();
	const { unreadCount: unreadMessageCount } = useUnreadMessages();
	const { unreadCount: unreadNotificationCount } = useNotifications();
	const { theme, resolvedTheme, setTheme } = useTheme();
	const isDark = (resolvedTheme ?? theme) === "dark";
	const canAccessDashboard =
		profile?.role === "admin" || profile?.role === "moder";
	const showHomeShortcut =
		pathname === "/about" ||
		pathname === "/contact" ||
		pathname.startsWith("/match") ||
		pathname.startsWith("/messages");
	const supabase = createClient();

	const handleLogout = async () => {
		await supabase.auth.signOut();
		window.location.href = "/login";
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
		<div className="fixed bottom-0 left-0 right-0 z-50 animate-fade-in-soft lg:hidden">
			<div className="pointer-events-none mx-auto w-full max-w-xl px-4">
				<Sheet>
					<SheetTrigger asChild>
						<Button
							type="button"
							size="icon"
							variant="outline"
							className="pointer-events-auto fixed bottom-20 right-4 z-[60] size-11 rounded-full border border-border/80 shadow-lg backdrop-blur"
							title="Mở menu nhanh"
						>
							<IconMenu2 className="size-5" />
						</Button>
					</SheetTrigger>
					<SheetContent side="top" className="mx-auto max-w-xl">
						<SheetHeader className="pr-10 text-left">
							<SheetTitle>Menu nhanh</SheetTitle>
							<SheetDescription>
								Các thao tác điều hướng và tùy chọn nhanh cho mobile.
							</SheetDescription>
						</SheetHeader>

						<div className="mt-4 grid gap-2">
							{showHomeShortcut && (
								<SheetClose asChild>
									<Button
										asChild
										type="button"
										variant="outline"
										className="h-11 justify-start rounded-2xl"
									>
										<Link href="/">
											<IconHome className="mr-2 size-4" />
											Trang chủ
										</Link>
									</Button>
								</SheetClose>
							)}

							<SheetClose asChild>
								<Button
									type="button"
									variant="outline"
									className="h-11 justify-start rounded-2xl"
									onClick={() => setTheme(isDark ? "light" : "dark")}
								>
									{isDark ? (
										<IconSun className="mr-2 size-4" />
									) : (
										<IconMoon className="mr-2 size-4" />
									)}
									{isDark ? "Chuyển sang sáng" : "Chuyển sang tối"}
								</Button>
							</SheetClose>

							{user && canAccessDashboard && (
								<SheetClose asChild>
									<Button
										asChild
										type="button"
										variant="outline"
										className="h-11 justify-start rounded-2xl"
									>
										<Link href="/dashboard">
											<IconLayoutDashboard className="mr-2 size-4" />
											Dashboard
										</Link>
									</Button>
								</SheetClose>
							)}

							{user && (
								<SheetClose asChild>
									<Button
										type="button"
										variant="outline"
										onClick={handleLogout}
										className="h-11 justify-start rounded-2xl text-red-600"
									>
										<IconLogout className="mr-2 size-4" />
										Đăng xuất
									</Button>
								</SheetClose>
							)}
						</div>
					</SheetContent>
				</Sheet>
			</div>
			<div className="border-t border-border/70 bg-background/95 backdrop-blur">
				<nav className="mx-auto flex h-16 w-full max-w-xl items-center justify-around px-1">
					{navItems.map((item) => {
						const isActive =
							pathname === item.href ||
							(item.href !== "/" && pathname.startsWith(item.href));

						return (
							<Link
								key={item.key}
								href={item.href}
								className={cn(
									"relative flex size-11 items-center justify-center rounded-full transition-all duration-300",
									isActive
										? "bg-primary/10 text-foreground"
										: "text-foreground/70 hover:bg-accent hover:text-foreground",
								)}
							>
								<item.icon
									className={cn(
										"size-6 transition-transform",
										isActive && "scale-105",
									)}
									stroke={isActive ? 2.6 : 2.2}
								/>
								{item.href === "/messages" && unreadMessageCount > 0 && (
									<span className="absolute right-0 top-0 inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
										{unreadMessageCount > 99 ? "99+" : unreadMessageCount}
									</span>
								)}
								{item.href === "/notify" && unreadNotificationCount > 0 && (
									<span className="absolute right-0 top-0 inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
										{unreadNotificationCount > 99
											? "99+"
											: unreadNotificationCount}
									</span>
								)}
							</Link>
						);
					})}
				</nav>
			</div>
		</div>
	);
}
