"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface PrivacySettingsFormProps {
	initialValues?: {
		birth_date?: string;
		birth_visibility?: string | null;
		relationship?: string | null;
		is_public?: boolean | null;
	};
	onSave?: (values: {
		birth_date: string;
		birth_visibility: string;
		relationship: string;
		is_public: boolean;
	}) => void;
}

export function PrivacySettingsForm({
	initialValues,
	onSave,
}: PrivacySettingsFormProps) {
	const [birthDate, setBirthDate] = useState(initialValues?.birth_date ?? "");
	const [birthVisibility, setBirthVisibility] = useState(
		initialValues?.birth_visibility ?? "full",
	);
	const [relationship, setRelationship] = useState(
		initialValues?.relationship ?? "private",
	);
	const [isPublic, setIsPublic] = useState(initialValues?.is_public ?? true);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSave?.({
			birth_date: birthDate,
			birth_visibility: birthVisibility,
			relationship,
			is_public: isPublic,
		});
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="mx-auto flex w-full max-w-md flex-col gap-5"
		>
			<div className="space-y-2">
				<Label htmlFor="privacy-birth-date">Birth date</Label>
				<Input
					id="privacy-birth-date"
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
				<Label htmlFor="privacy-birthday-visibility">Birthday privacy</Label>
				<Select value={birthVisibility} onValueChange={setBirthVisibility}>
					<SelectTrigger id="privacy-birthday-visibility" className="w-full">
						<SelectValue placeholder="Select birthday visibility" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="full">Show full birthday (day/month/year)</SelectItem>
						<SelectItem value="month_year">Hide day (month/year only)</SelectItem>
						<SelectItem value="day_month">Show day/month only</SelectItem>
						<SelectItem value="year_only">Show only year</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Label htmlFor="privacy-relationship">Relationship</Label>
				<Select value={relationship} onValueChange={setRelationship}>
					<SelectTrigger id="privacy-relationship" className="w-full">
						<SelectValue placeholder="Select relationship status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="single">Single</SelectItem>
						<SelectItem value="in_relationship">In a relationship</SelectItem>
						<SelectItem value="married">Married</SelectItem>
						<SelectItem value="complicated">Complicated</SelectItem>
						<SelectItem value="private">Prefer not to say</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Label htmlFor="privacy-profile-visibility">Profile visibility</Label>
				<Select
					value={isPublic ? "public" : "private"}
					onValueChange={(value) => setIsPublic(value === "public")}
				>
					<SelectTrigger id="privacy-profile-visibility" className="w-full">
						<SelectValue placeholder="Select profile visibility" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="public">Public profile</SelectItem>
						<SelectItem value="private">Private profile</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<Button type="submit" className="w-40" id="privacy-save-btn">
				Save Changes
			</Button>
		</form>
	);
}
