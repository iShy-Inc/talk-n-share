import { Button } from "@/components/ui/button";
import { IconPalette } from "@tabler/icons-react";
import Link from "next/link";

export default function Banner2() {
	return (
		<div className="border-b bg-background">
			<div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-3 text-center">
				<div className="flex items-center gap-4">
					<IconPalette className="size-5 stroke-2 shrink-0" />
					<span className="text-sm font-medium">
						Bạn có thể tùy chỉnh giao diện trang web ngay trong phần cài đặt cá
						nhân.
					</span>
					<Button variant="secondary" size="sm" asChild>
						<Link href="/profile/settings?section=appearance">
							Tìm hiểu thêm
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
