// modules/UserApi.ts

export interface User {
    login: string;
    password?: string;
    is_moderator?: boolean;
    id?: string;
  }
  
  // Вход пользователя
  export async function loginUser(credentials: { login: string; password: string }): Promise<{ token: string } | null> {
    try {
      console.log('Logging in user:', credentials.login);
      
      const res = await fetch('/api/v1/users/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      console.log(`Response status: ${res.status}`);
      
      if (!res.ok) {
        console.error(`HTTP error! status: ${res.status}`);
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Login successful');
      return data;
    } catch (err) {
      console.error('Failed to login user:', err);
      return null;
    }
  }
  
  // Регистрация пользователя
  export async function registerUser(userData: { login: string; password: string }): Promise<User | null> {
    try {
      console.log('Registering user:', userData.login);
      
      const res = await fetch('/api/v1/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          is_moderator: false,
        }),
      });
      
      console.log(`Response status: ${res.status}`);
      
      if (!res.ok) {
        console.error(`HTTP error! status: ${res.status}`);
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Registration successful');
      return data;
    } catch (err) {
      console.error('Failed to register user:', err);
      return null;
    }
  }
  
  // Выход пользователя
  export async function logoutUser(): Promise<boolean> {
    try {
      console.log('Logging out user...');
      
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch('/api/v1/users/signout', {
        method: 'POST',
        headers,
      });
      
      console.log(`Response status: ${res.status}`);
      
      if (!res.ok) {
        console.error(`HTTP error! status: ${res.status}`);
        throw new Error(`HTTP ${res.status}`);
      }
      
      console.log('Logout successful');
      return true;
    } catch (err) {
      console.error('Failed to logout user:', err);
      return false;
    }
  }
  
  // Получить профиль пользователя
  export async function getUserProfile(login: string): Promise<User | null> {
    try {
      console.log(`Getting profile for user: ${login}`);
      
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(`/api/v1/users/${login}/me`, {
        headers,
      });
      
      console.log(`Response status: ${res.status}`);
      
      if (!res.ok) {
        console.error(`HTTP error! status: ${res.status}`);
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      console.log('User profile received:', data);
      return data;
    } catch (err) {
      console.error('Failed to get user profile:', err);
      return null;
    }
  }
  
  // Обновить профиль пользователя
  export async function updateUserProfile(login: string, data: Partial<User>): Promise<User | null> {
    try {
      console.log(`Updating profile for user: ${login}`, data);
      
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(`/api/v1/users/${login}/me`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });
      
      console.log(`Response status: ${res.status}`);
      
      if (!res.ok) {
        console.error(`HTTP error! status: ${res.status}`);
        throw new Error(`HTTP ${res.status}`);
      }
      
      const responseData = await res.json();
      console.log('User profile updated:', responseData);
      return responseData;
    } catch (err) {
      console.error('Failed to update user profile:', err);
      return null;
    }
  }