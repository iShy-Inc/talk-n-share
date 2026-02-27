export type SupportContact = {
	id: string;
	name: string;
	type: "hotline" | "hospital" | "community" | "expert";
	description: string;
	phone?: string;
	email?: string;
	address?: string;
	website?: string;
	hours?: string;
};

const SELF_HARM_KEYWORDS = [
	"tự tử",
	"tu tu",
	"muốn chết",
	"muon chet",
	"không muốn sống",
	"khong muon song",
	"tự hại",
	"tu hai",
	"self harm",
	"hurt myself",
	"kill myself",
	"suicide",
	"end my life",
	"cắt tay",
	"cat tay",
	"nhảy lầu",
	"nhay lau",
	"uống thuốc ngủ",
	"uong thuoc ngu",
	"muốn biến mất",
	"muon bien mat",
	"chán sống",
	"chan song",
	"muốn kết thúc",
	"muon ket thuc",
] as const;

const normalizeText = (value: string) =>
	value
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/\s+/g, " ")
		.trim();

const NORMALIZED_KEYWORDS = SELF_HARM_KEYWORDS.map((keyword) =>
	normalizeText(keyword),
);

export const hasSelfHarmSignal = (text: string) => {
	if (!text.trim()) return false;
	const normalized = normalizeText(text);
	return NORMALIZED_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

export const SUPPORT_CONTACTS: SupportContact[] = [
	{
		id: "vn-115",
		name: "Cấp cứu y tế 115",
		type: "hotline",
		description:
			"Nếu bạn hoặc người bên cạnh có nguy cơ tự gây hại ngay lập tức, hãy gọi cấp cứu để được can thiệp khẩn.",
		phone: "115",
		hours: "24/7",
	},
	{
		id: "vn-111",
		name: "Tổng đài bảo vệ trẻ em 111",
		type: "hotline",
		description:
			"Hỗ trợ khủng hoảng tâm lý và an toàn cho trẻ vị thành niên, sinh viên trẻ và gia đình.",
		phone: "111",
		hours: "24/7",
		website: "https://tongdai111.vn",
	},
	{
		id: "befrienders",
		name: "Befrienders Worldwide",
		type: "community",
		description:
			"Mạng lưới hỗ trợ cảm xúc quốc tế, giúp tìm hotline theo quốc gia và khu vực.",
		website: "https://www.befrienders.org",
		hours: "Theo từng quốc gia",
	},
	{
		id: "youmed-tamly",
		name: "Danh bạ bác sĩ tâm lý (YouMed)",
		type: "expert",
		description:
			"Tra cứu chuyên gia tâm lý/tâm thần và lịch khám trực tiếp hoặc trực tuyến.",
		website: "https://youmed.vn",
		hours: "Theo lịch đặt khám",
	},
	{
		id: "bookingcare-tamly",
		name: "Danh bạ chuyên gia tâm lý (BookingCare)",
		type: "expert",
		description:
			"Tìm kiếm chuyên gia tâm lý phù hợp, hỗ trợ đặt lịch tư vấn.",
		website: "https://bookingcare.vn",
		hours: "Theo lịch đặt khám",
	},
	{
		id: "school-counseling",
		name: "Phòng tham vấn tâm lý trường đại học",
		type: "community",
		description:
			"Liên hệ trung tâm hỗ trợ sinh viên của trường để được tư vấn trực tiếp, bảo mật và miễn phí/chi phí thấp.",
		email: "counseling@your-university.edu.vn",
		phone: "(028) 0000 0000",
		address: "Tòa nhà hỗ trợ sinh viên, khuôn viên trường",
		hours: "Thứ 2 - Thứ 6, 08:00 - 17:00",
	},
	{
		id: "community-support",
		name: "Cộng đồng đồng hành sinh viên",
		type: "community",
		description:
			"Nhóm hỗ trợ ngang hàng, chia sẻ an toàn và định hướng dịch vụ chuyên môn khi cần.",
		email: "hotro.tamly.sv@example.org",
		phone: "0900 000 000",
		hours: "Hàng ngày, 08:00 - 22:00",
	},
] as const;
