# BÁO CÁO KỸ THUẬT MINI-PROJECT 2
## REAL-TIME STUDY ROOM BOOKING APP (REACT NATIVE & EXPO)

- **Học phần**: Lập trình Ứng dụng Di động (Mobile App Development)
- **Đơn vị**: Khoa Khoa học Máy tính, Trường ĐH CNTT & Truyền thông Việt - Hàn (VKU)
- **Sinh viên thực hiện**: Nguyễn Văn An (MSSV: `22IT108` - Lớp: `22SE1`)
- **Trọng số điểm**: 10% (Tuần 5 – 6)

---

### I. TỔNG QUAN DỰ ÁN & BÀI TOÁN THỰC TIỄN (PROBLEM SCENARIO)

#### 1. Bối cảnh thực tế tại VKU
Sinh viên và các nhóm nghiên cứu tại Đại học Việt - Hàn (VKU) thường xuyên cần không gian để học nhóm, làm đồ án tốt nghiệp, huấn luyện mô hình AI hoặc sinh hoạt câu lạc bộ. Hiện nay, việc tìm kiếm phòng trống đòi hỏi sinh viên phải đi kiểm tra trực tiếp từng tầng tại các tòa nhà (Khu A, B, C, V), dẫn đến lãng phí thời gian và thường xuyên xảy ra va chạm lịch (booking collision) khi nhiều nhóm cùng sử dụng một phòng.

#### 2. Mục tiêu giải pháp
Xây dựng ứng dụng di động **VKU Study Room Booking** đa nền tảng bằng React Native & Expo SDK, tích hợp hệ thống kiểm tra và cập nhật trạng thái khả dụng theo thời gian thực, ngăn chặn trùng lịch (Conflict Prevention Engine), xuất mã QR Check-in và tự động bắn thông báo nhắc nhở trước 15 phút.

---

### II. KIẾN TRÚC HỆ THỐNG & CÔNG NGHỆ (ARCHITECTURE & TECH STACK)

```
+-------------------------------------------------------------------------+
|                        VKU MOBILE APP (EXPO SDK)                        |
|                                                                         |
|  +-------------------------+  +--------------------------------------+  |
|  |     PRESENTATION UI     |  |       GLOBAL STATE (ZUSTAND)         |  |
|  | - ExploreScreen         |  | - useBookingStore                    |  |
|  |   (FlatList 60fps)      |  |   * user session                     |  |
|  | - RoomDetailScreen      |  |   * active reservations              |  |
|  | - MyBookingsScreen      |  |   * real-time conflict checking      |  |
|  | - ProfileScreen         |  | - useFilterStore                     |  |
|  | - BookingPassModal      |  |   * multi-parameter filters          |  |
|  +------------+------------+  +-------------------+------------------+  |
|               |                                   |                     |
|  +------------v-----------------------------------v------------------+  |
|  |                       SERVICES & HARDWARE                         |  |
|  | - @react-native-async-storage/async-storage (State Persistence)  |  |
|  | - expo-notifications (15-min pre-session local alert triggers)   |  |
|  | - react-native-qrcode-svg (Interactive QR check-in generation)    |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
```

- **Core Framework**: React Native (v0.86) & Expo SDK (v57), TypeScript nghiêm ngặt (Strict mode).
- **Navigation**: React Navigation (Bottom Tabs + Native Stack).
- **State Management**: Zustand (Clean, boilerplate-free state, selectors tối ưu).
- **Persistence**: `@react-native-async-storage/async-storage` qua middleware `persist`.
- **Hardware & Notifications**: `expo-notifications` (Foreground & Background handler), Camera/QR SVG.

---

### III. BẢNG KIỂM TÍNH NĂNG CHI TIẾT (FEATURE CHECKLIST)

| STT | Phân hệ tính năng | Tiêu chuẩn kỹ thuật | Trạng thái |
|:---:|:---|:---|:---:|
| **1** | **Room Discovery & Multi-Parameter Filter** | | |
| 1.1 | Danh sách phòng học FlatList 60fps | Sử dụng `React.memo` cho `RoomCard`, `removeClippedSubviews`, cấu hình `windowSize`, `initialNumToRender` tránh drop frame. | ✅ ĐẠT (100%) |
| 1.2 | Dữ liệu phòng chuẩn thực tế VKU | Ảnh chất lượng cao, phân loại Khu A, B, C, V, số tầng, sức chứa 2–20 SV, rating và mô tả chi tiết. | ✅ ĐẠT (100%) |
| 1.3 | Huy hiệu trạng thái thời gian thực | Hiển thị rõ ràng `Available Now` (Xanh lục) vs `Occupied` (Đỏ) dựa trên trạng thái thực tế. | ✅ ĐẠT (100%) |
| 1.4 | Bộ lọc tức thì theo Tòa nhà | Chip lọc nhanh: Tất cả, Khu A, Khu B, Khu C, Khu V (phản hồi tức thì < 16ms). | ✅ ĐẠT (100%) |
| 1.5 | Bộ lọc theo Sức chứa & Tiện nghi | Lọc theo nhóm 2–6, 7–12, 13–20 bạn; Lọc theo thiết bị: Máy chiếu, Bảng trắng, PC xịn, Điều hòa. | ✅ ĐẠT (100%) |
| **2** | **Interactive Time-Slot Selector & Conflict Engine** | | |
| 2.1 | Bộ chọn ngày 7 ngày tới | Thanh cuộn ngang chọn 7 ngày liên tiếp từ ngày hiện tại, làm nổi bật ngày đang chọn. | ✅ ĐẠT (100%) |
| 2.2 | 4 Khung giờ 2 tiếng chuẩn | `07:30–09:30`, `09:30–11:30`, `13:00–15:00`, `15:00–17:00`. | ✅ ĐẠT (100%) |
| 2.3 | Visual Conflict Engine | Tự động phát hiện slot đã có người đặt, disable slot, gạch ngang thời gian và hiển thị "Đã kín". | ✅ ĐẠT (100%) |
| 2.4 | Thẻ vé Booking Pass | Sinh mã định danh duy nhất `VKU-BK-XXXXX`, lưu trữ đầy đủ thông tin SV và phòng học. | ✅ ĐẠT (100%) |
| 2.5 | Mã QR Check-in tương tác | Hiển thị mã QR chuẩn Vector SVG, hỗ trợ nút "Mô phỏng Quét Check-in" chuyển trạng thái sang `CHECKED_IN`. | ✅ ĐẠT (100%) |
| **3** | **Global State Management với Zustand** | | |
| 3.1 | Store `useBookingStore` | Quản lý phiên sinh viên, danh mục phòng học, danh sách đặt phòng và hành động đặt/hủy. | ✅ ĐẠT (100%) |
| 3.2 | Chống va chạm lịch đồng thời | Hàm `bookRoom` kiểm tra `isSlotBooked` trước khi commit, từ chối double booking. | ✅ ĐẠT (100%) |
| 3.3 | Hủy lịch & Giải phóng Slot | Hàm `cancelBooking` giải phóng slot lập tức, cho phép người khác đặt lại mà không cần tải lại app. | ✅ ĐẠT (100%) |
| 3.4 | Lưu trữ cục bộ với AsyncStorage | Tích hợp `createJSONStorage(() => AsyncStorage)` duy trì dữ liệu qua các phiên bật/tắt app. | ✅ ĐẠT (100%) |
| **4** | **Local Notifications (expo-notifications)** | | |
| 4.1 | Đăng ký & Cấp quyền | Tự động kiểm tra và yêu cầu quyền `requestPermissionsAsync` khi khởi chạy app. | ✅ ĐẠT (100%) |
| 4.2 | Lập lịch thông báo trước 15 phút | Tự động tính toán mốc $T_{slot} - 15\text{ phút}$ và đăng ký vào Notification Manager. | ✅ ĐẠT (100%) |
| 4.3 | Nút Test thông báo tức thì | Cho phép giảng viên/người chấm kiểm tra thông báo ngay lập tức trên máy thật hoặc trình duyệt. | ✅ ĐẠT (100%) |

---

### IV. THIẾT KẾ THUẬT TOÁN CONFLICT PREVENTION ENGINE

Thuật toán ngăn chặn trùng lịch được triển khai trực tiếp trong Zustand store với độ phức tạp truy vấn $O(N)$ (với $N$ là tổng số lượt đặt đang active):

```typescript
isSlotBooked: (roomId: string, date: string, slotId: SlotId): boolean => {
  const { reservations } = get();
  return reservations.some(
    (b) =>
      b.roomId === roomId &&
      b.date === date &&
      b.slotId === slotId &&
      b.status !== 'CANCELLED'
  );
}
```

- **Khi người dùng mở phòng**: Giao diện render 4 khung giờ, đối chiếu với `isSlotBooked(room.id, selectedDate, slot.id)`. Nếu trả về `true`, thuộc tính `disabled` của `TouchableOpacity` được kích hoạt, slot chuyển tông màu xám nhạt kèm huy hiệu ổ khóa.
- **Khi hủy phòng**: Trạng thái chuyển thành `CANCELLED`, ngay lập tức hàm `isSlotBooked` trả về `false`, giải phóng slot cho sinh viên khác.

---

### V. HƯỚNG DẪN XUẤT BÁO CÁO SANG ĐỊNH DẠNG PDF

Để xuất báo cáo này thành file PDF đẹp chuẩn (Deliverable #3):
1. Mở file `report-preview.html` trong thư mục dự án bằng trình duyệt **Google Chrome** hoặc **Microsoft Edge**.
2. Nhấn tổ hợp phím **`Ctrl + P`** (hoặc chọn In).
3. Tại mục **Máy in đích (Destination)**, chọn **"Lưu dưới dạng PDF" (Save as PDF)**.
4. Chọn khổ giấy **A4**, lề **Mặc định** (hoặc Tối thiểu) và bật tùy chọn **"Đồ họa nền" (Background graphics)**.
5. Bấm **Lưu** để nhận file PDF báo cáo chuẩn chỉnh từ 2 đến 4 trang nộp cho giảng viên.
