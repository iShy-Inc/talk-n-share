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
				<h3 className="text-base font-semibold">Chế độ màu</h3>
				<p className="mt-2 text-sm text-muted-foreground">
					Chọn cách ứng dụng hiển thị sáng và tối.
				</p>
				<Select value={theme} onValueChange={setTheme}>
					<SelectTrigger className="mt-3 w-full max-w-xs rounded-xl">
						<SelectValue placeholder="Chọn chế độ" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="system">Theo hệ thống</SelectItem>
						<SelectItem value="light">Sáng</SelectItem>
						<SelectItem value="dark">Tối</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div>
				<h3 className="text-base font-semibold">Kiểu giao diện</h3>
				<p className="mt-2 text-sm text-muted-foreground">
					Chọn bảng màu giao diện bạn yêu thích.
				</p>
				<Select
					value={themeStyle}
					onValueChange={(value) => setThemeStyle(value as ThemeStyle)}
				>
					<SelectTrigger className="mt-3 w-full max-w-xs rounded-xl">
						<SelectValue placeholder="Chọn kiểu" />
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
