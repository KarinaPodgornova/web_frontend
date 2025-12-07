// store/slices/userSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  username: string;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  username: '',
  isAuthenticated: false,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Синхронные экшены для авторизации
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    loginSuccess: (state, action: PayloadAction<{ username: string }>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.username = action.payload.username;
    },
    
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Синхронные экшены для регистрации
    registerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    registerSuccess: (state) => {
      state.loading = false;
      state.isAuthenticated = true;
    },
    
    registerFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Синхронный экшен для выхода
    logout: (state) => {
      state.isAuthenticated = false;
      state.username = '';
      localStorage.removeItem('token');
    },
    
    // Очистка ошибки
    clearError: (state) => {
      state.error = null;
    },
    
    // Восстановление состояния из localStorage/token
    restoreAuth: (state, action: PayloadAction<{ username: string }>) => {
      state.isAuthenticated = true;
      state.username = action.payload.username;
    },
  },
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure,
  registerStart, 
  registerSuccess, 
  registerFailure,
  logout,
  clearError,
  restoreAuth
} = userSlice.actions;

export default userSlice.reducer;