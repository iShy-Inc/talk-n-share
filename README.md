# 🌐 Talk-N-Share: Full-stack Anonymous Social Network & Matching Chat

**TalKnShare** là nền tảng mạng xã hội ẩn danh kết hợp Chat Matching thời gian thực. Dự án tập trung vào tính riêng tư, kiểm duyệt nội dung tự động và trải nghiệm người dùng hiện đại.

---

## 🚀 Tính năng chi tiết

### 1. Mạng xã hội Ẩn danh (Threads-style)

- **Feed & Interaction:** Đăng bài, Like, Comment ẩn danh hoàn toàn.
- **Privacy Mode:** Trang cá nhân khóa mặc định; chỉ hiển thị khi chủ sở hữu bật công khai.
- **Smart Moderation:** - Tự động lọc ngôn từ độc hại (Toxic, Hate speech, Religion, Sexual).
  - **Moderation UI:** Hiển thị trạng thái "Đang phê duyệt" cho đến khi nội dung được xác nhận an toàn.
- **Reporting System:** Tố cáo người dùng vi phạm kèm bằng chứng hình ảnh (Upload qua Supabase Storage).

### 2. Matching Chat ẩn danh

- **Filter Match:** Ghép đôi theo Giới tính, Độ tuổi, Khu vực hoặc Ngẫu nhiên.
- **Mutual Like & Reveal:** - Hệ thống "Khóa kép": Danh tính (Tên thật, Avatar) chỉ hiển thị khi cả 2 cùng nhấn Like đối phương.
  - Thông báo Real-time khi nhận được tín hiệu Like từ bạn chat.
- **Rich Messaging:** Chat text, gửi ảnh, bộ chọn Emoji, và thả Reaction lên tin nhắn.
- **Session Management:** Hỗ trợ thoát chat (End session) nhưng vẫn lưu lại lịch sử hội thoại cũ.

---

## 🛠 Tech Stack & Architecture

- **Core:** `Next.js 16 (App Router)`
- **Backend/Real-time:** `Supabase` (PostgreSQL + Real-time + RLS)
- **State Management:** `Zustand` (Global State) & `TanStack Query` (Server State)
- **UI & Styling:** `Tailwind CSS` + `Headless UI` + `Lucide Icons`
- **Validation:** `Zod`

---

## 📂 Cấu trúc thư mục (Project Structure)

```text

├── app/
│   ├── (auth)/           # Authentication
│   ├── (forum)/          # Newsfeed
│   ├── (chat)/           # Phòng chat
│   └── api/              # Webhooks
├── components/           # UI Components
│   ├── ui/               # Base Components
│   ├── forum/            # PostCard, CommentSection, ReportModal
│   └── chat/             # MessageBubble, EmojiPicker, IdentityCard
├── hooks/                # Custom Hooks
│   ├── usePosts.ts       # Fetch & Post logic
│   ├── useChat.ts        # Real-time messages & Reactions
│   └── useMatch.ts       # Logic Matching & Filter
├── store/                # Statement Stores
├── configs/              # Configs of site
├── services/             # Supabase Client config
└── utils/                # Helper functions

```

# Clone repo

git clone [https://github.com/iShy-Inc/talk-n-share.git](https://github.com/iShy-Inc/talk-n-share.git)

# Cài đặt thư viện

npm install

# Chạy dự án

npm run dev

# Cấu hình Environment Variables (.env.local)

NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
