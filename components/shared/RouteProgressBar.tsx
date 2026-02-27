"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const MIN_START_PROGRESS = 8;
const MAX_IN_FLIGHT_PROGRESS = 88;

export function RouteProgressBar() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [progress, setProgress] = useState(0);
	const [isVisible, setIsVisible] = useState(false);
	const progressTimerRef = useRef<number | null>(null);
	const finishTimerRef = useRef<number | null>(null);
	const mountedRef = useRef(false);

	const currentRoute = useMemo(() => {
		const query = searchParams.toString();
		return `${pathname}${query ? `?${query}` : ""}`;
	}, [pathname, searchParams]);

	const clearProgressTimers = () => {
		if (progressTimerRef.current) {
			window.clearInterval(progressTimerRef.current);
			progressTimerRef.current = null;
		}
		if (finishTimerRef.current) {
			window.clearTimeout(finishTimerRef.current);
			finishTimerRef.current = null;
		}
	};

	const startProgress = () => {
		setIsVisible(true);
		setProgress((prev) => (prev > MIN_START_PROGRESS ? prev : MIN_START_PROGRESS));

		if (progressTimerRef.current) return;
		progressTimerRef.current = window.setInterval(() => {
			setProgress((prev) => {
				if (prev >= MAX_IN_FLIGHT_PROGRESS) return prev;
				const remaining = MAX_IN_FLIGHT_PROGRESS - prev;
				const step = Math.max(1.2, remaining * 0.08);
				return Math.min(MAX_IN_FLIGHT_PROGRESS, prev + step);
			});
		}, 140);
	};

	const finishProgress = () => {
		if (!isVisible) return;
		clearProgressTimers();
		setProgress(100);
		finishTimerRef.current = window.setTimeout(() => {
			setIsVisible(false);
			setProgress(0);
			finishTimerRef.current = null;
		}, 240);
	};

	useEffect(() => {
		if (!mountedRef.current) {
			mountedRef.current = true;
			return;
		}
		finishProgress();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentRoute]);

	useEffect(() => {
		const onClick = (event: MouseEvent) => {
			if (event.defaultPrevented) return;
			if (event.button !== 0) return;
			if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

			const target = event.target as HTMLElement | null;
			const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
			if (!anchor) return;
			if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

			const href = anchor.getAttribute("href");
			if (!href || href.startsWith("#")) return;

			const url = new URL(anchor.href, window.location.href);
			if (url.origin !== window.location.origin) return;

			const nextRoute = `${url.pathname}${url.search}`;
			if (nextRoute === currentRoute) return;

			startProgress();
		};

		const onPopState = () => startProgress();

		document.addEventListener("click", onClick, true);
		window.addEventListener("popstate", onPopState);

		return () => {
			document.removeEventListener("click", onClick, true);
			window.removeEventListener("popstate", onPopState);
			clearProgressTimers();
		};
	}, [currentRoute]);

	return (
		<div
			aria-hidden="true"
			className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[3px]"
		>
			<div
				className="h-full origin-left bg-primary shadow-[0_0_12px_hsl(var(--primary))] transition-[transform,opacity] duration-200 ease-out"
				style={{
					opacity: isVisible ? 1 : 0,
					transform: `scaleX(${progress / 100})`,
				}}
			/>
		</div>
	);
}
