"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Send } from "lucide-react";
import { usePosts } from "@/hooks/usePosts";
import { STORAGE_BUCKETS, uploadFileToBucket } from "@/lib/supabase-storage";
import { toast } from "sonner";
import useProfile from "@/hooks/useProfile";
import { EmojiPickerButton } from "@/components/shared/EmojiPickerButton";
import { GifPickerButton } from "@/components/shared/GifPickerButton";
import { registerGiphySend, type GifSelection } from "@/lib/giphy";

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
	const [selectedGif, setSelectedGif] = useState<GifSelection | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const imageInputRef = useRef<HTMLInputElement>(null);
	const contentInputRef = useRef<HTMLTextAreaElement>(null);
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
		const hasGif = !!selectedGif;
		if (!hasText && !hasImage && !hasGif) return;

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
				gif_provider: selectedGif?.provider ?? null,
				gif_id: selectedGif?.id ?? null,
			});

			setPost({ content: "", image_url: null });
			setSelectedImageFile(null);
			setSelectedGif(null);
			if (imageInputRef.current) {
				imageInputRef.current.value = "";
			}
			if (selectedGif?.provider === "giphy") {
				void registerGiphySend(selectedGif.id);
			}
			if (createdPost?.status === "pending") {
				toast.success(
					"Bài viết đã gửi và đang chờ duyệt vì chứa nội dung nhạy cảm hoặc liên kết.",
				);
			} else {
				toast.success("Đăng bài thành công.");
			}
		} catch {
			toast.error("Không thể đăng bài");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handlePickImage = () => {
		if (!profile) {
			toast.error("Vui lòng đăng nhập để tải ảnh lên");
			return;
		}
		imageInputRef.current?.click();
	};

	const handleImageSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file || !profile) return;
		if (!file.type.startsWith("image/")) {
			toast.error("Vui lòng chọn tệp hình ảnh");
			return;
		}

		setSelectedImageFile(file);
		setSelectedGif(null);
		toast.success("Đã chọn ảnh. Ảnh sẽ được tải lên khi bạn đăng bài.");
	};

	const handleSelectEmoji = (emoji: string) => {
		const input = contentInputRef.current;
		const selectionStart = input?.selectionStart ?? post.content.length;
		const selectionEnd = input?.selectionEnd ?? post.content.length;
		const nextContent =
			post.content.slice(0, selectionStart) +
			emoji +
			post.content.slice(selectionEnd);
		const nextCursor = selectionStart + emoji.length;

		setPost((prev) => ({ ...prev, content: nextContent }));

		requestAnimationFrame(() => {
			contentInputRef.current?.focus({ preventScroll: true });
			contentInputRef.current?.setSelectionRange(nextCursor, nextCursor);
		});
	};

	return (
		<div className="animate-fade-up mb-6 w-full overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all duration-300 hover:shadow-md">
			<form onSubmit={handleSubmit}>
				<label htmlFor="image-upload" className="sr-only">
					Tải ảnh lên
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
								alt={profile.display_name || "Người dùng"}
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
							ref={contentInputRef}
							value={post.content}
							onChange={(e) => setPost({ ...post, content: e.target.value })}
							placeholder={`Bạn đang nghĩ gì${
								profile?.display_name ? `, ${profile.display_name}` : ""
							}?`}
							className="min-h-[92px] w-full resize-none rounded-2xl border border-transparent bg-muted/55 px-4 py-3 text-[15px] leading-relaxed placeholder:text-muted-foreground/80 focus:border-border focus:outline-none"
						/>
						{selectedImageFile && (
							<div className="mb-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
								Ảnh đã đính kèm: {selectedImageFile.name}
							</div>
						)}
						{selectedGif && (
							<div className="mb-2 rounded-xl border border-border bg-muted/30 p-2">
								<div className="mb-2 flex items-center justify-between">
									<span className="text-xs text-muted-foreground">GIF đã chọn</span>
									<button
										type="button"
										onClick={() => setSelectedGif(null)}
										className="text-xs font-medium text-primary"
									>
										Xóa
									</button>
								</div>
								<img
									src={selectedGif.previewUrl}
									alt={selectedGif.title}
									className="h-52 w-full rounded-xl object-cover"
								/>
							</div>
						)}
						{previewUrl && (
							<div className="mb-2 overflow-hidden rounded-xl border border-border">
								<Image
									src={previewUrl}
									alt="Xem trước ảnh đã chọn"
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
								className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-muted hover:text-foreground"
								title="Thêm ảnh"
							>
								<ImageIcon size={18} />
								<span>Ảnh</span>
							</button>
							<GifPickerButton
								onSelect={(gif) => {
									setSelectedGif(gif);
									setSelectedImageFile(null);
									if (imageInputRef.current) {
										imageInputRef.current.value = "";
									}
								}}
								disabled={isSubmitting}
								className="rounded-lg"
							/>
							<EmojiPickerButton
								onSelect={handleSelectEmoji}
								disabled={isSubmitting}
							/>

							<button
								type="submit"
								disabled={
									(
										post.content.trim().length === 0 &&
										!selectedImageFile &&
										!selectedGif
									) ||
									isSubmitting
								}
								className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
							>
								<span>{isSubmitting ? "Đang đăng..." : "Đăng"}</span>
								<Send size={16} />
							</button>
						</div>
					</div>
				</div>
			</form>
		</div>
	);
}
