"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface PrivacySettingsFormProps {
	initialValues?: {
		birth_date?: string;
		birth_visibility?: string | null;
		relationship?: string | null;
		is_public?: boolean | null;
	};
	onSave?: (values: {
		birth_date: string;
		birth_visibility: string;
		relationship: string;
		is_public: boolean;
	}) => void;
}

export function PrivacySettingsForm({
	initialValues,
	onSave,
}: PrivacySettingsFormProps) {
	const [birthDate, setBirthDate] = useState(initialValues?.birth_date ?? "");
	const [birthVisibility, setBirthVisibility] = useState(
		initialValues?.birth_visibility ?? "full",
	);
	const [relationship, setRelationship] = useState(
		initialValues?.relationship ?? "private",
	);
	const [isPublic, setIsPublic] = useState(initialValues?.is_public ?? true);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSave?.({
			birth_date: birthDate,
			birth_visibility: birthVisibility,
			relationship,
			is_public: isPublic,
		});
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="mx-auto flex w-full max-w-md flex-col gap-5"
		>
			<div className="space-y-2">
				<Label htmlFor="privacy-birth-date">Ngày sinh</Label>
				<Input
					id="privacy-birth-date"
					type="date"
					value={birthDate}
					max={new Date().toISOString().split("T")[0]}
					onChange={(e) => setBirthDate(e.target.value)}
				/>
				<p className="text-xs text-muted-foreground">
					Cung hoàng đạo được tự động tính theo ngày sinh.
				</p>
			</div>

			<div className="space-y-2">
				<Label htmlFor="privacy-birthday-visibility">Quyền riêng tư ngày sinh</Label>
				<Select value={birthVisibility} onValueChange={setBirthVisibility}>
					<SelectTrigger id="privacy-birthday-visibility" className="w-full">
						<SelectValue placeholder="Chọn chế độ hiển thị ngày sinh" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="full">Hiển thị đầy đủ (ngày/tháng/năm)</SelectItem>
						<SelectItem value="month_year">Ẩn ngày (chỉ tháng/năm)</SelectItem>
						<SelectItem value="day_month">Chỉ hiển thị ngày/tháng</SelectItem>
						<SelectItem value="year_only">Chỉ hiển thị năm</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Label htmlFor="privacy-relationship">Mối quan hệ</Label>
				<Select value={relationship} onValueChange={setRelationship}>
					<SelectTrigger id="privacy-relationship" className="w-full">
						<SelectValue placeholder="Chọn trạng thái mối quan hệ" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="single">Độc thân</SelectItem>
						<SelectItem value="in_relationship">Đang trong mối quan hệ</SelectItem>
						<SelectItem value="married">Đã kết hôn</SelectItem>
						<SelectItem value="complicated">Phức tạp</SelectItem>
						<SelectItem value="private">Không muốn tiết lộ</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Label htmlFor="privacy-profile-visibility">Hiển thị hồ sơ</Label>
				<Select
					value={isPublic ? "public" : "private"}
					onValueChange={(value) => setIsPublic(value === "public")}
				>
					<SelectTrigger id="privacy-profile-visibility" className="w-full">
						<SelectValue placeholder="Chọn chế độ hiển thị hồ sơ" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="public">Hồ sơ công khai</SelectItem>
						<SelectItem value="private">Hồ sơ riêng tư</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<Button type="submit" className="w-40" id="privacy-save-btn">
				Lưu thay đổi
			</Button>
		</form>
	);
}
