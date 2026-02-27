"use client";

import { type ChangeEvent, type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import {
	IconHeart,
	IconX,
	IconAlertTriangle,
	IconUserCheck,
	IconFlag3,
} from "@tabler/icons-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Message } from "@/types/supabase";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { STORAGE_BUCKETS, uploadFileToBucket } from "@/lib/supabase-storage";
import { toast } from "sonner";

interface ActiveMatchChatProps {
	messages: Message[];
	currentUserId: string;
	partnerUserId?: string;
	partnerLiked: boolean;
	userLiked: boolean;
	isRevealed: boolean;
	partnerProfile?: {
		display_name: string;
		avatar_url?: string;
		location?: string;
	};
	onSendMessage: (content: string) => void;
	onLike: () => void;
	onEndChat: () => void;
}

export function ActiveMatchChat({
	messages,
	currentUserId,
	partnerUserId,
	partnerLiked,
	userLiked,
	isRevealed,
	partnerProfile,
	onSendMessage,
	onLike,
	onEndChat,
}: ActiveMatchChatProps) {
	const [showEndDialog, setShowEndDialog] = useState(false);
	const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
	const [reportReason, setReportReason] = useState("harassment");
	const [reportEvidenceUrl, setReportEvidenceUrl] = useState<string | null>(
		null,
	);
	const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
	const [isSubmittingReport, setIsSubmittingReport] = useState(false);
	const supabase = createClient();

	const handleReportEvidenceSelected = async (
		event: ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file) return;
		if (!file.type.startsWith("image/")) {
			toast.error("Vui lòng chọn file ảnh.");
			return;
		}

		try {
			setIsUploadingEvidence(true);
			const { publicUrl } = await uploadFileToBucket({
				bucket: STORAGE_BUCKETS.REPORT_EVIDENCE,
				file,
				ownerId: currentUserId,
			});
			setReportEvidenceUrl(publicUrl);
			toast.success("Đã tải ảnh bằng chứng.");
		} catch {
			toast.error("Không thể tải ảnh bằng chứng.");
		} finally {
			setIsUploadingEvidence(false);
			event.target.value = "";
		}
	};

	const handleSubmitReport = async (event: FormEvent) => {
		event.preventDefault();
		if (!partnerUserId) {
			toast.error("Không xác định được người cần báo cáo.");
			return;
		}
		if (!reportEvidenceUrl) {
			toast.error("Bắt buộc phải có ảnh bằng chứng.");
			return;
		}

		try {
			setIsSubmittingReport(true);
			const { error } = await supabase.from("reports").insert({
				reporter_id: currentUserId,
				reported_user_id: partnerUserId,
				target_type: "user",
				target_id: null,
				reason: reportReason,
				status: "pending",
				evidence_image_url: reportEvidenceUrl,
			});
			if (error) throw error;

			toast.success("Đã gửi báo cáo người dùng.");
			setIsReportDialogOpen(false);
			setReportReason("harassment");
			setReportEvidenceUrl(null);
		} catch {
			toast.error("Gửi báo cáo thất bại.");
		} finally {
			setIsSubmittingReport(false);
		}
	};

	return (
		<div className="flex h-full flex-col bg-background">
			{/* Match Header */}
			<div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 shadow-sm">
				<div className="flex items-center gap-3">
					{isRevealed && partnerProfile?.avatar_url ? (
						<img
							src={partnerProfile.avatar_url}
							alt={partnerProfile.display_name}
							className="size-10 rounded-full object-cover"
						/>
					) : (
						<div className="flex size-10 items-center justify-center rounded-full bg-secondary text-xl">
							🕵️
						</div>
					)}
					<div>
						<h3 className="font-semibold">
							{isRevealed ? partnerProfile?.display_name : "Anonymous Partner"}
						</h3>
						<p className="text-xs text-muted-foreground">
							{isRevealed
								? partnerProfile?.location || "Revealed!"
								: "Identity hidden"}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					{isRevealed ? (
						<span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2.5 py-1 rounded-full">
							<IconUserCheck className="size-3" />
							Matched
						</span>
					) : (
						<>
							{partnerLiked && !userLiked && (
								<span className="hidden sm:inline-block text-xs text-primary animate-pulse font-medium mr-2">
									Partner likes you!
								</span>
							)}
							<Button
								size="icon"
								variant={userLiked ? "secondary" : "ghost"}
								className={cn(
									"rounded-full transition-all",
									userLiked
										? "bg-red-100 text-red-500 hover:bg-red-200 dark:bg-red-900/30"
										: "text-muted-foreground hover:text-red-500",
								)}
								onClick={onLike}
								disabled={userLiked}
								title="Like to reveal"
							>
								<IconHeart
									className={cn("size-5", userLiked && "fill-current")}
								/>
							</Button>
						</>
					)}

					<AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
						<AlertDialogTrigger asChild>
							<Button
								size="sm"
								variant="ghost"
								className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
							>
								<IconX className="mr-1 size-4" />
								End
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>End this chat?</AlertDialogTitle>
								<AlertDialogDescription>
									Are you sure you want to disconnect? You won&apos;t be able to
									message this person again unless you&apos;ve both revealed
									your identities.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction
									onClick={onEndChat}
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
								>
									End Chat
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>

					<Button
						size="sm"
						variant="ghost"
						className="text-amber-600 hover:bg-amber-500/10 hover:text-amber-700"
						onClick={() => setIsReportDialogOpen(true)}
					>
						<IconFlag3 className="mr-1 size-4" />
						Báo cáo
					</Button>
				</div>
			</div>

			{/* Info Banner */}
			{!isRevealed && (
				<div className="bg-muted/30 px-4 py-2 text-center text-xs text-muted-foreground">
					<IconAlertTriangle className="mr-1.5 inline-block size-3.5 align-text-bottom" />
					Hãy cùng bấm thích để hiện danh tính và lưu cuộc trò chuyện này.
				</div>
			)}

			{/* Messages Area */}
			<div className="flex-1 space-y-4 overflow-y-auto p-4 scroller-thin">
				{messages.length === 0 && (
					<div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground opacity-50">
						<div className="mb-4 text-4xl">👋</div>
						<p>Say hello to your new match!</p>
					</div>
				)}
				{messages.map((msg) => (
					<ChatBubble
						key={msg.id}
						content={msg.content ?? ""}
						timestamp={format(new Date(msg.created_at), "h:mm a")}
						variant={msg.sender_id === currentUserId ? "sent" : "received"}
					/>
				))}
			</div>

			{/* Input Area */}
			<ChatInput onSend={onSendMessage} />

			<Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<form onSubmit={handleSubmitReport} className="space-y-4">
						<DialogHeader>
							<DialogTitle>Báo cáo người dùng</DialogTitle>
							<DialogDescription>
								Vui lòng cung cấp lý do và ảnh bằng chứng. Ảnh bằng chứng là bắt
								buộc.
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-2">
							<Label htmlFor="match-report-reason">Lý do</Label>
							<select
								id="match-report-reason"
								title="match-report-reason"
								className="h-9 w-full rounded-4xl border border-input bg-input/30 px-3 text-sm outline-none focus-visible:border-ring"
								value={reportReason}
								onChange={(e) => setReportReason(e.target.value)}
							>
								<option value="harassment">Quấy rối</option>
								<option value="hate_speech">Ngôn từ thù ghét</option>
								<option value="sexual_content">Nội dung nhạy cảm</option>
								<option value="threat">Đe dọa</option>
								<option value="scam">Lừa đảo</option>
								<option value="other">Khác</option>
							</select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="match-report-evidence">
								Ảnh bằng chứng <span className="text-destructive">*</span>
							</Label>
							<Input
								id="match-report-evidence"
								type="file"
								accept="image/*"
								required
								onChange={handleReportEvidenceSelected}
							/>
							{reportEvidenceUrl && (
								<a
									href={reportEvidenceUrl}
									target="_blank"
									rel="noreferrer"
									className="text-xs font-medium text-primary underline underline-offset-2"
								>
									Xem ảnh đã tải lên
								</a>
							)}
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsReportDialogOpen(false)}
							>
								Hủy
							</Button>
							<Button
								type="submit"
								disabled={
									isUploadingEvidence ||
									isSubmittingReport ||
									!reportEvidenceUrl ||
									!partnerUserId
								}
								className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							>
								Gửi báo cáo
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
