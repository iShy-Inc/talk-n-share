"use client";

import React, { useState } from "react";
import { useDashboardUsers } from "@/hooks/useDashboard";
import { useAdminRole } from "@/hooks/useAdminRole";
import { Profile } from "@/types/supabase";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AvatarCategoryPicker } from "@/components/shared/AvatarCategoryPicker";
import { LOCATION_OPTIONS } from "@/app/onboarding/page";
import {
	AvatarCategoryKey,
	getAvatarCategoryForUrl,
} from "@/lib/avatar-options";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	IconSearch,
	IconTrash,
	IconEdit,
	IconUsers,
	IconGlobe,
	IconLock,
	IconShieldLock,
	IconLoader2,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { formatDateDDMMYYYY } from "@/utils/helpers/date";
import { RoleVerifiedBadge } from "@/components/shared/RoleVerifiedBadge";

export default function UsersPage() {
	const { usersQuery, updateUser, deleteUser } = useDashboardUsers();
	const { hasAccess, loading: roleLoading } = useAdminRole();
	const [search, setSearch] = useState("");
	const [editingUser, setEditingUser] = useState<Profile | null>(null);
	const [selectedAvatarCategory, setSelectedAvatarCategory] =
		useState<AvatarCategoryKey>("people");
	const [editForm, setEditForm] = useState({
		display_name: "",
		avatar_url: "",
		bio: "",
		gender: "",
		location: "",
		birth_date: "",
		birth_visibility: "full",
		relationship: "private",
		role: "user" as Profile["role"],
		is_public: true,
	});

	const users = usersQuery.data ?? [];
	const filteredUsers = users.filter(
		(user) =>
			(user.display_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
			(user.location ?? "").toLowerCase().includes(search.toLowerCase()),
	);

	const handleEdit = (user: Profile) => {
		setEditingUser(user);
		setSelectedAvatarCategory(getAvatarCategoryForUrl(user.avatar_url));
		setEditForm({
			display_name: user.display_name ?? "",
			avatar_url: user.avatar_url ?? "",
			bio: user.bio ?? "",
			gender: user.gender ?? "",
			location: user.location ?? "",
			birth_date: user.birth_date ?? "",
			birth_visibility: user.birth_visibility ?? "full",
			relationship: user.relationship ?? "private",
			role: user.role ?? "user",
			is_public: user.is_public ?? true,
		});
		requestAnimationFrame(() => {
			document
				.getElementById("edit-user-panel")
				?.scrollIntoView({ behavior: "smooth", block: "start" });
		});
	};

	const handleSaveEdit = () => {
		if (!editingUser) return;
		updateUser.mutate(
			{
				id: editingUser.id,
				display_name: editForm.display_name || undefined,
				avatar_url: editForm.avatar_url || null,
				bio: editForm.bio || null,
				gender: (editForm.gender || undefined) as Profile["gender"],
				location: editForm.location || undefined,
				birth_date: editForm.birth_date || null,
				birth_visibility: editForm.birth_visibility || null,
				relationship: editForm.relationship || null,
				role: editForm.role,
				is_public: editForm.is_public,
			},
			{
				onSuccess: () => {
					toast.success("User updated successfully");
					setEditingUser(null);
				},
				onError: () => toast.error("Failed to update user"),
			},
		);
	};

	const handleDelete = (userId: string) => {
		deleteUser.mutate(userId, {
			onSuccess: () => toast.success("User deleted successfully"),
			onError: () => toast.error("Failed to delete user"),
		});
	};

	// Access control check
	if (roleLoading) {
		return (
			<div className="flex h-96 items-center justify-center">
				<IconLoader2 className="size-8 animate-spin text-primary" />
			</div>
		);
	}

	if (!hasAccess) {
		return (
			<div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
				<div className="flex size-20 items-center justify-center rounded-2xl bg-muted">
					<IconShieldLock className="size-10 text-muted-foreground" />
				</div>
				<div>
					<h2 className="text-xl font-semibold">Access Restricted</h2>
					<p className="mt-1 text-sm text-muted-foreground">
						Only administrators and moderators can manage users.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="animate-fade-up space-y-4 md:space-y-6">
			<div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm md:p-5">
				<h1 className="text-xl font-bold tracking-tight md:text-2xl">Users</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Manage roles, visibility, and user profile data in one place.
				</p>
			</div>

			{/* Toolbar */}
			<Card className="rounded-2xl border border-border/70 bg-card/90 shadow-sm">
				<CardContent className="p-4">
					<div className="relative">
						<IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Search by username or region..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-9"
							id="search-users"
						/>
					</div>
				</CardContent>
			</Card>

			{editingUser && (
				<Card
					id="edit-user-panel"
					className="rounded-2xl border border-border/70 bg-card/95 shadow-sm"
				>
					<CardHeader>
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<CardTitle>Edit User</CardTitle>
								<CardDescription>
									Update user profile information in-page. Scroll the page to
									review all fields.
								</CardDescription>
							</div>
							<Button
								variant="outline"
								onClick={() => setEditingUser(null)}
								type="button"
							>
								Close editor
							</Button>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="edit-username">Username</Label>
							<Input
								id="edit-username"
								value={editForm.display_name}
								onChange={(e) =>
									setEditForm({ ...editForm, display_name: e.target.value })
								}
							/>
						</div>
						<div className="space-y-2">
							<AvatarCategoryPicker
								selectedCategory={selectedAvatarCategory}
								selectedAvatar={editForm.avatar_url}
								onCategoryChange={setSelectedAvatarCategory}
								onAvatarSelect={(avatarUrl) =>
									setEditForm({ ...editForm, avatar_url: avatarUrl })
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="edit-avatar-url">Avatar URL (custom)</Label>
							<Input
								id="edit-avatar-url"
								value={editForm.avatar_url}
								onChange={(e) =>
									setEditForm({ ...editForm, avatar_url: e.target.value })
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="edit-bio">Bio</Label>
							<Textarea
								id="edit-bio"
								value={editForm.bio}
								onChange={(e) =>
									setEditForm({ ...editForm, bio: e.target.value })
								}
								rows={3}
							/>
						</div>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="edit-gender">Gender</Label>
								<Select
									value={editForm.gender || "unset"}
									onValueChange={(value) =>
										setEditForm({
											...editForm,
											gender: value === "unset" ? "" : value,
										})
									}
								>
									<SelectTrigger id="edit-gender">
										<SelectValue placeholder="Select gender" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="unset">Unset</SelectItem>
										<SelectItem value="male">male</SelectItem>
										<SelectItem value="female">female</SelectItem>
										<SelectItem value="others">others</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="edit-location">Location</Label>
								<Select
									value={editForm.location || "unset"}
									onValueChange={(value) =>
										setEditForm({
											...editForm,
											location: value === "unset" ? "" : value,
										})
									}
								>
									<SelectTrigger id="edit-location">
										<SelectValue placeholder="Chọn địa điểm" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="unset">Unset</SelectItem>
										{LOCATION_OPTIONS.map((loc) => (
											<SelectItem key={loc} value={loc}>
												{loc}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="edit-birth-date">Birth date</Label>
							<Input
								id="edit-birth-date"
								type="date"
								value={editForm.birth_date}
								onChange={(e) =>
									setEditForm({ ...editForm, birth_date: e.target.value })
								}
							/>
						</div>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="edit-birth-visibility">Birth visibility</Label>
								<Select
									value={editForm.birth_visibility || "full"}
									onValueChange={(value) =>
										setEditForm({
											...editForm,
											birth_visibility: value,
										})
									}
								>
									<SelectTrigger id="edit-birth-visibility">
										<SelectValue placeholder="Chọn chế độ hiển thị ngày sinh" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="full">Hiển thị đầy đủ</SelectItem>
										<SelectItem value="month_year">Ẩn ngày</SelectItem>
										<SelectItem value="day_month">Chỉ ngày/tháng</SelectItem>
										<SelectItem value="year_only">Chỉ năm</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="edit-relationship">Relationship</Label>
								<Select
									value={editForm.relationship || "private"}
									onValueChange={(value) =>
										setEditForm({
											...editForm,
											relationship: value,
										})
									}
								>
									<SelectTrigger id="edit-relationship">
										<SelectValue placeholder="Chọn trạng thái mối quan hệ" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="single">Độc thân</SelectItem>
										<SelectItem value="in_relationship">
											Đang trong mối quan hệ
										</SelectItem>
										<SelectItem value="married">Đã kết hôn</SelectItem>
										<SelectItem value="complicated">Phức tạp</SelectItem>
										<SelectItem value="private">Không muốn tiết lộ</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="edit-role">Role</Label>
							<Select
								value={editForm.role}
								onValueChange={(value) =>
									setEditForm({
										...editForm,
										role: value as Profile["role"],
									})
								}
							>
								<SelectTrigger id="edit-role">
									<SelectValue placeholder="Select role" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="user">user</SelectItem>
									<SelectItem value="moder">moder</SelectItem>
									<SelectItem value="admin">admin</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="edit-is-public">Profile visibility</Label>
							<Select
								value={editForm.is_public ? "public" : "private"}
								onValueChange={(value) =>
									setEditForm({
										...editForm,
										is_public: value === "public",
									})
								}
							>
								<SelectTrigger id="edit-is-public">
									<SelectValue placeholder="Chọn chế độ hiển thị hồ sơ" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="public">Hồ sơ công khai</SelectItem>
									<SelectItem value="private">Hồ sơ riêng tư</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex flex-col-reverse gap-2 border-t border-border/70 pt-4 sm:flex-row sm:justify-end">
							<Button
								variant="outline"
								type="button"
								onClick={() => setEditingUser(null)}
							>
								Cancel
							</Button>
							<Button onClick={handleSaveEdit}>Save Changes</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Users Table */}
			<Card className="rounded-2xl border border-border/70 bg-card/90 shadow-sm overflow-hidden">
				<CardHeader>
					<CardTitle>All Users ({filteredUsers.length})</CardTitle>
					<CardDescription>View and manage user profiles</CardDescription>
				</CardHeader>
				<CardContent className="p-0">
					{usersQuery.isLoading ? (
						<div className="space-y-4 p-6">
							{Array.from({ length: 5 }).map((_, i) => (
								<div
									key={i}
									className="h-16 animate-pulse rounded-xl bg-muted"
								/>
							))}
						</div>
					) : filteredUsers.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-16 text-center">
							<IconUsers className="size-12 text-muted-foreground/40" />
							<p className="mt-3 text-sm font-medium text-muted-foreground">
								No users found
							</p>
						</div>
					) : (
						<>
							<div className="space-y-3 p-4 md:hidden">
								{filteredUsers.map((user) => (
									<div
										key={user.id}
										className="rounded-xl border border-border/60 bg-background/70 p-3"
									>
										<div className="flex items-start justify-between gap-2">
											<div className="min-w-0">
												<div className="flex items-center gap-2">
													<p className="truncate text-sm font-semibold">
														{user.display_name ?? "User"}
													</p>
													<RoleVerifiedBadge role={user.role} />
												</div>
												<p className="text-xs text-muted-foreground">{user.id}</p>
											</div>
											<Badge
												variant={(user.is_public ?? true) ? "default" : "secondary"}
												className="gap-1"
											>
												{(user.is_public ?? true) ? (
													<IconGlobe className="size-3" />
												) : (
													<IconLock className="size-3" />
												)}
												{(user.is_public ?? true) ? "Public" : "Private"}
											</Badge>
										</div>
										<div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
											<p>Gender: {user.gender ?? "—"}</p>
											<p>Region: {user.location ?? "—"}</p>
											<p>Role: {user.role}</p>
											<p>
												Birthday:{" "}
												{user.birth_date
													? formatDateDDMMYYYY(user.birth_date)
													: "—"}
											</p>
										</div>
										<div className="mt-2 flex items-center justify-end gap-1">
											<Button
												variant="ghost"
												size="icon-sm"
												onClick={() => handleEdit(user)}
												title="Edit"
												id={`edit-user-mobile-${user.id}`}
											>
												<IconEdit className="size-4" />
											</Button>
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button
														variant="ghost"
														size="icon-sm"
														title="Delete"
														id={`delete-user-mobile-${user.id}`}
													>
														<IconTrash className="size-4 text-destructive" />
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>Delete User</AlertDialogTitle>
														<AlertDialogDescription>
															Are you sure you want to delete{" "}
															<strong>{user.display_name ?? "this user"}</strong>? This
															will permanently remove their account and all associated
															data.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Cancel</AlertDialogCancel>
														<AlertDialogAction
															variant="destructive"
															onClick={() => handleDelete(user.id)}
														>
															Delete
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</div>
									</div>
								))}
							</div>

							<div className="hidden overflow-x-auto md:block">
							<table className="w-full">
								<thead>
									<tr className="border-b border-border/50 bg-muted/30">
										<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
											User
										</th>
										<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
											Gender
										</th>
										<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
											Region
										</th>
										<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
											Role
										</th>
										<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
											Visibility
										</th>
										<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
											Birthday
										</th>
										<th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border/30">
									{filteredUsers.map((user) => (
										<tr key={user.id} className="group transition-colors hover:bg-muted/30">
											<td className="px-6 py-4">
												<div className="flex items-center gap-3">
													{user.avatar_url ? (
														<img
															src={user.avatar_url}
															alt={user.display_name ?? "User"}
															className="size-9 rounded-full object-cover ring-2 ring-border"
														/>
													) : (
														<div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 text-sm font-bold text-white ring-2 ring-border">
															{(user.display_name ??
																user.display_name ??
																"U")[0]?.toUpperCase()}
														</div>
													)}
													<div>
														<div className="flex items-center gap-2">
															<p className="text-sm font-semibold">
																{user.display_name ?? "User"}
															</p>
															<RoleVerifiedBadge role={user.role} />
														</div>
														<p className="text-xs text-muted-foreground">
															{user.id.slice(0, 8)}...
														</p>
													</div>
												</div>
											</td>
											<td className="px-6 py-4 text-sm text-muted-foreground capitalize">
												{user.gender ?? "—"}
											</td>
											<td className="px-6 py-4 text-sm text-muted-foreground">
												{user.location ?? "—"}
											</td>
											<td className="px-6 py-4 text-sm">
												<span className="capitalize">{user.role}</span>
											</td>
											<td className="px-6 py-4">
												<Badge
													variant={user.is_public ? "default" : "secondary"}
													className="gap-1"
												>
													{(user.is_public ?? true) ? (
														<IconGlobe className="size-3" />
													) : (
														<IconLock className="size-3" />
													)}
													{(user.is_public ?? true) ? "Public" : "Private"}
												</Badge>
											</td>
											<td className="px-6 py-4 text-sm text-muted-foreground">
												{user.birth_date ? formatDateDDMMYYYY(user.birth_date) : "—"}
											</td>
											<td className="px-6 py-4">
												<div className="flex items-center justify-end gap-1">
													<Button
														variant="ghost"
														size="icon-sm"
														onClick={() => handleEdit(user)}
														title="Edit"
														id={`edit-user-${user.id}`}
													>
														<IconEdit className="size-4" />
													</Button>
													<AlertDialog>
														<AlertDialogTrigger asChild>
															<Button
																variant="ghost"
																size="icon-sm"
																title="Delete"
																id={`delete-user-${user.id}`}
															>
																<IconTrash className="size-4 text-destructive" />
															</Button>
														</AlertDialogTrigger>
														<AlertDialogContent>
															<AlertDialogHeader>
																<AlertDialogTitle>Delete User</AlertDialogTitle>
																<AlertDialogDescription>
																	Are you sure you want to delete{" "}
																	<strong>
																		{user.display_name ?? "this user"}
																	</strong>
																	? This will permanently remove their account
																	and all associated data.
																</AlertDialogDescription>
															</AlertDialogHeader>
															<AlertDialogFooter>
																<AlertDialogCancel>Cancel</AlertDialogCancel>
																<AlertDialogAction
																	variant="destructive"
																	onClick={() => handleDelete(user.id)}
																>
																	Delete
																</AlertDialogAction>
															</AlertDialogFooter>
														</AlertDialogContent>
													</AlertDialog>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						</>
					)}
				</CardContent>
			</Card>

		</div>
	);
}
