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
      <p className="mb-2 text-sm text-gray-500">Filter tasks</p>

      <div className="mb-4 flex flex-nowrap gap-2">
        {filters.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => onFilterChange(value)}
            className={`
              whitespace-nowrap
              rounded-xl
              border border-white/10
              px-3 py-2
              text-sm
              transition-all duration-300
              backdrop-blur-md
              shadow-sm
              hover:scale-[1.03]
              hover:shadow-lg
              sm:px-4
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
