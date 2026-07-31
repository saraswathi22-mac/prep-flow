import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

import { db } from "./config";
import type { User } from "firebase/auth";
import type { InterviewTask } from "../types/task";

// Get collection name based on user
export const getCollectionName = (user: User | null): string => {
  return user ? `interviewTasks_${user.uid}` : "interviewTasks_guest";
};

// LOAD TASKS
export const loadTasks = async (
  user: User | null,
): Promise<InterviewTask[]> => {
  try {
    const collectionName = getCollectionName(user);

    const querySnapshot = await getDocs(collection(db, collectionName));

    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...(doc.data() as Omit<InterviewTask, "id">),
        }) as InterviewTask,
    );
  } catch (error) {
    console.error("Failed to load tasks", error);

    return [];
  }
};

// SAVE TASKS
export const saveTasks = async (
  user: User | null,
  tasks: InterviewTask[],
): Promise<void> => {
  if (!user) return;
  try {
    const collectionName = getCollectionName(user);

    // Save each task individually
    const promises = tasks.map((task) => {
      return setDoc(doc(db, collectionName, task.id.toString()), task);
    });

    await Promise.all(promises);
  } catch (error) {
    console.error("Failed to save tasks", error);
  }
};

// DELETE TASK
export const deleteTaskFromFirebase = async (
  user: User | null,
  taskId: string,
): Promise<void> => {
  try {
    const collectionName = getCollectionName(user);
    await deleteDoc(doc(db, collectionName, taskId.toString()));
  } catch (error) {
    console.error("Failed to delete task", error);
  }
};
