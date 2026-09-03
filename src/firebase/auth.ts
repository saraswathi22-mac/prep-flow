import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  signInWithPopup,
  linkWithPopup,
  linkWithCredential,
  GoogleAuthProvider,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  type User,
  type AuthError,
  type AuthCredential,
} from "firebase/auth";

import { doc, getDoc, setDoc } from "firebase/firestore";

import { auth, db } from "./config";

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

  await setDoc(doc(db, "users", userCredential.user.uid), {
    email: email.trim().toLowerCase(),
    googleConnected: false,
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

const GOOGLE_LINKED_EMAILS_COLLECTION = "googleLinkedEmails";

const markGoogleConnectedForUser = async (user: User): Promise<void> => {
  // setDoc + merge instead of updateDoc: works even if this user's
  // users/{uid} doc doesn't exist yet (e.g. older test accounts).
  await setDoc(
    doc(db, "users", user.uid),
    { googleConnected: true },
    { merge: true },
  );

  if (user.email) {
    await setDoc(
      doc(db, GOOGLE_LINKED_EMAILS_COLLECTION, user.email.trim().toLowerCase()),
      { linked: true },
      { merge: true },
    );
  }
};

// Login
export const login = async ({
  email,
  password,
}: AuthCredentials): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

    return userCredential.user;
  } catch (error) {
    const authError = error as AuthError;

    throw authError;
  }
};

// Guest login
export const loginAsGuest = async (): Promise<User> => {
  const userCredential = await signInAnonymously(auth);

  return userCredential.user;
};

/**
 * Thrown when Google sign-in collides with an existing email/password
 * account. The UI should catch this, show a "confirm your password"
 * field, and call resolveGoogleAccountLink() with what the user types.
 */
export class GooglePasswordLinkRequired extends Error {
  constructor(
    public email: string,
    public pendingCredential: AuthCredential,
  ) {
    super(
      "An account with this email already exists. Confirm password to link Google.",
    );
    this.name = "GooglePasswordLinkRequired";
  }
}

// Sign in with Google
export const loginWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();

  try {
    const userCredential = await signInWithPopup(auth, provider);

    return userCredential.user;
  } catch (error) {
    const authError = error as AuthError;

    if (authError.code === "auth/account-exists-with-different-credential") {
      const email = authError.customData?.email as string;
      const pendingCredential =
        GoogleAuthProvider.credentialFromError(authError);

      if (email && pendingCredential) {
        // Hand control back to the UI to collect the existing password.
        throw new GooglePasswordLinkRequired(email, pendingCredential);
      }
    }

    throw authError;
  }
};

export const connectGoogleAfterSignup = async (): Promise<User> => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("You must be signed in to connect Google.");
  }

  const provider = new GoogleAuthProvider();

  const userCredential = await linkWithPopup(user, provider);

  await markGoogleConnectedForUser(userCredential.user);

  return userCredential.user;
};

export const isGoogleConnectedForEmail = async (
  email: string,
): Promise<boolean> => {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return false;
  }

  const snap = await getDoc(
    doc(db, GOOGLE_LINKED_EMAILS_COLLECTION, normalizedEmail),
  );

  return snap.exists() && snap.data()?.linked === true;
};

/**
 * Call this once the UI has the password, in response to
 * GooglePasswordLinkRequired. Signs in with password (proving account
 * ownership) then permanently links the Google credential to it.
 * After this, loginWithGoogle() will succeed directly for this user —
 * no more prompts, no more duplicate accounts.
 */
export const resolveGoogleAccountLink = async (
  email: string,
  password: string,
  pendingCredential: AuthCredential,
): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );
  await linkWithCredential(userCredential.user, pendingCredential);
  await markGoogleConnectedForUser(userCredential.user);

  return userCredential.user;
};

/**
 * For a user who is currently signed in via Google only (no password
 * provider yet) and wants to add email/password as a second sign-in
 * option. Call this from an "Add password" button in account settings.
 */
export const addPasswordToAccount = async (password: string): Promise<User> => {
  const user = auth.currentUser;

  if (!user || !user.email) {
    throw new Error("You must be signed in to add a password.");
  }

  const credential = EmailAuthProvider.credential(user.email, password);
  const userCredential = await linkWithCredential(user, credential);
  return userCredential.user;
};

/**
 * For the "Forgot password?" link on the sign-in page. Works even for
 * accounts that only have Google as a provider — completing the reset
 * flow adds a password credential to the account rather than requiring
 * one to already exist.
 */
export const requestPasswordReset = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

// Link Google to the currently signed-in user (kept for account-settings
// page use — e.g. "Connect Google" button after the user is already
// logged in with password. Not needed for the sign-in-time flow above.)
export const connectGoogleAccount = async (): Promise<User> => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("You must be signed in to connect Google.");
  }

  const provider = new GoogleAuthProvider();

  const userCredential = await linkWithPopup(user, provider);

  await markGoogleConnectedForUser(userCredential.user);

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
