import { createSlice } from '@reduxjs/toolkit'
import type { Device } from '../../modules/DevicesTypes'

export interface DevicesState {
  devices: Device[]
  loading: boolean
  error: string | null
}

const initialState: DevicesState = {
  devices: [],
  loading: false,
  error: null
}

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
    }
  }
})

export const { setDevices, setLoading, setError } = devicesSlice.actions
export default devicesSlice.reducer