import { Suspense } from "react";

import { ProfileSettingsPage } from "@/components/profile/ProfileSettingsPage";

export default function Page() {
	return (
		<Suspense fallback={null}>
			<ProfileSettingsPage />
		</Suspense>
	);
}
