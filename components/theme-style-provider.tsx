"use client";

import {
	createContext,
	useContext,
	useLayoutEffect,
	useMemo,
	useState,
} from "react";

const STORAGE_KEY = "talk-n-share-theme-style";
const THEME_LINK_ID = "talk-n-share-theme-link";

export const THEME_STYLES = [
	{ value: "original", label: "Original", href: "/themes/original.css" },
	{ value: "clean-state", label: "Clean State", href: "/themes/clean-state.css" },
	{ value: "modern-minimal", label: "Modern Minimal", href: "/themes/modern-minimal.css" },
	{ value: "caffeine", label: "Caffeine", href: "/themes/caffeine.css" },
	{ value: "slack", label: "Slack", href: "/themes/slack.css" },
	{ value: "spotify", label: "Spotify", href: "/themes/spotify.css" },
	{ value: "perplexity", label: "Perplexity", href: "/themes/perplexity.css" },
	{ value: "valorant", label: "Valorant", href: "/themes/valorant.css" },
	{ value: "marvel", label: "Marvel", href: "/themes/marvel.css" },
	{ value: "ghibli-studio", label: "Ghibli Studio", href: "/themes/ghibli-studio.css" },
	{ value: "marshmallow", label: "Marshmallow", href: "/themes/marshmallow.css" },
] as const;

export type ThemeStyle = (typeof THEME_STYLES)[number]["value"];
const DEFAULT_THEME_STYLE: ThemeStyle = "original";

type ThemeStyleContextValue = {
	themeStyle: ThemeStyle;
	setThemeStyle: (style: ThemeStyle) => void;
};

const ThemeStyleContext = createContext<ThemeStyleContextValue | null>(null);

export function ThemeStyleProvider({ children }: { children: React.ReactNode }) {
	const [themeStyle, setThemeStyle] = useState<ThemeStyle>(() => {
		if (typeof window === "undefined") return DEFAULT_THEME_STYLE;
		const saved = localStorage.getItem(STORAGE_KEY) as ThemeStyle | null;
		return saved && THEME_STYLES.some((item) => item.value === saved)
			? saved
			: DEFAULT_THEME_STYLE;
	});

	useLayoutEffect(() => {
		const selectedTheme =
			THEME_STYLES.find((item) => item.value === themeStyle) ??
			THEME_STYLES.find((item) => item.value === DEFAULT_THEME_STYLE)!;

		document.documentElement.setAttribute("data-app-theme", selectedTheme.value);
		document.documentElement.removeAttribute("data-theme-style");
		localStorage.setItem(STORAGE_KEY, themeStyle);

		let linkTag = document.getElementById(THEME_LINK_ID) as HTMLLinkElement | null;
		if (!linkTag) {
			linkTag = document.createElement("link");
			linkTag.id = THEME_LINK_ID;
			linkTag.rel = "stylesheet";
			document.head.appendChild(linkTag);
		}
		if (linkTag.getAttribute("href") !== selectedTheme.href) {
			linkTag.setAttribute("href", selectedTheme.href);
		}
	}, [themeStyle]);

	const value = useMemo(
		() => ({
			themeStyle,
			setThemeStyle,
		}),
		[themeStyle],
	);

	return (
		<ThemeStyleContext.Provider value={value}>
			{children}
		</ThemeStyleContext.Provider>
	);
}

export function useThemeStyle() {
	const ctx = useContext(ThemeStyleContext);
	if (!ctx) {
		throw new Error("useThemeStyle must be used within ThemeStyleProvider");
	}
	return ctx;
}
