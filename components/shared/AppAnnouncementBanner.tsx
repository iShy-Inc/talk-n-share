"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IconHeart, IconPalette, IconUsers } from "@tabler/icons-react";
import Link from "next/link";

const ROTATION_INTERVAL_MS = 5 * 60 * 1000;
const AUTO_DISMISS_MS = 15 * 1000;

const getBannerIndex = () =>
	Math.floor(Date.now() / ROTATION_INTERVAL_MS) % BANNERS.length;
const shouldShowBanner = () =>
	Date.now() % ROTATION_INTERVAL_MS < AUTO_DISMISS_MS;

const BANNERS = [
	{
		id: "banner-1",
		style: {
			"--normal-bg": "#0c4a6e",
			"--normal-text": "#e0f2fe",
			"--normal-border": "rgba(186,230,253,0.2)",
		} as React.CSSProperties,
		content: (
			<div className="flex items-center gap-3">
				<IconUsers className="size-4 shrink-0 stroke-2" />
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
		),
	},
	{
		id: "banner-2",
		style: {
			"--normal-bg": "#451a03",
			"--normal-text": "#fef3c7",
			"--normal-border": "rgba(253,230,138,0.25)",
		} as React.CSSProperties,
		content: (
			<div className="flex items-center gap-3">
				<IconPalette className="size-4 shrink-0 stroke-2" />
				<span className="text-sm font-medium leading-5">
					Bạn có thể tùy chỉnh giao diện trang web ngay trong phần cài đặt cá
					nhân.
				</span>
				<Button variant="secondary" size="sm" className="shrink-0" asChild>
					<Link href="/profile/settings?section=appearance">Tìm hiểu thêm</Link>
				</Button>
			</div>
		),
	},
	{
		id: "banner-3",
		style: {
			"--normal-bg": "#4c0519",
			"--normal-text": "#ffe4e6",
			"--normal-border": "rgba(254,205,211,0.25)",
		} as React.CSSProperties,
		content: (
			<div className="flex items-center gap-3">
				<IconHeart className="size-4 shrink-0 stroke-2" />
				<span className="text-sm font-medium leading-5">
					Niềm vui của mọi người là món quà lớn nhất đối với chúng tôi
				</span>
			</div>
		),
	},
] as const;

export function AppAnnouncementBanner() {
	const [activeIndex, setActiveIndex] = useState(getBannerIndex);
	const [isVisible, setIsVisible] = useState(shouldShowBanner);
	const toastIdRef = useRef<string | number | null>(null);

	useEffect(() => {
		let timeoutId: number | null = null;

		const scheduleNextTick = () => {
			const delay =
				ROTATION_INTERVAL_MS - (Date.now() % ROTATION_INTERVAL_MS) || 0;

			timeoutId = window.setTimeout(() => {
				startTransition(() => {
					setActiveIndex(getBannerIndex());
					setIsVisible(true);
				});
				scheduleNextTick();
			}, delay);
		};
		scheduleNextTick();

		return () => {
			if (timeoutId !== null) {
				window.clearTimeout(timeoutId);
			}
		};
	}, []);

	useEffect(() => {
		if (!isVisible) {
			if (toastIdRef.current !== null) {
				toast.dismiss(toastIdRef.current);
				toastIdRef.current = null;
			}
			return;
		}

		const visibleTimeRemaining =
			AUTO_DISMISS_MS - (Date.now() % ROTATION_INTERVAL_MS);
		if (visibleTimeRemaining <= 0) {
			startTransition(() => setIsVisible(false));
			return;
		}

		const banner = BANNERS[activeIndex] ?? BANNERS[0];

		if (toastIdRef.current !== null) {
			toast.dismiss(toastIdRef.current);
		}

		toastIdRef.current = toast(banner.content, {
			id: banner.id,
			position: "top-center",
			duration: visibleTimeRemaining,
			style: banner.style,
			onDismiss: () => setIsVisible(false),
			onAutoClose: () => setIsVisible(false),
		});
	}, [activeIndex, isVisible]);

	return null;
}
