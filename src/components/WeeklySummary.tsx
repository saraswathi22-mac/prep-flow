import {
  getWeeklyStats,
  groupByKey,
  getDailyActivity,
} from "../helpers/weeklyStats";
import TechStackCoverage from "./TechStackCoverage";
import DailyActivityChart from "./DailyActivityChart";
import { InterviewTask } from "../types/task";

interface WeeklySummaryProps {
  tasks: InterviewTask[];
}

type StatCardColor = "green" | "yellow" | "gray";

interface StatCardProps {
  label: string;
  value: string | number;
  color?: StatCardColor;
}

const WeeklySummary = ({ tasks }: WeeklySummaryProps) => {
  const stats = getWeeklyStats(tasks);
  const dailyActivity = getDailyActivity(tasks);

  const completedTasks = tasks.filter((task) => task.status === "done");
  const completedDailyActivity = getDailyActivity(completedTasks);

  const maxTasks = Math.max(...completedDailyActivity.map((day) => day.tasks));

  const mostProductiveDays = completedDailyActivity
    .filter((day) => day.tasks === maxTasks && maxTasks > 0)
    .map((day) => day.day);

  const techStackStats = groupByKey(
    tasks,
    "techStack",
    (stack) => stack.charAt(0).toUpperCase() + stack.slice(1),
  );

  const difficultyStats = groupByKey(tasks, "difficulty", (level) =>
    level.toLowerCase(),
  );

  const completionPercent =
    stats.total === 0 ? 0 : Math.round((stats.done / stats.total) * 100);

  const topTech = Object.entries(techStackStats).sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0];

  const hardTasks = difficultyStats.hard || 0;

  const mediumTasks = difficultyStats.medium || 0;

  const easyTasks = difficultyStats.easy || 0;

  const insights = [];

  if (stats.total === 0) {
    insights.push(
      "No interview tasks were scheduled this week. Plan a few tasks to start building momentum.",
    );
  } else if (completionPercent >= 90) {
    insights.push(
      `Outstanding work! You completed ${completionPercent}% of your planned tasks this week.`,
    );
  } else if (completionPercent >= 75) {
    insights.push(
      `Great consistency! You completed ${completionPercent}% of your planned tasks this week.`,
    );
  } else if (completionPercent >= 50) {
    insights.push(
      `You completed ${completionPercent}% of your planned tasks this week. Finishing a few more tasks will help you stay on track.`,
    );
  } else {
    insights.push(
      `You completed ${completionPercent}% of your planned tasks this week. Try breaking your goals into smaller daily tasks to build consistency.`,
    );
  }

  if (mostProductiveDays.length === 1) {
    insights.push(
      `Your most productive day was ${mostProductiveDays[0]} with ${maxTasks} task${maxTasks > 1 ? "s" : ""}.`,
    );
  } else if (mostProductiveDays.length > 1) {
    insights.push(
      `Your most productive days were ${mostProductiveDays.join(", ")} with ${maxTasks} task${maxTasks > 1 ? "s" : ""} each.`,
    );
  }

  if (stats.done > 0) {
    if (topTech) {
      insights.push(`Your strongest focus area was ${topTech}.`);
    }

    if (hardTasks >= 3) {
      insights.push("Great job tackling hard problems consistently.");
    } else if (mediumTasks > easyTasks) {
      insights.push(
        "Most of your practice focused on medium-level challenges.",
      );
    } else {
      insights.push("Try solving more medium and hard problems next week.");
    }
  }

  const insightMessage = insights.join(" ");

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total" value={stats.total} />

        <StatCard label="Done" value={stats.done} color="green" />

        <StatCard label="Pending" value={stats.todo} color="gray" />

        <StatCard label="🔥 Streak" value="5 Days" color="yellow" />
      </div>

      {/* Progress */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">
            Weekly Progress
          </p>

          <p className="text-lg font-bold text-[#5A9C43]">
            {completionPercent}%
          </p>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#5A9C43] transition-all duration-700"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Tech Stack */}
        <TechStackCoverage techStackStats={techStackStats} />

        {/* Daily Activity */}
        <DailyActivityChart data={dailyActivity} />
      </div>

      {/* Weekly Insight */}
      <div className="rounded-xl border border-[#5A9C43]/20 bg-[#5A9C43]/5 p-5">
        <h4 className="mb-2 text-sm font-semibold text-[#4C8A38]">
          ⚡ Weekly Insight
        </h4>

        <p className="text-sm leading-6 text-slate-600">{insightMessage}</p>
      </div>
    </div>
  );
};

/* ---------- Small UI Helpers ---------- */

const StatCard = ({ label, value, color = "gray" }: StatCardProps) => {
  const colorMap: Record<StatCardColor, string> = {
    green: "text-emerald-600",
    yellow: "text-amber-600",
    gray: "text-slate-700",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm transition-shadow hover:shadow-md">
      <p className="text-xs font-medium text-slate-500">{label}</p>

      <p className={`mt-2 text-xl font-bold md:text-2xl ${colorMap[color]}`}>
        {value}
      </p>
    </div>
  );
};

export default WeeklySummary;
