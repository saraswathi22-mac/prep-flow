import { motion } from "framer-motion";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import {
  InsightsRounded,
  BoltRounded,
  CelebrationRounded,
  AssignmentRounded,
  CheckCircleRounded,
  TrendingUpRounded,
} from "@mui/icons-material";

interface DailyProgressProps {
  completed?: number;
  total?: number;
}

const DailyProgress = ({ completed = 0, total = 0 }: DailyProgressProps) => {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  const getProgressColor = () => {
    if (percent === 100) return "from-green-500 to-emerald-500";

    if (percent >= 60) return "from-green-400 to-green-500";

    if (percent >= 30) return "from-yellow-400 to-orange-400";

    return "from-red-400 to-pink-500";
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
      }}
      whileHover={{
        y: -4,
        scale: 1.01,
      }}
      className="
        rounded-3xl
        border border-white/20

        bg-gradient-to-br
        from-white/80
        via-blue-50/70
        to-purple-50/80

        backdrop-blur-2xl

        p-4 md:p-6

        shadow-[0_10px_40px_rgba(59,130,246,0.10)]

        transition-all duration-300
      "
    >
      {/* 🔷 Header */}
      <div className="flex items-start gap-3">
        <TrendingUpRounded
          className="mt-1 shrink-0 text-violet-600"
          fontSize="medium"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold leading-6 text-gray-800">
              Today's Progress
            </h3>

            {total > 0 ? (
              <motion.div
                key={percent}
                initial={{
                  scale: 0.8,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                className={`
            flex shrink-0 items-center justify-center
            rounded-full
            px-3 py-1.5
            text-sm
            font-bold
            ${
              percent === 100
                ? "bg-green-100 text-green-700"
                : "bg-indigo-50 text-indigo-600"
            }
          `}
              >
                {percent}%
              </motion.div>
            ) : (
              <div
                className="
            flex shrink-0 items-center justify-center
            rounded-full
            bg-violet-100
            px-3 py-1.5
            text-sm
            font-semibold
            text-violet-700
          "
              >
                Ready
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🔷 Progress Bar */}
      {total > 0 && (
        <div className="mt-6">
          <div
            className="
        w-full
        h-3
        rounded-full
        bg-white/60
        overflow-hidden
        relative
        border border-white/30
      "
          >
            {/* Animated Fill */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
              }}
              className={`
          h-full
          rounded-full
          bg-gradient-to-r
          ${getProgressColor()}
          relative
        `}
            >
              <div
                className="
            absolute
            inset-0
            bg-white/20
            blur-md
          "
              />
            </motion.div>

            {/* Shine Effect */}
            <motion.div
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                repeat: Infinity,
                duration: 2.5,
                ease: "linear",
              }}
              className="
          absolute
          top-0
          h-full
          w-20
          bg-white/20
          skew-x-12
        "
            />
          </div>
        </div>
      )}

      {/* Progress Summary */}
      <div className={`${total > 0 ? "mt-5" : "mt-6"}`}>
        {total === 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-2.5 py-1 text-sm font-medium text-violet-700">
            <AssignmentRounded fontSize="small" />
            No tasks planned for today
          </span>
        ) : (
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-sm font-medium text-green-700">
              <CheckCircleRounded fontSize="small" />
              {completed} Completed
            </span>

            {percent < 100 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-sm font-medium text-blue-700">
                <AssignmentRounded fontSize="small" />
                {Math.max(total - completed, 0)} Remaining
              </span>
            )}
          </div>
        )}
      </div>

      {/* 🔷 Footer */}
      <div className="mt-5 text-sm">
        {percent === 100 ? (
          <motion.span
            initial={{ scale: 0.9 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
            }}
            className="inline-flex items-center gap-2 font-semibold text-green-600"
          >
            <CelebrationRounded fontSize="small" />
            Excellent! All tasks are complete!
          </motion.span>
        ) : percent >= 60 ? (
          <span className="inline-flex items-center gap-2 font-semibold text-green-600">
            <TrendingUpRounded fontSize="small" />
            You're making great progress.
          </span>
        ) : percent > 0 ? (
          <span className="inline-flex items-center gap-2 font-medium text-gray-600">
            <BoltRounded fontSize="small" className="text-orange-500" />
            Keep going. You're on track.
          </span>
        ) : total === 0 ? (
          <span className="text-gray-500">
            Start today's interview prep by adding your first task.
          </span>
        ) : (
          <span className="text-gray-500">
            Your interview plan is ready. Let's get started.
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default DailyProgress;
