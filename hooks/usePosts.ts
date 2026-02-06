import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client"; // File cấu hình supabase client
import { Post } from "@/types";

const supabase = createClient();

export const usePosts = () => {
	const queryClient = useQueryClient();

	// Get posts
	const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
		queryKey: ["posts"],
		initialPageParam: 0,
		queryFn: async ({ pageParam }) => {
			const { data, error } = await supabase
				.from("posts")
				.select("*, profiles(username, avatar_url)")
				.eq("is_approved", true)
				.order("created_at", { ascending: false })
				.range(pageParam as number, (pageParam as number) + 9);
			if (error) throw error;
			return data;
		},
		getNextPageParam: (_lastPage, allPages) => allPages.length * 10,
	});

	// Create post
	const createPost = useMutation({
		mutationFn: async (newPost: Pick<Post, "content" | "image_url">) => {
			// Logic: Gửi bài lên với is_approved = false mặc định
			const { data, error } = await supabase
				.from("posts")
				.insert([{ ...newPost, is_approved: false }]);
			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			alert("Bài viết đang được phê duyệt nội dung!");
		},
	});

	// Delete post
	const deletePost = useMutation({
		mutationFn: async (postId: string) => {
			const { error } = await supabase.from("posts").delete().eq("id", postId);
			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
	});

	// Update post
	const updatePost = useMutation({
		mutationFn: async (post: Post) => {
			const { data, error } = await supabase
				.from("posts")
				.update(post)
				.eq("id", post.id);
			if (error) throw error;
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
	});

	return {
		posts: data?.pages.flat() || [],
		fetchNextPage,
		hasNextPage,
		createPost,
		deletePost,
		updatePost,
	};
};
