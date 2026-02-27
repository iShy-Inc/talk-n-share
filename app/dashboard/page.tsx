"use client";

import React from "react";
import { useDashboardStats } from "@/hooks/useDashboard";
import { useAdminRole } from "@/hooks/useAdminRole";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import {
	IconArticle,
	IconUsers,
	IconMessageCircle,
	IconFlag,
	IconClock,
	IconAlertTriangle,
} from "@tabler/icons-react";

export default function DashboardPage() {
	const { data: stats, isLoading } = useDashboardStats();
	const { isModer } = useAdminRole();

	const statCards = [
		{
			label: "Tổng bài viết",
			value: stats?.totalPosts ?? 0,
			icon: IconArticle,
			gradient: "from-emerald-500 to-teal-600",
			bgGlow: "bg-emerald-500/10",
		},
		{
			label: "Tổng người dùng",
			value: stats?.totalUsers ?? 0,
			icon: IconUsers,
			gradient: "from-blue-500 to-indigo-600",
			bgGlow: "bg-blue-500/10",
		},
		{
			label: "Tổng bình luận",
			value: stats?.totalComments ?? 0,
			icon: IconMessageCircle,
			gradient: "from-violet-500 to-purple-600",
			bgGlow: "bg-violet-500/10",
		},
		{
			label: "Tổng báo cáo",
			value: stats?.totalReports ?? 0,
			icon: IconFlag,
			gradient: "from-rose-500 to-red-600",
			bgGlow: "bg-rose-500/10",
		},
	];

	const alertCards = [
		{
			label: "Bài viết chờ duyệt",
			value: stats?.pendingPosts ?? 0,
			description: "Posts awaiting approval",
			icon: IconClock,
			color: "text-amber-500",
			bg: "bg-amber-500/10",
		},
		{
			label: "Báo cáo chờ xử lý",
			value: stats?.pendingReports ?? 0,
			description: "Reports needing review",
			icon: IconAlertTriangle,
			color: "text-rose-500",
			bg: "bg-rose-500/10",
		},
	];

	return (
		<div className="space-y-7">
			{/* Page Title */}
			<div className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur-sm">
				<h1 className="text-2xl font-bold tracking-tight">Trung tâm vận hành</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					A clean overview of platform health, moderation load, and key actions.
				</p>
			</div>

			{/* Stats Grid */}
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{statCards.map((card) => (
					<Card
						key={card.label}
						className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
					>
						<div className={`absolute inset-0 ${card.bgGlow} opacity-35`} />
						<CardContent className="relative p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-muted-foreground">
										{card.label}
									</p>
									<p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
										{isLoading ? (
											<span className="inline-block h-9 w-16 animate-pulse rounded-lg bg-muted" />
										) : (
											card.value.toLocaleString()
										)}
									</p>
								</div>
								<div
									className={`flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.gradient} text-white shadow-sm`}
								>
									<card.icon className="size-6" />
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Alerts */}
			<div className="grid gap-4 sm:grid-cols-2">
				{alertCards.map((card) => (
					<Card
						key={card.label}
						className="rounded-2xl border border-border/70 bg-card/90 shadow-sm transition-all duration-300 hover:shadow-md"
					>
						<CardHeader>
							<div className="flex items-center gap-3">
								<div
									className={`flex size-10 items-center justify-center rounded-xl ${card.bg}`}
								>
									<card.icon className={`size-5 ${card.color}`} />
								</div>
								<div>
									<CardTitle className="text-base">{card.label}</CardTitle>
									<CardDescription>{card.description}</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-4xl font-bold tracking-tight">
								{isLoading ? (
									<span className="inline-block h-10 w-16 animate-pulse rounded-lg bg-muted" />
								) : (
									card.value.toLocaleString()
								)}
							</p>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Quick info */}
			<Card className="rounded-2xl border border-border/70 bg-card/90 shadow-sm">
				<CardHeader>
					<CardTitle>Thao tác nhanh</CardTitle>
					<CardDescription>
						Navigate to manage your platform content
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
						{[
							{
								label: "Quản lý bài viết",
								href: "/dashboard/posts",
								icon: IconArticle,
								desc: "Review, approve or remove posts",
							},
							{
								label: "Quản lý người dùng",
								href: "/dashboard/users",
								icon: IconUsers,
								desc: "View and manage user profiles",
							},
							{
								label: "Quản lý bình luận",
								href: "/dashboard/comments",
								icon: IconMessageCircle,
								desc: "Moderate user comments",
							},
							{
								label: "Quản lý báo cáo",
								href: "/dashboard/reports",
								icon: IconFlag,
								desc: "Review and resolve reports",
							},
						]
							.filter(
								(action) => !(isModer && action.href === "/dashboard/users"),
							)
							.map((action) => (
								<a
									key={action.label}
									href={action.href}
									className="group flex flex-col gap-2 rounded-2xl border border-border/50 p-4 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:shadow-md"
								>
									<div className="flex size-10 items-center justify-center rounded-xl bg-muted transition-colors group-hover:bg-primary/10">
										<action.icon className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
									</div>
									<div>
										<p className="text-sm font-semibold">{action.label}</p>
										<p className="text-xs text-muted-foreground">
											{action.desc}
										</p>
									</div>
								</a>
							))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
