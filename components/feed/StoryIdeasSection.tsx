"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
	IconRefresh,
	IconSparkles,
	IconBrain,
	IconUsers,
	IconHeartHandshake,
	IconTrendingUp,
} from "@tabler/icons-react";

const STORY_TYPES = [
	{
		id: "motivation",
		label: "Tích cực",
		color: "from-emerald-400 to-teal-500",
		icon: IconSparkles,
	},
	{
		id: "mindset",
		label: "Tư duy",
		color: "from-blue-400 to-indigo-500",
		icon: IconBrain,
	},
	{
		id: "social",
		label: "Kết nối",
		color: "from-pink-400 to-rose-500",
		icon: IconUsers,
	},
	{
		id: "selfcare",
		label: "Self-care",
		color: "from-amber-400 to-orange-500",
		icon: IconHeartHandshake,
	},
	{
		id: "growth",
		label: "Phát triển",
		color: "from-violet-400 to-purple-500",
		icon: IconTrendingUp,
	},
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

const STORY_IDEAS_BY_TYPE = {
	motivation: [
		"Hôm nay bạn không cần hoàn hảo, chỉ cần tiến lên một chút.",
		"Bạn không đi chậm, bạn đang đi đúng nhịp của mình.",
		"Kỷ luật nhỏ mỗi ngày luôn thắng cảm hứng nhất thời.",
		"Đi xa là chuyện của thời gian, đi tiếp là chuyện của quyết tâm.",
		"Đừng tự so sánh chương 1 của mình với chương 20 của người khác.",
		"Ngày khó khăn không định nghĩa con người bạn.",
		"Bạn đã sống sót qua 100% ngày tệ trước đây.",
		"Thành công lớn bắt đầu từ những việc nhỏ được làm đều đặn.",
		"Nghỉ ngơi để đi xa hơn, không phải để bỏ cuộc.",
		"Mỗi sáng là một cơ hội để viết lại câu chuyện của mình.",
		"Khi chưa thấy kết quả, hãy tin vào quá trình.",
		"Tự tin không phải biết hết, mà là dám bắt đầu.",
		"Hôm nay cố gắng 1%, tương lai cảm ơn bạn 100%.",
		"Bạn mạnh mẽ hơn cảm giác mệt mỏi hiện tại.",
		"Thành tựu lớn được xây từ các thói quen nhỏ.",
	],
	mindset: [
		"Điều bạn kiểm soát được: thái độ, nỗ lực và cách phản ứng.",
		"Không phải mọi suy nghĩ đều là sự thật.",
		"Đổi câu hỏi từ “Tại sao mình tệ?” sang “Mình học được gì?”.",
		"Khi mọi thứ chưa rõ, hãy làm bước nhỏ tiếp theo.",
		"Hoàn thành tốt hơn hoàn hảo.",
		"Sai lầm là dữ liệu, không phải bản án.",
		"Một quyết định tốt hôm nay đáng giá hơn mười kế hoạch để mai.",
		"Đừng chờ tự tin mới hành động, hãy hành động để có tự tin.",
		"Suy nghĩ tích cực không phải phủ nhận khó khăn, mà là chọn cách đi qua.",
		"Sự rõ ràng đến từ hành động, không phải lo lắng.",
		"Tâm trí mạnh là tâm trí biết dừng đúng lúc.",
		"Bạn không cần đáp ứng kỳ vọng của tất cả mọi người.",
		"Ranh giới cá nhân là dấu hiệu của tự tôn, không phải ích kỷ.",
		"Tập trung vào tiến bộ, không phải sự hoàn hảo.",
		"Không có đường tắt cho sự trưởng thành bền vững.",
	],
	social: [
		"Hãy bắt đầu cuộc trò chuyện bằng một câu hỏi chân thành.",
		"Một lời cảm ơn đúng lúc có thể thay đổi cả ngày của ai đó.",
		"Lắng nghe để hiểu, không phải để phản biện.",
		"Đôi khi câu “Bạn ổn không?” là món quà lớn nhất.",
		"Sự tử tế nhỏ tạo ra hiệu ứng domino tích cực.",
		"Đừng ngại nhắn tin cho người bạn lâu ngày chưa liên lạc.",
		"Nói rõ mong muốn giúp giảm hiểu lầm trong mọi mối quan hệ.",
		"Bạn không cần nhiều bạn, chỉ cần những kết nối thật.",
		"Hãy khen cụ thể thay vì khen chung chung.",
		"Sự hiện diện trọn vẹn quý hơn lời khuyên dài dòng.",
		"Kết nối tốt bắt đầu từ việc tôn trọng khác biệt.",
		"Đôi lúc im lặng cùng nhau cũng là một kiểu thấu hiểu.",
		"Tin nhắn đầu tiên không cần hoàn hảo, chỉ cần tử tế.",
		"Học cách xin lỗi đúng cách là kỹ năng xã hội quan trọng.",
		"Cho đi sự chú ý là cách bạn thể hiện sự trân trọng.",
	],
	selfcare: [
		"Uống nước, thở sâu, giãn cơ nhẹ. Cơ thể bạn cần điều đó.",
		"Bạn được phép nghỉ mà không cần cảm thấy có lỗi.",
		"Ngủ đủ là một dạng yêu bản thân rất thực tế.",
		"Đừng nói với bản thân những lời bạn không nói với người bạn thương.",
		"Tắm nước ấm và tắt thông báo 30 phút trước khi ngủ.",
		"Hãy ăn một bữa tử tế, cơ thể bạn xứng đáng.",
		"Thở 4-4-4-4 trong 1 phút để giảm căng thẳng nhanh.",
		"Mệt thì nghỉ, đừng tự trách mình vì cần hồi phục.",
		"Viết ra điều khiến bạn lo để đầu óc nhẹ hơn.",
		"Không sao nếu hôm nay bạn chỉ làm được những việc tối thiểu.",
		"Tự chăm sóc không xa xỉ, đó là nhu cầu cơ bản.",
		"Một buổi đi bộ ngắn có thể cứu cả tâm trạng.",
		"Hạn chế doomscrolling, tâm trí bạn cần khoảng trống.",
		"Cho mình 10 phút không màn hình mỗi ngày.",
		"Hãy tự hỏi: “Cơ thể mình đang cần gì lúc này?”.",
	],
	growth: [
		"Mỗi tuần học một điều mới, bạn sẽ khác sau 1 năm.",
		"Đặt mục tiêu nhỏ đến mức bạn không thể từ chối làm.",
		"Đọc 10 trang mỗi ngày vẫn hơn 0 trang mỗi tháng.",
		"Theo dõi tiến bộ bằng dữ liệu, không chỉ cảm xúc.",
		"Muốn giỏi hơn, hãy chấp nhận giai đoạn làm chưa giỏi.",
		"Đầu tư tốt nhất là đầu tư vào kỹ năng của chính mình.",
		"Bạn sẽ đi nhanh hơn khi bớt trì hoãn quyết định nhỏ.",
		"Tập trung một việc trong 25 phút, nghỉ 5 phút.",
		"Học cách nói “không” để nói “có” với mục tiêu lớn.",
		"Không cần thay đổi cả cuộc đời trong một ngày.",
		"Kiên trì âm thầm tạo nên những kết quả ồn ào.",
		"Một hệ thống tốt luôn mạnh hơn ý chí nhất thời.",
		"Ghi lại bài học sau mỗi thất bại để không lặp lại.",
		"Bạn trở thành phiên bản tốt hơn qua từng lần sửa sai.",
		"Hôm nay gieo thói quen, ngày mai gặt thành tựu.",
	],
} as const;

const randomIndex = (size: number) => Math.floor(Math.random() * size);

export function StoryIdeasSection() {
	const [open, setOpen] = useState(false);
	const [activeTypeId, setActiveTypeId] = useState<(typeof STORY_TYPES)[number]["id"]>("motivation");
	const [activeLabel, setActiveLabel] = useState("Tích cực");
	const [activeIdea, setActiveIdea] = useState(
		STORY_IDEAS_BY_TYPE.motivation[0],
	);
	const [activeBackground, setActiveBackground] = useState(
		UNSPLASH_FALLBACK_IMAGES[0],
	);

	const stories = useMemo(() => STORY_TYPES, []);

	const getRandomIdeaByType = (
		typeId: (typeof STORY_TYPES)[number]["id"],
	) => {
		const ideas = STORY_IDEAS_BY_TYPE[typeId];
		return ideas[randomIndex(ideas.length)];
	};

	const openStory = (story: (typeof STORY_TYPES)[number]) => {
		setActiveTypeId(story.id);
		setActiveLabel(story.label);
		setActiveIdea(getRandomIdeaByType(story.id));
		setActiveBackground(
			UNSPLASH_FALLBACK_IMAGES[randomIndex(UNSPLASH_FALLBACK_IMAGES.length)],
		);
		setOpen(true);
	};

	const refreshStory = () => {
		setActiveIdea(getRandomIdeaByType(activeTypeId));
		setActiveBackground(
			UNSPLASH_FALLBACK_IMAGES[randomIndex(UNSPLASH_FALLBACK_IMAGES.length)],
		);
	};

	return (
		<>
			<div className="animate-fade-up mb-6 rounded-2xl border border-border/70 bg-card/90 px-4 py-4 shadow-sm">
				<div className="mb-3 flex items-center justify-between">
					<p className="text-sm font-semibold">Story Gợi Ý</p>
					<p className="text-xs text-muted-foreground">Chạm để xem</p>
				</div>
				<div className="flex gap-3 overflow-x-auto pb-1">
					{stories.map((story) => (
						<button
							key={story.id}
							type="button"
							onClick={() => openStory(story)}
							className="flex shrink-0 flex-col items-center gap-1.5 transition-transform duration-300 hover:-translate-y-1"
						>
							<span
								className={`flex size-16 items-center justify-center rounded-full bg-gradient-to-br ${story.color} p-[2px]`}
							>
								<span className="flex size-full items-center justify-center rounded-full bg-background text-[11px] font-semibold">
									<story.icon className="size-4" />
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
									variant="default"
									onClick={refreshStory}
									className="rounded-full border border-white/20 bg-black/80 px-5 text-white shadow-lg hover:bg-black/95"
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
