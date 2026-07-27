export type TaskStatus = "todo" | "inProgress" | "done" | "skipped";

export interface InterviewTask {
  id: string;
  title: string;
  status: TaskStatus;
  date: string;
  difficulty: "easy" | "medium" | "hard";
  techStack: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  isRolledOver?: boolean;
}

export type EditInterviewTaskPayload = {
  id: string;
  updates: Partial<Omit<InterviewTask, "id">>;
};
