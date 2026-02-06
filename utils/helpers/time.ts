// src/utils/date.js
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

/**
 * Định dạng thời gian sang kiểu "X phút trước"
 * @param {string | Date} date
 */
export const formatTimeAgo = (date: string | Date) => {
	if (!date) return "";
	return formatDistanceToNow(new Date(date), {
		addSuffix: true,
		locale: vi,
	});
};
