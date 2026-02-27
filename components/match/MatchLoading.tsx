"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { IconLoader2 } from "@tabler/icons-react";

interface MatchLoadingProps {
	onCancel: () => void;
	elapsedSeconds: number;
	minWaitSeconds: number;
}

const PSYCHOLOGY_TIPS = [
	"Sự thật tâm lý: mỉm cười có thể giúp giảm tín hiệu căng thẳng trong não.",
	"Mẹo: đặt câu hỏi mở sẽ giúp kết nối xã hội tốt hơn.",
	"Sự thật tâm lý: mọi người thấy gần gũi hơn khi chia sẻ chuyện cá nhân nhỏ.",
	"Mẹo: đồng bộ nhịp giao tiếp giúp cuộc trò chuyện thoải mái hơn.",
	"Sự thật tâm lý: sự tò mò thường tạo ấn tượng đầu tốt hơn sự hoàn hảo.",
	"Mẹo: gọi tên tự nhiên trong chat giúp tăng cảm giác thân thiện và tin tưởng.",
	"Sự thật tâm lý: phản hồi tích cực ngắn giúp cuộc trò chuyện trôi chảy hơn.",
	"Mẹo: câu nói thể hiện đồng cảm giúp đối phương cảm thấy được lắng nghe.",
];

export function MatchLoading({
	onCancel,
	elapsedSeconds,
	minWaitSeconds,
}: MatchLoadingProps) {
	const [tipIndex, setTipIndex] = useState(0);

	useEffect(() => {
		const timer = window.setInterval(() => {
			setTipIndex((prev) => (prev + 1) % PSYCHOLOGY_TIPS.length);
		}, 10000);

		return () => {
			window.clearInterval(timer);
		};
	}, []);

	const remaining = Math.max(minWaitSeconds - elapsedSeconds, 0);

	return (
		<div className="flex flex-col items-center justify-center space-y-8 p-12 text-center">
			<div className="relative flex size-32 items-center justify-center">
				<div className="absolute inset-0 animate-ping rounded-full bg-primary/20 opacity-75 duration-1000"></div>
				<div className="absolute inset-4 animate-ping rounded-full bg-primary/30 opacity-75 duration-[1.5s]"></div>
				<div className="relative flex size-24 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl">
					<IconLoader2 className="size-10 animate-spin" />
				</div>
			</div>

			<div className="space-y-2">
				<h3 className="text-xl font-bold">Đang tìm người phù hợp...</h3>
				<p className="text-muted-foreground">
					Chúng tôi đang tìm người phù hợp với tiêu chí của bạn.
				</p>
				<p className="text-sm font-medium text-primary">
					Đang chờ: {elapsedSeconds}s / {minWaitSeconds}s
				</p>
				{remaining > 0 && (
					<p className="text-xs text-muted-foreground">
						Hãy chờ thêm ít nhất {remaining}s để có kết quả tốt hơn.
					</p>
				)}
			</div>

			<div className="w-full rounded-xl border border-border/70 bg-muted/30 p-3 text-left">
				<p className="text-xs uppercase tracking-wide text-muted-foreground">
					Mẹo tâm lý
				</p>
				<p className="mt-1 text-sm text-foreground">
					{PSYCHOLOGY_TIPS[tipIndex]}
				</p>
			</div>

			<Button
				variant="outline"
				onClick={onCancel}
				className="rounded-full px-8"
			>
				Hủy tìm
			</Button>
		</div>
	);
}
