"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

const supabase = createClient();

function ResetPasswordContent() {
	const [isLoading, setIsLoading] = useState(false);
	const [isCheckingRecovery, setIsCheckingRecovery] = useState(true);
	const [hasRecoverySession, setHasRecoverySession] = useState(false);
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const router = useRouter();

	useEffect(() => {
		let isMounted = true;

		const checkRecoverySession = async () => {
			const { data, error } = await supabase.auth.getSession();
			if (!isMounted) return;

			if (error) {
				toast.error(error.message);
				setHasRecoverySession(false);
				setIsCheckingRecovery(false);
				return;
			}

			setHasRecoverySession(Boolean(data.session));
			setIsCheckingRecovery(false);
		};

		void checkRecoverySession();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			if (!isMounted) return;

			if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
				setHasRecoverySession(Boolean(session));
				setIsCheckingRecovery(false);
			}
		});

		return () => {
			isMounted = false;
			subscription.unsubscribe();
		};
	}, []);

	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!hasRecoverySession) {
			toast.error("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
			return;
		}
		if (password !== confirmPassword) {
			toast.error("Mật khẩu xác nhận không khớp");
			return;
		}
		if (password.length < 6) {
			toast.error("Mật khẩu phải có ít nhất 6 ký tự");
			return;
		}

		setIsLoading(true);

		const { error } = await supabase.auth.updateUser({ password });

		if (error) {
			toast.error(error.message);
			setIsLoading(false);
			return;
		}

		toast.success("Đặt lại mật khẩu thành công. Bạn có thể đăng nhập lại.");
		setIsLoading(false);
		router.push("/login");
	};

	return (
		<Card className="w-full max-w-md border-muted/60 bg-background/80 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
			<CardHeader className="space-y-1 text-center">
				<CardTitle className="text-2xl font-bold tracking-tight">
					Đặt lại mật khẩu
				</CardTitle>
				<CardDescription>
					{isCheckingRecovery
						? "Đang xác minh liên kết đặt lại mật khẩu..."
						: hasRecoverySession
							? "Nhập mật khẩu mới của bạn bên dưới"
							: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn."}
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-4">
				{hasRecoverySession ? (
					<form onSubmit={handleResetPassword} className="grid gap-4">
						<div className="grid gap-2">
							<Label htmlFor="password">Mật khẩu mới</Label>
							<Input
								id="password"
								type="password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className="bg-background/50"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
							<Input
								id="confirmPassword"
								type="password"
								placeholder="••••••••"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								className="bg-background/50"
							/>
						</div>
						<Button
							type="submit"
							className="w-full"
							disabled={isLoading || isCheckingRecovery}
						>
							{isLoading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
						</Button>
					</form>
				) : (
					<div className="rounded-xl border border-border bg-card/60 p-4 text-sm text-muted-foreground">
						Vui lòng yêu cầu một liên kết mới từ trang quên mật khẩu trước khi
						tiếp tục.
					</div>
				)}
			</CardContent>
			<CardFooter className="flex justify-center">
				<Link
					href="/login"
					className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Quay lại đăng nhập
				</Link>
			</CardFooter>
		</Card>
	);
}

export default function ResetPasswordPage() {
	return (
		<div className="flex min-h-screen w-full items-center justify-center p-4">
			<ResetPasswordContent />
		</div>
	);
}
