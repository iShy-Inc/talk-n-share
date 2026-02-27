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
			<Label htmlFor="avatar-category">Chọn ảnh đại diện</Label>
			<Select
				value={selectedCategory}
				onValueChange={(value) => onCategoryChange(value as AvatarCategoryKey)}
			>
				<SelectTrigger className="w-full" id="avatar-category">
					<SelectValue placeholder="Chọn danh mục ảnh đại diện" />
				</SelectTrigger>
				<SelectContent>
					{AVATAR_CATEGORIES.map((category) => (
						<SelectItem key={category.key} value={category.key}>
							{category.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<div className="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-2 sm:grid-cols-[repeat(auto-fill,minmax(82px,1fr))] sm:gap-3">
				{currentCategory.avatars.map((avatar) => (
					<button
						key={avatar.id}
						type="button"
						onClick={() => onAvatarSelect(avatar.src)}
						className={`aspect-square w-full overflow-hidden rounded-xl border-2 transition ${
							selectedAvatar === avatar.src
								? "border-primary"
								: "border-transparent hover:border-border"
						}`}
					>
						<span className="hidden sr-only">{avatar.label}</span>
						<Image
							src={avatar.src}
							alt={avatar.label}
							width={160}
							height={160}
							className="h-full w-full bg-muted/50 object-cover"
						/>
					</button>
				))}
			</div>
		</div>
	);
}
