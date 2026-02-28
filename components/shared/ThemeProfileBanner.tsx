"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconPalette, IconX } from "@tabler/icons-react";

const STORAGE_KEY = "talk-n-share-dismiss-theme-profile-banner";

export function ThemeProfileBanner() {
	const [isDismissed, setIsDismissed] = useState<boolean | null>(null);

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			setIsDismissed(window.localStorage.getItem(STORAGE_KEY) === "1");
		}, 0);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, []);

	const handleDismiss = () => {
		window.localStorage.setItem(STORAGE_KEY, "1");
		setIsDismissed(true);
	};

	if (isDismissed !== false) {
		return null;
	}

	return (
		<div className="border-b border-primary/15 bg-primary/8 px-4 py-3 text-sm text-foreground">
			<div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
				<div className="flex items-center gap-3 text-center">
					<span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
						<IconPalette className="size-4" />
					</span>
					<p className="leading-6">
						Bạn có thể đổi giao diện của website trong{" "}
						<Link
							href="/profile/settings?section=appearance"
							className="font-semibold text-primary underline underline-offset-4"
						>
							Profile
						</Link>
						.
					</p>
				</div>
				<button
					type="button"
					onClick={handleDismiss}
					aria-label="Đóng thông báo"
					className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground"
				>
					<IconX className="size-4" />
				</button>
			</div>
		</div>
	);
}
