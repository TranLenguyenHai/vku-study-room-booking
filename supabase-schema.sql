-- ====================================================================
-- VKU STUDY ROOM BOOKING APP - SUPABASE POSTGRESQL SCHEMA
-- Mini-Project 2: Real-time Study Room Booking (React Native & Expo)
-- Sinh viên: Trần Lê Nguyên Hải (MSSV: 23IT.EB031 - Lớp 23ITe1)
-- ====================================================================

-- 1. BẢNG ROOMS (Danh mục phòng học VKU)
CREATE TABLE IF NOT EXISTS public.rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    building TEXT NOT NULL CHECK (building IN ('A', 'B', 'C', 'V')),
    floor INTEGER NOT NULL,
    room_number TEXT NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity >= 2 AND capacity <= 20),
    equipment TEXT[] NOT NULL DEFAULT '{}',
    photo_url TEXT NOT NULL,
    description TEXT,
    is_occupied_now BOOLEAN DEFAULT FALSE,
    rating NUMERIC(2,1) DEFAULT 5.0,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BẢNG BOOKINGS (Lịch đặt phòng & Vé Booking Pass)
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY, -- Ví dụ: VKU-BK-89210
    room_id TEXT REFERENCES public.rooms(id) ON DELETE CASCADE,
    room_name TEXT NOT NULL,
    building TEXT NOT NULL,
    room_number TEXT NOT NULL,
    date TEXT NOT NULL, -- Định dạng YYYY-MM-DD
    slot_id TEXT NOT NULL CHECK (slot_id IN ('slot_1', 'slot_2', 'slot_3', 'slot_4')),
    slot_label TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    student_code TEXT NOT NULL,
    purpose TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('CONFIRMED', 'CHECKED_IN', 'CANCELLED')) DEFAULT 'CONFIRMED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    qr_value TEXT NOT NULL,
    notification_id TEXT
);

-- Chỉ mục tối ưu hóa tốc độ truy vấn Conflict Engine
CREATE INDEX IF NOT EXISTS idx_bookings_conflict 
ON public.bookings(room_id, date, slot_id, status);

-- 3. CẤU HÌNH BẢO MẬT ROW LEVEL SECURITY (RLS)
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Cho phép tất cả sinh viên xem danh sách phòng
CREATE POLICY "Cho phép đọc danh sách phòng công khai"
ON public.rooms FOR SELECT
USING (true);

-- Cho phép sinh viên xem, thêm và cập nhật lịch đặt phòng
CREATE POLICY "Cho phép xem tất cả lịch đặt phòng"
ON public.bookings FOR SELECT
USING (true);

CREATE POLICY "Cho phép đặt phòng mới"
ON public.bookings FOR INSERT
WITH CHECK (true);

CREATE POLICY "Cho phép cập nhật hoặc hủy lịch đặt phòng"
ON public.bookings FOR UPDATE
USING (true);

-- 4. BẬT TÍNH NĂNG SUPABASE REALTIME (Đồng bộ tức thì qua WebSocket)
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

-- 5. NẠP DỮ LIỆU MẪU (SEED DATA PHÒNG HỌC VKU)
INSERT INTO public.rooms (id, name, building, floor, room_number, capacity, equipment, photo_url, description, is_occupied_now, rating, tags)
VALUES
(
    'room-a101',
    'Phòng Lab AI & IoT A.101',
    'A',
    1,
    'A.101',
    20,
    ARRAY['High-spec PC', 'Projector', 'Whiteboard', 'AC'],
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    'Phòng máy tính cấu hình cao RTX 4070, phục vụ nghiên cứu trí tuệ nhân tạo, đồ họa và phát triển phần mềm.',
    false,
    4.9,
    ARRAY['Nghiên cứu', 'AI Lab', 'Máy trạm']
),
(
    'room-a205',
    'Phòng Thảo Luận Nhóm A.205',
    'A',
    2,
    'A.205',
    6,
    ARRAY['Whiteboard', 'AC', 'Projector'],
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    'Không gian yên tĩnh cách âm dành cho nhóm làm bài tập lớn, đồ án tốt nghiệp và thuyết trình.',
    true,
    4.8,
    ARRAY['Nhóm nhỏ', 'Yên tĩnh', 'Cách âm']
),
(
    'room-b102',
    'Phòng Đổi Mới Sáng Tạo B.102',
    'B',
    1,
    'B.102',
    12,
    ARRAY['Projector', 'Whiteboard', 'AC'],
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    'Bàn ghế linh hoạt di động, bảng kính 360 độ hỗ trợ Design Thinking và thảo luận nhóm năng động.',
    false,
    4.7,
    ARRAY['Sáng tạo', 'Họp nhóm', 'Bảng 360']
),
(
    'room-b304',
    'Studio Đa Phương Tiện B.304',
    'B',
    3,
    'B.304',
    8,
    ARRAY['High-spec PC', 'AC'],
    'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=800&q=80',
    'Trang bị 4 máy iMac M2 và hệ thống thu âm cơ bản cho dựng video, đồ họa truyền thông số.',
    false,
    4.9,
    ARRAY['Multimedia', 'iMac', 'Dựng phim']
),
(
    'room-c201',
    'Phòng Hội Thảo Nhỏ C.201',
    'C',
    2,
    'C.201',
    16,
    ARRAY['Projector', 'Whiteboard', 'AC'],
    'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    'Phòng hội thảo chuyên đề, có hệ thống âm thanh mic không dây và máy chiếu 4K siêu nét.',
    true,
    4.6,
    ARRAY['Hội thảo', 'Thuyết trình', 'Microphone']
),
(
    'room-c305',
    'Góc Tự Học Pod C.305',
    'C',
    3,
    'C.305',
    4,
    ARRAY['AC', 'Whiteboard'],
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
    'Phòng học pod kính tập trung cao độ cho nhóm 2-4 bạn ôn thi giữa kỳ, cuối kỳ.',
    false,
    4.5,
    ARRAY['Tập trung', 'Ôn thi', 'Pod riêng']
),
(
    'room-v101',
    'Trung Tâm Khởi Nghiệp V.101',
    'V',
    1,
    'V.101',
    20,
    ARRAY['High-spec PC', 'Projector', 'Whiteboard', 'AC'],
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    'Không gian mở kết nối startup VKU, đầy đủ tiện nghi công nghệ cao và khu vực pitching.',
    false,
    5.0,
    ARRAY['Startup', 'Pitching', 'Toàn diện']
),
(
    'room-v208',
    'Phòng Nghiên Cứu Vi Mạch V.208',
    'V',
    2,
    'V.208',
    10,
    ARRAY['High-spec PC', 'AC', 'Whiteboard'],
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    'Chuyên dụng cho nghiên cứu vi mạch bán dẫn và hệ thống nhúng, có máy đo logic và bộ kit FPGA.',
    true,
    4.8,
    ARRAY['Vi mạch', 'Bán dẫn', 'Hardware']
)
ON CONFLICT (id) DO NOTHING;
