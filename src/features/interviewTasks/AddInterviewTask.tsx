import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { addInterviewTask } from "./interviewTaskSlice";
import InterviewTaskForm, {
  type InterviewTaskFormValues,
} from "./InterviewTaskForm";
import { getLocalDate, getWeekId } from "../../helpers/dateHelpers";
import { auth } from "../../firebase/config";
import { toast } from "sonner";

const AddInterviewTask = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const today = getLocalDate();

  const user = auth.currentUser;

  const handleAddTask = (values: InterviewTaskFormValues) => {
    if (!user) {
      toast.error("Please login first");
      return;
    }

    dispatch(
      addInterviewTask({
        id: uuidv4(),
        date: today,
        weekId: getWeekId(today),
        question: values.question,
        techStack: values.techStack,
        difficulty: values.difficulty,
        status: "todo",
        isRolledOver: false,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    );

    toast.success("Interview task added");

    setTimeout(() => {
      navigate("/");
    }, 800);
  };

  return (
    <InterviewTaskForm
      title="Add Interview Task"
      subtitle="Add one clear interview-style question for today."
      submitLabel="➕ Add Task"
      initialValues={{
        question: "",
        techStack: "React",
        difficulty: "medium",
      }}
      onSubmit={handleAddTask}
    />
  );
};

export default AddInterviewTask;
