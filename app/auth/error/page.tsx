import { AuthHomeLink } from "@/components/shared/AuthHomeLink";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ error: string }>;
}) {
	const params = await searchParams;

	return (
		<div className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<AuthHomeLink className="absolute top-4 left-4 md:top-6 md:left-6" />
			<div className="w-full max-w-sm">
				<div className="flex flex-col gap-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-2xl">
								Sorry, something went wrong.
							</CardTitle>
						</CardHeader>
						<CardContent>
							{params?.error ? (
								<p className="text-sm text-muted-foreground">
									Code error: {params.error}
								</p>
							) : (
								<p className="text-sm text-muted-foreground">
									An unspecified error occurred.
								</p>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
