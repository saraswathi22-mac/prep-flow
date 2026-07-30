import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import Button from "./Button";

interface TopActionsProps {
  isToday: boolean;
  hasUnfinishedYesterday: boolean;
  onRollover: () => void;
}

const TopActions = ({
  isToday,
  hasUnfinishedYesterday,
  onRollover,
}: TopActionsProps) => {
  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.3,
      }}
      className="
        flex
        flex-wrap
        items-start
        gap-4 md:gap-6
      "
    >
      {/* 🔷 Primary Action */}
      <motion.div
        whileHover={{
          y: -2,
          scale: 1.02,
        }}
        whileTap={{
          scale: 0.98,
        }}
        transition={{
          type: "spring",
          stiffness: 280,
          damping: 18,
        }}
      >
        <Link to="/add-task">
          <Button>
            <motion.span
              whileHover={{
                rotate: 90,
              }}
              transition={{
                duration: 0.25,
              }}
              className="
                mr-2

                inline-flex
                items-center
                justify-center

                w-5
                h-5

                rounded-full

                bg-white
                text-indigo-600

                text-sm
                font-bold
              "
            >
              +
            </motion.span>
            Add Task
          </Button>
        </Link>
      </motion.div>

      <AnimatePresence>
        {isToday && hasUnfinishedYesterday && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 6,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: -6,
            }}
            transition={{
              duration: 0.25,
            }}
            className="
        flex
        flex-col
        items-start
        gap-1
      "
          >
            <Button onClick={onRollover} variant="secondary">
              ⏭ Roll Over Tasks
            </Button>

            <p
              className="
          text-xs
          text-gray-500
          ml-1
        "
            >
              You have unfinished tasks from yesterday
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TopActions;
