import { useState } from "react";
import {
  login,
  loginWithGoogle,
  resolveGoogleAccountLink,
  GooglePasswordLinkRequired,
  addPasswordToAccount,
  signup,
} from "../firebase/auth";
import { FirebaseError } from "firebase/app";
import { toast } from "sonner";
import type { AuthCredential } from "firebase/auth";
import { fetchSignInMethodsForEmail } from "firebase/auth";
import { auth } from "../firebase/config";

interface LoginProps {
  onLoginStart: () => void;
  onSignupStart: () => void;
}

function Login({ onLoginStart, onSignupStart }: LoginProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // When Google sign-in collides with an existing
  // email/password account, store the pending Google
  // credential until the user confirms their password.
  const [pendingLink, setPendingLink] = useState<{
    email: string;
    credential: AuthCredential;
  } | null>(null);

  const [linkPassword, setLinkPassword] = useState("");

  const getErrorMessage = (err: FirebaseError): string => {
    const code = err.code || "";

    switch (code) {
      case "auth/invalid-email":
        return "Invalid email format";

      case "auth/invalid-credential":
        return "Invalid email or password";

      case "auth/email-already-in-use":
        return "Email already registered";

      case "auth/weak-password":
        return "Password should be at least 6 characters";

      case "auth/popup-closed-by-user":
        return "Google sign-in was cancelled";

      case "auth/user-not-found":
        return "No account found with this email";

      case "auth/wrong-password":
        return "Incorrect password";

      default:
        return "Something went wrong. Please try again.";
    }
  };

  const isFormValid =
    email.trim() !== "" &&
    password.trim() !== "" &&
    (isLogin || name.trim() !== "");

  // Email/password login or signup.
  //
  // Note: this no longer decides whether to show a "connect Google"
  // step — that decision (and the screen itself) lives in App.tsx,
  // triggered off onLoginStart/onSignupStart plus Firebase auth state.
  // Firebase signs the user in immediately inside login()/signup(), so
  // by the time this function returns, App.tsx has likely already
  // re-rendered past this component.
  const handleSubmit = async (): Promise<void> => {
    if (loading) return;

    setLoading(true);

    try {
      if (isLogin) {
        await login({ email, password });
        onLoginStart();
      } else {
        onSignupStart();
        const user = await signup({
          name,
          email,
          password,
        });

        toast.success(`Welcome, ${user.displayName || name}!`, {
          description: "Your account has been created.",
        });
      }
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        toast.error(getErrorMessage(err), {
          duration: 4000,
        });
      } else {
        toast.error("Something went wrong. Please try again.", {
          duration: 4000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Google sign-in — only reachable once googleConnected is true, i.e.
  // after an explicit connect step (via ConnectGooglePrompt in App.tsx).
  //
  // The GooglePasswordLinkRequired branch is kept as a safety net (e.g.
  // if the flag gets cleared or the user clears site data), not as the
  // primary path anymore.
  const handleGoogleLogin = async (): Promise<void> => {
    if (loading) return;

    setLoading(true);

    try {
      const user = await loginWithGoogle();

      // TEMP DEBUG — confirms whether the password method
      // survived the Google sign-in for this email.
      if (user.email) {
        const methods = await fetchSignInMethodsForEmail(auth, user.email);
        console.log(
          "[handleGoogleLogin] sign-in methods for",
          user.email,
          ":",
          methods,
        );
      }

      onLoginStart();
    } catch (err: unknown) {
      if (err instanceof GooglePasswordLinkRequired) {
        setPendingLink({
          email: err.email,
          credential: err.pendingCredential,
        });
      } else if (err instanceof FirebaseError) {
        switch (err.code) {
          case "auth/popup-closed-by-user":
            toast.error("Google sign-in was cancelled.", {
              duration: 4000,
            });
            break;

          case "auth/provider-already-linked":
            toast.info("Google is already connected to your account.", {
              duration: 4000,
            });
            break;

          case "auth/credential-already-in-use":
            toast.error(
              "This Google account is already connected to another account.",
              {
                duration: 5000,
              },
            );
            break;

          default:
            toast.error(getErrorMessage(err), {
              duration: 4000,
            });
        }
      } else {
        toast.error("Something went wrong. Please try again.", {
          duration: 4000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Confirm the existing password when Google
  // collides with an existing email/password account.
  //
  // NOTE: like signup()/login(), the signInWithEmailAndPassword call
  // inside resolveGoogleAccountLink() triggers Firebase's auth-state
  // listener in App.tsx immediately. In practice this component may
  // unmount before linkWithCredential() finishes — that's fine, the
  // promise chain still completes in the background and the account
  // still gets linked. The user just won't see this screen's own
  // success path play out; App.tsx's own auth-state handling takes
  // over once the link completes and providerData reflects it.
  const handleConfirmLink = async (): Promise<void> => {
    if (!pendingLink || loading) return;

    setLoading(true);

    try {
      await resolveGoogleAccountLink(
        pendingLink.email,
        linkPassword,
        pendingLink.credential,
      );

      setPendingLink(null);
      setLinkPassword("");

      onLoginStart();
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        toast.error(getErrorMessage(err), {
          duration: 4000,
        });
      } else {
        toast.error("Something went wrong. Please try again.", {
          duration: 4000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (): void => {
    setName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setIsLogin((prev) => !prev);
  };

  const BRAND_GREEN = "#5A9C43" as const;
  const BRAND_GREEN_HOVER = "#4C8A38" as const;
  const BRAND_YELLOW = "#F7B81B" as const;

  // --------------------------------------------------
  // Existing account: Google/password collision screen
  // --------------------------------------------------
  if (pendingLink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/80 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8">
          <h2 className="mb-2 text-lg font-semibold text-slate-700">
            Confirm your password
          </h2>

          <p className="mb-6 text-sm text-slate-500">
            An account already exists for <strong>{pendingLink.email}</strong>.
            Enter its password once to connect Google — after this, Google
            sign-in will work directly.
          </p>

          <input
            type="password"
            placeholder="Password"
            value={linkPassword}
            onChange={(e) => setLinkPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition-all focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
          />

          <button
            type="button"
            onClick={() => void handleConfirmLink()}
            disabled={loading || !linkPassword.trim()}
            className="mt-4 w-full rounded-xl py-3 font-medium text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70"
            style={{
              backgroundColor: BRAND_GREEN,
            }}
          >
            {loading ? "Connecting..." : "Connect Google"}
          </button>

          <button
            type="button"
            onClick={() => {
              setPendingLink(null);
              setLinkPassword("");
            }}
            className="mt-3 w-full text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Normal Login / Signup screen
  // --------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/80 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <img
            src="/prep-flow.png"
            alt="PrepFlow"
            className="mx-auto h-16 w-16 object-contain mb-2"
          />

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            PrepFlow
          </h1>

          <p className="mt-3 text-sm text-slate-600 pb-3">
            Your interview preparation companion.
          </p>

          <div className="mt-2 text-sm font-medium">
            <span style={{ color: BRAND_GREEN }}>Plan</span>

            <span className="mx-2 text-slate-400">•</span>

            <span className="text-slate-700">Practice</span>

            <span className="mx-2 text-slate-400">•</span>

            <span style={{ color: BRAND_YELLOW }}>Progress</span>
          </div>
        </div>

        {/* Form Title */}
        <h2 className="mb-6 text-center text-lg font-semibold text-slate-700">
          {isLogin ? "Sign in to continue" : "Create your account"}
        </h2>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
          className="space-y-4"
        >
          {!isLogin && (
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-[#5A9C43] focus:ring-4 focus:ring-[#5A9C43]/10"
            />
          )}

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition-all focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                const value = e.target.value;

                setPassword(value);

                if (!value) {
                  setShowPassword(false);
                }
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-16 text-slate-700 outline-none transition-all focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={!password.trim()}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md px-1 text-sm font-medium text-slate-500 transition hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5A9C43]/30 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:text-slate-300"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full rounded-xl py-3 font-medium text-white transition-all duration-200 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
            style={{
              backgroundColor: BRAND_GREEN,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = BRAND_GREEN_HOVER)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = BRAND_GREEN)
            }
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Please wait...
              </span>
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Features */}
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-slate-500">
          <span>✓ Daily Tracking</span>
          <span>✓ Mock Interviews</span>
          <span>✓ Progress Insights</span>
        </div>

        {/* Toggle */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm font-medium transition"
            style={{ color: BRAND_GREEN }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = BRAND_GREEN_HOVER)
            }
            onMouseLeave={(e) => (e.currentTarget.style.color = BRAND_GREEN)}
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
