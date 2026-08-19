import { doc, getDoc, setDoc } from "firebase/firestore";

import { db } from "./config";
import type { User } from "firebase/auth";

interface UserPreferences {
  techStacks: string[];
  hasCompletedTechStackSetup?: boolean;
}

// Get user's preferences document
export const getUserPreferencesRef = (user: User) => {
  return doc(db, "users", user.uid);
};

// Load user's selected tech stacks
export const loadTechStacks = async (user: User | null): Promise<string[]> => {
  if (!user) return [];

  try {
    const userPreferencesRef = getUserPreferencesRef(user);
    const snapshot = await getDoc(userPreferencesRef);

    if (!snapshot.exists()) {
      return [];
    }

    const data = snapshot.data() as UserPreferences;

    return data.techStacks || [];
  } catch (error) {
    console.error("Failed to load tech stacks", error);

    return [];
  }
};

// Check whether initial tech stack setup is complete
export const hasCompletedTechStackSetup = async (
  user: User | null,
): Promise<boolean> => {
  if (!user) return false;

  try {
    const userPreferencesRef = getUserPreferencesRef(user);
    const snapshot = await getDoc(userPreferencesRef);

    if (!snapshot.exists()) {
      return false;
    }

    const data = snapshot.data() as UserPreferences;

    return data.hasCompletedTechStackSetup === true;
  } catch (error) {
    console.error("Failed to check tech stack setup", error);

    return false;
  }
};

export const completeTechStackSetup = async (
  user: User | null,
  techStacks: string[],
): Promise<void> => {
  if (!user) return;

  try {
    const userPreferencesRef = getUserPreferencesRef(user);

    await setDoc(
      userPreferencesRef,
      {
        techStacks,
        hasCompletedTechStackSetup: true,
      },
      {
        merge: true,
      },
    );
  } catch (error) {
    console.error("Failed to complete tech stack setup", error);

    throw error;
  }
};

// Save user's selected tech stacks
export const saveTechStacks = async (
  user: User | null,
  techStacks: string[],
): Promise<void> => {
  if (!user) return;

  try {
    const userPreferencesRef = getUserPreferencesRef(user);

    await setDoc(
      userPreferencesRef,
      {
        techStacks,
      },
      {
        merge: true,
      },
    );
  } catch (error) {
    console.error("Failed to save tech stacks", error);

    throw error;
  }
};
