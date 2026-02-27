"use client";

import Link from "next/link";
import { IconCompass, IconMessageCircleQuestion, IconSparkles } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

const PROMPTS = [
	"Hãy chia sẻ một niềm vui nhỏ trong ngày của bạn.",
	"Đặt một câu hỏi thú vị để mở đầu cuộc trò chuyện.",
	"Đăng điều gì đó khiến bạn mỉm cười hôm nay.",
	"Chia sẻ một mẹo hữu ích mà người khác có thể cần.",
	"Viết một suy nghĩ chân thật mà bạn thường giữ riêng.",
];

export function FeedEngagementCard() {
	const prompt = PROMPTS[0];

	return (
		<div className="mb-5 overflow-hidden rounded-2xl border border-border/70 bg-[radial-gradient(circle_at_10%_10%,hsl(var(--primary)/0.12),transparent_38%),radial-gradient(circle_at_90%_20%,hsl(var(--ring)/0.10),transparent_35%),hsl(var(--card))] p-4 shadow-sm">
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
						<IconSparkles className="size-3.5" />
						Gợi ý trò chuyện
					</p>
					<p className="mt-2 text-sm font-medium text-foreground">{prompt}</p>
				</div>
			</div>

			<div className="mt-3 flex flex-wrap gap-2">
				<Button asChild size="sm" variant="secondary" className="rounded-full">
					<Link href="/search">
						<IconCompass className="mr-1.5 size-4" />
						Khám phá chủ đề
					</Link>
				</Button>
				<Button asChild size="sm" variant="outline" className="rounded-full">
					<Link href="/match">
						<IconMessageCircleQuestion className="mr-1.5 size-4" />
						Tìm người để trò chuyện
					</Link>
				</Button>
			</div>
		</div>
	);
}
