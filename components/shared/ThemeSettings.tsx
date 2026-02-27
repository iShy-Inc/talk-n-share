"use client";

import { useTheme } from "next-themes";
import { useThemeStyle, THEME_STYLES, ThemeStyle } from "@/components/theme-style-provider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export function ThemeSettings() {
	const { theme, setTheme } = useTheme();
	const { themeStyle, setThemeStyle } = useThemeStyle();
	if (!theme) {
		return null;
	}

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-base font-semibold">Color Mode</h3>
				<p className="mt-2 text-sm text-muted-foreground">
					Choose how the app handles light and dark appearance.
				</p>
				<Select value={theme} onValueChange={setTheme}>
					<SelectTrigger className="mt-3 w-full max-w-xs rounded-xl">
						<SelectValue placeholder="Select mode" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="system">System</SelectItem>
						<SelectItem value="light">Light</SelectItem>
						<SelectItem value="dark">Dark</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div>
				<h3 className="text-base font-semibold">Theme Style</h3>
				<p className="mt-2 text-sm text-muted-foreground">
					Pick your preferred shadcn-inspired palette preset.
				</p>
				<Select
					value={themeStyle}
					onValueChange={(value) => setThemeStyle(value as ThemeStyle)}
				>
					<SelectTrigger className="mt-3 w-full max-w-xs rounded-xl">
						<SelectValue placeholder="Select style" />
					</SelectTrigger>
					<SelectContent>
						{THEME_STYLES.map((style) => (
							<SelectItem key={style.value} value={style.value}>
								{style.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
