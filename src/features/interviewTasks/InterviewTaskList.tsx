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
import { InterviewTask } from "../../types/task";

const InterviewTaskList = () => {
  // Redux
  const dispatch = useDispatch();
  const allTasks = useSelector((state: RootState) => state.interviewTasks);

  // Auth
  const user = auth.currentUser;

  // State
  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [filter, setFilter] = useState("all");
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
      className="mt-6 space-y-10 max-w-6xl mx-auto px-4"
    >
      {/* Welcome Section */}
      <div className="flex-1">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
          👋 {greeting}, {firstName}!
        </h1>

        <p className="mt-2 text-gray-600 leading-relaxed">
          Stay consistent. Every practice session brings you closer to your next
          opportunity.
        </p>
      </div>

      {/* Action Bar */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
    rounded-2xl
    border border-white/10
    bg-white/70
    backdrop-blur-xl
    shadow-[0_8px_30px_rgba(0,0,0,0.08)]
    p-5
  "
        >
          <DailyProgress
            completed={completedTasks}
            total={filteredTasks.length}
          />
        </motion.div>
      )}

      {/* Section Header */}
      <div className="border-b pb-3">
        <h2 className="text-xl font-semibold text-gray-800">
          {isToday ? "Today's Interview Tasks" : `Tasks on ${selectedDate}`}
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          {isPastDay
            ? "Past days are read-only to maintain accurate progress"
            : "Stay consistent. Complete today's plan 🚀"}
        </p>
      </div>

      {/* Filters */}
      <TaskFilters filter={filter} onFilterChange={setFilter} />

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
              ? "bg-gray-200 text-gray-700"
              : status === "inProgress"
                ? "bg-yellow-200 text-yellow-800"
                : "bg-green-200 text-green-800"
          }
        `}
                    >
                      {columnTasks.length}
                    </span>
                  </div>
                }
                className={`
                  rounded-[28px]
                  p-5
                  min-h-[340px]
                  
                  backdrop-blur-2xl
                  
                  border border-white/30
                  
                  transition-all duration-500
                  
                  hover:-translate-y-2
                  hover:scale-[1.01]
                  
                  shadow-[0_10px_35px_rgba(0,0,0,0.08)]
                  
                  ${
                    status === "todo"
                      ? `
                        bg-gradient-to-br
                        from-slate-100
                        via-slate-50
                        to-slate-200
                  
                        hover:shadow-slate-300/30
                      `
                      : status === "inProgress"
                        ? `
                        bg-gradient-to-br
                        from-yellow-50
                        via-orange-50
                        to-amber-100
                  
                        hover:shadow-yellow-300/30
                      `
                        : `
                        bg-gradient-to-br
                        from-emerald-50
                        via-green-50
                        to-teal-100
                  
                        hover:shadow-emerald-300/30
                      `
                  }
                  `}
              >
                <SortableContext
                  items={columnTasks.map((task) => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-sm text-gray-400">Loading...</div>
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
                        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white/50 backdrop-blur-sm shadow-sm">
                          <span className="text-4xl">
                            {status === "todo"
                              ? "📋"
                              : status === "inProgress"
                                ? "🚀"
                                : "🏆"}
                          </span>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-800">
                          {status === "todo"
                            ? "No tasks to start"
                            : status === "inProgress"
                              ? "Nothing in progress"
                              : "No completed tasks yet"}
                        </h3>

                        <p className="mt-2 max-w-[220px] text-sm leading-6 text-gray-500">
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
      <div className="pt-10 mt-10 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            📊 Weekly Analytics
            <span className="ml-2 text-sm text-gray-500">
              ({currentWeekId})
            </span>
          </h2>

          <button
            onClick={() => setShowWeeklySummary((prev) => !prev)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition"
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
