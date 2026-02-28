export function getAuthRedirectUrl(pathname: string) {
	const baseUrl =
		process.env.NEXT_PUBLIC_SITE_URL ??
		(typeof window !== "undefined" ? window.location.origin : "");

	if (!baseUrl) {
		throw new Error("Missing site URL for auth redirect");
	}

	return new URL(pathname, baseUrl).toString();
}
