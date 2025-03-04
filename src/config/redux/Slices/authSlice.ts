import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

// export const login = createAsyncThunk(
//   "auth/login",
//   async (data, { rejectWithValue }) => {
//     try {
//       const response = await controller.login(data);

//       if (response.success) {
//         return {
//           user: { email: data.email, name: "User" },
//           token: response.data.token,
//         };
//       } else {
//         return rejectWithValue(response.message);
//       }
//     } catch (error) {
//       return rejectWithValue(error instanceof Error ? error.message : "An error occurred while logging in.");
//     }
//   }
// );

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
    },
  },
//   extraReducers: (builder) => {
//     builder
//       .addCase(login.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(login.fulfilled, (state, action) => {
//         state.loading = false;
//         state.user = action.payload.user;
//         state.token = action.payload.token;
//       })
//       .addCase(login.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload || "Login failed";
//       });
//   },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
