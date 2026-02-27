"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
	IconBell,
	IconBolt,
	IconLayoutDashboard,
	IconLogout,
	IconMoon,
	IconSearch,
	IconSun,
} from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/client";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuthStore } from "@/store/useAuthStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import useProfile from "@/hooks/useProfile";

const supabase = createClient();

export function AppHeaderNav() {
	const user = useAuthStore((state) => state.user);
	const { profile } = useProfile();
	const router = useRouter();
	const { unreadCount } = useNotifications();
	const [search, setSearch] = useState("");
	const { theme, resolvedTheme, setTheme } = useTheme();

	const handleLogout = async () => {
		await supabase.auth.signOut();
		window.location.href = "/login";
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		const q = search.trim();
		router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
	};

	const isDark = (resolvedTheme ?? theme) === "dark";
	const canAccessDashboard = profile?.role === "admin" || profile?.role === "moder";

	return (
		<header className="animate-slide-down-soft sticky top-0 z-40 hidden border-b border-border/60 bg-background/85 backdrop-blur-md lg:block">
			<div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4">
				<Link
					href="/"
					className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card/70 px-3 py-1.5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-card"
				>
					<span className="animate-float-soft inline-flex size-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
						<IconBolt className="size-4.5" />
					</span>
					<span className="text-sm font-semibold tracking-tight">Talk N Share</span>
				</Link>

				<form onSubmit={handleSearch} className="ml-auto w-full max-w-sm">
					<div className="relative">
						<IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Tìm bài viết, người dùng..."
							className="h-9 rounded-full pl-9"
						/>
					</div>
				</form>

				<Link
					href="/notify"
					className="relative inline-flex size-9 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
					title="Thông báo"
				>
					<IconBell className="size-5" />
					{unreadCount > 0 && (
						<span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
							{unreadCount > 99 ? "99+" : unreadCount}
						</span>
					)}
				</Link>

				{user && canAccessDashboard && (
					<Button asChild variant="ghost" size="sm" className="rounded-full">
						<Link href="/dashboard">
							<IconLayoutDashboard className="mr-1 size-4" />
							Dashboard
						</Link>
					</Button>
				)}

				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					onClick={() => setTheme(isDark ? "light" : "dark")}
					className="rounded-full border border-border/70 text-muted-foreground hover:bg-muted hover:text-foreground"
					title={isDark ? "Chuyển sang sáng" : "Chuyển sang tối"}
				>
					{isDark ? (
						<IconSun className="size-4.5" />
					) : (
						<IconMoon className="size-4.5" />
					)}
				</Button>

				{user ? (
					<Button
						variant="ghost"
						size="sm"
						onClick={handleLogout}
						className="text-red-500 hover:bg-red-500/10 hover:text-red-600"
					>
						<IconLogout className="mr-1 size-4" />
						Đăng xuất
					</Button>
				) : (
					<Button asChild size="sm" className="rounded-full">
						<Link href="/login">Đăng nhập / Đăng ký</Link>
					</Button>
				)}
			</div>
		</header>
	);
}
