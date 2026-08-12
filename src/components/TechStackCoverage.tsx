import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Label,
} from "recharts";

interface TechStackCoverageProps {
  techStackStats: Record<string, number>;
}

interface TechStackData {
  name: string;
  value: number;
}

const TECH_COLORS: Record<string, string> = {
  React: "#3B82F6",
  JavaScript: "#F59E0B",
  TypeScript: "#3178C6",
  HTML: "#E34F26",
  CSS: "#1572B6",
  Redux: "#764ABC",
  Nextjs: "#111827",
};

function TechStackCoverage({ techStackStats }: TechStackCoverageProps) {
  const techStack: TechStackData[] = Object.entries(techStackStats).map(
    ([name, value]) => ({
      name,
      value,
    }),
  );

  const total = techStack.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h4 className="mb-4 text-sm font-semibold text-slate-800">
        🚀 Tech Stack Coverage
      </h4>

      {techStack.length ? (
        <>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={techStack}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {techStack.map((item) => (
                    <Cell
                      key={item.name}
                      fill={TECH_COLORS[item.name] ?? "#94A3B8"}
                    />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (
                        !viewBox ||
                        !("cx" in viewBox) ||
                        !("cy" in viewBox)
                      ) {
                        return null;
                      }

                      const { cx, cy } = viewBox;

                      return (
                        <text
                          x={cx}
                          y={cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={cx}
                            dy="-8"
                            fontSize="24"
                            fontWeight="700"
                            fill="#1E293B"
                          >
                            {total}
                          </tspan>

                          <tspan x={cx} dy="22" fontSize="14" fill="#64748B">
                            {total === 1 ? "Task" : "Tasks"}
                          </tspan>
                        </text>
                      );
                    }}
                  />
                </Pie>

                <Tooltip
                  formatter={(value, name) => [
                    `${value} task${Number(value) > 1 ? "s" : ""}`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-2">
            {techStack.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor: TECH_COLORS[item.name] ?? "#94A3B8",
                    }}
                  />

                  <span className="text-sm text-slate-600">
                    {item.name} ({Math.round((item.value / total) * 100)}%)
                  </span>
                </div>

                <span className="font-semibold text-slate-800">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-400">
          No tasks this week
        </div>
      )}
    </div>
  );
}

export default TechStackCoverage;
