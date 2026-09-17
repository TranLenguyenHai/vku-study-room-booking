export type Building = 'A' | 'B' | 'C' | 'V';

export type Equipment = 'Projector' | 'Whiteboard' | 'High-spec PC' | 'AC';

export type RoomStatus = 'Available Now' | 'Occupied';

export interface Room {
  id: string;
  name: string;
  building: Building;
  floor: number;
  roomNumber: string;
  capacity: number; // 2 - 20
  equipment: Equipment[];
  photoUrl: string;
  description: string;
  isOccupiedNow: boolean;
  rating: number;
  tags: string[];
}
