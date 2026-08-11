import { useDroppable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface BoardColumnProps {
  id: string;
  title: ReactNode;
  children: ReactNode;
  className?: string;
}

const BoardColumn = ({
  id,
  title,
  children,
  className = "",
}: BoardColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <motion.div
      ref={setNodeRef}
      layout
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: isOver ? 1.02 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 220,
        damping: 22,
      }}
      whileHover={{
        y: -4,
      }}
      className={`
        ${className}
        ${
          isOver
            ? `
              ring-2
              ring-blue-300
              shadow-[0_20px_50px_rgba(59,130,246,0.18)]
            `
            : ""
        }
      `}
    >
      <motion.h3
        layout
        animate={{
          color: isOver ? "#2563eb" : "#374151",
        }}
        transition={{
          duration: 0.2,
        }}
        className="
          font-semibold
          mb-3 md:mb-4
          capitalize
          text-base md:text-lg
        "
      >
        {title}
      </motion.h3>

      <motion.div
        layout
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 24,
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default BoardColumn;
