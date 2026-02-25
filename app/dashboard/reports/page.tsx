"use client";

import React, { useState } from "react";
import { useDashboardReports } from "@/hooks/useDashboard";
import { ReportWithReporter } from "@/types/supabase";
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
	IconFlag,
	IconCheckbox,
	IconEyeOff,
	IconArticle,
	IconMessageCircle,
	IconUser,
} from "@tabler/icons-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

type ReportStatus = NonNullable<ReportWithReporter["status"]>;
type ReportTargetType = ReportWithReporter["target_type"];

const statusColors: Record<ReportStatus, string> = {
	pending: "destructive",
	reviewed: "secondary",
	resolved: "default",
	dismissed: "outline",
};

const targetTypeIcons: Record<ReportTargetType, React.ElementType> = {
	post: IconArticle,
	comment: IconMessageCircle,
	user: IconUser,
};

export default function ReportsPage() {
	const { reportsQuery, deleteReport, resolveReport } = useDashboardReports();
	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState<"all" | ReportStatus>("all");

	const reports = reportsQuery.data ?? [];
	const filteredReports = reports.filter((report) => {
		const matchesSearch =
			report.reason.toLowerCase().includes(search.toLowerCase()) ||
			(report.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
			(report.reporter_name ?? "").toLowerCase().includes(search.toLowerCase());
		if (filter === "all") return matchesSearch;
		return matchesSearch && report.status === filter;
	});

	const handleResolve = (reportId: string, status: ReportStatus) => {
		resolveReport.mutate(
			{ reportId, status },
			{
				onSuccess: () => toast.success(`Report marked as ${status}`),
				onError: () => toast.error("Failed to update report"),
			},
		);
	};

	const handleDelete = (reportId: string) => {
		deleteReport.mutate(reportId, {
			onSuccess: () => toast.success("Report deleted"),
			onError: () => toast.error("Failed to delete report"),
		});
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Reports</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Review and resolve user-submitted reports
				</p>
			</div>

			{/* Toolbar */}
			<Card className="border-0 shadow-lg">
				<CardContent className="p-4">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
						<div className="relative flex-1">
							<IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder="Search reports..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="pl-9"
								id="search-reports"
							/>
						</div>
						<div className="flex flex-wrap gap-2">
							{(
								["all", "pending", "reviewed", "resolved", "dismissed"] as const
							).map((f) => (
								<Button
									key={f}
									variant={filter === f ? "default" : "outline"}
									size="sm"
									onClick={() => setFilter(f)}
									id={`filter-reports-${f}`}
								>
									{f.charAt(0).toUpperCase() + f.slice(1)}
								</Button>
							))}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Reports Table */}
			<Card className="border-0 shadow-lg overflow-hidden">
				<CardHeader>
					<CardTitle>All Reports ({filteredReports.length})</CardTitle>
					<CardDescription>
						Manage reported content on your platform
					</CardDescription>
				</CardHeader>
				<CardContent className="p-0">
					{reportsQuery.isLoading ? (
						<div className="space-y-4 p-6">
							{Array.from({ length: 5 }).map((_, i) => (
								<div
									key={i}
									className="h-20 animate-pulse rounded-xl bg-muted"
								/>
							))}
						</div>
					) : filteredReports.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-16 text-center">
							<IconFlag className="size-12 text-muted-foreground/40" />
							<p className="mt-3 text-sm font-medium text-muted-foreground">
								No reports found
							</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b border-border/50 bg-muted/30">
										<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
											Reporter
										</th>
										<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
											Target
										</th>
										<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
											Reason
										</th>
										<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
											Status
										</th>
										<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
											Date
										</th>
										<th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border/30">
									{filteredReports.map((report) => {
										const safeStatus: ReportStatus = report.status ?? "pending";
										const TargetIcon = targetTypeIcons[report.target_type];
										return (
											<tr
												key={report.id}
												className="group transition-colors hover:bg-muted/20"
											>
												<td className="px-6 py-4">
													<div>
														<p className="text-sm font-medium">
															{report.reporter_name ?? "Unknown"}
														</p>
														<p className="text-xs text-muted-foreground">
															{report.reporter_id.slice(0, 8)}...
														</p>
													</div>
												</td>
												<td className="px-6 py-4">
													<Badge
														variant="outline"
														className="gap-1.5 capitalize"
													>
														<TargetIcon className="size-3" />
														{report.target_type}
													</Badge>
													<p className="mt-1 text-xs text-muted-foreground">
														{report.target_id
															? `${report.target_id.slice(0, 8)}...`
															: "—"}
													</p>
												</td>
												<td className="max-w-xs px-6 py-4">
													<p className="text-sm font-medium">{report.reason}</p>
													{report.description && (
														<p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
															{report.description}
														</p>
													)}
													{report.evidence_image_url && (
														<a
															href={report.evidence_image_url}
															target="_blank"
															rel="noreferrer"
															className="mt-1 inline-block text-xs text-primary underline-offset-4 hover:underline"
														>
															View evidence
														</a>
													)}
												</td>
												<td className="px-6 py-4">
													<Badge
														variant={
															statusColors[safeStatus] as
																| "default"
																| "secondary"
																| "destructive"
																| "outline"
														}
														className="capitalize"
													>
														{safeStatus}
													</Badge>
												</td>
												<td className="px-6 py-4 text-sm text-muted-foreground">
													{format(new Date(report.created_at), "MMM d, yyyy")}
												</td>
												<td className="px-6 py-4">
													<div className="flex items-center justify-end gap-1">
														{safeStatus === "pending" && (
															<>
																<Button
																	variant="ghost"
																	size="icon-sm"
																	onClick={() =>
																		handleResolve(report.id, "resolved")
																	}
																	title="Resolve"
																	id={`resolve-report-${report.id}`}
																>
																	<IconCheckbox className="size-4 text-emerald-500" />
																</Button>
																<Button
																	variant="ghost"
																	size="icon-sm"
																	onClick={() =>
																		handleResolve(report.id, "dismissed")
																	}
																	title="Dismiss"
																	id={`dismiss-report-${report.id}`}
																>
																	<IconEyeOff className="size-4 text-amber-500" />
																</Button>
															</>
														)}
														<AlertDialog>
															<AlertDialogTrigger asChild>
																<Button
																	variant="ghost"
																	size="icon-sm"
																	title="Delete"
																	id={`delete-report-${report.id}`}
																>
																	<IconTrash className="size-4 text-destructive" />
																</Button>
															</AlertDialogTrigger>
															<AlertDialogContent>
																<AlertDialogHeader>
																	<AlertDialogTitle>
																		Delete Report
																	</AlertDialogTitle>
																	<AlertDialogDescription>
																		Are you sure you want to delete this report?
																		This action cannot be undone.
																	</AlertDialogDescription>
																</AlertDialogHeader>
																<AlertDialogFooter>
																	<AlertDialogCancel>Cancel</AlertDialogCancel>
																	<AlertDialogAction
																		variant="destructive"
																		onClick={() => handleDelete(report.id)}
																	>
																		Delete
																	</AlertDialogAction>
																</AlertDialogFooter>
															</AlertDialogContent>
														</AlertDialog>
													</div>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
