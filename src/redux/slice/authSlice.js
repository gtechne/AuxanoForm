import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    isLoggedIn: false,
    email: null,
    useName: null,
    userID: null,
    userRole: null, // "student" or "teacher"
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    SET_ACTIVE_USER: (state, action) => {
        //console.log(action.payload);
        const { email, userName, userID, userRole } = action.payload;
        state.isLoggedIn = true;
        state.email = email;
        state.userName = userName;
        state.userID = userID;
        state.userRole = userRole;
      },
      REMOVE_ACTIVE_USER(state, action) {
        state.isLoggedIn = false;
        state.email = null;
        state.userName = null;
        state.userID = null;
        state.userRole = null;
        //console.log(state.isLoggedIn);
      },
  },
});

export const { SET_ACTIVE_USER, REMOVE_ACTIVE_USER } = authSlice.actions;

export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;
export const selectEmail = (state) => state.auth.email;
export const selectUserName = (state) => state.auth.userName;
export const selectUserID = (state) => state.auth.userID;
export const selectUserRole = (state) => state.auth.userRole;

export default authSlice.reducer