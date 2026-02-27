"use client";

import { useState } from "react";
import { IconSearch } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export interface PickerContact {
	id: string;
	name: string;
	title?: string;
	avatar?: string;
}

interface ContactPickerProps {
	contacts: PickerContact[];
	onSelect: (contact: PickerContact) => void;
}

export function ContactPicker({ contacts, onSelect }: ContactPickerProps) {
	const [search, setSearch] = useState("");

	const filtered = contacts.filter(
		(c) =>
			c.name.toLowerCase().includes(search.toLowerCase()) ||
			(c.title ?? "").toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<Card className="w-full max-w-md overflow-hidden border shadow-lg">
			<CardContent className="p-0">
				{/* Search input */}
				<div className="relative border-b border-border/70 p-4">
					<IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Tin nhắn mới đến:"
						className="rounded-full border-0 bg-muted pl-9"
						id="contact-picker-search"
					/>
				</div>

				{/* Contact list */}
				<div className="max-h-[60vh] space-y-1 overflow-y-auto p-3">
					{filtered.map((contact) => (
						<button
							key={contact.id}
							onClick={() => onSelect(contact)}
							className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-muted/70"
							id={`pick-contact-${contact.id}`}
						>
							{contact.avatar ? (
								<img
									src={contact.avatar}
									alt=""
								className="size-11 shrink-0 rounded-full object-cover"
							/>
						) : (
							<div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
								{contact.name[0]?.toUpperCase()}
							</div>
						)}
						<div className="min-w-0">
							<p className="truncate font-semibold">{contact.name}</p>
							{contact.title && (
								<p className="truncate text-sm text-muted-foreground">
									{contact.title}
								</p>
							)}
						</div>
					</button>
				))}
				{filtered.length === 0 && (
					<p className="py-4 text-center text-sm text-muted-foreground">
						Không tìm thấy liên hệ
					</p>
				)}
			</div>
			</CardContent>
		</Card>
	);
}
