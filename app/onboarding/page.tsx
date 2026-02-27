"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";
import useProfile, {
	MY_PROFILE_QUERY_KEY,
	isProfileComplete,
} from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AvatarCategoryPicker } from "@/components/shared/AvatarCategoryPicker";
import {
	AvatarCategoryKey,
	getAvatarCategoryForUrl,
} from "@/lib/avatar-options";
import { getZodiacSign } from "@/lib/zodiac";
import toast from "react-hot-toast";

const supabase = createClient();

export const LOCATION_OPTIONS = [
	"Hola Campus",
	"Xavalo Campus",
	"Hovilo Campus",
	"Fuda Campus",
	"Quy Nhon Campus",
	"Others",
];

export const ADJECTIVES = [
	"Silent",
	"Curious",
	"Hidden",
	"Brave",
	"Cosmic",
	"Misty",
	"Neon",
	"Swift",
	"Gentle",
	"Lucky",
	"Echo",
	"Calm",
	"Happy",
	"Sad",
	"Angry",
	"Scared",
	"Surprised",
	"Excited",
	"Bored",
	"Tired",
	"Hungry",
	"Thirsty",
	"Sleepy",
	"Energetic",
	"Calm",
	"Happy",
	"Sad",
	"Angry",
	"Scared",
	"Surprised",
	"Excited",
	"Bored",
	"Tired",
	"Hungry",
	"Thirsty",
	"Sleepy",
	"Energetic",
];

export const NOUNS = [
	"Fox",
	"Hawk",
	"Otter",
	"Panda",
	"Tiger",
	"Koala",
	"Wolf",
	"Comet",
	"Breeze",
	"Raven",
	"Whale",
	"Falcon",
	"Fox",
	"Hawk",
	"Otter",
	"Panda",
	"Tiger",
	"Koala",
	"Wolf",
	"Comet",
	"Breeze",
	"Raven",
	"Whale",
	"Falcon",
];

export const randomInt = (max: number) => Math.floor(Math.random() * max);

export const buildAnonymousNames = (taken: Set<string>, total = 12) => {
	const result = new Set<string>();
	let attempts = 0;
	while (result.size < total && attempts < 300) {
		const name = `${ADJECTIVES[randomInt(ADJECTIVES.length)]} ${
			NOUNS[randomInt(NOUNS.length)]
		} ${100 + randomInt(900)}`;
		if (!taken.has(name)) result.add(name);
		attempts += 1;
	}
	return Array.from(result);
};

export default function OnboardingPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const user = useAuthStore((state) => state.user);
	const { profile, loading: isLoadingProfile } = useProfile();

	const [step, setStep] = useState(1);
	const [selectedName, setSelectedName] = useState("");
	const [selectedAvatar, setSelectedAvatar] = useState("");
	const [selectedAvatarCategory, setSelectedAvatarCategory] =
		useState<AvatarCategoryKey>("people");
	const [birthDate, setBirthDate] = useState("");
	const [gender, setGender] = useState<"male" | "female" | "others" | "">("");
	const [location, setLocation] = useState("");
	const [bio, setBio] = useState("");
	const [isPublic, setIsPublic] = useState<boolean | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [nameVersion, setNameVersion] = useState(0);
	const zodiac = useMemo(() => getZodiacSign(birthDate), [birthDate]);

	const { data: allNames = [] } = useQuery({
		queryKey: ["all-profile-names"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("profiles")
				.select("display_name")
				.not("display_name", "is", null);
			if (error) throw error;
			return (data ?? [])
				.map((row: any) => row.display_name as string)
				.filter(Boolean);
		},
		enabled: !!user,
	});

	const availableNames = useMemo(() => {
		void nameVersion;
		const taken = new Set(allNames);
		return buildAnonymousNames(taken, 12);
	}, [allNames, nameVersion]);

	useEffect(() => {
		if (!user) {
			router.replace("/login");
			return;
		}
		if (!isLoadingProfile && isProfileComplete(profile)) {
			router.replace("/profile?tab=settings&section=general");
		}
	}, [user, isLoadingProfile, profile, router]);

	useEffect(() => {
		if (!profile) return;
		if (profile.display_name) setSelectedName(profile.display_name);
		if (profile.avatar_url) {
			setSelectedAvatar(profile.avatar_url);
			setSelectedAvatarCategory(getAvatarCategoryForUrl(profile.avatar_url));
		}
		if (profile.birth_date) setBirthDate(profile.birth_date);
		if (profile.gender) setGender(profile.gender);
		if (profile.location) setLocation(profile.location);
		if (profile.bio) setBio(profile.bio);
		if (profile.is_public !== null && profile.is_public !== undefined) {
			setIsPublic(profile.is_public);
		}
	}, [profile]);

	const canGoNextStep1 = !!selectedName && !!selectedAvatar;
	const canGoNextStep2 = !!birthDate && !!gender;
	const canGoNextStep3 = !!location && !!bio.trim();
	const canSubmit =
		canGoNextStep1 && canGoNextStep2 && canGoNextStep3 && isPublic !== null;

	const handleSaveProfile = async () => {
		if (!user || !canSubmit) return;
		try {
			setIsSubmitting(true);
			const { error } = await supabase
				.from("profiles")
				.update({
					display_name: selectedName,
					avatar_url: selectedAvatar,
					birth_date: birthDate,
					gender,
					location,
					bio: bio.trim(),
					zodiac,
					is_public: isPublic,
				})
				.eq("id", user.id);
			if (error) throw error;

			await queryClient.invalidateQueries({ queryKey: [MY_PROFILE_QUERY_KEY] });
			toast.success("Profile setup completed");
			router.replace("/profile?tab=settings&section=general");
		} catch (error: any) {
			toast.error(error?.message ?? "Failed to save onboarding profile");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4 py-10">
			<Card className="w-full border-border/60 bg-card/90 shadow-xl">
				<CardHeader>
					<CardTitle>Complete Your Anonymous Profile</CardTitle>
					<p className="text-sm text-muted-foreground">
						Step {step} of 4. All steps are required before entering the app.
					</p>
				</CardHeader>
				<CardContent className="space-y-6">
					{step === 1 && (
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<Label>Choose an anonymous name</Label>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => setNameVersion((v) => v + 1)}
								>
									Regenerate
								</Button>
							</div>
							<div className="grid grid-cols-2 gap-2 md:grid-cols-3">
								{availableNames.map((name) => (
									<Button
										key={name}
										type="button"
										variant={selectedName === name ? "default" : "outline"}
										className="h-auto whitespace-normal px-3 py-2 text-xs"
										onClick={() => setSelectedName(name)}
									>
										{name}
									</Button>
								))}
							</div>

							<AvatarCategoryPicker
								selectedCategory={selectedAvatarCategory}
								selectedAvatar={selectedAvatar}
								onCategoryChange={setSelectedAvatarCategory}
								onAvatarSelect={setSelectedAvatar}
							/>
						</div>
					)}

					{step === 2 && (
						<div className="space-y-4">
							<div>
								<Label htmlFor="birth-date">Birth date</Label>
								<Input
									id="birth-date"
									type="date"
									value={birthDate}
									max={new Date().toISOString().split("T")[0]}
									onChange={(e) => setBirthDate(e.target.value)}
								/>
							</div>
							<div>
								<Label>Gender</Label>
								<Select
									value={gender}
									onValueChange={(v) => setGender(v as any)}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select your gender" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="male">Male</SelectItem>
										<SelectItem value="female">Female</SelectItem>
										<SelectItem value="others">Others</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					)}

					{step === 3 && (
						<div className="space-y-4">
							<div>
								<Label htmlFor="location">Location</Label>
								<Select value={location} onValueChange={setLocation}>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select location" />
									</SelectTrigger>
									<SelectContent>
										{LOCATION_OPTIONS.map((l) => (
											<SelectItem key={l} value={l}>
												{l}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="onboarding-bio">Bio</Label>
								<Textarea
									id="onboarding-bio"
									placeholder="Tell people a little bit about yourself..."
									value={bio}
									onChange={(e) => setBio(e.target.value)}
									className="min-h-[110px] resize-none"
								/>
							</div>
							<div className="rounded-xl border border-border bg-muted/20 p-3">
								<p className="text-xs text-muted-foreground">
									Zodiac is auto-detected from birth date
								</p>
								<p className="text-sm font-semibold">{zodiac || "—"}</p>
							</div>
						</div>
					)}

					{step === 4 && (
						<div className="space-y-4">
							<Label>Profile visibility</Label>
							<div className="space-y-2 rounded-xl border border-border p-3">
								<div className="flex items-center gap-2">
									<Checkbox
										checked={isPublic === true}
										onCheckedChange={(checked) =>
											checked ? setIsPublic(true) : null
										}
									/>
									<span className="text-sm">Public profile</span>
								</div>
								<div className="flex items-center gap-2">
									<Checkbox
										checked={isPublic === false}
										onCheckedChange={(checked) =>
											checked ? setIsPublic(false) : null
										}
									/>
									<span className="text-sm">Private profile</span>
								</div>
							</div>

							<div className="rounded-xl border border-border bg-muted/30 p-3 text-sm">
								<p>
									Anonymous Name: <strong>{selectedName}</strong>
								</p>
								<p>Location: {location}</p>
								<p>Bio: {bio || "—"}</p>
								<p>Zodiac: {zodiac}</p>
								<p>Gender: {gender}</p>
							</div>
						</div>
					)}

					<div className="flex items-center justify-between pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => setStep((s) => Math.max(1, s - 1))}
							disabled={step === 1 || isSubmitting}
						>
							Back
						</Button>

						{step < 4 ? (
							<Button
								type="button"
								onClick={() => setStep((s) => Math.min(4, s + 1))}
								disabled={
									isSubmitting ||
									(step === 1 && !canGoNextStep1) ||
									(step === 2 && !canGoNextStep2) ||
									(step === 3 && !canGoNextStep3)
								}
							>
								Next
							</Button>
						) : (
							<Button
								type="button"
								onClick={handleSaveProfile}
								disabled={!canSubmit || isSubmitting}
							>
								{isSubmitting ? "Saving..." : "Finish"}
							</Button>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
