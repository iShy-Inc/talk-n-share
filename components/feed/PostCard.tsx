"use client";

import {
	MessageSquare,
	Heart,
	Share2,
	MoreHorizontal,
	Flag,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { Post } from "@/types";

interface PostCardProps {
	post: Post;
}

export function PostCard({ post }: PostCardProps) {
	return (
		<div className="w-full bg-card text-card-foreground border rounded-xl p-4 mb-4 shadow-sm hover:shadow-md transition-shadow duration-200">
			<div className="flex items-start justify-between mb-3">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
						{post.author_avatar ? (
							<Image
								src={post.author_avatar}
								alt="Avatar"
								width={40}
								height={40}
							/>
						) : (
							<span className="text-xl">👤</span>
						)}
					</div>
					<div>
						<h3 className="font-semibold text-sm">
							{post.author_name || "Anonymous User"}
						</h3>
						<p className="text-xs text-muted-foreground">
							{formatDistanceToNow(new Date(post.created_at), {
								addSuffix: true,
							})}
						</p>
					</div>
				</div>
				<button className="text-muted-foreground hover:text-foreground">
					<MoreHorizontal size={20} />
					<span className="sr-only">More</span>
				</button>
			</div>

			<div className="mb-4">
				<p className="text-base leading-relaxed whitespace-pre-wrap">
					{post.content}
				</p>
				{post.image_url && (
					<div className="mt-3 relative w-full h-64 rounded-lg overflow-hidden">
						<Image
							src={post.image_url}
							alt="Post content"
							fill
							className="object-cover"
						/>
					</div>
				)}
			</div>

			<div className="flex items-center justify-between pt-3 border-t">
				<div className="flex gap-4">
					<button
						className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-red-500 transition-colors group"
						title="Like"
					>
						<Heart size={18} className="group-hover:fill-current" />
						<span>{post.likes_count}</span>
					</button>
					<button
						className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-blue-500 transition-colors"
						title="Comment"
					>
						<MessageSquare size={18} />
						<span>{post.comments_count}</span>
					</button>
				</div>
				<div className="flex gap-4">
					<button
						className="text-muted-foreground hover:text-foreground"
						title="Share"
					>
						<Share2 size={18} />
					</button>
					<button
						className="text-muted-foreground hover:text-foreground"
						title="Report"
					>
						<Flag size={18} />
					</button>
				</div>
			</div>
		</div>
	);
}
