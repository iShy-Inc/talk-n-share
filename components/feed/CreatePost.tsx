"use client";

import { useState } from "react";
import { Image as ImageIcon, Send } from "lucide-react";

export function CreatePost() {
	const [content, setContent] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!content.trim()) return;
		// TODO: Implement post creation
		console.log("Create post:", content);
		setContent("");
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
							value={content}
							onChange={(e) => setContent(e.target.value)}
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
								disabled={!content.trim()}
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
