"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuthStore } from "@/store/useAuthStore";
import useProfile, { MY_PROFILE_QUERY_KEY } from "@/hooks/useProfile";
import {
	SettingsLayout,
	SettingsMenuItem,
} from "@/components/shared/SettingsLayout";
import { GeneralSettingsForm } from "@/components/shared/GeneralSettingsForm";
import { PrivacySettingsForm } from "@/components/shared/PrivacySettingsForm";
import { AccountSettings } from "@/components/shared/AccountSettings";
import { ThemeSettings } from "@/components/shared/ThemeSettings";
import {
	AvatarCategoryKey,
	getAvatarCategoryForUrl,
} from "@/lib/avatar-options";
import { getZodiacSign } from "@/lib/zodiac";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

const settingsMenuItems: SettingsMenuItem[] = [
	{ label: "Chung", value: "general" },
	{ label: "Riêng tư", value: "privacy" },
	{ label: "Giao diện", value: "appearance" },
	{ label: "Tài khoản", value: "account" },
	{ label: "Đăng xuất", value: "logout" },
];

function getActiveSection(section: string | null) {
	if (
		section === "general" ||
		section === "privacy" ||
		section === "appearance" ||
		section === "account"
	) {
		return section;
	}

	return "general";
}

function GeneralSettingsSection({
	profile,
	onSave,
}: {
	profile: ReturnType<typeof useProfile>["profile"];
	onSave: (values: {
		display_name: string;
		bio: string;
		avatarUrl: string;
		location: string;
	}) => Promise<void>;
}) {
	const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatar_url ?? "");
	const [selectedAvatarCategory, setSelectedAvatarCategory] =
		useState<AvatarCategoryKey>(getAvatarCategoryForUrl(profile?.avatar_url));

	return (
		<GeneralSettingsForm
			initialValues={{
				display_name: profile?.display_name ?? "",
				bio: profile?.bio ?? "",
				location: profile?.location ?? "",
			}}
			selectedAvatar={selectedAvatar}
			selectedAvatarCategory={selectedAvatarCategory}
			onAvatarSelect={setSelectedAvatar}
			onAvatarCategoryChange={setSelectedAvatarCategory}
			onSave={onSave}
		/>
	);
}

export function ProfileSettingsPage() {
	const user = useAuthStore((state) => state.user);
	const router = useRouter();
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();
	const { profile } = useProfile();
	const activeSection = getActiveSection(searchParams.get("section"));

	const handleSaveGeneral = async (values: {
		display_name: string;
		bio: string;
		avatarUrl: string;
		location: string;
	}) => {
		if (!user) return;

		const { error } = await supabase
			.from("profiles")
			.update({
				display_name: values.display_name,
				bio: values.bio || null,
				avatar_url: values.avatarUrl || null,
				location: values.location || null,
			})
			.eq("id", user.id);

		if (error) {
			toast.error("Không thể lưu cài đặt");
			return;
		}

		toast.success("Đã lưu cài đặt thành công");
		await queryClient.invalidateQueries({ queryKey: [MY_PROFILE_QUERY_KEY] });
	};

	const handleSavePrivacy = async (values: {
		birth_date: string;
		birth_visibility: string;
		relationship: string;
		is_public: boolean;
	}) => {
		if (!user) return;

		const isSwitchingToPublic =
			(profile?.is_public ?? true) === false && values.is_public;
		if (isSwitchingToPublic) {
			const confirmed = window.confirm(
				"Chuyển sang công khai sẽ làm thông tin hồ sơ hiển thị với người khác. Tiếp tục?",
			);
			if (!confirmed) {
				toast("Hồ sơ của bạn vẫn ở chế độ riêng tư.");
				return;
			}
		}

		const { error } = await supabase
			.from("profiles")
			.update({
				birth_date: values.birth_date || null,
				birth_visibility: values.birth_visibility || "full",
				relationship: values.relationship || "private",
				zodiac: values.birth_date ? getZodiacSign(values.birth_date) : "",
				is_public: values.is_public,
			})
			.eq("id", user.id);

		if (error) {
			toast.error("Không thể lưu cài đặt");
			return;
		}

		toast.success("Đã lưu cài đặt thành công");
		await queryClient.invalidateQueries({ queryKey: [MY_PROFILE_QUERY_KEY] });
	};

	const handleDeleteAccount = async () => {
		toast.error(
			"Xóa tài khoản cần quản trị viên xử lý. Vui lòng liên hệ hỗ trợ.",
		);
	};

	const handleSettingsMenuChange = async (value: string) => {
		if (value === "logout") {
			await supabase.auth.signOut();
			window.location.href = "/login";
			return;
		}

		router.replace(`/profile/settings?section=${value}`);
	};

	return (
		<div className="space-y-4 mt-12 md:mt-0">
			<SettingsLayout
				menuItems={settingsMenuItems}
				activeItem={activeSection}
				onMenuChange={handleSettingsMenuChange}
			>
				{activeSection === "general" && (
					<GeneralSettingsSection
						key={`${profile?.id ?? "profile"}-${profile?.updated_at ?? "init"}`}
						profile={profile}
						onSave={handleSaveGeneral}
					/>
				)}
				{activeSection === "privacy" && (
					<PrivacySettingsForm
						key={`${profile?.id ?? "profile"}-${profile?.updated_at ?? "init"}-privacy`}
						initialValues={{
							birth_date: profile?.birth_date ?? "",
							birth_visibility: profile?.birth_visibility ?? "full",
							relationship: profile?.relationship ?? "private",
							is_public: profile?.is_public,
						}}
						onSave={handleSavePrivacy}
					/>
				)}
				{activeSection === "account" && (
					<AccountSettings onDeleteAccount={handleDeleteAccount} />
				)}
				{activeSection === "appearance" && <ThemeSettings />}
			</SettingsLayout>
		</div>
	);
}
