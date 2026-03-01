import { IconHeart } from "@tabler/icons-react";

export default function Banner3() {
	return (
		<div className="border-b bg-background">
			<div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-3 text-center">
				<div className="flex items-center gap-4">
					<IconHeart className="size-5 stroke-2 shrink-0" />
					<span className="font-medium text-sm">
						Niềm vui của mọi người là món quà lớn nhất đối với chúng tôi
					</span>
				</div>
				<span className="rounded-full border border-border/60 bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
					Lời nhắn từ team
				</span>
			</div>
		</div>
	);
}
