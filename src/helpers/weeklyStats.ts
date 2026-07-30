import type { InterviewTask } from "../types/task";

export const getWeeklyStats = (tasks: InterviewTask[] = []) => {
  return tasks.reduce(
    (acc, task) => {
      acc.total++;

      if (task.status === "done") acc.done++;
      else if (task.status === "skipped") acc.skipped++;
      else acc.todo++;

      return acc;
    },
    { total: 0, done: 0, skipped: 0, todo: 0 },
  );
};

export const groupByKey = <K extends keyof InterviewTask>(
  tasks: InterviewTask[] = [],
  key: K,
  formatter: (value: NonNullable<InterviewTask[K]>) => string = (value) =>
    String(value),
): Record<string, number> => {
  return tasks.reduce<Record<string, number>>((acc, task) => {
    const value = task[key];

    if (value == null) return acc; // since loosely typed, also checks undefined

    const formattedValue = formatter(value as NonNullable<InterviewTask[K]>);

    acc[formattedValue] = (acc[formattedValue] || 0) + 1;

    return acc;
  }, {});
};

export const getDailyActivity = (tasks: InterviewTask[] = []) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const activity = days.map((day) => ({
    day,
    tasks: 0,
  }));

  tasks.forEach((task) => {
    const date = new Date(task.date);
    const jsDay = date.getDay(); // 0 = Sun

    const index = jsDay === 0 ? 6 : jsDay - 1;

    if (activity[index]) {
      activity[index].tasks++;
    }
  });

  return activity;
};
