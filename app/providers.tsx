// app/providers.tsx
"use client";
import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationBootstrap } from "@/hooks/useNotifications";
import { useRealtimeMessageToasts } from "@/hooks/useRealtimeMessageToasts";
import { usePresenceHeartbeat } from "@/hooks/usePresence";

function AuthBootstrap() {
	useAuth();
	useNotificationBootstrap();
	usePresenceHeartbeat();
	return null;
}

function RealtimeMessageToastBootstrap() {
	useRealtimeMessageToasts();
	return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(() => new QueryClient());
		return (
		<QueryClientProvider client={queryClient}>
			<AuthBootstrap />
			<Suspense fallback={null}>
				<RealtimeMessageToastBootstrap />
			</Suspense>
			{children}
		</QueryClientProvider>
	);
}
