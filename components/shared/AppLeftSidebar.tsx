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
	IconSparkles,
} from "@tabler/icons-react";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";

interface AppLeftSidebarProps {
	profile: UserProfile | null;
	className?: string;
}

const navItems = [
	{ label: "Trang chủ", href: "/", icon: IconHome },
	{ label: "Hồ sơ", href: "/profile", icon: IconUser },
	{ label: "Tin nhắn", href: "/messages", icon: IconMessage },
	{ label: "Ghép đôi", href: "/match", icon: IconSparkles },
];

export function AppLeftSidebar({ profile, className }: AppLeftSidebarProps) {
	const { unreadCount } = useUnreadMessages();

	const pathname = usePathname();
	return (
		<aside className={cn("hidden animate-fade-up lg:block", className)}>
			<div className="sticky top-6 space-y-4">
				<SidebarProfileCard
					userId={profile?.id}
					displayName={profile?.display_name ?? "Guest"}
					role={profile?.role}
					isPublic={profile?.is_public}
					title={
						profile?.location
							? profile?.location
							: profile?.role === "admin"
								? "Quản trị viên"
								: profile?.role === "moder"
									? "Kiểm duyệt viên"
									: "Thành viên Talk N Share"
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
									"group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 ease-out",
									isActive
										? "bg-accent/50 font-semibold text-foreground shadow-sm"
										: "text-muted-foreground hover:bg-accent/60 hover:text-foreground hover:translate-x-1",
								)}
							>
								<item.icon
									className={cn(
										"size-5 transition-all duration-200 ease-out",
										isActive
											? "text-primary"
											: "group-hover:-translate-y-0.5 group-hover:text-primary",
									)}
								/>
								<span className="flex items-center gap-2">
									<span className="inline-block transition-all duration-200 ease-out group-hover:tracking-[0.01em]">
									{item.label}
									</span>
									{item.href === "/messages" && unreadCount > 0 && (
										<span className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white">
											{unreadCount > 99 ? "99+" : unreadCount}
										</span>
									)}
								</span>
							</Link>
						);
					})}
				</nav>
			</div>
		</aside>
	);
}
