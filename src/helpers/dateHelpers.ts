// Get local date in YYYY-MM-DD format
export const getLocalDate = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Get yesterday's date in YYYY-MM-DD format
export const getYesterday = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split("T")[0];
};

// Generate week ID (example: 2026-W12)
export const getWeekId = (dateStr: string) => {
  const date = new Date(dateStr);

  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDays = Math.floor(
    (date.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000),
  );

  const week = Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);

  return `${date.getFullYear()}-W${week}`;
};
