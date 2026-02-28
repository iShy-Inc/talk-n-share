"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Github } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Google Icon Component
function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			width="24"
			height="24"
			{...props}
		>
			<path
				d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
				fill="#4285F4"
			/>
			<path
				d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
				fill="#34A853"
			/>
			<path
				d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
				fill="#FBBC05"
			/>
			<path
				d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
				fill="#EA4335"
			/>
		</svg>
	);
}

import { createClient } from "@/utils/supabase/client";
import { createEmailAuthClient } from "@/utils/supabase/email-client";
import { getAuthRedirectUrl } from "@/utils/auth/get-auth-redirect-url";
import { toast } from "sonner";

// ... (GoogleIcon component remains)

export default function SignupPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [agreedToTerms, setAgreedToTerms] = useState(false);
	const router = useRouter();
	const supabase = createClient();
	const emailAuthClient = createEmailAuthClient();

	const handleSignup = async (e: React.FormEvent) => {
		e.preventDefault();
		const normalizedEmail = email.trim().toLowerCase();

		if (!agreedToTerms) {
			toast.error("You must agree to the Terms and Chính sách riêng tư");
			return;
		}
		if (!normalizedEmail) {
			toast.error("Email is required");
			return;
		}
		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}
		setIsLoading(true);

		const { error, data } = await emailAuthClient.auth.signUp({
			email: normalizedEmail,
			password,
			options: {
				emailRedirectTo: getAuthRedirectUrl("/auth/complete?next=/onboarding"),
			},
		});

		if (error) {
			toast.error(error.message);
			setIsLoading(false);
			return;
		}

		const isExistingUser =
			!data?.session &&
			Array.isArray(data?.user?.identities) &&
			data.user.identities.length === 0;

		if (isExistingUser) {
			toast.info(
				"Email này đã được đăng ký trước đó. Nếu tài khoản chưa xác minh, bạn có thể gửi lại email xác nhận ở bước tiếp theo.",
			);
			router.push(
				"/signup-thank-you?email=" +
					encodeURIComponent(normalizedEmail) +
					"&existing=1",
			);
			setIsLoading(false);
			return;
		}

		if (data?.user) {
			toast.success(
				"Tạo tài khoản thành công! Vui lòng kiểm tra email để xác minh tài khoản.",
			);
			router.push(
				"/signup-thank-you?email=" + encodeURIComponent(normalizedEmail),
			);
		}
		setIsLoading(false);
	};

	const handleOAuthSignup = async (provider: "google" | "github") => {
		setIsLoading(true);
		const { error } = await supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: getAuthRedirectUrl("/auth/callback?next=/onboarding"),
			},
		});

		if (error) {
			toast.error(error.message);
			setIsLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen w-full items-center justify-center p-4">
			<Card className="w-full max-w-md border-muted/60 bg-background/80 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
				<CardHeader className="space-y-1 text-center">
					<CardTitle className="text-2xl font-bold tracking-tight">
						Tạo tài khoản
					</CardTitle>
					<CardDescription>
						Nhập thông tin để tạo tài khoản mới
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4">
					<div className="grid grid-cols-2 gap-4">
						<Button
							variant="outline"
							className="w-full"
							onClick={() => handleOAuthSignup("google")}
						>
							<GoogleIcon className="mr-2 h-4 w-4" />
							Google
						</Button>
						<Button
							variant="outline"
							className="w-full"
							onClick={() => handleOAuthSignup("github")}
						>
							<Github className="mr-2 h-4 w-4" />
							Github
						</Button>
					</div>
					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">
								Hoặc tiếp tục với
							</span>
						</div>
					</div>
					<form onSubmit={handleSignup} className="grid gap-4">
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="name@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="bg-background/50"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="password">Mật khẩu</Label>
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
							<Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
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
						<div className="flex items-start space-x-2">
							<Checkbox
								id="terms"
								checked={agreedToTerms}
								onCheckedChange={(checked) =>
									setAgreedToTerms(checked as boolean)
								}
								required
							/>
							<Label
								htmlFor="terms"
								className="text-xs leading-normal font-normal text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Tôi đồng ý với{" "}
								<a href="#" className="underline hover:text-primary">
									Điều khoản dịch vụ
								</a>{" "}
								và{" "}
								<a href="#" className="underline hover:text-primary">
									Chính sách riêng tư
								</a>
								.
							</Label>
						</div>
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Đang tạo tài khoản..." : "Đăng ký"}
						</Button>
					</form>
				</CardContent>
				<CardFooter className="flex justify-center">
					<p className="text-sm text-muted-foreground">
						Đã có tài khoản?{" "}
						<Link
							href="/login"
							className="font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
						>
							Đăng nhập
						</Link>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
