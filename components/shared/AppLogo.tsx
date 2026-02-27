import Image from "next/image";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/img/logo/icon.png";

interface AppLogoProps {
	className?: string;
	showText?: boolean;
	textClassName?: string;
	imageClassName?: string;
	text?: string;
}

export function AppLogo({
	className,
	showText = false,
	textClassName,
	imageClassName,
	text = "Talk N Share",
}: AppLogoProps) {
	return (
		<div
			className={cn(
				"inline-flex items-center",
				showText ? "gap-2" : "gap-0",
				className,
			)}
		>
			<Image
				src={logoImage}
				alt={text}
				width={28}
				height={28}
				priority
				className={cn("h-8 w-auto object-contain", imageClassName)}
			/>
			{showText && (
				<span
					className={cn("text-sm font-semibold tracking-tight", textClassName)}
				>
					{text}
				</span>
			)}
		</div>
	);
}
