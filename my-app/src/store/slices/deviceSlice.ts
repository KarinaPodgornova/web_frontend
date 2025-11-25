import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { Device } from '../../modules/DevicesTypes'
import { api } from '../../api'

interface DevicesState {
  devices: Device[]
  loading: boolean
  error: string | null
}

const initialState: DevicesState = {
  devices: [],
  loading: false,
  error: null
}

export const fetchDevices = createAsyncThunk(
  'devices/fetchDevices',
  async (searchTitle: string | undefined, { rejectWithValue }) => {
    try {
      const response = await api.devices.devicesList({ 
        device_name: searchTitle 
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка загрузки устройств');
    }
  }
);

const devicesSlice = createSlice({
  name: 'devices',
  initialState,
  reducers: {
    setDevices: (state, action) => {
      state.devices = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDevices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.loading = false;
        state.devices = action.payload as Device[]; 
     })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
  }
})

export const { setDevices, setLoading, setError } = devicesSlice.actions
export default devicesSlice.reducer