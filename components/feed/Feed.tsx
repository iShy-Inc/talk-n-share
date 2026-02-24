"use client";

import { useQuery } from "@tanstack/react-query";
import { PostCard } from "./PostCard";
import { PostWithAuthor } from "@/types/supabase";

// Mock data fetcher for now
const fetchPosts = async (): Promise<PostWithAuthor[]> => {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 1000));

	return [
		{
			id: "1",
			author_id: "demo-author-1",
			content: "Just built an anonymous social network! 🚀 #coding #nextjs",
			created_at: new Date().toISOString(),
			image_url: null,
			status: "approved",
			author_name: "Anonymous Dev",
			likes_count: 42,
			comments_count: 5,
		},
		{
			id: "2",
			author_id: "demo-author-2",
			content: "Is anyone else awake? 😴",
			created_at: new Date(Date.now() - 3600000).toISOString(),
			image_url: null,
			status: "approved",
			likes_count: 12,
			comments_count: 2,
		},
		{
			id: "3",
			author_id: "demo-author-3",
			content: "Check out this view!",
			image_url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e",
			created_at: new Date(Date.now() - 86400000).toISOString(),
			status: "approved",
			likes_count: 156,
			comments_count: 24,
		},
	];
};

export function Feed() {
	const {
		data: posts,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["posts"],
		queryFn: fetchPosts,
	});

	if (isLoading) {
		return (
			<div className="w-full space-y-4">
				{[1, 2, 3].map((i) => (
					<div
						key={i}
						className="w-full h-48 bg-secondary/50 rounded-xl animate-pulse"
					/>
				))}
			</div>
		);
	}

	if (error) {
		return <div className="text-center text-red-500">Failed to load posts</div>;
	}

	return (
		<div className="w-full max-w-2xl mx-auto">
			{posts?.map((post) => (
				<PostCard key={post.id} post={post} />
			))}
		</div>
	);
}
