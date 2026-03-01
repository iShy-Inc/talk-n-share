import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Providers from "./providers";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeStyleProvider } from "@/components/theme-style-provider";
import siteConfig from "@/configs/site";
import { MobileDock } from "@/components/shared";
import { RouteProgressBar } from "@/components/shared/RouteProgressBar";
import { ScrollToTopButton } from "@/components/shared/ScrollToTopButton";
import { AppAnnouncementBanner } from "@/components/shared/AppAnnouncementBanner";
import { FloatingAmbientPlayerControl } from "@/components/shared/FloatingAmbientPlayerControl";
import { AmbientPlayerProvider } from "@/hooks/useAmbientPlayer";
import { MobileMenu } from "@/components/shared/MobileDock";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

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
		<html lang="en" suppressHydrationWarning className={inter.variable}>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<ThemeStyleProvider>
						<Providers>
							<AmbientPlayerProvider>
								<Suspense fallback={null}>
									<RouteProgressBar />
								</Suspense>
								<AppAnnouncementBanner />
								{children}
								<FloatingAmbientPlayerControl />
								<ScrollToTopButton />
								<MobileMenu />
								<MobileDock />
								<Toaster position="bottom-right" />
							</AmbientPlayerProvider>
						</Providers>
					</ThemeStyleProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
