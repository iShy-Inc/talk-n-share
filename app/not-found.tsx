import Link from "next/link";
import {
	IconArrowLeft,
	IconCompass,
	IconHome2,
	IconMessageCircle,
	IconSearch,
} from "@tabler/icons-react";
import { AppLogo } from "@/components/shared/AppLogo";
import { Button } from "@/components/ui/button";

const quickLinks = [
	{
		href: "/",
		label: "Về trang chủ",
		description: "Quay lại bảng tin và nội dung mới nhất.",
		icon: IconHome2,
	},
	{
		href: "/search",
		label: "Tìm kiếm",
		description: "Tìm bài viết, người dùng hoặc chủ đề bạn cần.",
		icon: IconSearch,
	},
	{
		href: "/messages",
		label: "Tin nhắn",
		description: "Mở lại các cuộc trò chuyện gần đây.",
		icon: IconMessageCircle,
	},
] as const;

export default function NotFound() {
	return (
		<main className="relative min-h-screen overflow-hidden bg-background">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_32%)]" />
			<div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-10">
				<header className="flex items-center justify-between">
					<Link href="/" className="inline-flex items-center">
						<AppLogo showText textClassName="text-base" />
					</Link>
					<Button asChild variant="ghost" className="rounded-full">
						<Link href="/">
							<IconArrowLeft className="size-4" />
							Trang chủ
						</Link>
					</Button>
				</header>

				<section className="flex flex-1 items-center py-10">
					<div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
						<div className="rounded-[2rem] border border-border/70 bg-card/90 p-8 shadow-xl shadow-black/5 backdrop-blur-sm sm:p-10">
							<div className="inline-flex rounded-full border border-border/60 bg-background px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
								Error 404
							</div>
							<h1 className="mt-5 max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
								Trang bạn tìm không còn ở đây.
							</h1>
							<p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
								Liên kết có thể đã thay đổi, bị xóa hoặc địa chỉ URL chưa đúng.
								Bạn có thể quay lại các khu vực chính của Talk N Share từ đây.
							</p>

							<div className="mt-8 flex flex-wrap gap-3">
								<Button asChild size="lg">
									<Link href="/">
										<IconCompass className="size-4" />
										Khám phá lại
									</Link>
								</Button>
								<Button asChild size="lg" variant="outline">
									<Link href="/search">
										<IconSearch className="size-4" />
										Tìm nội dung
									</Link>
								</Button>
							</div>
						</div>

						<div className="rounded-[2rem] border border-border/70 bg-card/85 p-6 shadow-lg shadow-black/5 backdrop-blur-sm sm:p-8">
							<p className="text-sm font-semibold text-foreground">
								Lối đi nhanh
							</p>
							<div className="mt-5 space-y-3">
								{quickLinks.map((item) => {
									const Icon = item.icon;
									return (
										<Link
											key={item.href}
											href={item.href}
											className="group flex items-start gap-4 rounded-3xl border border-border/60 bg-background/80 p-4 transition-colors hover:border-primary/40 hover:bg-background"
										>
											<span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
												<Icon className="size-5" />
											</span>
											<span className="block">
												<span className="block text-sm font-semibold text-foreground">
													{item.label}
												</span>
												<span className="mt-1 block text-sm leading-6 text-muted-foreground">
													{item.description}
												</span>
											</span>
										</Link>
									);
								})}
							</div>
						</div>
					</div>
				</section>
			</div>
		</main>
	);
}
