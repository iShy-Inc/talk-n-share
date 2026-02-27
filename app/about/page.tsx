"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	IconArrowLeft,
	IconBrandNextjs,
	IconBrandSupabase,
	IconBrandTailwind,
	IconBrandReact,
	IconShieldCheck,
	IconGhost,
	IconHeartHandshake,
	IconMessageCircle,
	IconFilter,
	IconUserCheck,
} from "@tabler/icons-react";
import Link from "next/link";
// import {
// 	MainLayout,
// 	AppLeftSidebar,
// 	AppRightSidebar,
// } from "@/components/shared";
import { useAuthStore } from "@/store/useAuthStore";

const features = [
	{
		title: "Ưu tiên ẩn danh",
		description:
			"Chia sẻ suy nghĩ tự do, không phán xét. Nền tảng được xây dựng trên quyền riêng tư để bạn kết nối chân thật hơn.",
		icon: IconGhost,
		color: "text-purple-500",
		bg: "bg-purple-500/10",
	},
	{
		title: "Ghép đôi thông minh",
		description:
			"Tìm kết nối ý nghĩa theo bộ lọc giới tính, khu vực và sở thích. Không còn ghép ngẫu nhiên.",
		icon: IconFilter,
		color: "text-pink-500",
		bg: "bg-pink-500/10",
	},
	{
		title: "An toàn & kiểm duyệt",
		description:
			"Kiểm duyệt AI giúp cuộc trò chuyện lành mạnh. Chúng tôi ưu tiên môi trường không độc hại.",
		icon: IconShieldCheck,
		color: "text-emerald-500",
		bg: "bg-emerald-500/10",
	},
	{
		title: "Hiện danh tính hai chiều",
		description:
			"Danh tính được giữ kín cho đến khi cả hai cùng sẵn sàng kết nối. Đây là cơ chế đồng thuận hai chiều.",
		icon: IconUserCheck,
		color: "text-blue-500",
		bg: "bg-blue-500/10",
	},
];

const techStack = [
	{ name: "Next.js 15", icon: IconBrandNextjs },
	{ name: "Supabase", icon: IconBrandSupabase },
	{ name: "Tailwind CSS", icon: IconBrandTailwind },
	{ name: "React Query", icon: IconBrandReact },
];

const TEAM_MEMBERS = [
	{
		role: "Leader",
		name: "Nguyễn Đại Hữu",
		image:
			"https://scontent.fhan2-4.fna.fbcdn.net/v/t39.30808-6/628869870_122106912927230802_8090522384723489227_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=13d280&_nc_ohc=PeFXqueUTHgQ7kNvwFF_OVV&_nc_oc=Adkx9KvxECc8xgiTsixVpgBeKt6TZikOyRrrOflfoUx_MbMhyW4QioqGsZxKxPRLAy0&_nc_zt=23&_nc_ht=scontent.fhan2-4.fna&_nc_gid=mPM_ltBv6Xln9OyzvJ2eYg&_nc_ss=8&oh=00_AfsBn-VuXhWsedh0tVrx0ErN7HzBG6FGUTHWeyd8wUjgtQ&oe=69A7CC68",
		link: "https://www.facebook.com/profile.php?id=61586924084913",
	},
	{
		role: "Technical Leader",
		name: "Phùng Quang Anh",
		image:
			"https://scontent.fhan2-4.fna.fbcdn.net/v/t39.30808-6/629524138_122106912915230802_8742723953268627278_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=13d280&_nc_ohc=PJ5FSS4icOgQ7kNvwHWspkl&_nc_oc=AdnDXc_gDKCxNJ3CUQuBoKr-rMLyYNfn1kxw9opEHVHlMiUWAr5h5Q65LbbbU5jqQtA&_nc_zt=23&_nc_ht=scontent.fhan2-4.fna&_nc_gid=1z6zRYz1c4heXa0sojGLrw&_nc_ss=8&oh=00_AfsE57iSw3OLnpAJ7FihK2AGsuCcwKCvPT9zMcJcvx7TAQ&oe=69A7CEED",
		link: "https://www.facebook.com/profile.php?id=61586924084913",
	},
	{
		role: "Content Creator",
		name: "Phạm Đình Khiêm",
		image:
			"https://scontent.fhan2-5.fna.fbcdn.net/v/t39.30808-6/631836529_122106912825230802_6631373958620577984_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=13d280&_nc_ohc=i4rkxD-0i8YQ7kNvwEqzMKR&_nc_oc=AdlBvfAHm51e0_yOelumwKNDcHUfgAUsSnIt7tqeSMGvJGl62AvRmPJ0G_dSXHF8sV0&_nc_zt=23&_nc_ht=scontent.fhan2-5.fna&_nc_gid=RB9-qdbr_pjxgBzOFkaVkA&_nc_ss=8&oh=00_AfvNKI73j9A7K6u5lU86O5h5GybbD8nPCST5uNyNBSbXJw&oe=69A7E427",
		link: "https://www.facebook.com/profile.php?id=61586924084913",
	},
	{
		role: "Forum Manager",
		name: "Đặng Huy Chiến",
		image:
			"https://scontent.fhan20-1.fna.fbcdn.net/v/t39.30808-6/633652413_122106912909230802_8553232615620898604_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=13d280&_nc_ohc=Se4EfzaXiAEQ7kNvwFJgkQN&_nc_oc=AdmuVJYYW6ArhOnekuT61HebAWMKn5z7u0p4QvePjoiDzwDdBbYAV0Zv6sejl6XKrtA&_nc_zt=23&_nc_ht=scontent.fhan20-1.fna&_nc_gid=baQU9naxonqqn9SnIdVDuA&_nc_ss=8&oh=00_Afs0b6g3XuLRFztXsS8Wc4X_ZESRwNENVeAnVk3kc03pzw&oe=69A7CEBF",
		link: "https://www.facebook.com/profile.php?id=61586924084913",
	},
	{
		role: "Blog Moderator",
		name: "Khương Việt Hùng",
		image:
			"https://scontent.fhan2-4.fna.fbcdn.net/v/t39.30808-6/631702685_122106912831230802_8783950941911964342_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=13d280&_nc_ohc=7E-9x_g1bBcQ7kNvwEs8NoL&_nc_oc=AdltWbw_LBAgzbPlKqwM0C4aYzzYHUisdevD8S9YR9QvtJdkgR_VTVOktY_nHk19Ujs&_nc_zt=23&_nc_ht=scontent.fhan2-4.fna&_nc_gid=M3jzGvUbN1-3IlV4fG14pA&_nc_ss=8&oh=00_Aft69l3TIiQJf7vKULMYTP834LD2uoDtVYwDisYeDMVzDw&oe=69A7EC42",
		link: "https://www.facebook.com/profile.php?id=61586924084913",
	},
	{
		role: "UXUI Designer",
		name: "Đỗ Thành Đạt",
		image:
			"https://scontent.fhan2-4.fna.fbcdn.net/v/t39.30808-6/629333460_122106912903230802_2069793484234391524_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=13d280&_nc_ohc=uZwukyXxdp8Q7kNvwEAEm38&_nc_oc=AdlXvhrqHF1WVRdCqEi682KGnfl8XFwDeJscbcpXTYeBJMNsZCYia0C7mbJX1ny1adE&_nc_zt=23&_nc_ht=scontent.fhan2-4.fna&_nc_gid=gHngZPwo_ql3M-Ug3QNUig&_nc_ss=8&oh=00_Afs2vBtVjik_mDUdtbtEMXf7qBW_QbaKIecBj7W-CduW-g&oe=69A7EECA",
		link: "https://facebook.com/mock-do-thanh-dat",
	},
] as const;

export default function AboutPage() {
	const user = useAuthStore((state) => state.user);

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 pt-6">
				<Button asChild variant="outline" size="sm" className="rounded-xl">
					<Link href="/">
						<IconArrowLeft className="mr-2 size-4" />
						Về trang chủ
					</Link>
				</Button>
			</div>

			{/* Hero Section */}
			<section className="relative overflow-hidden py-24 md:py-32">
				<div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
				<div className="container mx-auto px-4 text-center">
					<div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
						<span className="flex size-2 me-2 rounded-full bg-primary animate-pulse" />
						Tương lai của kết nối xã hội
					</div>
					<h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
						Kết nối{" "}
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
							Ẩn danh.
						</span>{" "}
						<br />
						Hiện diện{" "}
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
							Ý nghĩa.
						</span>
					</h1>
					<p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
						Talk-N-Share là nền tảng thế hệ mới kết hợp sự tự do của mạng xã hội
						ẩn danh với trải nghiệm ghép đôi trò chuyện theo thời gian thực. Ưu
						tiên quyền riêng tư, kiểm duyệt thông minh và kết nối con người chân
						thật.
					</p>
					<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
						<Button
							size="lg"
							className="rounded-full px-8 h-12 text-base"
							asChild
						>
							<Link href={user ? "/match" : "/signup"}>
								{user ? "Bắt đầu ghép đôi" : "Tham gia cộng đồng"}
							</Link>
						</Button>
						<Button
							size="lg"
							variant="outline"
							className="rounded-full px-8 h-12 text-base"
							asChild
						>
							<Link href="/contact">Liên hệ</Link>
						</Button>
					</div>
				</div>
			</section>

			<section className="border-y border-border/70 bg-card/40 py-16">
				<div className="container mx-auto px-4">
					<div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
								Project Team
							</p>
							<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
								Đội ngũ Talk-N-Share
							</h2>
						</div>
						<p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
							Chia sẻ suy nghĩ, tìm kết nối ý nghĩa, và kết nối con người chân
							thật.
						</p>
					</div>

					<div className="team-marquee relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
						<div className="team-marquee-track flex w-max gap-5 py-2">
							{[...TEAM_MEMBERS, ...TEAM_MEMBERS].map((member, index) => (
								<a
									key={`${member.name}-${index}`}
									href={member.link}
									target="_blank"
									rel="noreferrer"
									className="team-member group block w-[260px] shrink-0 overflow-hidden rounded-[1.75rem] border border-border/70 bg-background shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition-all sm:w-[300px]"
								>
									<div className="relative h-72 overflow-hidden bg-muted sm:h-80">
										<img
											src={member.image}
											alt={`${member.role} ${member.name}`}
											className="team-member-image size-full object-cover transition-transform duration-500"
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent opacity-90" />
									</div>
									<div className="team-member-copy space-y-2 p-5">
										<p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary transition-colors duration-300">
											{member.role}
										</p>
										<h3 className="text-xl font-semibold leading-tight transition-colors duration-300">
											{member.name}
										</h3>
										<p className="text-sm text-muted-foreground transition-colors duration-300">
											Nhấn để mở hồ sơ Facebook cá nhân của thành viên này.
										</p>
									</div>
								</a>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* Features Grid */}
			<section className="py-20 bg-muted/30">
				<div className="container mx-auto px-4">
					<div className="mb-16 text-center">
						<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
							Vì sao chọn Talk-N-Share?
						</h2>
						<p className="mt-4 text-muted-foreground">
							Các tính năng được thiết kế cho trải nghiệm xã hội hiện đại, an
							toàn và thu hút.
						</p>
					</div>
					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
						{features.map((feature, index) => (
							<div
								key={index}
								className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
							>
								<div
									className={cn("mb-4 inline-flex rounded-xl p-3", feature.bg)}
								>
									<feature.icon className={cn("size-6", feature.color)} />
								</div>
								<h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
								<p className="text-muted-foreground">{feature.description}</p>
								<div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Tech Stack */}
			<section className="py-20">
				<div className="container mx-auto px-4 text-center">
					<h3 className="mb-10 text-2xl font-semibold text-muted-foreground/80">
						Được xây dựng bằng công nghệ hiện đại
					</h3>
					<div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale transition-all hover:grayscale-0 hover:opacity-100">
						{techStack.map((tech) => (
							<div
								key={tech.name}
								className="flex flex-col items-center gap-2 group"
							>
								<tech.icon className="size-10 md:size-12 text-foreground transition-transform group-hover:scale-110" />
								<span className="text-sm font-medium">{tech.name}</span>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Footer */}
			<section className="border-t bg-card py-16">
				<div className="container mx-auto px-4 text-center">
					<h2 className="mb-6 text-3xl font-bold">Sẵn sàng bắt đầu chia sẻ?</h2>
					<p className="mx-auto mb-8 max-w-xl text-muted-foreground">
						Tham gia cùng hàng ngàn người dùng đang khám phá cách kết nối mới
						trên online. An toàn, riêng tư và thú vị.
					</p>
					<Button size="lg" className="rounded-full px-10" asChild>
						<Link href="/signup">Tạo tài khoản miễn phí</Link>
					</Button>
				</div>
			</section>
			<style jsx>{`
				.team-marquee:hover .team-marquee-track {
					animation-play-state: paused;
				}

				.team-marquee-track {
					animation: team-marquee 30s linear infinite;
					will-change: transform;
				}

				.team-member:hover {
					transform: translateY(-8px) scale(1.02);
					border-color: color-mix(
						in srgb,
						hsl(var(--primary)) 35%,
						transparent
					);
					box-shadow: 0 20px 44px rgba(0, 0, 0, 0.14);
				}

				.team-member:hover .team-member-image {
					transform: scale(1.06);
				}

				.team-member:hover .team-member-copy h3,
				.team-member:hover .team-member-copy p {
					color: hsl(var(--primary));
				}

				@keyframes team-marquee {
					from {
						transform: translate3d(0, 0, 0);
					}
					to {
						transform: translate3d(-50%, 0, 0);
					}
				}
			`}</style>
		</div>
	);
}
