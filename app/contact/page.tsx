"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	IconMail,
	IconBrandGithub,
	IconBrandTwitter,
	IconMapPin,
	IconPhone,
	IconSend,
} from "@tabler/icons-react";
import toast from "react-hot-toast";
import Link from "next/link";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function ContactPage() {
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1500));
		setIsLoading(false);
		toast.success("Message sent successfully! We'll get back to you soon.");
		// Reset form logic here
	};

	return (
		<div className="min-h-screen bg-background pb-12">
			{/* Header */}
			<div className="relative overflow-hidden border-b bg-card py-16 text-center shadow-sm md:py-24">
				<div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />
				<h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
					Get in <span className="text-primary">Touch</span>
				</h1>
				<p className="mx-auto max-w-xl text-lg text-muted-foreground">
					Have questions about Talk-N-Share? Feedback on our matching system? Or
					just want to say hi? We&apos;d love to hear from you.
				</p>
			</div>

			<div className="container mx-auto mt-12 px-4">
				<div className="grid gap-8 lg:grid-cols-2">
					{/* Contact Form */}
					<Card className="border-0 shadow-lg">
						<CardHeader>
							<CardTitle>Send us a message</CardTitle>
							<CardDescription>
								Fill out the form below and our team will respond within 24
								hours.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-6">
								<div className="grid gap-4 sm:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="name">Name</Label>
										<Input id="name" placeholder="Group 3" required />
									</div>
									<div className="space-y-2">
										<Label htmlFor="email">Email</Label>
										<Input
											id="email"
											type="email"
											placeholder="group3@ssg104.com"
											required
										/>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="subject">Subject</Label>
									<Input
										id="subject"
										placeholder="Feedback / Inquiry"
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="message">Message</Label>
									<Textarea
										id="message"
										placeholder="Tell us what's on your mind..."
										className="min-h-[150px]"
										required
									/>
								</div>
								<Button type="submit" className="w-full" disabled={isLoading}>
									{isLoading ? (
										<span className="flex items-center gap-2">
											<span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
											Sending...
										</span>
									) : (
										<span className="flex items-center gap-2">
											<IconSend className="size-4" />
											Send Message
										</span>
									)}
								</Button>
							</form>
						</CardContent>
					</Card>

					{/* Contact Info */}
					<div className="space-y-8">
						{/* Info Cards */}
						<div className="grid gap-4 sm:grid-cols-2">
							<Card className="group overflow-hidden border transition-all hover:border-primary/50 hover:shadow-md">
								<CardContent className="flex flex-col items-center justify-center p-6 text-center">
									<div className="mb-4 inline-flex rounded-full bg-primary/10 p-3 text-primary group-hover:scale-110 transition-transform">
										<IconMail className="size-6" />
									</div>
									<h3 className="mb-1 font-semibold">Email Us</h3>
									<p className="text-sm text-muted-foreground">
										group3@ssg104.com
									</p>
								</CardContent>
							</Card>

							<Card className="group overflow-hidden border transition-all hover:border-primary/50 hover:shadow-md">
								<CardContent className="flex flex-col items-center justify-center p-6 text-center">
									<div className="mb-4 inline-flex rounded-full bg-primary/10 p-3 text-primary group-hover:scale-110 transition-transform">
										<IconMapPin className="size-6" />
									</div>
									<h3 className="mb-1 font-semibold">Visit Us</h3>
									<p className="text-sm text-muted-foreground">
										Group 3 - SSG104
									</p>
									<p className="text-sm text-muted-foreground">
										FPT Hanoi Campus
									</p>
								</CardContent>
							</Card>
						</div>

						{/* FAQ Section */}
						<Card>
							<CardHeader>
								<CardTitle>Frequently Asked Questions</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="rounded-lg border p-4">
									<h4 className="font-semibold text-sm">
										Is Talk-N-Share really anonymous?
									</h4>
									<p className="mt-1 text-sm text-muted-foreground">
										Yes! By default, your profile is hidden. You only reveal
										your identity when you choose to, typically after a mutual
										match connection.
									</p>
								</div>
								<div className="rounded-lg border p-4">
									<h4 className="font-semibold text-sm">
										How does matching work?
									</h4>
									<p className="mt-1 text-sm text-muted-foreground">
										Unless you specify filters, our smart algorithm pairs you
										with users who share similar interests or are in compatible
										locations.
									</p>
								</div>
								<div className="rounded-lg border p-4">
									<h4 className="font-semibold text-sm">Is it free to use?</h4>
									<p className="mt-1 text-sm text-muted-foreground">
										Absolutely. All core features including posting, matching,
										and chatting are completely free.
									</p>
								</div>
							</CardContent>
						</Card>

						{/* Social Links */}
						<div className="flex justify-center gap-6 pt-4">
							<a
								href="#"
								className="text-muted-foreground transition-colors hover:text-primary"
							>
								<IconBrandTwitter className="size-6" />
							</a>
							<a
								href="#"
								className="text-muted-foreground transition-colors hover:text-primary"
							>
								<IconBrandGithub className="size-6" />
							</a>
							<a
								href="#"
								className="text-muted-foreground transition-colors hover:text-primary"
							>
								<IconPhone className="size-6" />
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
