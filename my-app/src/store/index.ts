import { configureStore } from '@reduxjs/toolkit'
import devicesReducer from './slices/deviceSlice'
import searchReducer from './slices/searchSlice'
import userReducer from './slices/userSlice';
import currentCalculationReducer from './slices/currentCalculationSlice';

export const store = configureStore({
  reducer: {
    devices: devicesReducer,
    search: searchReducer,
    user: userReducer,
    currentCalculation: currentCalculationReducer,
  },
  devTools: true
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch