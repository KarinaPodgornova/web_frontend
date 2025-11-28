// src/store/slices/currentCalculationSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';

interface DeviceCart {
  id?: number;
  devices_count?: number;
  devices?: any[];
  status?: string;
  creator_login?: string;
  date_create?: string;
  date_form?: string;
}

interface CurrentCalculationDevice {
  device_id: number;
  name: string;
  description: string;
  power_nominal: number;
  amount?: number;
}

interface CurrentCalculationDetail {
  id: number;
  amount: number;
  amperage?: number;
  current_id?: number;
  devices?: CurrentCalculationDevice[];
  [key: string]: any;
}

interface CurrentCalculationState {
  current_id?: number;
  devices_count: number;
  loading: boolean;
  currentCart: DeviceCart | null;
  error: string | null;
  currentDetail: CurrentCalculationDetail | null;
  saveLoading: {
    amount: boolean;
    devices: { [key: number]: boolean };
  };
}

const initialState: CurrentCalculationState = {
  current_id: undefined,
  devices_count: 0,
  loading: false,
  currentCart: null,
  currentDetail: null,
  error: null,
  saveLoading: {
    amount: false,
    devices: {},
  },
};



// --- Загрузка корзины
export const getCurrentCart = createAsyncThunk(
  'currentCalculation/getCurrentCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.currentCalculations.currentCartList();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка загрузки корзины');
    }
  }
);

// --- Добавление устройства в расчёт
export const addToCurrentCalculation = createAsyncThunk(
  'currentCalculation/addToCurrentCalculation',
  async (deviceId: number, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.devices.addToCurrentCalculationCreate(deviceId);
      dispatch(getCurrentCart());
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 409) {
        dispatch(getCurrentCart());
        return { message: 'already_added' };
      }
      return rejectWithValue(error.response?.data?.description || 'Ошибка добавления');
    }
  }
);

// --- Удаление устройства из расчёта
export const removeFromCurrentCalculation = createAsyncThunk(
  'currentCalculation/removeFromCurrentCalculation',
  async ({ deviceId, currentId }: { deviceId: number; currentId: number }, { rejectWithValue }) => {
    try {
      const response = await api.currentDevices.currentDevicesDelete(deviceId, currentId);
      return { deviceId, currentId, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка удаления устройства');
    }
  }
);

// --- Обновление количества устройства в расчёте
export const updateDeviceAmount = createAsyncThunk(
  'currentCalculation/updateDeviceAmount',
  async ({ deviceId, currentId, amount }: { deviceId: number; currentId: number; amount: number }, { rejectWithValue }) => {
    try {
      const response = await api.currentDevices.currentDevicesUpdate(deviceId, currentId, { amount });
      return { deviceId, amount, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка обновления количества');
    }
  }
);



// --- Получение полной информации о расчёте
export const getCurrentDetail = createAsyncThunk(
  'currentCalculation/getCurrentDetail',
  async (currentId: number, { rejectWithValue }) => {
    try {
      const response = await api.currentCalculations.currentCalculationsDetail(currentId);
      const data = response.data;
      const normalizedData: CurrentCalculationDetail = {
        id: data.current_id,
        amount: data.devices_count || 0,
        amperage: data.amperage,
        current_id: data.current_id,
        devices: data.devices || [],
        ...data,
      };
      return normalizedData;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка загрузки расчёта');
    }
  }
);

// --- Подтверждение расчёта (например, формирование)
export const formCurrentCalculation = createAsyncThunk(
  'currentCalculation/formCurrentCalculation',
  async (currentId: number, { rejectWithValue }) => {
    try {
      const response = await api.currentCalculations.formUpdate(currentId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка подтверждения расчёта');
    }
  }
);

export const deleteCurrentCalculation = createAsyncThunk(
  'currentCalculation/deleteCurrentCalculation',
  async (currentId: number, { rejectWithValue }) => {
    try {
      const response = await api.currentCalculations.deleteCurrentCalculationsDelete(currentId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка удаления заявки');
    }
  }
);

const currentCalculationSlice = createSlice({
  name: 'currentCalculation',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCalculation: (state) => {
      state.currentCart = null;
      state.devices_count = 0;
      state.current_id = undefined;
    },
    removeDeviceOptimistic: (state, action) => {
      const deviceId = action.payload;
      if (state.currentDetail) {
        const devices = state.currentDetail.devices || [];
        const updatedDevices = devices.filter(device => device.device_id !== deviceId);
        state.currentDetail.devices = updatedDevices;
        state.currentDetail.amount = updatedDevices.length;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // --- корзина
      .addCase(getCurrentCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentCart.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCart = action.payload;
        state.devices_count = action.payload.devices_count || 0;
        state.current_id = action.payload.current_id;
      })
      .addCase(getCurrentCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.currentCart = null;
        state.devices_count = 0;
        state.current_id = undefined;
      })
      // --- детализация
      .addCase(getCurrentDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentDetail = null;
      })
      .addCase(getCurrentDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDetail = action.payload;
      })
      .addCase(getCurrentDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.currentDetail = null;
      })
      // --- добавление устройства
      .addCase(addToCurrentCalculation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCurrentCalculation.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addToCurrentCalculation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // --- удаление устройства
      .addCase(removeFromCurrentCalculation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCurrentCalculation.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(removeFromCurrentCalculation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })







            // --- обновление количества устройства
      .addCase(updateDeviceAmount.pending, (state, action) => {
        const deviceId = action.meta.arg.deviceId;
        state.saveLoading.devices[deviceId] = true;
        state.error = null;
      })
      .addCase(updateDeviceAmount.fulfilled, (state, action) => {
        const { deviceId, amount } = action.payload;
        state.saveLoading.devices[deviceId] = false;
        
        // Обновляем количество в currentDetail если он есть
        if (state.currentDetail?.devices) {
          const device = state.currentDetail.devices.find(d => d.device_id === deviceId);
          if (device) {
            device.amount = amount;
          }
        }
        
        // Обновляем количество в currentCart если он есть
        if (state.currentCart?.devices) {
          const device = state.currentCart.devices.find(d => d.device_id === deviceId);
          if (device) {
            device.amount = amount;
          }
        }
      })
      .addCase(updateDeviceAmount.rejected, (state, action) => {
        const deviceId = action.meta.arg.deviceId;
        state.saveLoading.devices[deviceId] = false;
        state.error = action.payload as string;
      })







      // --- формирование расчёта
      .addCase(formCurrentCalculation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(formCurrentCalculation.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(formCurrentCalculation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })




            // --- удаление заявки
      .addCase(deleteCurrentCalculation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCurrentCalculation.fulfilled, (state) => {
        state.loading = false;
        state.currentCart = null;
        state.devices_count = 0;
        state.current_id = undefined;
      })
      .addCase(deleteCurrentCalculation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });



  },
});

export const { clearError, clearCurrentCalculation, removeDeviceOptimistic } = currentCalculationSlice.actions;
export default currentCalculationSlice.reducer;
