"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "talk-n-share-theme-style";

export const THEME_STYLES = [
	{ value: "mint", label: "Mint" },
	{ value: "zinc", label: "Zinc" },
	{ value: "blue", label: "Blue" },
	{ value: "rose", label: "Rose" },
	{ value: "amber", label: "Amber" },
] as const;

export type ThemeStyle = (typeof THEME_STYLES)[number]["value"];

type ThemeStyleContextValue = {
	themeStyle: ThemeStyle;
	setThemeStyle: (style: ThemeStyle) => void;
};

const ThemeStyleContext = createContext<ThemeStyleContextValue | null>(null);

export function ThemeStyleProvider({ children }: { children: React.ReactNode }) {
	const [themeStyle, setThemeStyle] = useState<ThemeStyle>(() => {
		if (typeof window === "undefined") return "mint";
		const saved = localStorage.getItem(STORAGE_KEY) as ThemeStyle | null;
		return saved && THEME_STYLES.some((item) => item.value === saved)
			? saved
			: "mint";
	});

	useEffect(() => {
		document.documentElement.setAttribute("data-theme-style", themeStyle);
		localStorage.setItem(STORAGE_KEY, themeStyle);
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
