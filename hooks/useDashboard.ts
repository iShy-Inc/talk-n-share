"use client";

import {
	useQuery,
	useMutation,
	useQueryClient,
	useInfiniteQuery,
} from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import {
	PostWithAuthor,
	Profile,
	CommentWithAuthor,
	ReportWithReporter,
} from "@/types/supabase";
import { usePosts } from "./usePosts";

const supabase = createClient();
const POSTS_PER_PAGE = 9; // Số lượng tweet mỗi lần tải
// ─── Posts ────────────────────────────────────────────────────────────────────

export const useDashboardPosts = () => {
	const postsQuery = useInfiniteQuery({
		queryKey: ["dashboard-posts", POSTS_PER_PAGE],
		initialPageParam: 0,
		queryFn: async ({ pageParam }) => {
			const from = pageParam as number;
			const to = from + POSTS_PER_PAGE - 1;
			const { data, error } = await supabase
				.from("posts")
				.select("*, profiles!posts_author_id_fkey(display_name, avatar_url)")
				.order("created_at", { ascending: false })
				.range(from, to);
			if (error) throw error;
			return (data || []).map((p: any) => ({
				...p,
				author_name: p.profiles?.display_name,
				author_avatar: p.profiles?.avatar_url,
			})) as PostWithAuthor[];
		},
		getNextPageParam: (lastPage, allPages) => {
			if (lastPage.length < POSTS_PER_PAGE) return undefined;
			return allPages.length * POSTS_PER_PAGE;
		},
	});
	const { updatePost, deletePost, approvePost } = usePosts();

	return { postsQuery, updatePost, deletePost, approvePost };
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const useDashboardUsers = () => {
	const queryClient = useQueryClient();

	const usersQuery = useQuery({
		queryKey: ["dashboard-users"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("profiles")
				.select("*")
				.order("display_name", { ascending: true });
			if (error) throw error;
			return (data ?? []) as Profile[];
		},
	});

	const updateUser = useMutation({
		mutationFn: async (user: Partial<Profile> & { id: string }) => {
			const { error } = await supabase
				.from("profiles")
				.update(user)
				.eq("id", user.id);
			if (error) throw error;
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["dashboard-users"] }),
	});

	const deleteUser = useMutation({
		mutationFn: async (userId: string) => {
			const { error } = await supabase
				.from("profiles")
				.delete()
				.eq("id", userId);
			if (error) throw error;
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["dashboard-users"] }),
	});

	return { usersQuery, updateUser, deleteUser };
};

// ─── Comments ─────────────────────────────────────────────────────────────────

export const useDashboardComments = () => {
	const queryClient = useQueryClient();

	const commentsQuery = useQuery({
		queryKey: ["dashboard-comments"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("comments")
				.select("*, profiles!comments_author_id_fkey(display_name, avatar_url)")
				.order("created_at", { ascending: false });
			if (error) throw error;
			return (data ?? []).map((comment: any) => ({
				...comment,
				author_name: comment.profiles?.display_name ?? null,
				author_avatar: comment.profiles?.avatar_url ?? null,
			})) as CommentWithAuthor[];
		},
	});

	const updateComment = useMutation({
		mutationFn: async (
			comment: Partial<CommentWithAuthor> & { id: string },
		) => {
			const { error } = await supabase
				.from("comments")
				.update(comment)
				.eq("id", comment.id);
			if (error) throw error;
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["dashboard-comments"] }),
	});

	const deleteComment = useMutation({
		mutationFn: async (commentId: string) => {
			const { error } = await supabase
				.from("comments")
				.delete()
				.eq("id", commentId);
			if (error) throw error;
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["dashboard-comments"] }),
	});

	return { commentsQuery, updateComment, deleteComment };
};

// ─── Reports ──────────────────────────────────────────────────────────────────

export const useDashboardReports = () => {
	const queryClient = useQueryClient();

	const reportsQuery = useQuery({
		queryKey: ["dashboard-reports"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("reports")
				.select("*")
				.order("created_at", { ascending: false });
			if (error) throw error;
			return (data ?? []) as ReportWithReporter[];
		},
	});

	const updateReport = useMutation({
		mutationFn: async (
			report: Partial<ReportWithReporter> & { id: string },
		) => {
			const { error } = await supabase
				.from("reports")
				.update(report)
				.eq("id", report.id);
			if (error) throw error;
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["dashboard-reports"] }),
	});

	const deleteReport = useMutation({
		mutationFn: async (reportId: string) => {
			const { error } = await supabase
				.from("reports")
				.delete()
				.eq("id", reportId);
			if (error) throw error;
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["dashboard-reports"] }),
	});

	const resolveReport = useMutation({
		mutationFn: async ({
			reportId,
			status,
		}: {
			reportId: string;
			status: ReportWithReporter["status"];
		}) => {
			const { error } = await supabase
				.from("reports")
				.update({ status })
				.eq("id", reportId);
			if (error) throw error;
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["dashboard-reports"] }),
	});

	return { reportsQuery, updateReport, deleteReport, resolveReport };
};

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export const useDashboardStats = () => {
	return useQuery({
		queryKey: ["dashboard-stats"],
		queryFn: async () => {
			const [posts, users, comments, reports] = await Promise.all([
				supabase.from("posts").select("id", { count: "exact", head: true }),
				supabase.from("profiles").select("id", { count: "exact", head: true }),
				supabase.from("comments").select("id", { count: "exact", head: true }),
				supabase.from("reports").select("id", { count: "exact", head: true }),
			]);

			const pendingPosts = await supabase
				.from("posts")
				.select("id", { count: "exact", head: true })
				.neq("status", "approved");

			const pendingReports = await supabase
				.from("reports")
				.select("id", { count: "exact", head: true })
				.eq("status", "pending");

			return {
				totalPosts: posts.count ?? 0,
				totalUsers: users.count ?? 0,
				totalComments: comments.count ?? 0,
				totalReports: reports.count ?? 0,
				pendingPosts: pendingPosts.count ?? 0,
				pendingReports: pendingReports.count ?? 0,
			};
		},
	});
};
