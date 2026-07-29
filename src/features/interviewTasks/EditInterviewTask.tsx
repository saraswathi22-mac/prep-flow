import { useDispatch, useSelector } from "react-redux";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { editInterviewTask } from "./interviewTaskSlice";
import { auth } from "../../firebase/config";
import { toast } from "sonner";
import InterviewTaskForm, {
  type InterviewTaskFormValues,
} from "./InterviewTaskForm";
import type { RootState } from "../../store/store";

const EditInterviewTask = () => {
  const { id } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = auth.currentUser;

  const allTasks = useSelector((state: RootState) => state.interviewTasks);

  const interviewTasks = useMemo(() => {
    if (!user) return [];

    return allTasks.filter((task) => task.userId === user.uid);
  }, [allTasks, user]);

  const existingTask = interviewTasks.find((t) => t.id === id);

  const handleEditTask = (values: InterviewTaskFormValues) => {
    if (!existingTask) return;

    dispatch(
      editInterviewTask({
        id: existingTask.id,
        updates: {
          question: values.question,
          techStack: values.techStack,
          difficulty: values.difficulty,
          updatedAt: new Date().toISOString(),
        },
      }),
    );

    toast.success("Interview task updated");

    setTimeout(() => {
      navigate("/");
    }, 800);
  };

  return (
    <InterviewTaskForm
      title="Edit Interview Task"
      subtitle="Update your task details"
      submitLabel="💾 Save Changes"
      isEditMode
      initialValues={{
        question: existingTask?.question || "",
        techStack: existingTask?.techStack || "React",
        difficulty: existingTask?.difficulty || "medium",
      }}
      onSubmit={handleEditTask}
    />
  );
};

export default EditInterviewTask;
