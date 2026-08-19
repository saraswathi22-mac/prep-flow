import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User,
} from "firebase/auth";

import { auth } from "./config";

interface AuthCredentials {
  email: string;
  password: string;
  name?: string;
}

// Signup
export const signup = async ({
  name,
  email,
  password,
}: AuthCredentials): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );

  await updateProfile(userCredential.user, {
    displayName: name,
  });

  try {
    await fetch("/api/send-welcome-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        name,
      }),
    });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }

  return userCredential.user;
};

// Login
export const login = async ({
  email,
  password,
}: AuthCredentials): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );

  return userCredential.user;
};

// Logout
export const logout = async (): Promise<void> => {
  await signOut(auth);
};

// Update display name
export const updateUserName = async (
  user: User,
  name: string,
): Promise<void> => {
  await updateProfile(user, {
    displayName: name,
  });
};

// Change password
export const changeUserPassword = async (
  user: User,
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  if (!user.email) {
    throw new Error("User email is not available.");
  }

  const credential = EmailAuthProvider.credential(user.email, currentPassword);

  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
};

// Delete account
export const deleteUserAccount = async (user: User): Promise<void> => {
  await deleteUser(user);
};

export const reauthenticateUser = async (
  user: User,
  password: string,
): Promise<void> => {
  if (!user.email) {
    throw new Error("User email is not available.");
  }

  const credential = EmailAuthProvider.credential(user.email, password);

  await reauthenticateWithCredential(user, credential);
};

// Observe auth state
export const observeAuthState = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
