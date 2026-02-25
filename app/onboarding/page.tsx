"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";
import useProfile, { MY_PROFILE_QUERY_KEY, isProfileComplete } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import toast from "react-hot-toast";

const supabase = createClient();

const ZODIAC_OPTIONS = [
	"Aries",
	"Taurus",
	"Gemini",
	"Cancer",
	"Leo",
	"Virgo",
	"Libra",
	"Scorpio",
	"Sagittarius",
	"Capricorn",
	"Aquarius",
	"Pisces",
];

const AVATAR_OPTIONS = [
	"https://api.dicebear.com/9.x/notionists/svg?seed=Fox",
	"https://api.dicebear.com/9.x/notionists/svg?seed=Falcon",
	"https://api.dicebear.com/9.x/notionists/svg?seed=Bear",
	"https://api.dicebear.com/9.x/notionists/svg?seed=Panda",
	"https://api.dicebear.com/9.x/notionists/svg?seed=Shark",
	"https://api.dicebear.com/9.x/notionists/svg?seed=Koala",
	"https://api.dicebear.com/9.x/notionists/svg?seed=Tiger",
	"https://api.dicebear.com/9.x/notionists/svg?seed=Wolf",
	"https://api.dicebear.com/9.x/notionists/svg?seed=Otter",
];

const ADJECTIVES = [
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
];

const NOUNS = [
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

const randomInt = (max: number) => Math.floor(Math.random() * max);

const buildAnonymousNames = (taken: Set<string>, total = 12) => {
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
	const [birthDate, setBirthDate] = useState("");
	const [gender, setGender] = useState<"male" | "female" | "others" | "">("");
	const [location, setLocation] = useState("");
	const [zodiac, setZodiac] = useState("");
	const [isPublic, setIsPublic] = useState<boolean | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [nameVersion, setNameVersion] = useState(0);

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
			router.replace("/");
		}
	}, [user, isLoadingProfile, profile, router]);

	useEffect(() => {
		if (!profile) return;
		if (profile.display_name) setSelectedName(profile.display_name);
		if (profile.avatar_url) setSelectedAvatar(profile.avatar_url);
		if (profile.birth_date) setBirthDate(profile.birth_date);
		if (profile.gender) setGender(profile.gender);
		if (profile.location) setLocation(profile.location);
		if (profile.zodiac) setZodiac(profile.zodiac);
		if (profile.is_public !== null && profile.is_public !== undefined) {
			setIsPublic(profile.is_public);
		}
	}, [profile]);

	const canGoNextStep1 = !!selectedName && !!selectedAvatar;
	const canGoNextStep2 = !!birthDate && !!gender;
	const canGoNextStep3 = !!location && !!zodiac;
	const canSubmit = canGoNextStep1 && canGoNextStep2 && canGoNextStep3 && isPublic !== null;

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
					zodiac,
					is_public: isPublic,
				})
				.eq("id", user.id);
			if (error) throw error;

			await queryClient.invalidateQueries({ queryKey: [MY_PROFILE_QUERY_KEY] });
			toast.success("Profile setup completed");
			router.replace("/");
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

							<Label>Choose an avatar</Label>
							<div className="grid grid-cols-3 gap-3 md:grid-cols-6">
								{AVATAR_OPTIONS.map((avatar) => (
									<button
										key={avatar}
										type="button"
										onClick={() => setSelectedAvatar(avatar)}
										className={`overflow-hidden rounded-xl border-2 transition ${
											selectedAvatar === avatar
												? "border-primary"
												: "border-transparent hover:border-border"
										}`}
									>
										<Image
											src={avatar}
											alt="Anonymous avatar option"
											width={80}
											height={80}
											className="h-20 w-full bg-muted/50 object-cover"
										/>
									</button>
								))}
							</div>
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
								<Select value={gender} onValueChange={(v) => setGender(v as any)}>
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
								<Input
									id="location"
									placeholder="City or campus"
									value={location}
									onChange={(e) => setLocation(e.target.value)}
								/>
							</div>
							<div>
								<Label>Zodiac</Label>
								<Select value={zodiac} onValueChange={setZodiac}>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select zodiac sign" />
									</SelectTrigger>
									<SelectContent>
										{ZODIAC_OPTIONS.map((z) => (
											<SelectItem key={z} value={z}>
												{z}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
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
