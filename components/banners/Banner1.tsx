import { Button } from "@/components/ui/button";
import { IconUsers, IconX } from "@tabler/icons-react";

interface BannerProps {
	onDismiss?: () => void;
}

export default function Banner1({ onDismiss }: BannerProps) {
	return (
		<div className="border-b border-sky-200/30 bg-gradient-to-r from-sky-950 via-sky-900 to-cyan-800 text-sky-50">
			<div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3">
				<div className="flex min-w-0 items-center gap-3 text-left">
					<IconUsers className="size-5 shrink-0 stroke-2" />
					<span className="text-sm font-medium leading-5">
						Theo dõi chúng mình trên mạng xã hội để nhận được những cập nhật và
						mẹo mới nhất!
					</span>
					<Button variant="secondary" size="sm" className="ml-1 shrink-0" asChild>
						<a
							href="https://www.facebook.com/profile.php?id=61586924084913"
							target="_blank"
							rel="noopener noreferrer"
						>
							Theo dõi
						</a>
					</Button>
				</div>
				<button
					type="button"
					onClick={onDismiss}
					aria-label="Tắt thông báo"
					className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-sky-100/80 transition-colors hover:bg-white/10 hover:text-white"
				>
					<IconX className="size-4 stroke-2" />
				</button>
			</div>
		</div>
	);
}
