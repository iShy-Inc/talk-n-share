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
	const { isAdmin, loading: roleLoading } = useAdminRole();
	const [search, setSearch] = useState("");
	const [editingUser, setEditingUser] = useState<Profile | null>(null);
	const [editForm, setEditForm] = useState({
		display_name: "",
		gender: "",
		location: "",
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
		setEditForm({
			display_name: user.display_name ?? "",
			gender: user.gender ?? "",
			location: user.location ?? "",
			role: user.role ?? "user",
			is_public: user.is_public ?? true,
		});
	};

	const handleSaveEdit = () => {
		if (!editingUser) return;
		updateUser.mutate(
			{
				id: editingUser.id,
				display_name: editForm.display_name || undefined,
				gender: (editForm.gender || undefined) as Profile["gender"],
				location: editForm.location || undefined,
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

	if (!isAdmin) {
		return (
			<div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
				<div className="flex size-20 items-center justify-center rounded-2xl bg-muted">
					<IconShieldLock className="size-10 text-muted-foreground" />
				</div>
				<div>
					<h2 className="text-xl font-semibold">Access Restricted</h2>
					<p className="mt-1 text-sm text-muted-foreground">
						Only administrators can manage users.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-7">
			<div className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm">
				<h1 className="text-2xl font-bold tracking-tight">Users</h1>
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
						<div className="overflow-x-auto">
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
					)}
				</CardContent>
			</Card>

			{/* Edit User Modal */}
			<AlertDialog
				open={!!editingUser}
				onOpenChange={(open) => !open && setEditingUser(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Edit User</AlertDialogTitle>
						<AlertDialogDescription>
							Update user profile information
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="mt-2 space-y-4">
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
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="edit-gender">Gender</Label>
								<Input
									id="edit-gender"
									value={editForm.gender}
									onChange={(e) =>
										setEditForm({ ...editForm, gender: e.target.value })
									}
									placeholder="male / female / other"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="edit-location">Location</Label>
								<Input
									id="edit-location"
									value={editForm.location}
									onChange={(e) =>
										setEditForm({ ...editForm, location: e.target.value })
									}
								/>
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
						<div className="flex items-center gap-2">
							<Input
								type="checkbox"
								id="edit-is-public"
								checked={editForm.is_public}
								onChange={(e) =>
									setEditForm({
										...editForm,
										is_public: e.target.checked,
									})
								}
								className="size-4 rounded border-input accent-primary"
							/>
							<Label htmlFor="edit-is-public">Public profile</Label>
						</div>
					</div>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setEditingUser(null)}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction onClick={handleSaveEdit}>
							Save Changes
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
