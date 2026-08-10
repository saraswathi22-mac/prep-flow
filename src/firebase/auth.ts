import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
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

// Observe auth state
export const observeAuthState = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
