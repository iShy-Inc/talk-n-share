"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { createEmailAuthClient } from "@/utils/supabase/email-client";
import { AuthHomeLink } from "@/components/shared/AuthHomeLink";

const supabase = createEmailAuthClient();

function removeHashFromUrl() {
	if (typeof window === "undefined" || !window.location.hash) {
		return;
	}

	window.history.replaceState(
		null,
		"",
		`${window.location.pathname}${window.location.search}`,
	);
}

function AuthCompleteContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const requestedNext = searchParams.get("next");
	const next = requestedNext?.startsWith("/") ? requestedNext : "/";
	const queryError =
		searchParams.get("error_description") ?? searchParams.get("error");

	useEffect(() => {
		let isMounted = true;

		const resolveAuth = async () => {
			const hashParams = new URLSearchParams(window.location.hash.slice(1));
			const hashError =
				hashParams.get("error_description") ?? hashParams.get("error");
			const accessToken = hashParams.get("access_token");
			const refreshToken = hashParams.get("refresh_token");

			if (hashError || queryError) {
				if (!isMounted) return;
				removeHashFromUrl();
				setErrorMessage(hashError ?? queryError);
				setIsLoading(false);
				return;
			}

			if (accessToken && refreshToken) {
				const { error } = await supabase.auth.setSession({
					access_token: accessToken,
					refresh_token: refreshToken,
				});

				if (!isMounted) return;

				if (error) {
					setErrorMessage(error.message);
					setIsLoading(false);
					return;
				}

				removeHashFromUrl();
				router.replace(next);
				return;
			}

			const { data, error } = await supabase.auth.getSession();

			if (!isMounted) return;

			if (error) {
				setErrorMessage(error.message);
				setIsLoading(false);
				return;
			}

			if (data.session) {
				removeHashFromUrl();
				router.replace(next);
				return;
			}

			setErrorMessage("Liên kết xác thực không hợp lệ hoặc đã hết hạn.");
			setIsLoading(false);
		};

		void resolveAuth();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			if (!isMounted) return;

			if ((event === "SIGNED_IN" || event === "PASSWORD_RECOVERY") && session) {
				removeHashFromUrl();
				router.replace(next);
			}
		});

		return () => {
			isMounted = false;
			subscription.unsubscribe();
		};
	}, [next, queryError, router]);

	return (
		<div className="relative flex min-h-screen w-full items-center justify-center p-4">
			<AuthHomeLink className="absolute top-4 left-4 md:top-6 md:left-6" />
			<Card className="w-full max-w-md border-muted/60 bg-background/80 shadow-xl backdrop-blur-sm">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl font-bold tracking-tight">
						Hoàn tất xác thực
					</CardTitle>
					<CardDescription>
						{isLoading
							? "Đang xác minh liên kết của bạn..."
							: errorMessage ?? "Xác thực thành công."}
					</CardDescription>
				</CardHeader>
				{!isLoading && errorMessage ? (
					<>
						<CardContent className="text-sm text-muted-foreground">
							Liên kết này có thể đã hết hạn hoặc được tạo từ phiên cũ. Hãy yêu
							cầu một email mới rồi thử lại.
						</CardContent>
						<CardFooter className="flex flex-col gap-3">
							<Button asChild className="w-full">
								<Link href="/forgot">Yêu cầu liên kết mới</Link>
							</Button>
							<Button asChild variant="outline" className="w-full">
								<Link href="/login">Quay lại đăng nhập</Link>
							</Button>
						</CardFooter>
					</>
				) : null}
			</Card>
		</div>
	);
}

export default function AuthCompletePage() {
	return (
		<Suspense
			fallback={
				<div className="relative flex min-h-screen w-full items-center justify-center p-4">
					<AuthHomeLink className="absolute top-4 left-4 md:top-6 md:left-6" />
					<Card className="w-full max-w-md border-muted/60 bg-background/80 shadow-xl backdrop-blur-sm">
						<CardHeader className="text-center">
							<CardTitle className="text-2xl font-bold tracking-tight">
								Hoàn tất xác thực
							</CardTitle>
							<CardDescription>
								Đang xác minh liên kết của bạn...
							</CardDescription>
						</CardHeader>
					</Card>
				</div>
			}
		>
			<AuthCompleteContent />
		</Suspense>
	);
}
