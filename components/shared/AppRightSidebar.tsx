"use client";

import { BreathingPauseWidget } from "@/components/feed/WellnessWidgets";
import { SuggestedFriends, SuggestedFriend } from "./SuggestedFriends";
import { SidebarFooter } from "./SidebarFooter";
import { cn } from "@/lib/utils";

interface AppRightSidebarProps {
	suggestedFriends: SuggestedFriend[];
	className?: string;
}

export function AppRightSidebar({
	suggestedFriends,
	className,
}: AppRightSidebarProps) {
	return (
		<aside className={cn("hidden animate-fade-up animate-delay-1 lg:block", className)}>
			<div className="sticky top-6 space-y-4">
				<BreathingPauseWidget />
				<SuggestedFriends friends={suggestedFriends} />
				<SidebarFooter />
			</div>
		</aside>
	);
}
