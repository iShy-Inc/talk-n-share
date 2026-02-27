"use client";

import Image from "next/image";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { AVATAR_CATEGORIES, AvatarCategoryKey } from "@/lib/avatar-options";

interface AvatarCategoryPickerProps {
	selectedCategory: AvatarCategoryKey;
	selectedAvatar: string;
	onCategoryChange: (category: AvatarCategoryKey) => void;
	onAvatarSelect: (avatarUrl: string) => void;
}

export function AvatarCategoryPicker({
	selectedCategory,
	selectedAvatar,
	onCategoryChange,
	onAvatarSelect,
}: AvatarCategoryPickerProps) {
	const currentCategory =
		AVATAR_CATEGORIES.find((c) => c.key === selectedCategory) ??
		AVATAR_CATEGORIES[0];

	return (
		<div className="space-y-3">
			<Label>Avatar Category</Label>
			<Select
				value={selectedCategory}
				onValueChange={(value) => onCategoryChange(value as AvatarCategoryKey)}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Select avatar category" />
				</SelectTrigger>
				<SelectContent>
					{AVATAR_CATEGORIES.map((category) => (
						<SelectItem key={category.key} value={category.key}>
							{category.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<div className="grid grid-cols-3 gap-3 md:grid-cols-6">
				{currentCategory.avatars.map((avatar) => (
					<button
						key={avatar.id}
						type="button"
						onClick={() => onAvatarSelect(avatar.src)}
						className={`size-20 overflow-hidden rounded-xl border-2 transition ${
							selectedAvatar === avatar.src
								? "border-primary"
								: "border-transparent hover:border-border"
						}`}
					>
						<span className="hidden sr-only">{avatar.label}</span>
						<Image
							src={avatar.src}
							alt={avatar.label}
							width={80}
							height={80}
							className="w-full h-full bg-muted/50 object-cover"
						/>
					</button>
				))}
			</div>
		</div>
	);
}
