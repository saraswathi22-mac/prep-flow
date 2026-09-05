import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { toast } from "sonner";

import { createAccountFromGuest } from "../firebase/auth";

const BRAND_GREEN = "#5A9C43" as const;
const BRAND_GREEN_HOVER = "#4C8A38" as const;

interface CreateAccountProps {
  onNameUpdated: (name: string) => void;
  onAccountCreated: () => void;
}

function CreateAccount({
  onNameUpdated,
  onAccountCreated,
}: CreateAccountProps) {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getErrorMessage = (err: FirebaseError): string => {
    switch (err.code) {
      case "auth/invalid-email":
        return "Invalid email format";

      case "auth/email-already-in-use":
        return "An account with this email already exists";

      case "auth/weak-password":
        return "Password should be at least 6 characters";

      case "auth/requires-recent-login":
        return "Please start a new guest session and try again.";

      default:
        return "Something went wrong. Please try again.";
    }
  };

  const isFormValid =
    name.trim() !== "" && email.trim() !== "" && password.trim() !== "";

  const handleSubmit = async (): Promise<void> => {
    if (loading || !isFormValid) return;

    setLoading(true);

    try {
      const user = await createAccountFromGuest({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      onNameUpdated(name.trim());
      onAccountCreated();

      toast.success(`Welcome, ${user.displayName || name.trim()}!`, {
        description: "Your guest account has been upgraded successfully.",
      });
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        toast.error(getErrorMessage(err), {
          duration: 4000,
        });
      } else if (err instanceof Error) {
        toast.error(err.message, {
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

  return (
    <div className="mx-auto w-full max-w-xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Back to dashboard"
        >
          ←
        </button>

        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Create an Account
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Create an account to keep your PrepFlow progress.
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-800">
          Save your progress
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Your existing tasks and tech stack will be kept when you create your
          account.
        </p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
          className="mt-6 space-y-4"
        >
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#5A9C43] focus:ring-2 focus:ring-[#5A9C43]/20"
          />

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#5A9C43] focus:ring-2 focus:ring-[#5A9C43]/20"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(event) => {
                const value = event.target.value;
                setPassword(value);

                if (!value) {
                  setShowPassword(false);
                }
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-16 text-sm outline-none focus:border-[#5A9C43] focus:ring-2 focus:ring-[#5A9C43]/20"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={!password.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 hover:text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full rounded-lg py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              backgroundColor: BRAND_GREEN,
            }}
            onMouseEnter={(event) => {
              if (!loading && isFormValid) {
                event.currentTarget.style.backgroundColor = BRAND_GREEN_HOVER;
              }
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.backgroundColor = BRAND_GREEN;
            }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          ✓ Your current tasks and tech stack will stay with you.
        </p>
      </section>
    </div>
  );
}

export default CreateAccount;
