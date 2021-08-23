import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userID: null,
  authToken: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    login: (_state, action) => action.payload,
    logout: (_state) => initialState,
  },
});

export const { login, logout } = userSlice.actions;

export default userSlice.reducer;
