import { useDispatch, useSelector } from "react-redux";
import { useMemo, useState, useEffect } from "react";
import { DndContext, closestCorners } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  addInterviewTask,
  editInterviewTask,
  deleteInterviewTask,
} from "./interviewTaskSlice";
import { auth } from "../../firebase/config";
// helpers
import {
  getLocalDate,
  getYesterday,
  getWeekId,
} from "../../helpers/dateHelpers";
// components
import DatePicker from "../../components/DatePicker";
import DailyProgress from "../../components/DailyProgress";
import TaskCard from "../../components/TaskCard";
import WeeklySummary from "../../components/WeeklySummary";
import TopActions from "../../components/TopActions";
import BoardColumn from "../../components/BoardColumn";
import { deleteTaskFromFirebase } from "../../firebase/taskStorage";

import { motion } from "framer-motion";

import { toast } from "sonner";
import useTaskBoard from "./hooks/useTaskBoard";
import TaskFilters from "./TaskFilters";
import { difficultyOrder } from "../../constants/difficultyOrder";
import { Link } from "react-router-dom";
import Button from "../../components/Button";
import { RootState } from "../../store/store";
import { InterviewTask, TaskFilter } from "../../types/task";

const InterviewTaskList = () => {
  // Redux
  const dispatch = useDispatch();
  const allTasks = useSelector((state: RootState) => state.interviewTasks);

  // Auth
  const user = auth.currentUser;

  // State
  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [loading, setLoading] = useState(true);
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);

  // Derived values
  const today = getLocalDate();
  const yesterday = getYesterday();
  const isToday = selectedDate === today;
  const isPastDay = selectedDate < today;

  // Memoized data
  const interviewTasks = useMemo(() => {
    if (!user) return [];
    return allTasks.filter((task) => task.userId === user.uid);
  }, [allTasks, user]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, [selectedDate]);

  const filteredTasks = useMemo(() => {
    return interviewTasks
      .filter((t) => t.date === selectedDate)
      .filter((t) => {
        if (filter === "completed") return t.status === "done";

        if (filter === "pending") return t.status !== "done";

        return true;
      })
      .sort((a, b) => {
        const aDifficulty = a.difficulty || "medium";

        const bDifficulty = b.difficulty || "medium";

        return difficultyOrder[aDifficulty] - difficultyOrder[bDifficulty];
      });
  }, [interviewTasks, selectedDate, filter]);

  const unfinishedYesterdayTasks = useMemo(
    () =>
      interviewTasks.filter(
        (t) => t.date === yesterday && t.status === "todo" && !t.isRolledOver,
      ),
    [interviewTasks, yesterday],
  );

  const completedTasks = filteredTasks.filter(
    (t) => t.status === "done",
  ).length;

  const currentWeekId = getWeekId(today);

  const weeklyTasks = useMemo(
    () => interviewTasks.filter((t) => getWeekId(t.date) === currentWeekId),
    [interviewTasks, currentWeekId],
  );

  const { boardTasks, handleDragEnd, updateStatus } = useTaskBoard({
    filteredTasks,
    dispatch,
  });

  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const userName = (user?.displayName || user?.email?.split("@")[0] || "User")
    .replace(/[._-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const firstName = userName.split(" ")[0];

  const handleDelete = (task: InterviewTask) => {
    try {
      // delete from redux
      dispatch(deleteInterviewTask(task.id));

      // delete from firebase after a delay of 5 seconds to allow for undo
      const timer = setTimeout(async () => {
        await deleteTaskFromFirebase(user, task.id);
      }, 5000);

      toast("Task deleted", {
        action: {
          label: "Undo",
          onClick: () => {
            clearTimeout(timer);

            dispatch(addInterviewTask(task));
          },
        },
      });
    } catch (error) {
      console.error(error);

      toast.error("Failed to delete task");
    }
  };

  const rolloverUnfinishedTasks = () => {
    if (!unfinishedYesterdayTasks.length || !user) return;

    unfinishedYesterdayTasks.forEach((task) => {
      // create today's copy
      dispatch(
        addInterviewTask({
          ...task,
          userId: user.uid,
          id: crypto.randomUUID(),
          date: today,
          status: "todo",
          isRolledOver: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      );

      // mark yesterday's task as rolled over
      dispatch(
        editInterviewTask({
          id: task.id,
          updates: {
            isRolledOver: true,
            updatedAt: new Date().toISOString(),
          },
        }),
      );
    });

    toast.success(
      `🔄 ${unfinishedYesterdayTasks.length} task${
        unfinishedYesterdayTasks.length > 1 ? "s" : ""
      } rolled over to today`,
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6"
    >
      {/* Welcome Section */}
      <div>
        <p className="mb-2 text-sm font-medium text-[#5A9C43]">
          Your interview prep journey
        </p>

        <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
          👋 {greeting}, {firstName}!
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
          Stay consistent. Every practice session brings you closer to your next
          opportunity.
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TopActions
          isToday={isToday}
          hasUnfinishedYesterday={unfinishedYesterdayTasks.length > 0}
          onRollover={rolloverUnfinishedTasks}
        />

        <DatePicker
          selectedDate={selectedDate}
          max={today}
          onChange={setSelectedDate}
        />
      </div>

      {/* Daily Progress */}
      {isToday && (
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.25 }}
          className="
            rounded-xl
            border border-slate-200
            bg-white
            p-5
            shadow-sm
            transition-shadow
            hover:shadow-md
          "
        >
          <DailyProgress
            completed={completedTasks}
            total={filteredTasks.length}
          />
        </motion.div>
      )}

      {/* Section Header */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
          {isToday ? "Today's Interview Tasks" : `Tasks on ${selectedDate}`}
        </h2>

        <p className="mt-1.5 text-sm leading-5 text-slate-500">
          {isPastDay
            ? "Past days are read-only to maintain accurate progress."
            : "Stay consistent. Complete today's plan 🚀"}
        </p>
      </div>

      {/* Filters */}
      <div className="pt-1">
        <TaskFilters filter={filter} onFilterChange={setFilter} />
      </div>

      {/* ✅ Kanban Board */}
      <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {(["todo", "inProgress", "done"] as const).map((status) => {
            const columnTasks = boardTasks[status];

            return (
              <BoardColumn
                key={status}
                id={status}
                title={
                  <div className="flex items-center gap-2">
                    <span>
                      {status === "todo"
                        ? "Todo"
                        : status === "inProgress"
                          ? "In Progress"
                          : "Done"}
                    </span>

                    <span
                      className={`
                        text-xs
                        px-2 py-0.5
                        rounded-full
                        font-medium

                        ${
                          status === "todo"
                            ? "bg-slate-200 text-slate-700"
                            : status === "inProgress"
                              ? "bg-amber-200 text-amber-800"
                              : "bg-emerald-200 text-emerald-800"
                        }
                      `}
                    >
                      {columnTasks.length}
                    </span>
                  </div>
                }
                className={`
                  min-h-[340px]
                  rounded-xl
                  border
                  p-4
                  shadow-sm
                  transition-shadow
                  hover:shadow-md
                  ${
                    status === "todo"
                      ? "border-slate-200 bg-slate-50"
                      : status === "inProgress"
                        ? "border-amber-200 bg-amber-50/60"
                        : "border-emerald-200 bg-emerald-50/60"
                  }
                `}
              >
                <SortableContext
                  items={columnTasks.map((task) => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {loading ? (
                      <div className="flex items-center justify-center py-10">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-[#5A9C43]" />
                          Loading tasks...
                        </div>
                      </div>
                    ) : columnTasks.length ? (
                      columnTasks.map((task) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          key={task.id}
                        >
                          <TaskCard
                            task={task}
                            isPastDay={isPastDay}
                            onStatusChange={updateStatus}
                            onDelete={handleDelete}
                          />
                        </motion.div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white backdrop-blur-sm shadow-sm">
                          <span className="text-4xl">
                            {status === "todo"
                              ? "📋"
                              : status === "inProgress"
                                ? "🚀"
                                : "🏆"}
                          </span>
                        </div>

                        <h3 className="text-lg font-semibold text-slate-800">
                          {status === "todo"
                            ? "No tasks to start"
                            : status === "inProgress"
                              ? "Nothing in progress"
                              : "No completed tasks yet"}
                        </h3>

                        <p className="mt-2 max-w-[220px] text-sm leading-6 text-slate-500">
                          {status === "todo"
                            ? "Create your first interview task to begin today's plan."
                            : status === "inProgress"
                              ? "Move a task here once you start working on it."
                              : "Finish a task to celebrate your progress here."}
                        </p>

                        {status === "todo" && !isPastDay && (
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
                            className="mt-6"
                          >
                            <Link to="/add-task">
                              <Button>
                                <motion.span
                                  whileHover={{ rotate: 90 }}
                                  transition={{ duration: 0.25 }}
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
                        )}
                      </div>
                    )}
                  </div>
                </SortableContext>
              </BoardColumn>
            );
          })}
        </div>
      </DndContext>

      {/* Weekly Summary */}
      <div className="mt-10 border-t border-slate-200 pt-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
              📊 Weekly Analytics
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review your interview preparation this week
              <span className="ml-1 text-slate-400">· {currentWeekId}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowWeeklySummary((prev) => !prev)}
            className="
        shrink-0
        rounded-lg
        px-3
        py-1.5
        text-sm
        font-medium
        text-[#5A9C43]
        transition-colors
        hover:bg-[#5A9C43]/10
        focus:outline-none
        focus:ring-2
        focus:ring-[#5A9C43]/20
      "
          >
            {showWeeklySummary ? "Hide" : "View"}
          </button>
        </div>

        {showWeeklySummary && (
          <div className="mt-5 rounded-3xl border border-gray-100 bg-white p-6 md:p-7 shadow-sm">
            <WeeklySummary tasks={weeklyTasks} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default InterviewTaskList;
