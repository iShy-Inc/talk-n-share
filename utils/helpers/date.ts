import { format } from "date-fns";

const toValidDate = (value?: string | Date | null) => {
	if (!value) return null;
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return null;
	return date;
};

export const formatDateDDMMYYYY = (value?: string | Date | null) => {
	const date = toValidDate(value);
	if (!date) return "N/A";
	return format(date, "dd/MM/yyyy");
};

export const formatDateDDMM = (value?: string | Date | null) => {
	const date = toValidDate(value);
	if (!date) return "N/A";
	return format(date, "dd/MM");
};

export const formatDateMMYYYY = (value?: string | Date | null) => {
	const date = toValidDate(value);
	if (!date) return "N/A";
	return format(date, "MM/yyyy");
};

export const formatDateYYYY = (value?: string | Date | null) => {
	const date = toValidDate(value);
	if (!date) return "N/A";
	return format(date, "yyyy");
};
