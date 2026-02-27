"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconSearch, IconX } from "@tabler/icons-react";
import { UserResultCard } from "@/components/shared";
import { PostCard } from "@/components/feed/PostCard";
import { PostWithAuthor } from "@/types/supabase";
import { cn } from "@/lib/utils";
import useProfile from "@/hooks/useProfile";
import { startOrRequestConversation } from "@/lib/contact-messaging";
import { toast } from "sonner";

const supabase = createClient();

type Tab = "all" | "posts" | "people";

export default function SearchPage() {
	const user = useAuthStore((state) => state.user);
	const router = useRouter();
	const searchParams = useSearchParams();
	const { profile } = useProfile();
	const query = searchParams.get("q") || "";

	const [searchInput, setSearchInput] = useState(query);
	const [activeTab, setActiveTab] = useState<Tab>("all");

	// Update input when URL query changes
	useEffect(() => {
		setSearchInput(query);
	}, [query]);

	// Search Posts
	const { data: posts = [], isLoading: isLoadingPosts } = useQuery({
		queryKey: ["search-posts", query],
		queryFn: async () => {
			if (!query.trim()) return [];
			const { data } = await supabase
				.from("posts")
				.select(
					"*, profiles!posts_author_id_fkey(display_name, avatar_url, is_public, role)",
				)
				.ilike("content", `%${query}%`)
				.eq("status", "approved")
				.order("created_at", { ascending: false })
				.limit(20);
			return (data ?? []).map((p: any) => ({
				...p,
				author_name: p.profiles?.display_name ?? p.author_name,
				author_avatar: p.profiles?.avatar_url ?? p.author_avatar,
			})) as PostWithAuthor[];
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
				.or(`display_name.ilike.%${query}%, location.ilike.%${query}%`) // Searching by location as title placeholder
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

	const handleSendMessage = async (id: string) => {
		if (!user) {
			router.push("/login");
			return;
		}
		const targetUser = people.find((person) => person.id === id);
		if (!targetUser) return;

		try {
			const result = await startOrRequestConversation({
				viewerId: user.id,
				viewerDisplayName: profile?.display_name,
				targetUserId: targetUser.id,
				targetDisplayName: targetUser.display_name,
				targetIsPublic: targetUser.is_public,
			});
			if (result.kind === "request_sent") {
				toast.success("Đã gửi yêu cầu nhắn tin tới tài khoản riêng tư này.");
				return;
			}
			router.push(`/messages?sessionId=${result.sessionId}`);
		} catch {
			toast.error("Không thể bắt đầu cuộc trò chuyện.");
		}
	};

	return (
		<>
			<div className="space-y-6">
				{/* Search Bar */}
				<form onSubmit={handleSearch} className="relative">
					<IconSearch className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						placeholder="Tìm bài viết, người dùng hoặc từ khóa..."
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
							{ id: "all", label: "Tất cả" },
							{ id: "posts", label: "Bài viết" },
							{ id: "people", label: "Mọi người" },
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
							Tìm kiếm Talk N Share
						</h3>
						<p className="max-w-xs text-sm">
							Tìm bài viết, người dùng và cuộc trò chuyện phù hợp với bạn.
						</p>
					</div>
				) : (
					<div className="space-y-8">
						{/* People Results */}
						{(activeTab === "all" || activeTab === "people") && (
							<div className="space-y-4">
								{activeTab === "all" && people.length > 0 && (
									<h2 className="text-lg font-semibold">Mọi người</h2>
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
											username={person.display_name || "User"}
											role={person.role}
											title={person.location} // using location as title/role placeholder
											avatarUrl={person.avatar_url}
											onSendMessage={handleSendMessage}
										/>
									))}
								</div>
								) : (
									activeTab === "people" && (
										<p className="text-center text-muted-foreground">
											Không tìm thấy người dùng cho &quot;{query}&quot;
										</p>
									)
								)}
							</div>
						)}

						{/* Posts Results */}
						{(activeTab === "all" || activeTab === "posts") && (
							<div className="space-y-4">
								{activeTab === "all" && posts.length > 0 && (
									<h2 className="text-lg font-semibold">Bài viết</h2>
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
											Không tìm thấy bài viết cho &quot;{query}&quot;
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
									<p>Không có kết quả cho &quot;{query}&quot;</p>
								</div>
							)}
					</div>
				)}
			</div>
		</>
	);
}
