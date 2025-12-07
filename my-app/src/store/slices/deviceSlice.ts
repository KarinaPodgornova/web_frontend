// store/slices/deviceSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Device } from '../../modules/DevicesTypes';

interface DevicesState {
  devices: Device[];
  loading: boolean;
  error: string | null;
}

const initialState: DevicesState = {
  devices: [],
  loading: false,
  error: null,
};

const devicesSlice = createSlice({
  name: 'devices',
  initialState,
  reducers: {
    // Синхронные экшены
    setDevices: (state, action: PayloadAction<Device[]>) => {
      state.devices = action.payload;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // Для асинхронных операций (если нужно)
    fetchDevicesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    fetchDevicesSuccess: (state, action: PayloadAction<Device[]>) => {
      state.loading = false;
      state.devices = action.payload;
    },
    
    fetchDevicesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { 
  setDevices, 
  setLoading, 
  setError, 
  clearError,
  fetchDevicesStart,
  fetchDevicesSuccess,
  fetchDevicesFailure
} = devicesSlice.actions;

export default devicesSlice.reducer;