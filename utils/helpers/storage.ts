// src/utils/storage.js
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

/**
 * Upload ảnh lên Supabase Storage
 * @param {File} file - File từ input
 * @param {string} bucket - Tên bucket (posts, reports, avatars)
 */
export const uploadImage = async (file: File, bucket = "posts") => {
	try {
		const fileExt = file.name.split(".").pop();
		const fileName = `${Math.random()}.${fileExt}`;
		const filePath = `${fileName}`;

		const { error: uploadError } = await supabase.storage
			.from(bucket)
			.upload(filePath, file);

		if (uploadError) throw uploadError;

		// Lấy URL công khai
		const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
		return data.publicUrl;
	} catch (error) {
		console.error("Error uploading image:", error as string);
		return null;
	}
};
