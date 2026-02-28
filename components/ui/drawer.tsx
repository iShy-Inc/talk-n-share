"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IconX } from "@tabler/icons-react";

function Drawer(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
	return <DialogPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
	return <DialogPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal(props: React.ComponentProps<typeof DialogPrimitive.Portal>) {
	return <DialogPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
	return <DialogPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
	return (
		<DialogPrimitive.Overlay
			data-slot="drawer-overlay"
			className={cn(
				"fixed inset-0 z-50 bg-black/60 backdrop-blur-xs data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0",
				className,
			)}
			{...props}
		/>
	);
}

function DrawerContent({
	className,
	children,
	showCloseButton = true,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
	showCloseButton?: boolean;
}) {
	return (
		<DrawerPortal>
			<DrawerOverlay />
			<DialogPrimitive.Content
				data-slot="drawer-content"
				className={cn(
					"fixed inset-x-0 bottom-0 top-2 z-50 flex h-[calc(100dvh-0.5rem)] w-full flex-col gap-4 rounded-t-3xl border border-border/70 bg-background p-4 shadow-2xl outline-none data-open:animate-in data-closed:animate-out data-closed:slide-out-to-bottom-full data-open:slide-in-from-bottom-full sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:h-auto sm:max-h-[88dvh] sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl",
					className,
				)}
				{...props}
			>
				<div className="mx-auto h-1.5 w-14 rounded-full bg-muted" />
				{children}
				{showCloseButton && (
					<DialogPrimitive.Close data-slot="drawer-close" asChild>
						<Button
							variant="ghost"
							size="icon-sm"
							className="absolute right-3 top-3"
						>
							<IconX />
							<span className="sr-only">Close</span>
						</Button>
					</DialogPrimitive.Close>
				)}
			</DialogPrimitive.Content>
		</DrawerPortal>
	);
}

function DrawerHeader({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="drawer-header"
			className={cn("shrink-0 flex flex-col gap-2 text-left", className)}
			{...props}
		/>
	);
}

function DrawerFooter({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="drawer-footer"
			className={cn(
				"shrink-0 flex flex-col-reverse gap-2 border-t border-border/70 bg-background pt-3 sm:flex-row sm:justify-end",
				className,
			)}
			{...props}
		/>
	);
}

function DrawerTitle(props: React.ComponentProps<typeof DialogPrimitive.Title>) {
	return (
		<DialogPrimitive.Title
			data-slot="drawer-title"
			className="text-base font-semibold"
			{...props}
		/>
	);
}

function DrawerDescription(
	props: React.ComponentProps<typeof DialogPrimitive.Description>,
) {
	return (
		<DialogPrimitive.Description
			data-slot="drawer-description"
			className="text-sm text-muted-foreground"
			{...props}
		/>
	);
}

export {
	Drawer,
	DrawerTrigger,
	DrawerPortal,
	DrawerOverlay,
	DrawerContent,
	DrawerHeader,
	DrawerFooter,
	DrawerTitle,
	DrawerDescription,
	DrawerClose,
};
