import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authService from './authService';

// Define RootState type since it can't find the module
type RootState = {
  auth: AuthState;
};

// Define User type
interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

// Define AuthState
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkingAuth: boolean;
  error: string | null;
}

// Get user from localStorage
const user = JSON.parse(localStorage.getItem('user') || 'null');

// Initial state
const initialState: AuthState = {
  user: user,
  isAuthenticated: !!user,
  isLoading: false,
  checkingAuth: true,
  error: null
};

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData: any, thunkAPI) => {
    try {
      return await authService.register(userData);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (userData: { email: string; password: string }, thunkAPI) => {
    try {
      return await authService.login(userData);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Check authentication status
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, thunkAPI) => {
    try {
      return await authService.checkAuth();
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Logout user
export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await authService.logout();
  }
);

// Auth slice
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
    reset: (state) => {
      state.isLoading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Login cases
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.checkingAuth = false;
    });
    builder.addCase(login.rejected, (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.error = action.payload as string;
      state.checkingAuth = false;
    });

    // Register cases
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action: PayloadAction<any>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.checkingAuth = false;
    });
    builder.addCase(register.rejected, (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.error = action.payload as string;
      state.checkingAuth = false;
    });

    // Check auth cases
    builder.addCase(checkAuth.pending, (state) => {
      state.checkingAuth = true;
    });
    builder.addCase(checkAuth.fulfilled, (state, action: PayloadAction<any>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.checkingAuth = false;
    });
    builder.addCase(checkAuth.rejected, (state, action: PayloadAction<any>) => {
      state.isAuthenticated = false;
      state.user = null;
      state.checkingAuth = false;
      state.error = action.payload as string;
    });

    // Logout cases
    builder.addCase(logout.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.user = null;
    });
  }
});

export const { clearErrors, reset } = authSlice.actions;
export const selectAuth = (state: RootState) => state.auth;
export default authSlice.reducer;