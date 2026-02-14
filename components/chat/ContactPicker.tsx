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
		<Card className="w-full max-w-md border shadow-lg">
			<CardContent className="p-6">
				{/* Search input */}
				<div className="relative mb-6">
					<IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="New message to:"
						className="rounded-xl bg-muted/50 pl-9"
						id="contact-picker-search"
					/>
				</div>

				{/* Contact list */}
				<div className="space-y-5">
					{filtered.map((contact) => (
						<button
							key={contact.id}
							onClick={() => onSelect(contact)}
							className="flex w-full items-center gap-4 rounded-lg text-left transition-all hover:translate-x-1"
							id={`pick-contact-${contact.id}`}
						>
							{contact.avatar ? (
								<img
									src={contact.avatar}
									alt=""
									className="size-14 shrink-0 rounded-full object-cover"
								/>
							) : (
								<div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
									{contact.name[0]?.toUpperCase()}
								</div>
							)}
							<div>
								<p className="font-semibold">{contact.name}</p>
								{contact.title && (
									<p className="text-sm text-muted-foreground">
										{contact.title}
									</p>
								)}
							</div>
						</button>
					))}
					{filtered.length === 0 && (
						<p className="py-4 text-center text-sm text-muted-foreground">
							No contacts found
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
