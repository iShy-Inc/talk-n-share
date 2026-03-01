import React from "react";
import { AuthHomeLink } from "@/components/shared/AuthHomeLink";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="relative flex min-h-screen flex-col items-center justify-center px-4">
			<AuthHomeLink className="absolute top-4 left-4 z-10 md:top-6 md:left-6" />
			{children}
		</div>
	);
};

export default AuthLayout;
