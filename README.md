# 🎓 VKU Real-time Study Room Booking App (React Native & Expo)

Ứng dụng di động đặt phòng học và phòng máy tính theo thời gian thực dành cho sinh viên **Trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn (VKU)**.

Dự án thuộc **Mini-Project 2** (Trọng số 10% - Tuần 5 & 6).

---

## 🌟 Tính Năng Cốt Lõi (Core Functional Specifications)

### 1. 🔍 Room Discovery & Multi-Parameter Filter
- **FlatList tối ưu hiệu năng cao (60fps scrolling)**:
  - Memoized card component (`React.memo`) chống re-render dư thừa.
  - Tối ưu hóa bộ nhớ với `removeClippedSubviews`, `initialNumToRender={5}`, `maxToRenderPerBatch={6}`, `windowSize={5}`.
  - Hiển thị đầy đủ hình ảnh chất lượng cao, tên phòng, Tòa nhà/Tầng (Khu A, B, C, V), sức chứa (2–20 sinh viên) và huy hiệu trạng thái thời gian thực (**Available Now** vs **Occupied**).
- **Bộ lọc tức thì (Instant Filter Chips & Search)**:
  - Tìm kiếm linh hoạt theo tên phòng, mã phòng, tòa nhà.
  - Chip lọc theo **Tòa nhà**: Tất cả, Khu A, Khu B, Khu C, Khu V.
  - Lọc theo **Sức chứa**: Nhóm nhỏ (2–6 bạn), Nhóm vừa (7–12 bạn), Lớp/Hội thảo (13–20 bạn).
  - Lọc theo **Trang thiết bị**: PC cấu hình cao (High-spec PC), Máy chiếu (Projector), Bảng trắng (Whiteboard), Điều hòa (AC).
  - Bộ lọc bật/tắt nhanh **"Phòng trống ngay" (Available Now)**.

### 2. ⏱️ Interactive Time-Slot Selector & Conflict Engine
- **Bộ chọn ngày trong vòng 7 ngày tới**:
  - Thanh cuộn ngang hiển thị 7 ngày liên tiếp từ ngày hiện tại, làm nổi bật ngày đang chọn và hôm nay.
- **4 Khung giờ 2 tiếng cố định**:
  - `07:30 – 09:30` (Ca Sáng 1)
  - `09:30 – 11:30` (Ca Sáng 2)
  - `13:00 – 15:00` (Ca Chiều 1)
  - `15:00 – 17:00` (Ca Chiều 2)
- **Visual Conflict Engine (Chống trùng lịch thời gian thực)**:
  - Tự động quét kiểm tra các lượt đặt chỗ đang hiệu lực trong store.
  - Khung giờ đã có người đặt sẽ bị **vô hiệu hóa (disabled)**, chuyển sang màu xám kèm biểu tượng ổ khóa và thông tin người đã giữ chỗ.
  - Ngăn chặn triệt để tình trạng đặt trùng phòng (Double Booking).
- **Thẻ Booking Pass & Mã QR Check-in tương tác**:
  - Sau khi đặt thành công, hệ thống tự động sinh mã vé duy nhất dạng `VKU-BK-XXXXX`.
  - Hiển thị vé điện tử kèm mã QR động (`react-native-qrcode-svg`).
  - Hỗ trợ nút **"Mô phỏng Quét Check-in"** chuyển trạng thái sang `CHECKED_IN` ngay trên giao diện.

### 3. 📦 Global State Management với Zustand & AsyncStorage
- Quản lý trạng thái toàn cục tập trung với `useBookingStore`:
  - **User Session**: Quản lý thông tin sinh viên VKU (Mã SV, Họ tên, Lớp, Ngành, Email, Avatar).
  - **Reservations**: Quản lý danh sách đặt phòng đang hoạt động và lịch sử.
  - **Cancellation Actions**: Hủy lịch phòng tức thì, giải phóng ngay khung giờ đó trong Conflict Engine mà không cần reload app.
  - **Data Persistence**: Tích hợp middleware `persist` kết hợp `@react-native-async-storage/async-storage` giúp lưu dữ liệu bền vững qua các lần khởi động lại app.

### 4. 🔔 Local Notifications (`expo-notifications`)
- Tích hợp thư viện thông báo cục bộ `expo-notifications`:
  - Tự động yêu cầu quyền nhận thông báo khi khởi chạy ứng dụng.
  - Lập lịch thông báo tự động trước **15 phút** so với thời điểm bắt đầu ca học đã đặt.
  - Cung cấp nút **"Bắn thông báo thử nghiệm"** trực tiếp trên thẻ Booking Pass và màn hình Lịch Đặt để phục vụ quay video demo / chấm bài trực tiếp.

---

## 🏗️ Cấu Trúc Dự Án (Architecture)

```
vku-study-room-booking/
├── App.tsx                          # Root App wrapper (SafeAreaProvider, Notification init)
├── app.json                         # Expo configuration
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # Cấu hình TypeScript nghiêm ngặt
├── README.md                        # Tài liệu hướng dẫn dự án (Deliverable #2)
├── REPORT.md                        # Báo cáo kỹ thuật 2-4 trang (Deliverable #3)
├── report-preview.html              # Mẫu in PDF báo cáo chuẩn A4
└── src/
    ├── types/                       # TypeScript interfaces & types
    │   ├── room.ts                  # Room, Building, Equipment, RoomStatus
    │   ├── booking.ts               # TimeSlot, Booking, SlotId, BookingStatus
    │   ├── user.ts                  # StudentUser session interface
    │   └── navigation.ts            # RootStackParamList & MainTabParamList
    ├── data/
    │   └── mockRooms.ts             # Dữ liệu phòng học chuẩn VKU & mock bookings test conflict
    ├── constants/
    │   └── theme.ts                 # Design Tokens (COLORS, SPACING, RADIUS)
    ├── store/
    │   ├── useBookingStore.ts       # Zustand Store + AsyncStorage persist middleware
    │   └── useFilterStore.ts        # Zustand Store quản lý Multi-Parameter filters
    ├── services/
    │   └── notificationService.ts   # Cấu hình expo-notifications (15m reminder & instant test)
    ├── components/
    │   ├── RoomCard.tsx             # Memoized component (React.memo) tối ưu 60fps
    │   ├── FilterChips.tsx          # Bộ lọc đa thông số (Tòa nhà, Sức chứa, Tiện nghi)
    │   ├── TimeSlotSelector.tsx     # Bộ chọn 7 ngày, 4 ca 2h & Visual Conflict Engine
    │   ├── BookingPassModal.tsx     # Thẻ vé Booking Pass kèm QR code check-in tương tác
    │   ├── StatusBadge.tsx          # Huy hiệu Available Now / Occupied
    │   └── EmptyState.tsx           # Giao diện khi không tìm thấy kết quả
    ├── screens/
    │   ├── ExploreScreen.tsx        # Màn hình Khám phá & danh sách phòng học VKU
    │   ├── RoomDetailScreen.tsx     # Màn hình Chi tiết phòng học & Đặt lịch
    │   ├── MyBookingsScreen.tsx     # Quản lý Lịch đặt của tôi, Hủy lịch & Mở QR Pass
    │   └── ProfileScreen.tsx        # Hồ sơ sinh viên VKU, Thống kê & Cài đặt thông báo
    └── navigation/
        └── AppNavigator.tsx         # Bottom Tabs & Native Stack Navigator
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy (Quickstart)

### Yêu cầu tiên quyết
- **Node.js**: Phiên bản 18 trở lên (Khuyến nghị LTS).
- **npm** hoặc **yarn**.
- Thiết bị di động đã cài đặt app **Expo Go** (Android / iOS) hoặc trình duyệt Web.

### 1. Cài đặt Dependencies
```bash
cd vku-study-room-booking
npm install
```

### 2. Chạy ứng dụng trên Thiết bị Di động (Expo Go)
```bash
npx expo start
```
- Mở camera hoặc app **Expo Go** quét mã QR hiển thị trong terminal để trải nghiệm trên máy thật.

### 3. Chạy ứng dụng trên Trình duyệt Web
```bash
npm run web
# hoặc
npx expo start --web
```
Ứng dụng sẽ tự động mở tại địa chỉ `http://localhost:8081`.

### 4. Build phiên bản Web Production (Live Demo)
```bash
npx expo export -p web
```
Toàn bộ file build tĩnh nằm trong thư mục `dist/`, có thể deploy trực tiếp lên **Cloudflare Pages**, **Vercel**, hoặc **Netlify**.

---

## 🧪 Kịch Bản Kiểm Thử Đánh Giá (Demo Checklist)

| STT | Kịch bản kiểm thử | Hành động | Kết quả mong đợi |
|-----|-------------------|-----------|-------------------|
| 1 | **Tối ưu 60fps FlatList** | Cuộn lướt danh sách phòng trên màn hình Khám Phá | Danh sách hiển thị mượt mà, ảnh load chuẩn, không bị giật lag. |
| 2 | **Lọc đa thông số** | Chọn Tòa B + Sức chứa "2-6 bạn" + "Điều hòa" | Danh sách lọc phản hồi tức thì dưới 16ms, hiển thị chính xác phòng thỏa mãn. |
| 3 | **Conflict Engine** | Vào phòng A.101 chọn Hôm nay ca 07:30–09:30 | Slot bị khóa (disabled), gạch ngang, hiển thị "Đã kín" do đã có người đặt trước. |
| 4 | **Đặt phòng mới** | Chọn phòng A.101 ca 13:00–15:00, bấm "Xác Nhận Giữ Chỗ" | Sinh mã `VKU-BK-XXXXX`, tự động mở thẻ QR Booking Pass. |
| 5 | **Mã QR & Check-in** | Bấm "Mô phỏng Quét Check-in" trên thẻ vé | Trạng thái chuyển thành "ĐÃ CHECK-IN", hiển thị popup thông báo thành công. |
| 6 | **Bắn thông báo cục bộ** | Bấm "Thử Bắn Thông Báo Nhắc Lịch" trên vé hoặc tab Lịch Đặt | Bắn ngay banner thông báo nhắc nhở 15 phút trước giờ nhận phòng. |
| 7 | **Hủy phòng & Nhả Slot** | Vào tab "Lịch Đặt", chọn 1 phòng đang đặt và bấm nút Hủy | Lịch đặt chuyển sang Lịch Sử / Đã Hủy, khung giờ tương ứng được mở khóa lại ngay lập tức. |
| 8 | **Lưu trữ Bền vững** | Reload lại app hoặc tải lại trang web | Toàn bộ dữ liệu đặt phòng và trạng thái check-in vẫn được giữ nguyên qua `AsyncStorage`. |

---

## 👥 Nhóm Tác Giả & Bản Quyền
- Dự án bài tập lớn **Mini-Project 2: Real-time Study Room Booking App**.
- Sinh viên thực hiện: **Nguyễn Văn An** (MSSV: `22IT108` - Lớp `22SE1`).
- Đơn vị đào tạo: **Trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn (VKU)**.
