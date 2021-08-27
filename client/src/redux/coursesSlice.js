import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { logout } from "./userSlice";
import axios from "axios";

export const fetchCourses = createAsyncThunk(
  "users/fetchCourses",
  async (userInfo) => {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/users/${userInfo.userID}/courses`,
      { headers: { Authorization: `Bearer ${userInfo.authToken}` } }
    );
    return res.data.courses;
  }
);

export const coursesSlice = createSlice({
  name: "courses",
  initialState: [],
  reducers: {
    addCourse: (state, action) => {
      state.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.fulfilled, (_state, action) => action.payload)
      .addCase(logout, () => []);
  },
});

export const { addCourse } = coursesSlice.actions;

export default coursesSlice.reducer;
