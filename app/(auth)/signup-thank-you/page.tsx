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
					Thank you for signing up
				</CardTitle>
				<CardDescription>
					Your account was created successfully.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3 text-sm text-muted-foreground">
				<p>
					Please check your email{email ? ` (${email})` : ""} for a verification
					link.
				</p>
				<p>
					After verifying your email, come back and sign in to continue.
				</p>
			</CardContent>
			<CardFooter className="flex justify-center">
				<Button asChild className="w-full">
					<Link href="/login">Back to Login</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}

export default function SignupThankYouPage() {
	return (
		<div className="flex min-h-screen w-full items-center justify-center p-4">
			<Suspense fallback={<div>Loading...</div>}>
				<SignupThankYouContent />
			</Suspense>
		</div>
	);
}
