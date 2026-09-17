import { Room } from '../types/room';
import { TimeSlot, Booking } from '../types/booking';

export const TIME_SLOTS: TimeSlot[] = [
  {
    id: 'slot_1',
    label: '07:30 – 09:30',
    period: 'Ca Sáng 1',
    startTime: '07:30',
    endTime: '09:30',
  },
  {
    id: 'slot_2',
    label: '09:30 – 11:30',
    period: 'Ca Sáng 2',
    startTime: '09:30',
    endTime: '11:30',
  },
  {
    id: 'slot_3',
    label: '13:00 – 15:00',
    period: 'Ca Chiều 1',
    startTime: '13:00',
    endTime: '15:00',
  },
  {
    id: 'slot_4',
    label: '15:00 – 17:00',
    period: 'Ca Chiều 2',
    startTime: '15:00',
    endTime: '17:00',
  },
];

export const MOCK_ROOMS: Room[] = [
  {
    id: 'room-a101',
    name: 'Phòng Lab AI & IoT A.101',
    building: 'A',
    floor: 1,
    roomNumber: 'A.101',
    capacity: 20,
    equipment: ['High-spec PC', 'Projector', 'Whiteboard', 'AC'],
    photoUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    description: 'Phòng máy tính cấu hình cao RTX 4070, phục vụ nghiên cứu trí tuệ nhân tạo, đồ họa và phát triển phần mềm.',
    isOccupiedNow: false,
    rating: 4.9,
    tags: ['Nghiên cứu', 'AI Lab', 'Máy trạm'],
  },
  {
    id: 'room-a205',
    name: 'Phòng Thảo Luận Nhóm A.205',
    building: 'A',
    floor: 2,
    roomNumber: 'A.205',
    capacity: 6,
    equipment: ['Whiteboard', 'AC', 'Projector'],
    photoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    description: 'Không gian yên tĩnh cách âm dành cho nhóm làm bài tập lớn, đồ án tốt nghiệp và thuyết trình.',
    isOccupiedNow: true,
    rating: 4.8,
    tags: ['Nhóm nhỏ', 'Yên tĩnh', 'Cách âm'],
  },
  {
    id: 'room-b102',
    name: 'Phòng Đổi Mới Sáng Tạo B.102',
    building: 'B',
    floor: 1,
    roomNumber: 'B.102',
    capacity: 12,
    equipment: ['Projector', 'Whiteboard', 'AC'],
    photoUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    description: 'Bàn ghế linh hoạt di động, bảng kính 360 độ hỗ trợ Design Thinking và thảo luận nhóm năng động.',
    isOccupiedNow: false,
    rating: 4.7,
    tags: ['Sáng tạo', 'Họp nhóm', 'Bảng 360'],
  },
  {
    id: 'room-b304',
    name: 'Studio Đa Phương Tiện B.304',
    building: 'B',
    floor: 3,
    roomNumber: 'B.304',
    capacity: 8,
    equipment: ['High-spec PC', 'AC'],
    photoUrl: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=800&q=80',
    description: 'Trang bị 4 máy iMac M2 và hệ thống thu âm cơ bản cho dựng video, đồ họa truyền thông số.',
    isOccupiedNow: false,
    rating: 4.9,
    tags: ['Multimedia', 'iMac', 'Dựng phim'],
  },
  {
    id: 'room-c201',
    name: 'Phòng Hội Thảo Nhỏ C.201',
    building: 'C',
    floor: 2,
    roomNumber: 'C.201',
    capacity: 16,
    equipment: ['Projector', 'Whiteboard', 'AC'],
    photoUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    description: 'Phòng hội thảo chuyên đề, có hệ thống âm thanh mic không dây và máy chiếu 4K siêu nét.',
    isOccupiedNow: true,
    rating: 4.6,
    tags: ['Hội thảo', 'Thuyết trình', 'Microphone'],
  },
  {
    id: 'room-c305',
    name: 'Góc Tự Học Pod C.305',
    building: 'C',
    floor: 3,
    roomNumber: 'C.305',
    capacity: 4,
    equipment: ['AC', 'Whiteboard'],
    photoUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
    description: 'Phòng học pod kính tập trung cao độ cho nhóm 2-4 bạn ôn thi giữa kỳ, cuối kỳ.',
    isOccupiedNow: false,
    rating: 4.5,
    tags: ['Tập trung', 'Ôn thi', 'Pod riêng'],
  },
  {
    id: 'room-v101',
    name: 'Trung Tâm Khởi Nghiệp V.101',
    building: 'V',
    floor: 1,
    roomNumber: 'V.101',
    capacity: 20,
    equipment: ['High-spec PC', 'Projector', 'Whiteboard', 'AC'],
    photoUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    description: 'Không gian mở kết nối startup VKU, đầy đủ tiện nghi công nghệ cao và khu vực pitching.',
    isOccupiedNow: false,
    rating: 5.0,
    tags: ['Startup', 'Pitching', 'Toàn diện'],
  },
  {
    id: 'room-v208',
    name: 'Phòng Nghiên Cứu Vi Mạch V.208',
    building: 'V',
    floor: 2,
    roomNumber: 'V.208',
    capacity: 10,
    equipment: ['High-spec PC', 'AC', 'Whiteboard'],
    photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    description: 'Chuyên dụng cho nghiên cứu vi mạch bán dẫn và hệ thống nhúng, có máy đo logic và bộ kit FPGA.',
    isOccupiedNow: true,
    rating: 4.8,
    tags: ['Vi mạch', 'Bán dẫn', 'Hardware'],
  },
];

// Helper to format date as YYYY-MM-DD
export function getFormattedDate(offsetDays: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
}

/**
 * Check if a time slot has already passed based on current device local time
 * @param dateString 'YYYY-MM-DD'
 * @param startTime '07:30', '09:30', etc.
 */
export function isSlotInPast(dateString: string, startTime: string): boolean {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayString = `${year}-${month}-${day}`;

  if (dateString < todayString) {
    return true;
  }
  if (dateString > todayString) {
    return false;
  }

  // It is today: check if current time is at or past the slot startTime
  const [slotHours, slotMinutes] = startTime.split(':').map(Number);
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();

  if (currentHours > slotHours) {
    return true;
  }
  if (currentHours === slotHours && currentMinutes >= slotMinutes) {
    return true;
  }

  return false;
}

// Initial mock reservations to test Conflict Engine immediately!
export const INITIAL_MOCK_BOOKINGS: Booking[] = [
  {
    id: 'VKU-BK-50119',
    roomId: 'room-a101',
    roomName: 'Phòng Lab AI & IoT A.101',
    building: 'A',
    roomNumber: 'A.101',
    date: getFormattedDate(0), // Today
    slotId: 'slot_1', // 07:30 - 09:30
    slotLabel: '07:30 – 09:30',
    userId: 'user_vku_02',
    userName: 'Lê Hoàng Nam',
    studentCode: '21IT045',
    purpose: 'Huấn luyện mô hình YOLOv8 nhận diện biển báo',
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
    qrValue: JSON.stringify({ id: 'VKU-BK-50119', room: 'A.101', slot: 'slot_1' }),
  },
  {
    id: 'room-b102-today',
    roomId: 'room-b102',
    roomName: 'Phòng Đổi Mới Sáng Tạo B.102',
    building: 'B',
    roomNumber: 'B.102',
    date: getFormattedDate(0),
    slotId: 'slot_3', // 13:00 - 15:00
    slotLabel: '13:00 – 15:00',
    userId: 'user_vku_03',
    userName: 'Trần Thị Mai',
    studentCode: '22BA012',
    purpose: 'Họp CLB Tiếng Anh & Thuyết trình Dự án',
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
    qrValue: JSON.stringify({ id: 'room-b102-today', room: 'B.102', slot: 'slot_3' }),
  },
  {
    id: 'room-v101-tomorrow',
    roomId: 'room-v101',
    roomName: 'Trung Tâm Khởi Nghiệp V.101',
    building: 'V',
    roomNumber: 'V.101',
    date: getFormattedDate(1), // Tomorrow
    slotId: 'slot_2', // 09:30 - 11:30
    slotLabel: '09:30 – 11:30',
    userId: 'user_vku_04',
    userName: 'Phạm Đức Trọng',
    studentCode: '20IT199',
    purpose: 'Rehearsal Demo Cuộc thi Hackathon VKU',
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
    qrValue: JSON.stringify({ id: 'room-v101-tomorrow', room: 'V.101', slot: 'slot_2' }),
  },
];
