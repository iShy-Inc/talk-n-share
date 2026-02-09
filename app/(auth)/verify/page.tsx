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

function VerifyContent() {
	const searchParams = useSearchParams();
	const email = searchParams.get("email") || "your email";
	const [isLoading, setIsLoading] = useState(false);
	const [otp, setOtp] = useState(["", "", "", "", "", ""]);
	const [isChecking, setIsChecking] = useState(true);
	const router = useRouter();

	// Check for active verification session
	React.useEffect(() => {
		const sessionEmail = sessionStorage.getItem("pendingVerificationEmail");
		if (!sessionEmail) {
			router.push("/signup");
		} else {
			setIsChecking(false);
		}
	}, [router]);

	if (isChecking) {
		return null;
	}

	const handleVerifyOtp = (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setTimeout(() => {
			console.log("OTP Verified:", otp.join(""));
			setIsLoading(false);
			sessionStorage.removeItem("pendingVerificationEmail");
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
		<div className="flex min-h-screen items-center justify-center w-full p-4">
			<Suspense fallback={<div>Loading...</div>}>
				<VerifyContent />
			</Suspense>
		</div>
	);
}
