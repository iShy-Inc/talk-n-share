"use client";

import { useEffect, useState } from "react";
import { IconArrowUp } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

const SHOW_AT_SCROLL_Y = 900;

export function ScrollToTopButton() {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		let frameId = 0;

		const onScroll = () => {
			cancelAnimationFrame(frameId);
			frameId = requestAnimationFrame(() => {
				setIsVisible(window.scrollY > SHOW_AT_SCROLL_Y);
			});
		};

		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });

		return () => {
			window.removeEventListener("scroll", onScroll);
			cancelAnimationFrame(frameId);
		};
	}, []);

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<Button
			type="button"
			size="icon"
			variant="secondary"
			onClick={scrollToTop}
			aria-label="Cuộn lên đầu trang"
			className={`fixed bottom-36 right-4 z-[70] rounded-full border border-border/80 bg-background/95 shadow-md backdrop-blur transition-all duration-300 md:bottom-24 lg:bottom-6 lg:right-6 ${
				isVisible
					? "translate-y-0 opacity-100"
					: "pointer-events-none translate-y-4 opacity-0"
			}`}
		>
			<IconArrowUp className="size-5" />
		</Button>
	);
}
