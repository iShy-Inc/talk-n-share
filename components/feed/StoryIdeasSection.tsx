"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconRefresh, IconBulb } from "@tabler/icons-react";

const STORY_TYPES = [
	{ id: "motivation", label: "Tích cực", color: "from-emerald-400 to-teal-500" },
	{ id: "mindset", label: "Tư duy", color: "from-blue-400 to-indigo-500" },
	{ id: "social", label: "Kết nối", color: "from-pink-400 to-rose-500" },
	{ id: "selfcare", label: "Self-care", color: "from-amber-400 to-orange-500" },
	{ id: "growth", label: "Phát triển", color: "from-violet-400 to-purple-500" },
] as const;

const UNSPLASH_FALLBACK_IMAGES = [
	"https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&h=1800&q=80",
	"https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1200&h=1800&q=80",
	"https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&h=1800&q=80",
	"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&h=1800&q=80",
	"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&h=1800&q=80",
	"https://images.unsplash.com/photo-1493244040629-496f6d136cc3?auto=format&fit=crop&w=1200&h=1800&q=80",
	"https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&h=1800&q=80",
	"https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&h=1800&q=80",
] as const;

const VIETNAMESE_IDEAS = [
	"Đôi khi im lặng không phải yếu đuối, mà là cách mình tự chữa lành.",
	"Hôm nay bạn không cần hoàn hảo, chỉ cần tử tế với chính mình.",
	"Hãy hỏi một người bạn: “Dạo này bạn ổn không?”",
	"Thử viết 3 điều bạn biết ơn trước khi ngủ.",
	"Một cuộc trò chuyện chân thành có thể thay đổi cả ngày của ai đó.",
	"Khi mệt, nghỉ một chút. Bỏ cuộc và nghỉ ngơi là hai chuyện khác nhau.",
	"Bạn không đi chậm, bạn đang đi đúng nhịp của mình.",
	"Thử chia sẻ một điều bạn học được tuần này lên feed.",
	"Không sao nếu hôm nay bạn chỉ làm được 60%, vẫn là tiến lên.",
	"Nhắn một tin cảm ơn cho người từng giúp bạn, dù chỉ một lần.",
] as const;

const randomIndex = (size: number) => Math.floor(Math.random() * size);

export function StoryIdeasSection() {
	const [open, setOpen] = useState(false);
	const [activeLabel, setActiveLabel] = useState("Tích cực");
	const [activeIdea, setActiveIdea] = useState(VIETNAMESE_IDEAS[0]);
	const [activeBackground, setActiveBackground] = useState(
		UNSPLASH_FALLBACK_IMAGES[0],
	);

	const stories = useMemo(() => STORY_TYPES, []);

	const openStory = (label: string) => {
		setActiveLabel(label);
		setActiveIdea(VIETNAMESE_IDEAS[randomIndex(VIETNAMESE_IDEAS.length)]);
		setActiveBackground(
			UNSPLASH_FALLBACK_IMAGES[randomIndex(UNSPLASH_FALLBACK_IMAGES.length)],
		);
		setOpen(true);
	};

	const refreshStory = () => {
		setActiveIdea(VIETNAMESE_IDEAS[randomIndex(VIETNAMESE_IDEAS.length)]);
		setActiveBackground(
			UNSPLASH_FALLBACK_IMAGES[randomIndex(UNSPLASH_FALLBACK_IMAGES.length)],
		);
	};

	return (
		<>
			<div className="mb-6 rounded-2xl border border-border/70 bg-card/90 px-4 py-4 shadow-sm">
				<div className="mb-3 flex items-center justify-between">
					<p className="text-sm font-semibold">Story Gợi Ý</p>
					<p className="text-xs text-muted-foreground">Chạm để xem</p>
				</div>
				<div className="flex gap-3 overflow-x-auto pb-1">
					{stories.map((story) => (
						<button
							key={story.id}
							type="button"
							onClick={() => openStory(story.label)}
							className="flex shrink-0 flex-col items-center gap-1.5"
						>
							<span
								className={`flex size-16 items-center justify-center rounded-full bg-gradient-to-br ${story.color} p-[2px]`}
							>
								<span className="flex size-full items-center justify-center rounded-full bg-background text-[11px] font-semibold">
									<IconBulb className="size-4" />
								</span>
							</span>
							<span className="max-w-16 truncate text-[11px] text-muted-foreground">
								{story.label}
							</span>
						</button>
					))}
				</div>
			</div>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent
					showCloseButton
					className="h-[88vh] max-w-md overflow-hidden border-0 p-0"
				>
					<DialogTitle className="sr-only">Gợi ý story</DialogTitle>
					<div className="relative h-full w-full">
						<Image
							src={activeBackground}
							alt="Nền story"
							fill
							unoptimized
							className="object-cover"
						/>
						<div className="absolute inset-0 bg-black/45" />
						<div className="relative z-10 flex h-full flex-col justify-between p-6 text-white">
							<div>
								<p className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
									{activeLabel}
								</p>
							</div>

							<div className="rounded-2xl bg-black/35 p-5 backdrop-blur-sm">
								<p className="text-center text-xl font-semibold leading-relaxed">
									{activeIdea}
								</p>
							</div>

							<div className="flex justify-center">
								<Button
									type="button"
									variant="secondary"
									onClick={refreshStory}
									className="rounded-full bg-white/85 text-foreground hover:bg-white"
								>
									<IconRefresh className="mr-2 size-4" />
									Ý tưởng khác
								</Button>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
