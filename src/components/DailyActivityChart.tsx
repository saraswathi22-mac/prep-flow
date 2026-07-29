import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DailyActivityData {
  day: string;
  tasks: number;
}

interface DailyActivityChartProps {
  data: DailyActivityData[];
}

function DailyActivityChart({ data }: DailyActivityChartProps) {
  return (
    <div className="rounded-2xl border border-gray-100 p-5">
      <h4 className="mb-4 text-sm font-semibold text-gray-800">
        📊 Daily Activity
      </h4>

      {data.some((d) => d.tasks) ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="25%">
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#F1F5F9"
              />

              {/* Numbers on the left */}
              <YAxis
                allowDecimals={false}
                domain={[0, "dataMax + 1"]}
                axisLine={false}
                tickLine={false}
              />

              {/* Weekdays at the bottom */}
              <XAxis dataKey="day" axisLine={false} tickLine={false} />

              <Tooltip
                cursor={{ fill: "#F3F4F6" }}
                formatter={(value) => [
                  `${value} task${value !== 1 ? "s" : ""}`,
                  "Tasks",
                ]}
              />

              <Bar
                dataKey="tasks"
                barSize={36}
                radius={[8, 8, 0, 0]}
                fill="#3B82F6"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 p-5 text-center text-sm text-gray-400">
          No activity this week
        </div>
      )}
    </div>
  );
}

export default DailyActivityChart;
