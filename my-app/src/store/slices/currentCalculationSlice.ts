// store/slices/currentCalculationSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit'; 

interface CurrentCalculationState {
  currentCart: any | null;
  devices_count: number;
}

const initialState: CurrentCalculationState = {
  currentCart: null,
  devices_count: 0,
};

const currentCalculationSlice = createSlice({
  name: 'currentCalculation',
  initialState,
  reducers: {
    // ТОЛЬКО СИНХРОННЫЕ ЭКШЕНЫ!
    setCurrentCart: (state, action: PayloadAction<any>) => {
      state.currentCart = action.payload;
      state.devices_count = action.payload.devices_count || 0;
    },
    
    clearCurrentCart: (state) => {
      state.currentCart = null;
      state.devices_count = 0;
    },
    
    updateDevicesCount: (state, action: PayloadAction<number>) => {
      state.devices_count = action.payload;
    },
  },
});

export const { setCurrentCart, clearCurrentCart, updateDevicesCount } = currentCalculationSlice.actions;
export default currentCalculationSlice.reducer;