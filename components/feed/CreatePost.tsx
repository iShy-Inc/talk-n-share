"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Send } from "lucide-react";
import { usePosts } from "@/hooks/usePosts";
import { STORAGE_BUCKETS, uploadFileToBucket } from "@/lib/supabase-storage";
import { toast } from "sonner";
import useProfile from "@/hooks/useProfile";

export function CreatePost() {
	const { profile } = useProfile();
	const [post, setPost] = useState<{
		content: string;
		image_url: string | null;
	}>({
		content: "",
		image_url: null,
	});
	const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const imageInputRef = useRef<HTMLInputElement>(null);
	const { createPost } = usePosts();

	useEffect(() => {
		if (!selectedImageFile) {
			setPreviewUrl(null);
			return;
		}

		const objectUrl = URL.createObjectURL(selectedImageFile);
		setPreviewUrl(objectUrl);

		return () => {
			URL.revokeObjectURL(objectUrl);
		};
	}, [selectedImageFile]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!profile) return;
		const hasText = post.content.trim().length > 0;
		const hasImage = !!selectedImageFile;
		if (!hasText && !hasImage) return;

		try {
			setIsSubmitting(true);
			let imageUrl: string | null = null;

			if (selectedImageFile) {
				const { publicUrl } = await uploadFileToBucket({
					bucket: STORAGE_BUCKETS.POST_IMAGES,
					file: selectedImageFile,
					ownerId: profile.id,
				});
				imageUrl = publicUrl;
			}

			const createdPost = await createPost.mutateAsync({
				content: hasText ? post.content : null,
				image_url: imageUrl,
				author_id: profile.id,
			});

			setPost({ content: "", image_url: null });
			setSelectedImageFile(null);
			if (imageInputRef.current) {
				imageInputRef.current.value = "";
			}
			if (createdPost?.status === "pending") {
				toast.success(
					"Post submitted. It is pending review because it contains sensitive text or a link.",
				);
			} else {
				toast.success("Post published successfully.");
			}
		} catch {
			toast.error("Failed to create post");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handlePickImage = () => {
		if (!profile) {
			toast.error("Please sign in to upload images");
			return;
		}
		imageInputRef.current?.click();
	};

	const handleImageSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file || !profile) return;
		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}

		setSelectedImageFile(file);
		toast.success("Image selected. It will upload when you post.");
	};

	return (
		<div className="mb-6 w-full overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
			<form onSubmit={handleSubmit}>
				<label htmlFor="image-upload" className="sr-only">
					Upload image
				</label>
				<input
					ref={imageInputRef}
					type="file"
					id="image-upload"
					accept="image/*"
					className="hidden"
					onChange={handleImageSelected}
				/>
				<div className="flex gap-3 px-4 pb-3 pt-4">
					<div className="size-10 shrink-0 overflow-hidden rounded-full bg-secondary">
						{profile?.avatar_url ? (
							<Image
								src={profile.avatar_url}
								alt={profile.display_name || "User"}
								width={40}
								height={40}
								className="size-10 object-cover"
							/>
						) : (
							<div className="flex size-10 items-center justify-center text-sm font-semibold text-primary">
								{profile?.display_name?.[0]?.toUpperCase() || "U"}
							</div>
						)}
					</div>
					<div className="flex-1">
						<textarea
							value={post.content}
							onChange={(e) => setPost({ ...post, content: e.target.value })}
							placeholder={`What's on your mind${
								profile?.display_name ? `, ${profile.display_name}` : ""
							}?`}
							className="min-h-[92px] w-full resize-none rounded-2xl border border-transparent bg-muted/55 px-4 py-3 text-[15px] leading-relaxed placeholder:text-muted-foreground/80 focus:border-border focus:outline-none"
						/>
						{selectedImageFile && (
							<div className="mb-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
								Image attached: {selectedImageFile.name}
							</div>
						)}
						{previewUrl && (
							<div className="mb-2 overflow-hidden rounded-xl border border-border">
								<Image
									src={previewUrl}
									alt="Selected image preview"
									width={1200}
									height={800}
									className="h-52 w-full object-cover"
									unoptimized
								/>
							</div>
						)}

						<div className="mt-2 flex items-center justify-between border-t border-border/70 pt-2">
							<button
								type="button"
								onClick={handlePickImage}
								disabled={isSubmitting}
								className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
								title="Add Image"
							>
								<ImageIcon size={18} />
								<span>Photo</span>
							</button>

							<button
								type="submit"
								disabled={
									(post.content.trim().length === 0 && !selectedImageFile) ||
									isSubmitting
								}
								className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
							>
								<span>{isSubmitting ? "Posting..." : "Post"}</span>
								<Send size={16} />
							</button>
						</div>
					</div>
				</div>
			</form>
		</div>
	);
}
