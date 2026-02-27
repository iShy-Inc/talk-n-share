"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

function SignupThankYouContent() {
	const searchParams = useSearchParams();
	const email = searchParams.get("email");

	return (
		<Card className="w-full max-w-md border-muted/60 bg-background/80 shadow-xl backdrop-blur-sm">
			<CardHeader className="text-center">
				<CardTitle className="text-2xl font-bold tracking-tight">
					Cảm ơn bạn đã đăng ký
				</CardTitle>
				<CardDescription>
					Tài khoản của bạn đã được tạo thành công.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3 text-sm text-muted-foreground">
				<p>
					Vui lòng kiểm tra email{email ? ` (${email})` : ""} để xác minh tài
					khoản.
				</p>
				<p>
					Sau khi xác minh email, quay lại và đăng nhập để tiếp tục.
				</p>
			</CardContent>
			<CardFooter className="flex justify-center">
				<Button asChild className="w-full">
					<Link href="/login">Quay lại đăng nhập</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}

export default function SignupThankYouPage() {
	return (
		<div className="flex min-h-screen w-full items-center justify-center p-4">
			<Suspense fallback={<div>Đang tải...</div>}>
				<SignupThankYouContent />
			</Suspense>
		</div>
	);
}
