import type {
	Database,
	Enums as SupabaseEnums,
	Tables as SupabaseTables,
	TablesInsert as SupabaseTablesInsert,
	TablesUpdate as SupabaseTablesUpdate,
} from "./supabase";

export type Tables<T extends keyof Database["public"]["Tables"]> =
	SupabaseTables<T>;
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
	SupabaseTablesInsert<T>;
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
	SupabaseTablesUpdate<T>;
export type Enums<T extends keyof Database["public"]["Enums"]> =
	SupabaseEnums<T>;

export type Profile = SupabaseTables<"profiles"> & {
	email?: string;
	interests?: string[];
	username?: string;
	region?: string;
	birthday?: string;
};

export type ChatSession = SupabaseTables<"matches"> & {
	last_message?: string;
	match_criteria?: Record<string, unknown>;
};

export type Post = SupabaseTables<"posts"> & {
	author_name?: string;
	author_avatar?: string;
	is_liked?: boolean;
	is_approved?: boolean;
};

export type Comment = SupabaseTables<"comments"> & {
	author_name?: string;
	author_avatar?: string;
};

export type Notification = SupabaseTables<"notifications">;

export type Report = SupabaseTables<"reports"> & {
	reporter_name?: string;
	description?: string | null;
	status: "pending" | "reviewed" | "resolved" | "dismissed" | null;
	target_type: "post" | "comment" | "user";
};
