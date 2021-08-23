import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    userID: localStorage.getItem("userID"),
    authToken: localStorage.getItem("authToken"),
  },
  reducers: {
    login: (_state, action) => {
      const { userID, authToken } = action.payload;
      localStorage.setItem("userID", userID);
      localStorage.setItem("authToken", authToken);
      return action.payload;
    },
    logout: (_state) => {
      localStorage.removeItem("userID");
      localStorage.removeItem("authToken");
      return {
        userID: null,
        authToken: null,
      };
    },
  },
});

export const { login, logout } = userSlice.actions;

export default userSlice.reducer;
