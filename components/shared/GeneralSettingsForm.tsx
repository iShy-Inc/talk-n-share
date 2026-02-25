"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { IconUpload } from "@tabler/icons-react";

interface GeneralSettingsFormProps {
	initialValues?: {
		fullName?: string;
		username?: string;
		bio?: string;
	};
	onSave?: (values: {
		fullName: string;
		username: string;
		bio: string;
	}) => void;
	onAvatarUpload?: () => void;
	avatarUploading?: boolean;
}

export function GeneralSettingsForm({
	initialValues,
	onSave,
	onAvatarUpload,
	avatarUploading = false,
}: GeneralSettingsFormProps) {
	const [fullName, setFullName] = useState(initialValues?.fullName ?? "");
	const [username, setUsername] = useState(initialValues?.username ?? "");
	const [bio, setBio] = useState(initialValues?.bio ?? "");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSave?.({ fullName, username, bio });
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="mx-auto flex w-full max-w-md flex-col gap-5"
		>
			{/* Avatar upload */}
			<button
				type="button"
				onClick={onAvatarUpload}
				disabled={avatarUploading}
				className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-5 py-5 text-sm text-muted-foreground transition-colors hover:bg-muted/60"
				id="upload-avatar-btn"
			>
				<IconUpload className="size-4" />
				{avatarUploading ? "Uploading avatar..." : "Choose an image for avatar"}
			</button>

			{/* Inputs */}
			<Input
				value={fullName}
				onChange={(e) => setFullName(e.target.value)}
				placeholder="Full name"
				id="settings-fullname"
			/>
			<Input
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				placeholder="Username"
				id="settings-username"
			/>
			<Textarea
				value={bio}
				onChange={(e) => setBio(e.target.value)}
				placeholder="Bio"
				className="min-h-[120px] resize-none"
				id="settings-bio"
			/>

			<Button type="submit" className="w-40" id="settings-save-btn">
				Save Changes
			</Button>
		</form>
	);
}
