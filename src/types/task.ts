export type TaskStatus = "todo" | "inProgress" | "done" | "skipped";
import type { Difficulty } from "../constants/interviewTaskOptions";

export interface InterviewTask {
  id: string;
  question: string;
  status: TaskStatus;
  date: string;
  difficulty: Difficulty;
  techStack: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  isRolledOver?: boolean;
  weekId: string;
}

export type EditInterviewTaskPayload = {
  id: string;
  updates: Partial<Omit<InterviewTask, "id">>;
};

export type TaskFilter = "all" | "completed" | "pending";