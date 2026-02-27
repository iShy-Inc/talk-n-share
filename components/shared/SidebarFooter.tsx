"use client";

interface SidebarFooterProps {
	copyrightText?: string;
	links?: { label: string; href: string }[];
}

export function SidebarFooter({
	copyrightText = "© 2026 Talk N Share. Copyright reserved.",
	links = [
		{ label: "Giới thiệu", href: "/about" },
		{ label: "Trợ giúp", href: "/contact" },
		{ label: "Riêng tư & Điều khoản", href: "/about" },
	],
}: SidebarFooterProps) {
	return (
		<div className="mt-6 border-t border-border pt-4 text-center">
			<p className="mb-2 text-xs text-muted-foreground">{copyrightText}</p>
			<div className="flex items-center justify-center gap-4">
				{links.map((link) => (
					<a
						key={link.label}
						href={link.href}
						className="text-xs text-muted-foreground transition-colors hover:text-foreground"
					>
						{link.label}
					</a>
				))}
			</div>
		</div>
	);
}
