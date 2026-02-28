import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const code = searchParams.get("code");
	const token_hash = searchParams.get("token_hash");
	const type = searchParams.get("type") as EmailOtpType | null;
	const _next = searchParams.get("next");
	const next = _next?.startsWith("/") ? _next : "/onboarding";

	const redirectToError = (message: string) => {
		redirect(`/auth/error?error=${encodeURIComponent(message)}`);
	};

	if (code) {
		const supabase = await createClient();
		const { error } = await supabase.auth.exchangeCodeForSession(code);

		if (!error) {
			redirect(next);
		}

		redirectToError(error.message);
	}

	if (token_hash && type) {
		const supabase = await createClient();

		const { error } = await supabase.auth.verifyOtp({
			type,
			token_hash,
		});
		if (!error) {
			redirect(next);
		}

		redirectToError(error.message);
	}

	redirectToError("Missing authorization code or token hash");
}
