import { CreatePost } from "@/components/feed/CreatePost";
import { Feed } from "@/components/feed/Feed";
import { Button } from "@/components/ui/button";

export default function Page() {
	return (
		<>
			<div className="w-full bg-primary">
				<header className="max-w-7xl mx-auto flex items-center justify-between px-16 py-4">
					<h1 className="text-4xl font-bold text-primary-foreground">
						Talk n Share
					</h1>
					<Button variant="secondary">Login</Button>
				</header>
			</div>
			<div className="flex min-h-screen items-center justify-center">
				<main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between p-16">
					<CreatePost />
					<Feed />
				</main>
			</div>
		</>
	);
}
