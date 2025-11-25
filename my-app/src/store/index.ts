import { configureStore } from '@reduxjs/toolkit'
import devicesReducer from './slices/deviceSlice'
import searchReducer from './slices/searchSlice'
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    devices: devicesReducer,
    search: searchReducer,
    user: userReducer,
  },
  devTools: true
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch