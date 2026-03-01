import { Button } from "@/components/ui/button";
import { IconPalette, IconX } from "@tabler/icons-react";
import Link from "next/link";

interface BannerProps {
	onDismiss?: () => void;
}

export default function Banner2({ onDismiss }: BannerProps) {
	return (
		<div className="border-b border-amber-200/50 bg-amber-50 text-amber-950">
			<div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
				<div className="flex min-w-0 items-center gap-4">
					<IconPalette className="size-5 shrink-0 stroke-2 text-amber-700" />
					<span className="text-sm font-medium leading-5">
						Bạn có thể tùy chỉnh giao diện trang web ngay trong phần cài đặt cá
						nhân.
					</span>
					<Button variant="secondary" size="sm" className="shrink-0" asChild>
						<Link href="/profile/settings?section=appearance">
							Tìm hiểu thêm
						</Link>
					</Button>
				</div>
				<button
					type="button"
					onClick={onDismiss}
					aria-label="Tắt thông báo"
					className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-amber-700/80 transition-colors hover:bg-amber-200/60 hover:text-amber-950"
				>
					<IconX className="size-4 stroke-2" />
				</button>
			</div>
		</div>
	);
}
