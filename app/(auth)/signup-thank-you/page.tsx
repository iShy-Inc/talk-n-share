"use client";

import { Suspense, useState } from "react";
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
import { getAuthRedirectUrl } from "@/utils/auth/get-auth-redirect-url";
import { createEmailAuthClient } from "@/utils/supabase/email-client";
import { toast } from "sonner";

function SignupThankYouContent() {
	const searchParams = useSearchParams();
	const email = searchParams.get("email");
	const isExistingUser = searchParams.get("existing") === "1";
	const [isResending, setIsResending] = useState(false);
	const supabase = createEmailAuthClient();

	const handleResendConfirmationEmail = async () => {
		if (!email || isResending) {
			return;
		}

		setIsResending(true);

		const { error } = await supabase.auth.resend({
			type: "signup",
			email,
			options: {
				emailRedirectTo: getAuthRedirectUrl("/auth/complete?next=/onboarding"),
			},
		});

		if (error) {
			toast.error(error.message);
			setIsResending(false);
			return;
		}

		toast.success("Email xác nhận đã được gửi lại. Vui lòng kiểm tra hộp thư.");
		setIsResending(false);
	};

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
				{isExistingUser ? (
					<p>
						Email này có thể đã được dùng trước đó. Nếu tài khoản vẫn chưa xác
						minh, bạn có thể gửi lại email xác nhận ngay bên dưới.
					</p>
				) : null}
				<p>
					Sau khi xác minh email, quay lại và đăng nhập để tiếp tục.
				</p>
			</CardContent>
			<CardFooter className="flex flex-col gap-3">
				<Button
					type="button"
					variant="outline"
					className="w-full"
					onClick={handleResendConfirmationEmail}
					disabled={!email || isResending}
				>
					{isResending ? "Đang gửi lại..." : "Gửi lại email xác nhận"}
				</Button>
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
