import { Button } from "@/components/ui/button";
import { IconHeart, IconX } from "@tabler/icons-react";

interface BannerProps {
	onDismiss?: () => void;
}

export default function Banner3({ onDismiss }: BannerProps) {
	return (
		<div className="border-b border-rose-200/50 bg-rose-50 text-rose-950">
			<div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
				<div className="flex min-w-0 items-center gap-4">
					<IconHeart className="size-5 shrink-0 stroke-2 text-rose-700" />
					<span className="text-sm font-medium leading-5">
						Niềm vui của mọi người là món quà lớn nhất đối với chúng tôi
					</span>
				</div>
				<span className="rounded-full border border-rose-200 bg-white/80 px-3 py-1 text-xs font-medium text-rose-800">
					Lời nhắn từ team
				</span>
				<Button
					type="button"
					variant="ghost"
					onClick={onDismiss}
					aria-label="Tắt thông báo"
					className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-rose-700/80 transition-colors hover:bg-rose-200/60 hover:text-rose-950"
				>
					<IconX className="size-4 stroke-2" />
				</Button>
			</div>
		</div>
	);
}
