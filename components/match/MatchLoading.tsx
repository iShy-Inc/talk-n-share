"use client";

import { Button } from "@/components/ui/button";
import { IconLoader2 } from "@tabler/icons-react";

interface MatchLoadingProps {
	onCancel: () => void;
}

export function MatchLoading({ onCancel }: MatchLoadingProps) {
	return (
		<div className="flex flex-col items-center justify-center space-y-8 p-12 text-center">
			<div className="relative flex size-32 items-center justify-center">
				<div className="absolute inset-0 animate-ping rounded-full bg-primary/20 opacity-75 duration-1000"></div>
				<div className="absolute inset-4 animate-ping rounded-full bg-primary/30 opacity-75 duration-[1.5s]"></div>
				<div className="relative flex size-24 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl">
					<IconLoader2 className="size-10 animate-spin" />
				</div>
			</div>

			<div className="space-y-2">
				<h3 className="text-xl font-bold">Finding a Match...</h3>
				<p className="text-muted-foreground">
					We are looking for someone who matches your preferences.
				</p>
			</div>

			<Button
				variant="outline"
				onClick={onCancel}
				className="rounded-full px-8"
			>
				Cancel Search
			</Button>
		</div>
	);
}
