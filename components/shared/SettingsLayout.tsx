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
	title = "Cài đặt",
	menuItems,
	activeItem,
	onMenuChange,
	children,
}: SettingsLayoutProps) {
	return (
		<Card className="overflow-hidden border py-0 shadow-sm">
			<CardHeader className="border-b border-border px-4 py-4 sm:px-6 sm:py-5">
				<CardTitle className="text-lg">{title}</CardTitle>
			</CardHeader>
			<CardContent className="flex min-h-[400px] flex-col p-0 md:flex-row">
				{/* Left menu */}
				<div className="border-b border-border bg-muted/30 md:w-52 md:shrink-0 md:border-b-0 md:border-r">
					<div className="flex gap-2 overflow-x-auto px-3 py-3 md:block md:space-y-1 md:overflow-visible md:px-0 md:py-0">
					{menuItems.map((item) => (
						<button
							key={item.value}
							onClick={() => onMenuChange(item.value)}
							className={cn(
								"group inline-flex shrink-0 items-center rounded-xl px-4 py-2.5 text-left text-sm transition-colors duration-200 touch-manipulation md:flex md:w-full md:rounded-none md:px-5 md:py-4",
								activeItem === item.value
									? "bg-accent font-medium text-foreground md:bg-accent/50"
									: "text-muted-foreground hover:bg-accent/60 hover:text-foreground md:hover:translate-x-1",
							)}
							id={`settings-menu-${item.value}`}
						>
							<span className="inline-block whitespace-nowrap transition-all duration-200 ease-out group-hover:tracking-[0.01em]">
								{item.label}
							</span>
						</button>
					))}
					</div>
				</div>

				{/* Right content */}
				<div className="min-w-0 flex-1 p-4 sm:p-6 md:p-8">{children}</div>
			</CardContent>
		</Card>
	);
}
