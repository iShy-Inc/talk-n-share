import { createBrowserClient } from "@supabase/ssr";

export function createEmailAuthClient() {
	return createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
		{
			auth: {
				flowType: "implicit",
			},
		},
	);
}
