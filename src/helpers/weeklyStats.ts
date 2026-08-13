import type { InterviewTask } from "../types/task";
import { getLocalDate } from "./dateHelpers";

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

    if (value == null) return acc;

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
    const jsDay = date.getDay();

    const index = jsDay === 0 ? 6 : jsDay - 1;

    if (activity[index]) {
      activity[index].tasks++;
    }
  });

  return activity;
};

export const getCurrentStreak = (tasks: InterviewTask[] = []): number => {
  const completedDates = new Set(
    tasks.filter((task) => task.status === "done").map((task) => task.date),
  );

  if (completedDates.size === 0) {
    return 0;
  }

  const today = getLocalDate();

  const startDate = completedDates.has(today) ? today : getPreviousDate(today);

  let streak = 0;
  let currentDate = startDate;

  while (completedDates.has(currentDate)) {
    streak++;

    currentDate = getPreviousDate(currentDate);
  }

  return streak;
};

const getPreviousDate = (date: string): string => {
  const [year, month, day] = date.split("-").map(Number);

  const previousDate = new Date(year, month - 1, day);
  previousDate.setDate(previousDate.getDate() - 1);

  return [
    previousDate.getFullYear(),
    String(previousDate.getMonth() + 1).padStart(2, "0"),
    String(previousDate.getDate()).padStart(2, "0"),
  ].join("-");
};
