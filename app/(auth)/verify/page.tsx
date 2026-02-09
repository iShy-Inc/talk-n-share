"use client";

import React, { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

// To avoid hydration errors with useSearchParams
function VerifyContent() {
	const searchParams = useSearchParams();
	const email = searchParams.get("email") || "your email";
	const [isLoading, setIsLoading] = useState(false);
	const [otp, setOtp] = useState(["", "", "", "", "", ""]);
	const router = useRouter();

	const handleVerifyOtp = (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setTimeout(() => {
			console.log("OTP Verified:", otp.join(""));
			setIsLoading(false);
			// Redirect or log in
			alert("Account verified!");
			router.push("/login");
		}, 1000);
	};

	const handleOtpChange = (index: number, value: string) => {
		if (isNaN(Number(value))) return;
		const newOtp = [...otp];
		newOtp[index] = value;
		setOtp(newOtp);

		// Auto-focus next input
		if (value !== "" && index < 5) {
			const nextInput = document.getElementById(`otp-${index + 1}`);
			nextInput?.focus();
		}
	};

	return (
		<Card className="w-full max-w-md border-muted/60 bg-background/80 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
			<CardHeader className="space-y-1 text-center">
				<CardTitle className="text-2xl font-bold tracking-tight">
					Verify your email
				</CardTitle>
				<CardDescription>
					We sent a verification code to {email}
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-4">
				<form onSubmit={handleVerifyOtp} className="grid gap-4">
					<div className="flex justify-center gap-2">
						{otp.map((digit, index) => (
							<Input
								key={index}
								id={`otp-${index}`}
								type="text"
								maxLength={1}
								className="h-10 w-10 text-center text-lg"
								value={digit}
								onChange={(e) => handleOtpChange(index, e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Backspace" && !digit && index > 0) {
										const prev = document.getElementById(`otp-${index - 1}`);
										prev?.focus();
									}
								}}
							/>
						))}
					</div>
					<Button type="submit" className="w-full" disabled={isLoading}>
						{isLoading ? "Verifying..." : "Verify Email"}
					</Button>
				</form>
			</CardContent>
			<CardFooter className="flex justify-center">
				<button
					onClick={() => console.log("Resend OTP")}
					className="text-sm font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
				>
					Resend Code
				</button>
			</CardFooter>
		</Card>
	);
}

export default function VerifyPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
			{/* Dynamic Background Effect */}
			<div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]"></div>
			<div className="absolute top-0 z-[-2] h-screen w-screen bg-white dark:bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]"></div>

			<Suspense fallback={<div>Loading...</div>}>
				<VerifyContent />
			</Suspense>
		</div>
	);
}
