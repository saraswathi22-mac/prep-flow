import type { TaskFilter } from "../../types/task";

interface FilterOption {
  label: string;
  value: TaskFilter;
}

interface TaskFiltersProps {
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
}

const filters: FilterOption[] = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Completed",
    value: "completed",
  },
  {
    label: "Pending",
    value: "pending",
  },
];

const TaskFilters = ({ filter, onFilterChange }: TaskFiltersProps) => {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-2">Filter tasks</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {filters.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => onFilterChange(value)}
            className={`
              px-4 py-2 rounded-xl
              transition-all duration-300
              border border-white/10
              backdrop-blur-md
              shadow-sm
              hover:scale-[1.03]
              hover:shadow-lg
              ${
                filter === value
                  ? "bg-blue-500 text-white"
                  : "bg-white/60 text-gray-700 hover:bg-white"
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TaskFilters;
