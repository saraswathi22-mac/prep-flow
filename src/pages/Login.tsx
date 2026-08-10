import { useState } from "react";
import { login, signup } from "../firebase/auth";
import { FirebaseError } from "firebase/app";
import type { KeyboardEvent } from "react";
import { toast } from "sonner";

function Login() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

      case "auth/user-not-found":
        return "No account found with this email";

      case "auth/wrong-password":
        return "Incorrect password";

      default:
        return "Something went wrong. Please try again.";
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (loading) return;

    setLoading(true);

    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        const user = await signup({ name, email, password });

        toast.success(`Welcome, ${user.displayName || name}!`, {
          description: "Your account is ready.",
        });
      }
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        toast.error(getErrorMessage(err), { duration: 4000 });
      } else {
        toast.error("Something went wrong. Please try again.", {
          duration: 4000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
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
        <div className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition-all focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          )}

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition-all focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-16 text-slate-700 outline-none transition-all focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
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
            {loading
              ? "Please wait..."
              : isLogin
                ? "Sign In"
                : "Create Account"}
          </button>
        </div>

        {/* Features */}
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-slate-500">
          <span>✓ Daily Tracking</span>
          <span>✓ Mock Interviews</span>
          <span>✓ Progress Insights</span>
        </div>

        {/* Toggle */}
        <div className="mt-8 text-center">
          <button
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
