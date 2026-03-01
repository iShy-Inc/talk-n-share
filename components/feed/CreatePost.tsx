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
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

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
	const [isComposerOpen, setIsComposerOpen] = useState(false);
	const [isDiscardAlertOpen, setIsDiscardAlertOpen] = useState(false);
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

	useEffect(() => {
		if (!isComposerOpen) {
			return;
		}

		const focusTimer = window.setTimeout(() => {
			contentInputRef.current?.focus({ preventScroll: true });
		}, 120);

		return () => {
			window.clearTimeout(focusTimer);
		};
	}, [isComposerOpen]);

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

			resetComposer();
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
			setIsComposerOpen(false);
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

	const hasPendingAttachment = !!selectedImageFile || !!selectedGif;
	const hasDraft =
		post.content.trim().length > 0 || !!selectedImageFile || !!selectedGif;
	const canSubmit = hasDraft && !isSubmitting;

	const resetComposer = () => {
		setPost({ content: "", image_url: null });
		setSelectedImageFile(null);
		setSelectedGif(null);
		setPreviewUrl(null);
		if (imageInputRef.current) {
			imageInputRef.current.value = "";
		}
	};

	const handleComposerOpenChange = (nextOpen: boolean) => {
		if (nextOpen) {
			setIsComposerOpen(true);
			return;
		}

		if (isSubmitting) {
			return;
		}

		if (hasDraft) {
			setIsDiscardAlertOpen(true);
			return;
		}

		setIsComposerOpen(false);
	};

	const renderComposerForm = () => (
		<form onSubmit={handleSubmit} className="flex h-full flex-col">
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
			<div className="flex items-start gap-3 border-b border-border/70 px-4 py-4">
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
				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-semibold text-foreground">
						{profile?.display_name || "Người dùng"}
					</p>
					<p className="text-xs text-muted-foreground">
						Chia sẻ điều bạn đang nghĩ với mọi người
					</p>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto px-4 py-4">
				<textarea
					ref={contentInputRef}
					value={post.content}
					onChange={(e) => setPost({ ...post, content: e.target.value })}
					placeholder={`Bạn đang nghĩ gì${
						profile?.display_name ? `, ${profile.display_name}` : ""
					}?`}
					className="min-h-[220px] w-full resize-none border-0 bg-transparent px-0 py-0 text-base leading-relaxed placeholder:text-muted-foreground/80 focus:outline-none"
				/>
				{selectedImageFile && (
					<div className="mt-3 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
						Ảnh đã đính kèm: {selectedImageFile.name}
					</div>
				)}
				{selectedGif && (
					<div className="mt-3 rounded-xl border border-border bg-muted/30 p-2">
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
							className="h-auto max-h-[min(52dvh,28rem)] w-full rounded-xl bg-background object-contain"
						/>
					</div>
				)}
				{previewUrl && (
					<div className="mt-3 overflow-hidden rounded-xl border border-border bg-muted/20 p-2">
						<Image
							src={previewUrl}
							alt="Xem trước ảnh đã chọn"
							width={1200}
							height={800}
							className="h-auto max-h-[min(52dvh,28rem)] w-full rounded-lg object-contain"
							unoptimized
						/>
					</div>
				)}
			</div>

			<div className="border-t border-border/70 px-4 py-3">
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-1">
						<button
							type="button"
							onClick={handlePickImage}
							disabled={isSubmitting}
							className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-muted hover:text-foreground"
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
							className="rounded-xl"
						/>
						<EmojiPickerButton
							onSelect={handleSelectEmoji}
							disabled={isSubmitting}
							panelSide="top"
						/>
					</div>
					<div className="flex items-center gap-3">
						{hasPendingAttachment ? (
							<span className="hidden text-xs text-muted-foreground sm:inline">
								Đã thêm nội dung
							</span>
						) : null}
						<Button
							type="submit"
							size="sm"
							className="rounded-full"
							disabled={!canSubmit}
						>
							<span>{isSubmitting ? "Đang đăng..." : "Đăng"}</span>
							<Send size={16} />
						</Button>
					</div>
				</div>
			</div>
		</form>
	);

	return (
		<>
			<Sheet open={isComposerOpen} onOpenChange={handleComposerOpenChange}>
				<SheetTrigger asChild>
					<button
						type="button"
						className="animate-fade-up mt-12 md:mt-0 mb-6 w-full overflow-hidden rounded-2xl border border-border/70 bg-card text-left shadow-sm transition-all duration-300 hover:shadow-md"
					>
						<div className="flex items-center gap-3 px-4 py-4">
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
							<div className="flex-1 rounded-full bg-muted/55 px-4 py-3 text-sm text-muted-foreground">
								{`Bạn đang nghĩ gì${
									profile?.display_name ? `, ${profile.display_name}` : ""
								}?`}
							</div>
						</div>
						<div className="flex items-center gap-2 border-t border-border/70 px-4 py-3 text-sm text-muted-foreground">
							<span className="inline-flex items-center gap-2 rounded-lg px-2 py-1">
								<ImageIcon size={18} />
								Ảnh
							</span>
							<span className="inline-flex items-center gap-2 rounded-lg px-2 py-1">
								GIF
							</span>
							<span className="inline-flex items-center gap-2 rounded-lg px-2 py-1">
								Emoji
							</span>
						</div>
					</button>
				</SheetTrigger>

				<SheetContent
					side="top"
					className="h-dvh rounded-none border-0 p-0 sm:max-w-none"
				>
					<SheetHeader className="sr-only">
						<SheetTitle>Tạo bài viết</SheetTitle>
						<SheetDescription>
							Soạn bài viết mới toàn màn hình.
						</SheetDescription>
					</SheetHeader>
					{renderComposerForm()}
				</SheetContent>
			</Sheet>
			<AlertDialog
				open={isDiscardAlertOpen}
				onOpenChange={setIsDiscardAlertOpen}
			>
				<AlertDialogContent size="sm">
					<AlertDialogHeader>
						<AlertDialogTitle>Đóng khung tạo bài viết?</AlertDialogTitle>
						<AlertDialogDescription>
							Nếu bạn tắt bây giờ, nội dung, ảnh hoặc GIF bạn đã thêm sẽ bị mất.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isSubmitting}>
							Tiếp tục chỉnh sửa
						</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							disabled={isSubmitting}
							onClick={() => {
								resetComposer();
								setIsDiscardAlertOpen(false);
								setIsComposerOpen(false);
							}}
						>
							Tắt và bỏ nội dung
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
