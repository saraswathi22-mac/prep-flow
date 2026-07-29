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
    medium: "bg-yellow-100 text-yellow-700",
    easy: "bg-green-100 text-green-700",
  };

  const statusColor = {
    done: "text-green-600",
    skipped: "text-yellow-600",
    todo: "text-gray-500",
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
        rounded-2xl
        p-4

        flex
        flex-col
        gap-3

        transition-all
        duration-300

        border
        backdrop-blur-xl

        cursor-grab
        active:cursor-grabbing

        ${
          isDragging
            ? `
              z-50
              ring-2
              ring-blue-200

              shadow-[0_25px_60px_rgba(59,130,246,0.25)]
            `
            : ""
        }

        ${
          isPastDay
            ? `
              bg-gray-50/80
              border-gray-200
              opacity-70
            `
            : `
              bg-white/80
              border-white/30

              shadow-[0_8px_30px_rgba(0,0,0,0.06)]

              hover:shadow-[0_15px_45px_rgba(59,130,246,0.12)]
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

          text-gray-400
          hover:text-blue-500

          transition-colors
        "
      >
        ☰
      </div>

      {/* 🔷 Header */}
      <div className="flex justify-between items-start gap-3">
        <h3
          className="
            font-semibold
            text-gray-900
            text-sm
            leading-snug

            transition-colors

            group-hover:text-indigo-600
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
            px-2.5
            py-1

            rounded-full

            bg-gradient-to-r
            from-slate-100
            to-slate-200

            text-gray-700
            font-medium
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
            border-gray-100
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
                  text-xs

                  px-3
                  py-1.5

                  rounded-lg

                  bg-blue-50
                  text-blue-600

                  hover:bg-blue-100

                  transition-all
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
                  text-xs

                  px-3
                  py-1.5

                  rounded-lg

                  bg-green-50
                  text-green-600

                  hover:bg-green-100

                  transition-all
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
                text-xs

                px-2.5
                py-1.5

                rounded-lg

                text-blue-600

                hover:bg-blue-50

                transition-all
              "
            >
              ✏
            </Link>

            <button
              onClick={() => onDelete(task)}
              className="
                text-xs

                px-2.5
                py-1.5

                rounded-lg

                text-red-600

                hover:bg-red-50

                transition-all
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
