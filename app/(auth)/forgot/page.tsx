"use client";

import React, { useState } from "react";
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

export default function ForgotPasswordPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [email, setEmail] = useState("");
	const router = useRouter();

	const handleForgotPassword = (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setTimeout(() => {
			console.log("Reset link sent to:", email);
			setIsLoading(false);
			// Optionally move to a "check email" state or reset password directly for demo
			router.push("/reset?email=" + encodeURIComponent(email));
		}, 1000);
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
			{/* Dynamic Background Effect */}
			<div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]"></div>
			<div className="absolute top-0 z-[-2] h-screen w-screen bg-white dark:bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]"></div>

			<Card className="w-full max-w-md border-muted/60 bg-background/80 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
				<CardHeader className="space-y-1 text-center">
					<CardTitle className="text-2xl font-bold tracking-tight">
						Forgot Password
					</CardTitle>
					<CardDescription>
						Enter your email to receive a reset link
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4">
					<form onSubmit={handleForgotPassword} className="grid gap-4">
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
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Sending Link..." : "Send Reset Link"}
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
		</div>
	);
}
