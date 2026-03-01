"use client";

import { startTransition, useEffect, useState } from "react";
import Banner1 from "@/components/banners/Banner1";
import Banner2 from "@/components/banners/Banner2";
import Banner3 from "@/components/banners/Banner3";

const ROTATION_INTERVAL_MS = 5 * 60 * 1000;
const ANNOUNCEMENT_BANNERS = [Banner1, Banner2, Banner3] as const;

const getBannerIndex = () =>
	Math.floor(Date.now() / ROTATION_INTERVAL_MS) % ANNOUNCEMENT_BANNERS.length;

export function AppAnnouncementBanner() {
	const [activeIndex, setActiveIndex] = useState(getBannerIndex);

	useEffect(() => {
		let timeoutId: number | null = null;

		const scheduleNextTick = () => {
			const delay =
				ROTATION_INTERVAL_MS - (Date.now() % ROTATION_INTERVAL_MS) || 0;

			timeoutId = window.setTimeout(() => {
				startTransition(() => {
					setActiveIndex(getBannerIndex());
				});
				scheduleNextTick();
			}, delay);
		};

		startTransition(() => {
			setActiveIndex(getBannerIndex());
		});
		scheduleNextTick();

		return () => {
			if (timeoutId !== null) {
				window.clearTimeout(timeoutId);
			}
		};
	}, []);

	const ActiveBanner = ANNOUNCEMENT_BANNERS[activeIndex] ?? ANNOUNCEMENT_BANNERS[0];

	return (
		<div className="sticky top-0 z-50">
			<ActiveBanner />
		</div>
	);
}
