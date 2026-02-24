// src/utils/match.js

import { Profile } from "@/types/supabase";

interface Filter {
	gender?: string;
	location?: string;
}

/**
 * Kiểm tra xem 2 user có khớp tiêu chí của nhau không
 * @param {Object} currentUser - User đang tìm
 * @param {Object} potentialMatch - Đối phương tiềm năng
 * @param {Object} filters - Bộ lọc (gender, location)
 */
export const isMatchValid = (
	currentUser: Profile,
	potentialMatch: Profile,
	filters: Filter,
) => {
	const { gender, location } = filters;

	// 1. Kiểm tra giới tính (Nếu có chọn)
	if (gender !== "all" && potentialMatch.gender !== gender) return false;

	// 2. Kiểm tra vùng miền
	if (location !== "all" && potentialMatch.location !== location) return false;

	return true;
};
