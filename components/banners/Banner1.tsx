import { Button } from "@/components/ui/button";
import { IconUsers } from "@tabler/icons-react";

export default function Banner1() {
	return (
		<div className="bg-gradient-to-r from-primary/80 to-primary/15 text-foreground">
			<div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-3 py-3 text-left md:text-center">
				<IconUsers className="size-5 stroke-2 shrink-0" />
				<span className="text-sm font-medium">
					Theo dõi chúng mình trên mạng xã hội để nhận được những cập nhật và
					mẹo mới nhất!
				</span>
				<Button variant="secondary" size="sm" className="ml-2" asChild>
					<a
						href="https://www.facebook.com/profile.php?id=61586924084913"
						target="_blank"
						rel="noopener noreferrer"
					>
						Theo dõi
					</a>
				</Button>
			</div>
		</div>
	);
}
