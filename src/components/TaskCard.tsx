import { Link } from "react-router-dom";

import { motion } from "framer-motion";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { InterviewTask, TaskStatus } from "../types/task";

interface TaskCardProps {
  task: InterviewTask;
  isPastDay: boolean;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (task: InterviewTask) => void;
}

const TaskCard = ({
  task,
  isPastDay,
  onStatusChange,
  onDelete,
}: TaskCardProps) => {
  const { techStack, status } = task;

  const difficulty = task.difficulty || "medium";

  // ✅ dnd-kit sortable hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  // ✅ drag styles
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const difficultyColor = {
    hard: "bg-red-100 text-red-700",
    medium: "bg-amber-100 text-amber-700",
    easy: "bg-emerald-100 text-emerald-700",
  };

  const statusColor = {
    done: "text-emerald-600",
    skipped: "text-amber-600",
    todo: "text-slate-500",
    inProgress: "text-blue-600",
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      whileHover={{
        y: -4,
        scale: 1.01,
      }}
      whileTap={{
        scale: 0.98,
      }}
      animate={{
        scale: isDragging ? 1.04 : 1,
        rotate: isDragging ? 1.5 : 0,
        opacity: isDragging ? 0.85 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
      className={`
        group
        flex flex-col gap-3
        rounded-xl
        border
        p-4
        transition-shadow duration-200
        cursor-grab
        active:cursor-grabbing

        ${
          isDragging
            ? `
              z-50
              ring-2
              ring-[#5A9C43]/30
              shadow-lg
            `
            : ""
        }

        ${
          isPastDay
            ? `
              border-slate-200
              bg-slate-50
              opacity-70
            `
            : `
              border-slate-200
              bg-white
              shadow-sm
              hover:shadow-md
            `
        }
      `}
    >
      {/* 🔷 Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="
          self-end

          cursor-grab
          active:cursor-grabbing

          text-slate-400
          hover:text-[#5A9C43]

          transition-colors
        "
      >
        ☰
      </div>

      {/* 🔷 Header */}
      <div className="flex justify-between items-start gap-2">
        <h3
          className="
            min-w-0
            flex-1
            text-sm
            font-semibold
            leading-snug
            text-slate-800
            transition-colors
            group-hover:text-[#5A9C43]
          "
        >
          {task.question}
        </h3>

        {/* Difficulty badge */}
        <span
          className={`
            text-xs
            px-2.5
            py-1

            rounded-full

            font-medium
            capitalize

            shadow-sm

            ${difficultyColor[difficulty] || "bg-gray-100 text-gray-600"}
          `}
        >
          {difficulty}
        </span>
      </div>

      {/* 🔷 Tech Stack */}
      <div className="flex items-center gap-2 text-xs flex-wrap">
        <span
          className="
            rounded-full
            bg-slate-100
            px-2.5
            py-1
            text-xs
            font-medium
            text-slate-700
          "
        >
          {techStack}
        </span>

        <span
          className={`
            font-medium

            ${statusColor[status]}
          `}
        >
          ● {status}
        </span>
      </div>

      {/* 🔷 Extra Info */}
      <div className="text-xs space-y-1">
        {task.isRolledOver && (
          <p className="text-orange-500">⏭ Rolled from yesterday</p>
        )}

        {isPastDay && <p className="text-gray-400">🔒 Read-only</p>}
      </div>

      {/* 🔷 Actions */}
      {!isPastDay && (
        <div
          className="
            flex
            justify-between
            items-center

            pt-3
            mt-1

            border-t
            border-slate-100
          "
        >
          <div className="flex gap-2">
            {status === "todo" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();

                  onStatusChange(task.id, "inProgress");
                }}
                className="
                  rounded-lg
                  bg-blue-50
                  px-3
                  py-1.5
                  text-xs
                  font-medium
                  text-blue-700
                  transition-colors
                  hover:bg-blue-100
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-200
                "
              >
                ▶ Start
              </button>
            )}

            {status === "inProgress" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();

                  onStatusChange(task.id, "done");
                }}
                className="
                  rounded-lg
                  bg-emerald-50
                  px-3
                  py-1.5
                  text-xs
                  font-medium
                  text-emerald-700
                  transition-colors
                  hover:bg-emerald-100
                  focus:outline-none
                  focus:ring-2
                  focus:ring-emerald-200
                "
              >
                ✓ Done
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <Link
              to={`/edit-task/${task.id}`}
              className="
                rounded-lg
                px-2.5
                py-1.5
                text-xs
                font-medium
                text-slate-500
                transition-colors
                hover:bg-slate-100
                hover:text-slate-700
                focus:outline-none
                focus:ring-2
                focus:ring-slate-200
              "
            >
              ✏
            </Link>

            <button
              onClick={() => onDelete(task)}
              className="
                rounded-lg
                px-2.5
                py-1.5
                text-xs
                font-medium
                text-red-500
                transition-colors
                hover:bg-red-50
                hover:text-red-600
                focus:outline-none
                focus:ring-2
                focus:ring-red-200
              "
            >
              🗑
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TaskCard;
