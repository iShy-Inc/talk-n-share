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
import { IconMapPin, IconUsers, IconSparkles } from "@tabler/icons-react";
import { LOCATION_OPTIONS } from "@/app/onboarding/page";

export type MatchCriteria = {
	gender: string;
	location: string;
	zodiac: string;
};

interface MatchOptionsProps {
	onStartMatch: (criteria: MatchCriteria) => void;
}

export function MatchOptions({ onStartMatch }: MatchOptionsProps) {
	const [criteriaType, setCriteriaType] = useState<
		"gender" | "location" | "zodiac"
	>("zodiac");
	const [gender, setGender] = useState("");
	const [location, setLocation] = useState("");
	const [zodiac, setZodiac] = useState("");

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
			zodiac,
		});
	};

	const canStart = Boolean(gender && location && zodiac);

	return (
		<div className="flex flex-col items-center justify-center space-y-8 p-8 text-center">
			<div className="space-y-4">
				<div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/10">
					<IconUsers className="size-10 text-primary" />
				</div>
				<h2 className="text-2xl font-bold">Tìm người phù hợp</h2>
				<p className="max-w-md text-foreground/75">
					Kết nối ẩn danh với người phù hợp theo tiêu chí của bạn.
				</p>
			</div>

			<div className="w-full max-w-sm space-y-4">
				<div className="grid grid-cols-3 gap-2 rounded-lg bg-accent p-1">
					<button
						onClick={() => setCriteriaType("gender")}
						className={`flex flex-col items-center justify-center rounded-md p-2 text-xs font-medium transition-all ${
							criteriaType === "gender"
								? "bg-background text-foreground shadow-sm"
								: "text-foreground/70 hover:text-foreground"
						}`}
					>
						<IconUsers className="mb-1 size-5" />
						Giới tính
					</button>
					<button
						onClick={() => setCriteriaType("location")}
						className={`flex flex-col items-center justify-center rounded-md p-2 text-xs font-medium transition-all ${
							criteriaType === "location"
								? "bg-background text-foreground shadow-sm"
								: "text-foreground/70 hover:text-foreground"
						}`}
					>
						<IconMapPin className="mb-1 size-5" />
						Khu vực
					</button>
					<button
						onClick={() => setCriteriaType("zodiac")}
						className={`flex flex-col items-center justify-center rounded-md p-2 text-xs font-medium transition-all ${
							criteriaType === "zodiac"
								? "bg-background text-foreground shadow-sm"
								: "text-foreground/70 hover:text-foreground"
						}`}
					>
						<IconSparkles className="mb-1 size-5" />
						Cung hoàng đạo
					</button>
				</div>

				<div className="space-y-2 text-left">
					<label className="text-sm font-medium">Chọn tiêu chí</label>
					{criteriaType === "gender" && (
						<Select value={gender} onValueChange={setGender}>
							<SelectTrigger>
								<SelectValue placeholder="Chọn giới tính" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="any">Bất kỳ</SelectItem>
								<SelectItem value="male">Nam</SelectItem>
								<SelectItem value="female">Nữ</SelectItem>
								<SelectItem value="others">Khác</SelectItem>
							</SelectContent>
						</Select>
					)}
					{criteriaType === "location" && (
						<Select value={location} onValueChange={setLocation}>
							<SelectTrigger>
								<SelectValue placeholder="Chọn khu vực" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="any">Bất kỳ</SelectItem>
								{LOCATION_OPTIONS.map((loc) => (
									<SelectItem key={loc} value={loc}>
										{loc}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
					{criteriaType === "zodiac" && (
						<Select value={zodiac} onValueChange={setZodiac}>
							<SelectTrigger>
								<SelectValue placeholder="Chọn cung hoàng đạo" />
							</SelectTrigger>
							<SelectContent>
								{interestOptions.map((value) => (
									<SelectItem key={value} value={value}>
										{value === "any" ? "Bất kỳ" : value}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				</div>

				<div className="grid grid-cols-3 gap-2 text-[11px]">
					<div
						className={`rounded-md border px-2 py-1.5 text-center ${
							gender
								? "border-primary/40 bg-primary/10 text-foreground"
								: "text-foreground/65"
						}`}
					>
						{gender
							? `Giới tính: ${gender.charAt(0).toUpperCase() + gender.slice(1)}`
							: "Giới tính: chưa chọn"}
					</div>
					<div
						className={`rounded-md border px-2 py-1.5 text-center ${
							location
								? "border-primary/40 bg-primary/10 text-foreground"
								: "text-foreground/65"
						}`}
					>
						{location
							? `Khu vực: ${location.charAt(0).toUpperCase() + location.slice(1)}`
							: "Khu vực: chưa chọn"}
					</div>
					<div
						className={`rounded-md border px-2 py-1.5 text-center ${
							zodiac
								? "border-primary/40 bg-primary/10 text-foreground"
								: "text-foreground/65"
						}`}
					>
						{zodiac
							? `Cung hoàng đạo: ${zodiac.charAt(0).toUpperCase() + zodiac.slice(1)}`
							: "Cung hoàng đạo: chưa chọn"}
					</div>
				</div>

				<Button
					size="lg"
					className="w-full rounded-full"
					onClick={handleStart}
					disabled={!canStart}
				>
					Bắt đầu ghép đôi
				</Button>
			</div>
		</div>
	);
}
