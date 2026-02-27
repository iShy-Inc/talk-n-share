"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	IconMail,
	IconBrandGithub,
	IconBrandTwitter,
	IconMapPin,
	IconPhone,
	IconSend,
} from "@tabler/icons-react";
import { toast } from "sonner";
import Link from "next/link";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function ContactPage() {
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1500));
		setIsLoading(false);
		toast.success("Gửi tin nhắn thành công! Chúng tôi sẽ phản hồi bạn sớm.");
		// Reset form logic here
	};

	return (
		<div className="min-h-screen bg-background pb-12">
			{/* Header */}
			<div className="relative overflow-hidden border-b bg-card py-16 text-center shadow-sm md:py-24">
				<div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />
				<h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
					Liên hệ <span className="text-primary">với chúng tôi</span>
				</h1>
				<p className="mx-auto max-w-xl text-lg text-muted-foreground">
					Bạn có câu hỏi về Talk-N-Share, góp ý về hệ thống ghép đôi, hoặc chỉ
					muốn chào một câu? Chúng tôi rất muốn lắng nghe bạn.
				</p>
			</div>

			<div className="container mx-auto mt-12 px-4">
				<div className="grid gap-8 lg:grid-cols-2">
					{/* Contact Form */}
					<Card className="border-0 shadow-lg">
						<CardHeader>
							<CardTitle>Gửi tin nhắn cho chúng tôi</CardTitle>
							<CardDescription>
								Điền biểu mẫu bên dưới, đội ngũ của chúng tôi sẽ phản hồi trong
								vòng 24 giờ.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-6">
								<div className="grid gap-4 sm:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="name">Tên</Label>
										<Input id="name" placeholder="Group 3" required />
									</div>
									<div className="space-y-2">
										<Label htmlFor="email">Email</Label>
										<Input
											id="email"
											type="email"
											placeholder="group3@ssg104.com"
											required
										/>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="subject">Chủ đề</Label>
									<Input
										id="subject"
										placeholder="Góp ý / Câu hỏi"
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="message">Tin nhắn</Label>
									<Textarea
										id="message"
										placeholder="Hãy cho chúng tôi biết điều bạn đang quan tâm..."
										className="min-h-[150px]"
										required
									/>
								</div>
								<Button type="submit" className="w-full" disabled={isLoading}>
									{isLoading ? (
										<span className="flex items-center gap-2">
											<span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
											Đang gửi...
										</span>
									) : (
										<span className="flex items-center gap-2">
											<IconSend className="size-4" />
											Gửi tin nhắn
										</span>
									)}
								</Button>
							</form>
						</CardContent>
					</Card>

					{/* Contact Info */}
					<div className="space-y-8">
						{/* Info Cards */}
						<div className="grid gap-4 sm:grid-cols-2">
							<Card className="group overflow-hidden border transition-all hover:border-primary/50 hover:shadow-md">
								<CardContent className="flex flex-col items-center justify-center p-6 text-center">
									<div className="mb-4 inline-flex rounded-full bg-primary/10 p-3 text-primary group-hover:scale-110 transition-transform">
										<IconMail className="size-6" />
									</div>
									<h3 className="mb-1 font-semibold">Email liên hệ</h3>
									<p className="text-sm text-muted-foreground">
										group3@ssg104.com
									</p>
								</CardContent>
							</Card>

							<Card className="group overflow-hidden border transition-all hover:border-primary/50 hover:shadow-md">
								<CardContent className="flex flex-col items-center justify-center p-6 text-center">
									<div className="mb-4 inline-flex rounded-full bg-primary/10 p-3 text-primary group-hover:scale-110 transition-transform">
										<IconMapPin className="size-6" />
									</div>
									<h3 className="mb-1 font-semibold">Địa chỉ</h3>
									<p className="text-sm text-muted-foreground">
										Group 3 - SSG104
									</p>
									<p className="text-sm text-muted-foreground">
										FPT Hanoi Campus
									</p>
								</CardContent>
							</Card>
						</div>

						{/* FAQ Section */}
						<Card>
							<CardHeader>
								<CardTitle>Câu hỏi thường gặp</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="rounded-lg border p-4">
									<h4 className="font-semibold text-sm">
										Talk-N-Share có thực sự ẩn danh không?
									</h4>
									<p className="mt-1 text-sm text-muted-foreground">
										Có! Mặc định hồ sơ của bạn sẽ được ẩn. Bạn chỉ hiện danh tính
										khi bạn muốn, thường là sau khi ghép đôi thành công.
									</p>
								</div>
								<div className="rounded-lg border p-4">
									<h4 className="font-semibold text-sm">
										Hệ thống ghép đôi hoạt động như thế nào?
									</h4>
									<p className="mt-1 text-sm text-muted-foreground">
										Nếu bạn không đặt bộ lọc, thuật toán sẽ ghép bạn với người
										dùng có sở thích hoặc khu vực phù hợp.
									</p>
								</div>
								<div className="rounded-lg border p-4">
									<h4 className="font-semibold text-sm">Sử dụng có miễn phí không?</h4>
									<p className="mt-1 text-sm text-muted-foreground">
										Hoàn toàn miễn phí. Các tính năng cốt lõi như đăng bài, ghép
										đôi và trò chuyện đều miễn phí.
									</p>
								</div>
							</CardContent>
						</Card>

						{/* Social Links */}
						<div className="flex justify-center gap-6 pt-4">
							<a
								href="#"
								className="text-muted-foreground transition-colors hover:text-primary"
							>
								<IconBrandTwitter className="size-6" />
							</a>
							<a
								href="#"
								className="text-muted-foreground transition-colors hover:text-primary"
							>
								<IconBrandGithub className="size-6" />
							</a>
							<a
								href="#"
								className="text-muted-foreground transition-colors hover:text-primary"
							>
								<IconPhone className="size-6" />
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
