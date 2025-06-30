import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserModel } from "../models/user";

// authenticationSlice.ts
export interface UserInterface {
  data: UserModel | null;
  loggedIn: boolean;
}

const initialState: UserInterface = {
  data: null,
  loggedIn: false,
};

// Create slice with reducers
export const authSlice = createSlice({
  name: "auth",
  initialState, 
  reducers: {
    loginFailed: (state: UserInterface) => {
      state.data = null;
      state.loggedIn = false;
    },
    loginSuccess: (state: UserInterface, action: PayloadAction<UserModel>) => {
      state.data = action.payload;
      state.loggedIn = true;
    },
    logout: (state: UserInterface) => {
      localStorage.clear(); 
      state.data = null;
      window.location.reload();
      state.loggedIn = false;
    },
  },
});

// Export actions and reducer
export const { loginSuccess, logout, loginFailed } = authSlice.actions;
export default authSlice.reducer;
