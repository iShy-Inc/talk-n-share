import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

import { createClient } from "@/utils/supabase/server";

function getFriendlyErrorMessage(rawMessage: string, next: string) {
	const message = rawMessage.toLowerCase();
	const isResetFlow = next === "/reset";

	if (message.includes("pkce code verifier not found")) {
		return isResetFlow
			? "Lien ket dat lai mat khau nay duoc mo tren thiet bi khac hoac da het han. Hay quay lai trang Quen mat khau va yeu cau mot lien ket moi."
			: "Lien ket xac minh email nay duoc mo tren thiet bi khac hoac da het han. Hay quay lai buoc dang ky va bam Gui lai email xac nhan.";
	}

	if (
		message.includes("expired") ||
		message.includes("invalid") ||
		message.includes("missing authorization code") ||
		message.includes("missing authorization code or token hash")
	) {
		return isResetFlow
			? "Lien ket dat lai mat khau khong hop le hoac da het han. Hay quay lai trang Quen mat khau va yeu cau mot lien ket moi."
			: "Lien ket xac minh email khong hop le hoac da het han. Hay quay lai buoc dang ky va bam Gui lai email xac nhan.";
	}

	return rawMessage;
}

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const code = searchParams.get("code");
	const token_hash = searchParams.get("token_hash");
	const type = searchParams.get("type") as EmailOtpType | null;
	const _next = searchParams.get("next");
	const next = _next?.startsWith("/") ? _next : "/onboarding";

	const redirectToError = (message: string) => {
		const friendlyMessage = getFriendlyErrorMessage(message, next);
		redirect(`/auth/error?error=${encodeURIComponent(friendlyMessage)}`);
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
