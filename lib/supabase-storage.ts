"use client";

import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export const STORAGE_BUCKETS = {
	AVATARS: "avatars",
	POST_IMAGES: "post-images",
	REPORT_EVIDENCE: "report-evidence",
} as const;

export type StorageBucket =
	(typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

type UploadOptions = {
	bucket: StorageBucket;
	file: File;
	ownerId: string;
};

const getFileExtension = (file: File) => {
	const fromName = file.name.split(".").pop()?.toLowerCase();
	if (fromName) return fromName;
	const fromType = file.type.split("/").pop()?.toLowerCase();
	return fromType || "bin";
};

export const uploadFileToBucket = async ({
	bucket,
	file,
	ownerId,
}: UploadOptions) => {
	const extension = getFileExtension(file);
	const objectPath = `${ownerId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

	const { error } = await supabase.storage.from(bucket).upload(objectPath, file, {
		contentType: file.type || undefined,
		upsert: false,
	});
	if (error) throw error;

	const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
	return {
		objectPath,
		publicUrl: data.publicUrl,
	};
};
