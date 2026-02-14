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
		<div>
			<h3 className="text-base font-semibold">Delete Account</h3>
			<p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
				This action is irreversible and will permanently delete all your data
				associated with the account.
			</p>

			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button
						variant="outline"
						className="mt-6 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
						id="delete-account-btn"
					>
						Delete My Account
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete your account and all associated data.
							This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction variant="destructive" onClick={onDeleteAccount}>
							Yes, delete my account
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
