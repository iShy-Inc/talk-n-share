import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client"; // File cấu hình supabase client
import type { Post, PostWithAuthor } from "@/types/supabase";

const supabase = createClient();
const POSTS_PER_PAGE = 9;
export const usePosts = () => {
	const queryClient = useQueryClient();

	// Get posts
	const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
		queryKey: ["feed-posts", "approved", POSTS_PER_PAGE],
		initialPageParam: 0,
		queryFn: async ({ pageParam }) => {
			const from = pageParam as number;
			const to = from + POSTS_PER_PAGE - 1;
			const { data, error } = await supabase
				.from("posts")
				.select(
					"*, profiles!posts_author_id_fkey(display_name, avatar_url, is_public, role)",
				)
				.eq("status", "approved")
				.order("created_at", { ascending: false })
				.range(from, to);
			if (error) throw error;
			return (data || []).map((p: any) => ({
				...p,
				author_name: p.profiles?.display_name ?? p.author_name ?? "Người dùng",
				author_avatar: p.profiles?.avatar_url ?? p.author_avatar ?? null,
			})) as PostWithAuthor[];
		},
		getNextPageParam: (lastPage, allPages) => {
			if (lastPage.length < POSTS_PER_PAGE) return undefined;
			return allPages.length * POSTS_PER_PAGE;
		},
	});

	// Create post
	const createPost = useMutation({
		mutationFn: async (
			newPost: Pick<Post, "content" | "image_url" | "author_id">,
		) => {
			const { data, error } = await supabase
				.from("posts")
				.insert([newPost])
				.select("id, status")
				.single();
			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard-posts"] });
		},
	});

	// Delete post
	const deletePost = useMutation({
		mutationFn: async (postId: string) => {
			const { error } = await supabase.from("posts").delete().eq("id", postId);
			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard-posts"] });
		},
	});

	// Update post
	const updatePost = useMutation({
		mutationFn: async (post: Partial<Post> & { id: string }) => {
			const { data, error } = await supabase
				.from("posts")
				.update(post)
				.eq("id", post.id);
			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard-posts"] });
		},
	});

	// Approve post
	const approvePost = useMutation({
		mutationFn: async (postId: string) => {
			const { error } = await supabase
				.from("posts")
				.update({ status: "approved" })
				.eq("id", postId);
			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard-posts"] });
		},
	});

	return {
		posts: data?.pages.flat() || [],
		fetchNextPage,
		hasNextPage,
		createPost,
		deletePost,
		updatePost,
		approvePost,
	};
};
