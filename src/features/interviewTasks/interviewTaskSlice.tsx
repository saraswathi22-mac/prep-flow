import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EditInterviewTaskPayload, InterviewTask } from "../../types/task";

const initialState: InterviewTask[] = [];

const interviewTaskSlice = createSlice({
  name: "interviewTasks",

  initialState,

  reducers: {
    // Load all tasks from localStorage
    setTasks: (state, action: PayloadAction<InterviewTask[]>) => {
      return action.payload;
    },

    // Add task
    addInterviewTask: (state, action: PayloadAction<InterviewTask>) => {
      state.push(action.payload);
    },

    // Edit task
    editInterviewTask: (
      state,
      action: PayloadAction<EditInterviewTaskPayload>,
    ) => {
      const { id, updates } = action.payload;

      const task = state.find((t) => t.id === id);

      if (task) {
        Object.assign(task, updates, {
          updatedAt: new Date().toISOString(),
        });
      }
    },

    // Delete task
    deleteInterviewTask: (state, action: PayloadAction<string>) => {
      return state.filter((t) => t.id !== action.payload);
    },
  },
});

export const {
  setTasks,
  addInterviewTask,
  editInterviewTask,
  deleteInterviewTask,
} = interviewTaskSlice.actions;

export default interviewTaskSlice.reducer;
