"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
	IconPhone,
	IconMail,
	IconMapPin,
	IconWorld,
	IconClock,
	IconShieldHeart,
	IconArrowLeft,
	IconAlertTriangle,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { SUPPORT_CONTACTS } from "@/lib/self-harm-support";

function SupportPageContent() {
	const searchParams = useSearchParams();
	const query = searchParams.get("q") ?? "";

	const contacts = useMemo(() => SUPPORT_CONTACTS, []);

	return (
		<div className="space-y-5 mt-12 md:mt-0">
			<div className="rounded-2xl border border-amber-500/30 bg-amber-50/70 p-4 text-amber-900 dark:bg-amber-500/10 dark:text-amber-100">
				<div className="flex items-start gap-3">
					<IconAlertTriangle className="mt-0.5 size-5 shrink-0" />
					<div>
						<p className="text-sm font-semibold">Bạn không một mình.</p>
						<p className="mt-1 text-sm">
							Nếu bạn thấy bản thân có nguy cơ tự gây hại ngay lúc này, hãy gọi
							 ngay số cấp cứu địa phương hoặc một người bạn tin tưởng.
						</p>
					</div>
				</div>
			</div>

			<div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h1 className="text-xl font-bold">Hỗ trợ tâm lý cho sinh viên</h1>
						<p className="mt-1 text-sm text-muted-foreground">
							Tổng hợp đầu mối hỗ trợ và liên hệ nhanh khi bạn cần một cuộc trò
							 chuyện an toàn.
						</p>
					</div>
					<Button asChild variant="outline" className="rounded-full">
						<Link href={query ? `/search?q=${encodeURIComponent(query)}` : "/search"}>
							<IconArrowLeft className="mr-1 size-4" />
							Quay lại tìm kiếm
						</Link>
					</Button>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<div className="rounded-2xl border border-red-500/25 bg-red-50/70 p-4 dark:bg-red-500/10">
					<p className="text-sm font-semibold text-red-700 dark:text-red-300">
						Khẩn cấp ngay bây giờ
					</p>
					<p className="mt-1 text-sm text-red-700/90 dark:text-red-200/90">
						Gọi cấp cứu y tế nếu bạn có ý định hoặc hành vi tự gây hại ngay lúc
						này.
					</p>
					<div className="mt-3 flex gap-2">
						<Button asChild className="rounded-full bg-red-600 hover:bg-red-700">
							<a href="tel:115">
								<IconPhone className="mr-1 size-4" />
								Gọi 115
							</a>
						</Button>
					</div>
				</div>

				<div className="rounded-2xl border border-primary/25 bg-primary/5 p-4">
					<div className="flex items-center gap-2 text-primary">
						<IconShieldHeart className="size-5" />
						<p className="text-sm font-semibold">Lưu ý triển khai</p>
					</div>
					<p className="mt-1 text-sm text-muted-foreground">
						Thông tin trong danh sách hiện ở mức tham khảo cho bản demo. Bạn nên
						cập nhật theo đầu mối chính thức tại trường/khu vực của mình.
					</p>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				{contacts.map((contact) => (
					<div
						key={contact.id}
						className={
							contact.id === "school-counseling" ||
							contact.id === "community-support"
								? "rounded-2xl border border-[#f37021]/70 bg-[#f37021]/12 p-4 shadow-sm"
								: "rounded-2xl border border-border/70 bg-card p-4 shadow-sm"
						}
					>
						<div className="mb-2 flex items-center justify-between gap-2">
							<p className="font-semibold">{contact.name}</p>
							<span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground capitalize">
								{contact.type}
							</span>
						</div>
						<p className="text-sm text-muted-foreground">{contact.description}</p>

						<div className="mt-3 space-y-1.5 text-sm">
							{contact.phone && (
								<p className="inline-flex items-center gap-2">
									<IconPhone className="size-4 text-primary" />
									{contact.phone}
								</p>
							)}
							{contact.email && (
								<p className="inline-flex items-center gap-2">
									<IconMail className="size-4 text-primary" />
									{contact.email}
								</p>
							)}
							{contact.address && (
								<p className="inline-flex items-start gap-2">
									<IconMapPin className="mt-0.5 size-4 shrink-0 text-primary" />
									<span>{contact.address}</span>
								</p>
							)}
							{contact.hours && (
								<p className="inline-flex items-center gap-2">
									<IconClock className="size-4 text-primary" />
									{contact.hours}
								</p>
							)}
						</div>

						<div className="mt-3 flex flex-wrap gap-2">
							{contact.phone && (
								<Button asChild size="sm" className="rounded-full">
									<a href={`tel:${contact.phone.replace(/\s+/g, "")}`}>
										<IconPhone className="mr-1 size-4" />
										Gọi ngay
									</a>
								</Button>
							)}
							{contact.email && (
								<Button asChild variant="outline" size="sm" className="rounded-full">
									<a href={`mailto:${contact.email}`}>
										<IconMail className="mr-1 size-4" />
										Email
									</a>
								</Button>
							)}
							{contact.website && (
								<Button asChild variant="outline" size="sm" className="rounded-full">
									<a href={contact.website} target="_blank" rel="noreferrer">
										<IconWorld className="mr-1 size-4" />
										Website
									</a>
								</Button>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default function SupportPage() {
	return (
		<Suspense fallback={null}>
			<SupportPageContent />
		</Suspense>
	);
}
