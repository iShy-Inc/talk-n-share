import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="flex flex-col min-h-screen items-center justify-center">
			{/* Show logo */}
			{/* <h1 className="text-4xl font-bold mb-8 pt-8">Talk & Share</h1> */}
			{children}
		</div>
	);
};

export default AuthLayout;
