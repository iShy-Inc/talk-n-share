"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { Post, Profile, Comment, Report } from "@/types";

const supabase = createClient();

// ─── Posts ────────────────────────────────────────────────────────────────────

export const useDashboardPosts = () => {
	const queryClient = useQueryClient();

	const postsQuery = useQuery({
		queryKey: ["dashboard-posts"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("posts")
				.select("*, profiles(username, avatar_url)")
				.order("created_at", { ascending: false });
			if (error) throw error;
			return (data ?? []) as Post[];
		},
	});

	const updatePost = useMutation({
		mutationFn: async (post: Partial<Post> & { id: string }) => {
			const { error } = await supabase
				.from("posts")
				.update(post)
				.eq("id", post.id);
			if (error) throw error;
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["dashboard-posts"] }),
	});

	const deletePost = useMutation({
		mutationFn: async (postId: string) => {
			const { error } = await supabase.from("posts").delete().eq("id", postId);
			if (error) throw error;
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["dashboard-posts"] }),
	});

	const approvePost = useMutation({
		mutationFn: async (postId: string) => {
			const { error } = await supabase
				.from("posts")
				.update({ is_approved: true })
				.eq("id", postId);
			if (error) throw error;
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["dashboard-posts"] }),
	});

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
				.order("username", { ascending: true });
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
				.select("*")
				.order("created_at", { ascending: false });
			if (error) throw error;
			return (data ?? []) as Comment[];
		},
	});

	const updateComment = useMutation({
		mutationFn: async (comment: Partial<Comment> & { id: string }) => {
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
			return (data ?? []) as Report[];
		},
	});

	const updateReport = useMutation({
		mutationFn: async (report: Partial<Report> & { id: string }) => {
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
			status: Report["status"];
		}) => {
			const { error } = await supabase
				.from("reports")
				.update({ status, resolved_at: new Date().toISOString() })
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
				.eq("is_approved", false);

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
