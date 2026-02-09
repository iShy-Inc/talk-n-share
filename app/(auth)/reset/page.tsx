"use client";

import React, { useState, Suspense } from "react";
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
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordContent() {
	const searchParams = useSearchParams();
	const email = searchParams.get("email") || "your account";
	const [isLoading, setIsLoading] = useState(false);
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const router = useRouter();

	const handleResetPassword = (e: React.FormEvent) => {
		e.preventDefault();
		if (password !== confirmPassword) {
			alert("Passwords do not match");
			return;
		}
		setIsLoading(true);
		setTimeout(() => {
			console.log("Password reset for:", email, "New Password:", password);
			setIsLoading(false);
			router.push("/login");
		}, 1000);
	};

	return (
		<Card className="w-full max-w-md border-muted/60 bg-background/80 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
			<CardHeader className="space-y-1 text-center">
				<CardTitle className="text-2xl font-bold tracking-tight">
					Reset Password
				</CardTitle>
				<CardDescription>Enter your new password below</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-4">
				<form onSubmit={handleResetPassword} className="grid gap-4">
					<div className="grid gap-2">
						<Label htmlFor="password">New Password</Label>
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
						<Label htmlFor="confirmPassword">Confirm New Password</Label>
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
					<Button type="submit" className="w-full" disabled={isLoading}>
						{isLoading ? "Resetting..." : "Reset Password"}
					</Button>
				</form>
			</CardContent>
			<CardFooter className="flex justify-center">
				<Link
					href="/login"
					className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Login
				</Link>
			</CardFooter>
		</Card>
	);
}

export default function ResetPasswordPage() {
	return (
		<div className="flex min-h-screen items-center justify-center w-full p-4">
			<Suspense fallback={<div>Loading...</div>}>
				<ResetPasswordContent />
			</Suspense>
		</div>
	);
}
