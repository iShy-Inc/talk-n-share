"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconSearch, IconX } from "@tabler/icons-react";
import {
	MainLayout,
	AppLeftSidebar,
	AppRightSidebar,
	SuggestedFriend,
	UserResultCard,
} from "@/components/shared";
import { PostCard } from "@/components/feed/PostCard";
import { Post } from "@/types";
import { cn } from "@/lib/utils";

const supabase = createClient();

type Tab = "all" | "posts" | "people";

export default function SearchPage() {
	const user = useAuthStore((state) => state.user);
	const router = useRouter();
	const searchParams = useSearchParams();
	const query = searchParams.get("q") || "";

	const [searchInput, setSearchInput] = useState(query);
	const [activeTab, setActiveTab] = useState<Tab>("all");

	// Update input when URL query changes
	useEffect(() => {
		setSearchInput(query);
	}, [query]);

	// Fetch current user profile for layout
	const { data: profile } = useQuery({
		queryKey: ["my-profile", user?.id],
		queryFn: async () => {
			if (!user) return null;
			const { data } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", user.id)
				.single();
			return data;
		},
		enabled: !!user,
	});

	// Fetch suggested friends for layout
	const { data: suggestedFriends = [] } = useQuery({
		queryKey: ["suggested-friends-search"],
		queryFn: async () => {
			const { data } = await supabase
				.from("profiles")
				.select("id, username, avatar_url, region")
				.neq("id", user?.id ?? "")
				.limit(4);
			return (data ?? []).map((u: any) => ({
				id: u.id,
				name: u.username ?? "User",
				title: u.region ?? "Talk N Share Member",
				avatar: u.avatar_url,
			})) as SuggestedFriend[];
		},
		enabled: !!user,
	});

	// Search Posts
	const { data: posts = [], isLoading: isLoadingPosts } = useQuery({
		queryKey: ["search-posts", query],
		queryFn: async () => {
			if (!query.trim()) return [];
			const { data } = await supabase
				.from("posts")
				.select("*, profiles(username, avatar_url)")
				.ilike("content", `%${query}%`)
				.eq("is_approved", true)
				.order("created_at", { ascending: false })
				.limit(20);
			return (data ?? []).map((p: any) => ({
				...p,
				author_name: p.profiles?.username ?? p.author_name,
				author_avatar: p.profiles?.avatar_url ?? p.author_avatar,
			})) as Post[];
		},
		enabled: !!query && (activeTab === "all" || activeTab === "posts"),
	});

	// Search People
	const { data: people = [], isLoading: isLoadingPeople } = useQuery({
		queryKey: ["search-people", query],
		queryFn: async () => {
			if (!query.trim()) return [];
			const { data } = await supabase
				.from("profiles")
				.select("*")
				.or(`username.ilike.%${query}%, region.ilike.%${query}%`) // Searching by region as title placeholder
				.neq("id", user?.id ?? "")
				.limit(20);
			return data ?? [];
		},
		enabled: !!query && (activeTab === "all" || activeTab === "people"),
	});

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (!searchInput.trim()) return;
		router.push(`/search?q=${encodeURIComponent(searchInput)}`);
	};

	const handleClear = () => {
		setSearchInput("");
		router.push("/search");
	};

	const handleFollow = (id: string) => {
		// Placeholder for follow logic
		console.log("Following user:", id);
	};

	return (
		<MainLayout
			leftSidebar={<AppLeftSidebar profile={profile ?? null} />}
			rightSidebar={<AppRightSidebar suggestedFriends={suggestedFriends} />}
		>
			<div className="space-y-6">
				{/* Search Bar */}
				<form onSubmit={handleSearch} className="relative">
					<IconSearch className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						placeholder="Search for posts, people, or keywords..."
						className="h-12 rounded-full border-border bg-card pl-12 pr-12 text-base shadow-sm focus-visible:ring-primary/20"
					/>
					{searchInput && (
						<Button
							type="button"
							onClick={handleClear}
							className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
						>
							<IconX className="size-5" />
						</Button>
					)}
				</form>

				{/* Tabs */}
				{query && (
					<div className="flex gap-2 overflow-x-auto pb-2">
						{[
							{ id: "all", label: "All" },
							{ id: "posts", label: "Posts" },
							{ id: "people", label: "People" },
						].map((tab) => (
							<Button
								key={tab.id}
								variant={activeTab === tab.id ? "default" : "outline"}
								onClick={() => setActiveTab(tab.id as Tab)}
								className={cn(
									"h-9 rounded-full px-6 transition-all",
									activeTab === tab.id && "shadow-md",
								)}
							>
								{tab.label}
							</Button>
						))}
					</div>
				)}

				{/* Results */}
				{!query ? (
					<div className="flex min-h-[300px] flex-col items-center justify-center text-center text-muted-foreground">
						<div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
							<IconSearch className="size-8 opacity-50" />
						</div>
						<h3 className="text-lg font-medium text-foreground">
							Search Talk N Share
						</h3>
						<p className="max-w-xs text-sm">
							Find posts, people, and conversations that matter to you.
						</p>
					</div>
				) : (
					<div className="space-y-8">
						{/* People Results */}
						{(activeTab === "all" || activeTab === "people") && (
							<div className="space-y-4">
								{activeTab === "all" && people.length > 0 && (
									<h2 className="text-lg font-semibold">People</h2>
								)}
								{isLoadingPeople ? (
									<div className="space-y-3">
										{[1, 2].map((i) => (
											<div
												key={i}
												className="h-20 w-full animate-pulse rounded-xl bg-muted/50"
											/>
										))}
									</div>
								) : people.length > 0 ? (
									<div className="grid gap-4">
										{people.map((person) => (
											<UserResultCard
												key={person.id}
												id={person.id}
												username={person.username || "User"}
												title={person.region} // using region as title/role placeholder
												avatarUrl={person.avatar_url}
												onFollow={handleFollow}
											/>
										))}
									</div>
								) : (
									activeTab === "people" && (
										<p className="text-center text-muted-foreground">
											No people found for &quot;{query}&quot;
										</p>
									)
								)}
							</div>
						)}

						{/* Posts Results */}
						{(activeTab === "all" || activeTab === "posts") && (
							<div className="space-y-4">
								{activeTab === "all" && posts.length > 0 && (
									<h2 className="text-lg font-semibold">Posts</h2>
								)}
								{isLoadingPosts ? (
									<div className="space-y-4">
										{[1, 2].map((i) => (
											<div
												key={i}
												className="h-48 w-full animate-pulse rounded-xl bg-muted/50"
											/>
										))}
									</div>
								) : posts.length > 0 ? (
									<div className="space-y-4">
										{posts.map((post) => (
											<PostCard key={post.id} post={post} />
										))}
									</div>
								) : (
									activeTab === "posts" && (
										<p className="text-center text-muted-foreground">
											No posts found for &quot;{query}&quot;
										</p>
									)
								)}
							</div>
						)}

						{/* Empty State */}
						{!isLoadingPeople &&
							!isLoadingPosts &&
							people.length === 0 &&
							posts.length === 0 && (
								<div className="py-12 text-center text-muted-foreground">
									<p>No results found for &quot;{query}&quot;</p>
								</div>
							)}
					</div>
				)}
			</div>
		</MainLayout>
	);
}
