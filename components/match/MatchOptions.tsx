"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { IconMapPin, IconUsers, IconHeart } from "@tabler/icons-react";
import { LOCATION_OPTIONS } from "@/app/onboarding/page";

export type MatchCriteria = {
	gender: string;
	location: string;
	interests: string;
};

interface MatchOptionsProps {
	onStartMatch: (criteria: MatchCriteria) => void;
}

export function MatchOptions({ onStartMatch }: MatchOptionsProps) {
	const [criteriaType, setCriteriaType] = useState<
		"gender" | "location" | "interests"
	>("interests");
	const [gender, setGender] = useState("");
	const [location, setLocation] = useState("");
	const [interests, setInterests] = useState("");

	const interestOptions = useMemo(() => {
		const zodiacs = [
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
		return ["any", ...zodiacs];
	}, []);

	const handleStart = () => {
		onStartMatch({
			gender,
			location,
			interests,
		});
	};

	const canStart = Boolean(gender && location && interests);

	return (
		<div className="flex flex-col items-center justify-center space-y-8 p-8 text-center">
			<div className="space-y-4">
				<div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/10">
					<IconUsers className="size-10 text-primary" />
				</div>
				<h2 className="text-2xl font-bold">Find a Match</h2>
				<p className="max-w-md text-muted-foreground">
					Connect anonymously with someone based on your preferences.
				</p>
			</div>

			<div className="w-full max-w-sm space-y-4">
				<div className="grid grid-cols-3 gap-2 rounded-lg bg-muted p-1">
					<button
						onClick={() => setCriteriaType("gender")}
						className={`flex flex-col items-center justify-center rounded-md p-2 text-xs font-medium transition-all ${
							criteriaType === "gender"
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						<IconUsers className="mb-1 size-5" />
						Gender
					</button>
					<button
						onClick={() => setCriteriaType("location")}
						className={`flex flex-col items-center justify-center rounded-md p-2 text-xs font-medium transition-all ${
							criteriaType === "location"
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						<IconMapPin className="mb-1 size-5" />
						Location
					</button>
					<button
						onClick={() => setCriteriaType("interests")}
						className={`flex flex-col items-center justify-center rounded-md p-2 text-xs font-medium transition-all ${
							criteriaType === "interests"
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						<IconHeart className="mb-1 size-5" />
						Interests
					</button>
				</div>

				<div className="space-y-2 text-left">
					<label className="text-sm font-medium">Select Preference</label>
					{criteriaType === "gender" && (
						<Select value={gender} onValueChange={setGender}>
							<SelectTrigger>
								<SelectValue placeholder="Select gender" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="any">Any Gender</SelectItem>
								<SelectItem value="male">Male</SelectItem>
								<SelectItem value="female">Female</SelectItem>
								<SelectItem value="others">Others</SelectItem>
							</SelectContent>
						</Select>
					)}
					{criteriaType === "location" && (
						<Select value={location} onValueChange={setLocation}>
							<SelectTrigger>
								<SelectValue placeholder="Select location" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="any">Any Location</SelectItem>
								{LOCATION_OPTIONS.map((loc) => (
									<SelectItem key={loc} value={loc}>
										{loc}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
					{criteriaType === "interests" && (
						<Select value={interests} onValueChange={setInterests}>
							<SelectTrigger>
								<SelectValue placeholder="Select an interest" />
							</SelectTrigger>
							<SelectContent>
								{interestOptions.map((value) => (
									<SelectItem key={value} value={value}>
										{value === "any" ? "Any Interest" : value}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				</div>

				<div className="grid grid-cols-3 gap-2 text-[11px]">
					<div
						className={`rounded-md border px-2 py-1.5 text-center ${
							gender ? "border-primary/40 bg-primary/10 text-foreground" : "text-muted-foreground"
						}`}
					>
						{gender ? `Gender: ${gender}` : "Gender: missing"}
					</div>
					<div
						className={`rounded-md border px-2 py-1.5 text-center ${
							location
								? "border-primary/40 bg-primary/10 text-foreground"
								: "text-muted-foreground"
						}`}
					>
						{location ? `Location: ${location}` : "Location: missing"}
					</div>
					<div
						className={`rounded-md border px-2 py-1.5 text-center ${
							interests
								? "border-primary/40 bg-primary/10 text-foreground"
								: "text-muted-foreground"
						}`}
					>
						{interests ? `Interest: ${interests}` : "Interest: missing"}
					</div>
				</div>

				<Button
					size="lg"
					className="w-full rounded-full"
					onClick={handleStart}
					disabled={!canStart}
				>
					Start Matching
				</Button>
			</div>
		</div>
	);
}
