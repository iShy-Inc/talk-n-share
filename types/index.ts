export interface Profile {
	id: string;
	username: string;
	avatar_url?: string;
	is_public: boolean;
	gender?: string;
	birthday?: string;
	region?: string;
	created_at?: string;
	email?: string;
	role?: string;
	interests?: string[];
}

export interface ChatSession {
	id: string;
	user1_id: string;
	user2_id: string;
	created_at: string;
	updated_at: string;
	last_message?: string;
	status: "active" | "ended";
	type: "direct" | "match";
	is_revealed: boolean;
	user1_liked: boolean;
	user2_liked: boolean;
	match_criteria?: any;
}

export interface Post {
	id: string;
	content: string;
	image_url?: string;
	created_at: string;
	author_id?: string; // Anonymized or real ID based on settings
	author_name?: string; // "Anonymous" or Real Name
	author_avatar?: string;
	likes_count: number;
	comments_count: number;
	is_liked?: boolean;
	is_approved?: boolean;
}

export interface Comment {
	id: string;
	post_id: string;
	content: string;
	created_at: string;
	author_name: string;
	author_avatar?: string;
	author_id?: string;
}

export interface Notification {
	id: string;
	user_id: string;
	content: string;
	is_read: boolean;
	created_at: string;
}

export interface Report {
	id: string;
	reporter_id: string;
	reporter_name?: string;
	target_type: "post" | "comment" | "user";
	target_id: string;
	reason: string;
	description?: string;
	status: "pending" | "reviewed" | "resolved" | "dismissed";
	created_at: string;
	resolved_at?: string;
	resolved_by?: string;
}
