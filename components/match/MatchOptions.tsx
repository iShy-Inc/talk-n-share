"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { IconMapPin, IconUsers, IconHeart } from "@tabler/icons-react";
import useProfile from "@/hooks/useProfile";
import { LOCATION_OPTIONS } from "@/app/onboarding/page";

export type MatchCriteria = {
	type: "gender" | "location" | "interests";
	value: string;
};

interface MatchOptionsProps {
	onStartMatch: (criteria: MatchCriteria) => void;
}

export function MatchOptions({ onStartMatch }: MatchOptionsProps) {
	const { profile } = useProfile();
	const [criteriaType, setCriteriaType] = useState<
		"gender" | "location" | "interests"
	>("interests");
	const [criteriaValue, setCriteriaValue] = useState("");

	const handleStart = () => {
		onStartMatch({ type: criteriaType, value: criteriaValue });
	};

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
						<Select value={criteriaValue} onValueChange={setCriteriaValue}>
							<SelectTrigger>
								<SelectValue placeholder="Select gender" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="any">Any Gender</SelectItem>
								<SelectItem value="male">Male</SelectItem>
								<SelectItem value="female">Female</SelectItem>
							</SelectContent>
						</Select>
					)}

					{criteriaType === "location" && (
						<Select value={criteriaValue} onValueChange={setCriteriaValue}>
							<SelectTrigger>
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
					)}

					{criteriaType === "interests" && (
						<Select value={criteriaValue} onValueChange={setCriteriaValue}>
							<SelectTrigger>
								<SelectValue placeholder="Select an interest" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="any">Any Interest</SelectItem>
								<SelectItem value="coding">Coding</SelectItem>
								<SelectItem value="music">Music</SelectItem>
								<SelectItem value="movies">Movies</SelectItem>
								<SelectItem value="travel">Travel</SelectItem>
								<SelectItem value="gaming">Gaming</SelectItem>
							</SelectContent>
						</Select>
					)}
				</div>

				<Button
					size="lg"
					className="w-full rounded-full"
					onClick={handleStart}
					disabled={!criteriaValue}
				>
					Start Matching
				</Button>
			</div>
		</div>
	);
}
