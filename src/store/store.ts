import { configureStore } from "@reduxjs/toolkit";
import interviewTaskReducer from "../features/interviewTasks/interviewTaskSlice";

export const store = configureStore({
  reducer: {
    interviewTasks: interviewTaskReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;