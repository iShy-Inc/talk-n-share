import React from "react";
import { AppLogo } from "@/components/shared/AppLogo";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="flex flex-col min-h-screen items-center justify-center">
			<div className="mb-8 pt-8">
				<AppLogo imageClassName="h-16 w-auto" />
			</div>
			{children}
		</div>
	);
};

export default AuthLayout;
