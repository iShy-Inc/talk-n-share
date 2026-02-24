"use client";

import { useState } from "react";
import { Image as ImageIcon, Send } from "lucide-react";
import { usePosts } from "@/hooks/usePosts";
import { useAuthStore } from "@/store/useAuthStore";

export function CreatePost() {
	const { user } = useAuthStore();
	const [post, setPost] = useState({
		content: "",
		image_url: null,
	});
	const { createPost } = usePosts();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!post.content.trim() || !user) return;
		console.log(post);
		createPost.mutate({
			...post,
			author_id: user.id,
		});
		setPost({ content: "", image_url: null });
	};

	return (
		<div className="w-full bg-card border rounded-xl p-4 mb-6 shadow-sm">
			<form onSubmit={handleSubmit}>
				<div className="flex gap-4">
					<div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
						<span className="text-xl">🕵️</span>
					</div>
					<div className="flex-1">
						<textarea
							value={post.content}
							onChange={(e) => setPost({ ...post, content: e.target.value })}
							placeholder="What's on your mind? (Anonymous)"
							className="w-full bg-transparent border-none focus:ring-0 resize-none min-h-[100px] text-lg placeholder:text-muted-foreground/70"
						/>

						<div className="flex items-center justify-between pt-2 border-t mt-2">
							<button
								type="button"
								className="text-muted-foreground hover:text-primary transition-colors p-2 -ml-2 rounded-full hover:bg-secondary/50"
								title="Add Image"
							>
								<ImageIcon size={20} />
							</button>

							<button
								type="submit"
								disabled={!post.content.trim()}
								className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center gap-2"
							>
								<span>Post</span>
								<Send size={16} />
							</button>
						</div>
					</div>
				</div>
			</form>
		</div>
	);
}
