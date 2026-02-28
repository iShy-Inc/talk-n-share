"use client";

import { Button } from "@/components/ui/button";
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

interface AccountSettingsProps {
	onDeleteAccount?: () => void;
}

export function AccountSettings({ onDeleteAccount }: AccountSettingsProps) {
	return (
		<div className="max-w-2xl">
			<h3 className="text-base font-semibold">Xóa tài khoản</h3>
			<p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
				Hành động này không thể hoàn tác và sẽ xóa vĩnh viễn toàn bộ dữ liệu
				liên quan đến tài khoản của bạn.
			</p>

			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button
						variant="outline"
						className="mt-6 w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground sm:w-auto"
						id="delete-account-btn"
					>
						Xóa tài khoản của tôi
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Bạn chắc chắn muốn tiếp tục?</AlertDialogTitle>
						<AlertDialogDescription>
							Tài khoản và toàn bộ dữ liệu liên quan sẽ bị xóa vĩnh viễn. Hành
							động này không thể hoàn tác.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Hủy</AlertDialogCancel>
						<AlertDialogAction variant="destructive" onClick={onDeleteAccount}>
							Đồng ý, xóa tài khoản
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
