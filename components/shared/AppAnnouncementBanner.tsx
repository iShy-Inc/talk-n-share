"use client";

import { startTransition, useEffect, useState } from "react";
import Banner1 from "@/components/banners/Banner1";
import Banner2 from "@/components/banners/Banner2";
import Banner3 from "@/components/banners/Banner3";

const ROTATION_INTERVAL_MS = 5 * 60 * 1000;
const AUTO_DISMISS_MS = 60 * 1000;
const ANNOUNCEMENT_BANNERS = [Banner1, Banner2, Banner3] as const;

const getBannerIndex = () =>
	Math.floor(Date.now() / ROTATION_INTERVAL_MS) % ANNOUNCEMENT_BANNERS.length;
const shouldShowBanner = () =>
	Date.now() % ROTATION_INTERVAL_MS < AUTO_DISMISS_MS;

export function AppAnnouncementBanner() {
	const [activeIndex, setActiveIndex] = useState(getBannerIndex);
	const [isVisible, setIsVisible] = useState(shouldShowBanner);

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
			return;
		}

		const visibleTimeRemaining =
			AUTO_DISMISS_MS - (Date.now() % ROTATION_INTERVAL_MS);
		if (visibleTimeRemaining <= 0) {
			return;
		}

		const timeoutId = window.setTimeout(() => {
			setIsVisible(false);
		}, visibleTimeRemaining);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [activeIndex, isVisible]);

	const ActiveBanner =
		ANNOUNCEMENT_BANNERS[activeIndex] ?? ANNOUNCEMENT_BANNERS[0];

	if (!isVisible) {
		return null;
	}

	return (
		<div className="sticky top-0 z-50">
			<ActiveBanner onDismiss={() => setIsVisible(false)} />
		</div>
	);
}
