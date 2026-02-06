export interface Profile {
	id: string;
	username: string;
	avatar_url?: string;
	is_public: boolean;
	gender?: string;
	birthday?: string;
	region?: string;
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
}

export interface Comment {
	id: string;
	post_id: string;
	content: string;
	created_at: string;
	author_name: string;
	author_avatar?: string;
}

export interface Notification {
	id: string;
	user_id: string;
	content: string;
	is_read: boolean;
	created_at: string;
}
