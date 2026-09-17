import { NavigatorScreenParams } from '@react-navigation/native';
import { Room } from './room';
import { Booking } from './booking';

export type MainTabParamList = {
  Explore: undefined;
  MyBookings: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  RoomDetail: { room: Room };
  BookingSuccess: { booking: Booking };
};
