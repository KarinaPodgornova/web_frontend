// store/slices/currentCalculationSlice.ts - ОКОНЧАТЕЛЬНЫЙ ВАРИАНТ
import { createSlice } from '@reduxjs/toolkit';

interface CurrentCalculationState {
  currentCart: any | null;
  devices_count: number;
  loading: boolean;
  error: string | null;
}

const initialState: CurrentCalculationState = {
  currentCart: null,
  devices_count: 0,
  loading: false,
  error: null,
};

const currentCalculationSlice = createSlice({
  name: 'currentCalculation',
  initialState,
  reducers: {
    // ТОЛЬКО синхронные экшены
    setCurrentCart: (state, action) => {
      state.currentCart = action.payload;
      state.devices_count = action.payload.devices_count || 0;
      state.loading = false;
      state.error = null;
    },
    
    clearCurrentCart: (state) => {
      state.currentCart = null;
      state.devices_count = 0;
      state.error = null;
    },
    
    updateDevicesCount: (state, action) => {
      state.devices_count = action.payload;
    },
    
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Экспортируем ТОЛЬКО синхронные экшены
export const { 
  setCurrentCart, 
  clearCurrentCart, 
  updateDevicesCount,
  setLoading,
  setError,
  clearError
} = currentCalculationSlice.actions;

export default currentCalculationSlice.reducer;