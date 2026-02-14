"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	IconBrandNextjs,
	IconBrandSupabase,
	IconBrandTailwind,
	IconBrandReact,
	IconShieldCheck,
	IconGhost,
	IconHeartHandshake,
	IconMessageCircle,
	IconFilter,
	IconUserCheck,
} from "@tabler/icons-react";
import Link from "next/link";
// import {
// 	MainLayout,
// 	AppLeftSidebar,
// 	AppRightSidebar,
// } from "@/components/shared";
import { useAuthStore } from "@/store/useAuthStore";

const features = [
	{
		title: "Anonymous First",
		description:
			"Share your thoughts freely without judgment. Our platform is built on privacy, allowing you to connect authentically.",
		icon: IconGhost,
		color: "text-purple-500",
		bg: "bg-purple-500/10",
	},
	{
		title: "Smart Matching",
		description:
			"Find meaningful connections with filters for gender, location, and interests. No more random swiping.",
		icon: IconFilter,
		color: "text-pink-500",
		bg: "bg-pink-500/10",
	},
	{
		title: "Safe & Moderated",
		description:
			"Advanced AI moderation keeps conversations healthy. We prioritize a toxic-free environment.",
		icon: IconShieldCheck,
		color: "text-emerald-500",
		bg: "bg-emerald-500/10",
	},
	{
		title: "Mutual Reveal",
		description:
			"Identities remain hidden until both parties feel comfortable to connect. It's a double-opt-in for trust.",
		icon: IconUserCheck,
		color: "text-blue-500",
		bg: "bg-blue-500/10",
	},
];

const techStack = [
	{ name: "Next.js 15", icon: IconBrandNextjs },
	{ name: "Supabase", icon: IconBrandSupabase },
	{ name: "Tailwind CSS", icon: IconBrandTailwind },
	{ name: "React Query", icon: IconBrandReact },
];

export default function AboutPage() {
	const { user } = useAuthStore();

	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<section className="relative overflow-hidden py-24 md:py-32">
				<div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
				<div className="container mx-auto px-4 text-center">
					<div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
						<span className="flex size-2 me-2 rounded-full bg-primary animate-pulse" />
						The Future of Social Connection
					</div>
					<h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
						Connect{" "}
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
							Anonymously.
						</span>{" "}
						<br />
						Reveal{" "}
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
							Meaningfully.
						</span>
					</h1>
					<p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
						Talk-N-Share is a next-generation platform that combines the freedom
						of anonymous social networking with the excitement of real-time chat
						matching. Prioritizing privacy, intelligent moderation, and genuine
						human connection.
					</p>
					<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
						<Button
							size="lg"
							className="rounded-full px-8 h-12 text-base"
							asChild
						>
							<Link href={user ? "/match" : "/signup"}>
								{user ? "Start Matching" : "Join the Community"}
							</Link>
						</Button>
						<Button
							size="lg"
							variant="outline"
							className="rounded-full px-8 h-12 text-base"
							asChild
						>
							<Link href="/contact">Get in Touch</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Features Grid */}
			<section className="py-20 bg-muted/30">
				<div className="container mx-auto px-4">
					<div className="mb-16 text-center">
						<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
							Why Talk-N-Share?
						</h2>
						<p className="mt-4 text-muted-foreground">
							Features designed for a modern, safe, and engaging social
							experience.
						</p>
					</div>
					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
						{features.map((feature, index) => (
							<div
								key={index}
								className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
							>
								<div
									className={cn("mb-4 inline-flex rounded-xl p-3", feature.bg)}
								>
									<feature.icon className={cn("size-6", feature.color)} />
								</div>
								<h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
								<p className="text-muted-foreground">{feature.description}</p>
								<div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Tech Stack */}
			<section className="py-20">
				<div className="container mx-auto px-4 text-center">
					<h3 className="mb-10 text-2xl font-semibold text-muted-foreground/80">
						Built with Cutting-Edge Technology
					</h3>
					<div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale transition-all hover:grayscale-0 hover:opacity-100">
						{techStack.map((tech) => (
							<div
								key={tech.name}
								className="flex flex-col items-center gap-2 group"
							>
								<tech.icon className="size-10 md:size-12 text-foreground transition-transform group-hover:scale-110" />
								<span className="text-sm font-medium">{tech.name}</span>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Footer */}
			<section className="border-t bg-card py-16">
				<div className="container mx-auto px-4 text-center">
					<h2 className="mb-6 text-3xl font-bold">Ready to start sharing?</h2>
					<p className="mx-auto mb-8 max-w-xl text-muted-foreground">
						Join thousands of users who are discovering a new way to connect
						online. Safe, private, and fun.
					</p>
					<Button size="lg" className="rounded-full px-10" asChild>
						<Link href="/signup">Create Free Account</Link>
					</Button>
				</div>
			</section>
		</div>
	);
}
