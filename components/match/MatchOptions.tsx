"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
	priority: "relaxed" | "balanced" | "strict";
};

interface MatchOptionsProps {
	onStartMatch: (criteria: MatchCriteria) => void;
}

const GENDER_OPTIONS = [
	{ value: "any", label: "Bất kỳ" },
	{ value: "male", label: "Nam" },
	{ value: "female", label: "Nữ" },
	{ value: "others", label: "Khác" },
];

const ZODIAC_GROUP_OPTIONS = [
	{ value: "any", label: "Bất kỳ" },
	{ value: "fire", label: "Lửa" },
	{ value: "earth", label: "Đất" },
	{ value: "air", label: "Khí" },
	{ value: "water", label: "Nước" },
];

const PRIORITY_OPTIONS = [
	{
		value: "relaxed" as const,
		label: "Dễ ghép",
		description: "Chỉ cần khớp 1 tiêu chí là có thể ghép đôi.",
	},
	{
		value: "balanced" as const,
		label: "Cân bằng",
		description: "Ưu tiên người khớp từ 2 tiêu chí nếu có.",
	},
	{
		value: "strict" as const,
		label: "Kén chọn",
		description: "Cố gắng ghép người khớp tối đa với bộ lọc đã chọn.",
	},
];

export function MatchOptions({ onStartMatch }: MatchOptionsProps) {
	const [gender, setGender] = useState("any");
	const [location, setLocation] = useState("any");
	const [zodiac, setZodiac] = useState("any");
	const [priority, setPriority] =
		useState<MatchCriteria["priority"]>("relaxed");

	const handleStart = () => {
		onStartMatch({
			gender,
			location,
			zodiac,
			priority,
		});
	};

	const selectedPriority =
		PRIORITY_OPTIONS.find((option) => option.value === priority) ??
		PRIORITY_OPTIONS[0];

	return (
		<div className="flex h-full min-h-0 w-full justify-center">
			<ScrollArea className="max-h-[calc(100dvh-1.5rem)] w-full max-w-6xl md:max-h-[min(48rem,calc(100dvh-4rem))] xl:max-h-none">
				<div className=" border border-border/70 bg-card/95 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.45)]">
					<div className="border-b border-border/60 px-4 py-5 text-center sm:px-6 md:px-8 md:py-7">
						<div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 sm:size-20">
							<IconUsers className="size-8 text-primary sm:size-10" />
						</div>
						<h2 className="mt-3 text-xl font-bold sm:text-2xl">
							Tìm người phù hợp
						</h2>
						<p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-foreground/75 sm:text-base">
							Kết nối ẩn danh với người phù hợp theo tiêu chí của bạn. Để càng
							nhiều mục ở mức bất kỳ thì bạn càng dễ gặp người mới.
						</p>
					</div>

					<div className="space-y-4 px-4 py-4 sm:px-6 md:space-y-5 md:px-8 md:py-6">
						<div className="rounded-3xl border border-border/60 bg-background/50 p-3 sm:p-4">
							<div className="mb-3 text-left sm:mb-4">
								<p className="text-sm font-semibold text-foreground">
									Bộ lọc ghép đôi
								</p>
								<p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
									Chọn ít hoặc nhiều tiêu chí tùy ý. Hệ thống sẽ ưu tiên người
									khớp nhiều hơn nhưng không ép bạn phải lọc quá chặt.
								</p>
							</div>
							<div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
								<div className="space-y-2 rounded-2xl border border-border/60 bg-card/90 p-3">
									<label className="flex items-center gap-2 text-sm font-medium">
										<IconUsers className="size-4 text-primary" />
										Giới tính
									</label>
									<Select value={gender} onValueChange={setGender}>
										<SelectTrigger className="h-11 w-full rounded-xl">
											<SelectValue placeholder="Bất kỳ" />
										</SelectTrigger>
										<SelectContent>
											{GENDER_OPTIONS.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2 rounded-2xl border border-border/60 bg-card/90 p-3">
									<label className="flex items-center gap-2 text-sm font-medium">
										<IconMapPin className="size-4 text-primary" />
										Khu vực
									</label>
									<Select value={location} onValueChange={setLocation}>
										<SelectTrigger className="h-11 w-full rounded-xl">
											<SelectValue placeholder="Bất kỳ" />
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
								</div>

								<div className="space-y-2 rounded-2xl border border-border/60 bg-card/90 p-3">
									<label className="flex items-center gap-2 text-sm font-medium">
										<IconSparkles className="size-4 text-primary" />
										Nhóm cung
									</label>
									<Select value={zodiac} onValueChange={setZodiac}>
										<SelectTrigger className="h-11 w-full rounded-xl">
											<SelectValue placeholder="Bất kỳ" />
										</SelectTrigger>
										<SelectContent>
											{ZODIAC_GROUP_OPTIONS.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2 rounded-2xl border border-primary/20 bg-primary/5 p-3">
									<label className="flex items-center gap-2 text-sm font-medium">
										<IconSparkles className="size-4 text-primary" />
										Mức độ ưu tiên
									</label>
									<Select
										value={priority}
										onValueChange={(value) =>
											setPriority(value as MatchCriteria["priority"])
										}
									>
										<SelectTrigger className="h-11 w-full rounded-xl bg-background">
											<SelectValue placeholder="Dễ ghép" />
										</SelectTrigger>
										<SelectContent>
											{PRIORITY_OPTIONS.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>

						<div className="rounded-3xl border border-border/60 bg-muted/20 p-3 text-left sm:p-4">
							<div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] xl:items-start">
								<div>
									<p className="text-sm font-semibold text-foreground">
										Tóm tắt lựa chọn
									</p>
									<p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
										Hệ thống ưu tiên người khớp nhiều tiêu chí hơn, nhưng vẫn
										giữ tỉ lệ ghép đôi đủ cao theo mức ưu tiên bạn chọn.
									</p>

									<div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 2xl:grid-cols-4">
										<div
											className={`rounded-xl border px-3 py-2 ${
												gender !== "any"
													? "border-primary/40 bg-primary/10 text-foreground"
													: "border-border/60 bg-background/70 text-foreground/65"
											}`}
										>
											{gender !== "any"
												? `Giới tính: ${GENDER_OPTIONS.find((option) => option.value === gender)?.label ?? gender}`
												: "Giới tính: bất kỳ"}
										</div>
										<div
											className={`rounded-xl border px-3 py-2 ${
												location !== "any"
													? "border-primary/40 bg-primary/10 text-foreground"
													: "border-border/60 bg-background/70 text-foreground/65"
											}`}
										>
											{location !== "any"
												? `Khu vực: ${location}`
												: "Khu vực: bất kỳ"}
										</div>
										<div
											className={`rounded-xl border px-3 py-2 ${
												zodiac !== "any"
													? "border-primary/40 bg-primary/10 text-foreground"
													: "border-border/60 bg-background/70 text-foreground/65"
											}`}
										>
											{zodiac !== "any"
												? `Nhóm cung: ${ZODIAC_GROUP_OPTIONS.find((option) => option.value === zodiac)?.label ?? zodiac}`
												: "Nhóm cung: bất kỳ"}
										</div>
										<div className="rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-foreground">
											{`Ưu tiên: ${selectedPriority.label}`}
										</div>
									</div>
								</div>

								<div className="space-y-3">
									<div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
										<p className="text-sm font-medium text-foreground">
											{selectedPriority.label}
										</p>
										<p className="mt-1 text-sm leading-relaxed text-foreground/70">
											{selectedPriority.description}
										</p>
									</div>

									<Button
										size="lg"
										className="h-12 w-full rounded-full text-base"
										onClick={handleStart}
									>
										Tìm kiếm
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</ScrollArea>
		</div>
	);
}
