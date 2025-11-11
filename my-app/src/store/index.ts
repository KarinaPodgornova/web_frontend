import { configureStore } from '@reduxjs/toolkit'
import devicesReducer from './slices/deviceSlice'
import searchReducer from './slices/searchSlice'

export const store = configureStore({
  reducer: {
    devices: devicesReducer,
    search: searchReducer,
  },
  devTools: true
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch