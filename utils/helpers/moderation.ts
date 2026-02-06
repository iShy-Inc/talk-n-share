// src/utils/moderation.js

// Helper mẫu
const TOXIC_WORDS = [
	"chửi_thề_1",
	"từ_nhạy_cảm_2",
	"phản_động",
	"sex",
	"toxic_word_n",
];

/**
 * Kiểm tra văn bản có chứa từ cấm không
 * @param {string} text
 * @returns {boolean} - true nếu vi phạm, false nếu sạch
 */
export const checkToxicContent = (text: string) => {
	if (!text) return false;
	const lowerText = text.toLowerCase();

	// Kiểm tra từ cấm trong danh sách
	const hasToxic = TOXIC_WORDS.some((word) => lowerText.includes(word));

	// Bạn có thể thêm Regex để kiểm tra các biến thể (v..í dụ viết t.á.c)
	const pattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/; // Ví dụ lọc email/link

	return hasToxic;
};
