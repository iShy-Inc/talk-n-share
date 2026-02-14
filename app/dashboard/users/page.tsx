"use client";

import React, { useState } from "react";
import { useDashboardUsers } from "@/hooks/useDashboard";
import { Profile } from "@/types";
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
} from "@tabler/icons-react";
import toast from "react-hot-toast";

export default function UsersPage() {
	const { usersQuery, updateUser, deleteUser } = useDashboardUsers();
	const [search, setSearch] = useState("");
	const [editingUser, setEditingUser] = useState<Profile | null>(null);
	const [editForm, setEditForm] = useState({
		username: "",
		gender: "",
		region: "",
		is_public: true,
	});

	const users = usersQuery.data ?? [];
	const filteredUsers = users.filter(
		(user) =>
			user.username.toLowerCase().includes(search.toLowerCase()) ||
			(user.region ?? "").toLowerCase().includes(search.toLowerCase()),
	);

	const handleEdit = (user: Profile) => {
		setEditingUser(user);
		setEditForm({
			username: user.username,
			gender: user.gender ?? "",
			region: user.region ?? "",
			is_public: user.is_public,
		});
	};

	const handleSaveEdit = () => {
		if (!editingUser) return;
		updateUser.mutate(
			{ id: editingUser.id, ...editForm },
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

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Users</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Manage user accounts and profiles
				</p>
			</div>

			{/* Toolbar */}
			<Card className="border-0 shadow-lg">
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
			<Card className="border-0 shadow-lg overflow-hidden">
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
										<tr
											key={user.id}
											className="group transition-colors hover:bg-muted/20"
										>
											<td className="px-6 py-4">
												<div className="flex items-center gap-3">
													{user.avatar_url ? (
														<img
															src={user.avatar_url}
															alt={user.username}
															className="size-9 rounded-full object-cover ring-2 ring-border"
														/>
													) : (
														<div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 text-sm font-bold text-white ring-2 ring-border">
															{user.username[0]?.toUpperCase()}
														</div>
													)}
													<div>
														<p className="text-sm font-semibold">
															{user.username}
														</p>
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
												{user.region ?? "—"}
											</td>
											<td className="px-6 py-4">
												<Badge
													variant={user.is_public ? "default" : "secondary"}
													className="gap-1"
												>
													{user.is_public ? (
														<IconGlobe className="size-3" />
													) : (
														<IconLock className="size-3" />
													)}
													{user.is_public ? "Public" : "Private"}
												</Badge>
											</td>
											<td className="px-6 py-4 text-sm text-muted-foreground">
												{user.birthday ?? "—"}
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
																	<strong>{user.username}</strong>? This will
																	permanently remove their account and all
																	associated data.
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
								value={editForm.username}
								onChange={(e) =>
									setEditForm({ ...editForm, username: e.target.value })
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
								<Label htmlFor="edit-region">Region</Label>
								<Input
									id="edit-region"
									value={editForm.region}
									onChange={(e) =>
										setEditForm({ ...editForm, region: e.target.value })
									}
								/>
							</div>
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
