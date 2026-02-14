"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface SettingsMenuItem {
	label: string;
	value: string;
}

interface SettingsLayoutProps {
	title?: string;
	menuItems: SettingsMenuItem[];
	activeItem: string;
	onMenuChange: (value: string) => void;
	children: React.ReactNode;
}

export function SettingsLayout({
	title = "Settings",
	menuItems,
	activeItem,
	onMenuChange,
	children,
}: SettingsLayoutProps) {
	return (
		<Card className="overflow-hidden border shadow-sm">
			<CardHeader className="border-b border-border px-6 py-5">
				<CardTitle className="text-lg">{title}</CardTitle>
			</CardHeader>
			<CardContent className="flex min-h-[400px] p-0">
				{/* Left menu */}
				<div className="w-52 shrink-0 border-r border-border bg-muted/30">
					{menuItems.map((item) => (
						<button
							key={item.value}
							onClick={() => onMenuChange(item.value)}
							className={cn(
								"block w-full px-5 py-4 text-left text-sm transition-colors",
								activeItem === item.value
									? "bg-muted font-medium text-foreground"
									: "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
							)}
							id={`settings-menu-${item.value}`}
						>
							{item.label}
						</button>
					))}
				</div>

				{/* Right content */}
				<div className="flex-1 p-8">{children}</div>
			</CardContent>
		</Card>
	);
}
