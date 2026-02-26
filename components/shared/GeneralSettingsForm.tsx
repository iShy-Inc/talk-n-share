"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AvatarCategoryPicker } from "@/components/shared/AvatarCategoryPicker";
import { AvatarCategoryKey } from "@/lib/avatar-options";
import { LOCATION_OPTIONS } from "@/app/onboarding/page";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface GeneralSettingsFormProps {
	initialValues?: {
		display_name?: string;
		bio?: string;
		location?: string;
		birth_date?: string;
		zodiac?: string;
		is_public?: boolean | null;
	};
	selectedAvatar?: string;
	selectedAvatarCategory?: AvatarCategoryKey;
	onSave?: (values: {
		display_name: string;
		bio: string;
		avatarUrl: string;
		location: string;
		birth_date: string;
		is_public: boolean;
	}) => void;
	onAvatarSelect?: (avatarUrl: string) => void;
	onAvatarCategoryChange?: (category: AvatarCategoryKey) => void;
}

export function GeneralSettingsForm({
	initialValues,
	selectedAvatar = "",
	selectedAvatarCategory = "people",
	onSave,
	onAvatarSelect,
	onAvatarCategoryChange,
}: GeneralSettingsFormProps) {
	const [displayName, setDisplayName] = useState(
		initialValues?.display_name ?? "",
	);
	const [bio, setBio] = useState(initialValues?.bio ?? "");
	const [location, setLocation] = useState(initialValues?.location ?? "");
	const [birthDate, setBirthDate] = useState(initialValues?.birth_date ?? "");
	const [isPublic, setIsPublic] = useState(initialValues?.is_public ?? true);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSave?.({
			display_name: displayName,
			bio,
			avatarUrl: selectedAvatar,
			location,
			birth_date: birthDate,
			is_public: isPublic,
		});
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="mx-auto flex w-full max-w-md flex-col gap-5"
		>
			<AvatarCategoryPicker
				selectedCategory={selectedAvatarCategory}
				selectedAvatar={selectedAvatar}
				onCategoryChange={(category) => onAvatarCategoryChange?.(category)}
				onAvatarSelect={(avatarUrl) => onAvatarSelect?.(avatarUrl)}
			/>

			{/* Inputs */}
			<Input
				value={displayName}
				onChange={(e) => setDisplayName(e.target.value)}
				placeholder="Display name"
				id="settings-display-name"
			/>
			<Textarea
				value={bio}
				onChange={(e) => setBio(e.target.value)}
				placeholder="Bio"
				className="min-h-[120px] resize-none"
				id="settings-bio"
			/>
			<Select value={location} onValueChange={setLocation}>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Select location" />
				</SelectTrigger>
				<SelectContent>
					{LOCATION_OPTIONS.map((loc) => (
						<SelectItem key={loc} value={loc}>
							{loc}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<div className="space-y-2">
				<Label htmlFor="settings-birth-date">Birth date</Label>
				<Input
					id="settings-birth-date"
					type="date"
					value={birthDate}
					max={new Date().toISOString().split("T")[0]}
					onChange={(e) => setBirthDate(e.target.value)}
				/>
				<p className="text-xs text-muted-foreground">
					Zodiac is automatically calculated from birth date.
				</p>
			</div>
			<div className="space-y-2">
				<Label htmlFor="settings-profile-visibility">Profile visibility</Label>
				<Select
					value={isPublic ? "public" : "private"}
					onValueChange={(value) => setIsPublic(value === "public")}
				>
					<SelectTrigger id="settings-profile-visibility" className="w-full">
						<SelectValue placeholder="Select profile visibility" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="public">Public profile</SelectItem>
						<SelectItem value="private">Private profile</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<Button type="submit" className="w-40" id="settings-save-btn">
				Save Changes
			</Button>
		</form>
	);
}
