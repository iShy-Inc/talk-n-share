"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Send } from "lucide-react";
import { usePosts } from "@/hooks/usePosts";
import { useAuthStore } from "@/store/useAuthStore";
import { STORAGE_BUCKETS, uploadFileToBucket } from "@/lib/supabase-storage";
import toast from "react-hot-toast";

export function CreatePost() {
	const { user } = useAuthStore();
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
		if (!user) return;
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
					ownerId: user.id,
				});
				imageUrl = publicUrl;
			}

			await createPost.mutateAsync({
				content: hasText ? post.content : null,
				image_url: imageUrl,
				author_id: user.id,
			});

			setPost({ content: "", image_url: null });
			setSelectedImageFile(null);
			if (imageInputRef.current) {
				imageInputRef.current.value = "";
			}
			toast.success("Post created successfully! Please wait the censorship.");
		} catch {
			toast.error("Failed to create post");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handlePickImage = () => {
		if (!user) {
			toast.error("Please sign in to upload images");
			return;
		}
		imageInputRef.current?.click();
	};

	const handleImageSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file || !user) return;
		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}

		setSelectedImageFile(file);
		toast.success("Image selected. It will upload when you post.");
	};

	return (
		<div className="w-full bg-card border rounded-xl p-4 mb-6 shadow-sm">
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
				<div className="flex gap-4">
					<div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
						<span className="text-xl">🕵️</span>
					</div>
					<div className="flex-1">
						<textarea
							value={post.content}
							onChange={(e) => setPost({ ...post, content: e.target.value })}
							placeholder="What's on your mind? (Anonymous)"
							className="w-full bg-transparent border-none focus:ring-0 resize-none min-h-[100px] text-lg placeholder:text-muted-foreground/70"
						/>
						{selectedImageFile && (
							<div className="mb-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
								Image attached: {selectedImageFile.name}
							</div>
						)}
						{previewUrl && (
							<div className="mb-3 overflow-hidden rounded-lg border border-border">
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

						<div className="flex items-center justify-between pt-2 border-t mt-2">
							<button
								type="button"
								onClick={handlePickImage}
								disabled={isSubmitting}
								className="text-muted-foreground hover:text-primary transition-colors p-2 -ml-2 rounded-full hover:bg-secondary/50"
								title="Add Image"
							>
								<ImageIcon size={20} />
							</button>

							<button
								type="submit"
								disabled={
									(post.content.trim().length === 0 && !selectedImageFile) ||
									isSubmitting
								}
								className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center gap-2"
							>
								<span>Post</span>
								<Send size={16} />
							</button>
						</div>
					</div>
				</div>
			</form>
		</div>
	);
}
