export const TECH_STACK_OPTIONS = [
  "React",
  "JavaScript",
  "TypeScript",
  "HTML/CSS",
  "Frontend System Design",
] as const;

export const DIFFICULTY_OPTIONS = [
  {
    value: "easy",
    label: "Easy 🟢",
  },
  {
    value: "medium",
    label: "Medium 🟡",
  },
  {
    value: "hard",
    label: "Hard 🔴",
  },
] as const;

export type Difficulty =
  (typeof DIFFICULTY_OPTIONS)[number]["value"];