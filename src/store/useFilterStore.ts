import { create } from 'zustand';
import { Building, Equipment } from '../types/room';

export type CapacityFilter = 'ALL' | 'SMALL' | 'MEDIUM' | 'LARGE'; // Small: 2-6, Medium: 7-12, Large: 13-20

export interface FilterState {
  searchQuery: string;
  selectedBuilding: 'ALL' | Building;
  capacityFilter: CapacityFilter;
  selectedEquipments: Equipment[];
  onlyAvailableNow: boolean;

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedBuilding: (building: 'ALL' | Building) => void;
  setCapacityFilter: (capacity: CapacityFilter) => void;
  toggleEquipment: (eq: Equipment) => void;
  setOnlyAvailableNow: (enabled: boolean) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  searchQuery: '',
  selectedBuilding: 'ALL',
  capacityFilter: 'ALL',
  selectedEquipments: [],
  onlyAvailableNow: false,

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedBuilding: (selectedBuilding) => set({ selectedBuilding }),
  setCapacityFilter: (capacityFilter) => set({ capacityFilter }),
  toggleEquipment: (equipment) =>
    set((state) => {
      const exists = state.selectedEquipments.includes(equipment);
      return {
        selectedEquipments: exists
          ? state.selectedEquipments.filter((item) => item !== equipment)
          : [...state.selectedEquipments, equipment],
      };
    }),
  setOnlyAvailableNow: (onlyAvailableNow) => set({ onlyAvailableNow }),
  resetFilters: () =>
    set({
      searchQuery: '',
      selectedBuilding: 'ALL',
      capacityFilter: 'ALL',
      selectedEquipments: [],
      onlyAvailableNow: false,
    }),
}));
