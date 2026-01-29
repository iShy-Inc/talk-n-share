import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { ThemeProvider } from "@/components/theme-provider";
import siteConfig from "@/configs/site";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: `${siteConfig.name} - ${siteConfig.description}`,
	description: `${siteConfig.description}`,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<html lang="en" suppressHydrationWarning>
				<Providers>
					<body
						className={`${geistSans.variable} ${geistMono.variable} antialiased`}
					>
						{children}
					</body>
				</Providers>
			</html>
		</ThemeProvider>
	);
}
