import { useState } from "react";
import { connectGoogleAfterSignup } from "../firebase/auth";
import { FirebaseError } from "firebase/app";
import { toast } from "sonner";

interface ConnectGooglePromptProps {
  // Called once the step is resolved — either Google got connected, or
  // the user chose to skip. App.tsx decides what happens next (navigate
  // home, show the welcome toast, etc.).
  onDone: () => void;
}

// Rendered by App.tsx as its own step, AFTER the user is authenticated
// (currentUser exists) but BEFORE they enter the main app — never as
// state inside Login.tsx. Login unmounts the instant Firebase auth
// state changes (i.e. immediately on signup/login), so anything meant
// to show right after auth has to live at the App level, not inside
// Login's own render.
function ConnectGooglePrompt({ onDone }: ConnectGooglePromptProps) {
  const [loading, setLoading] = useState(false);

  const handleConnect = async (): Promise<void> => {
    if (loading) return;

    setLoading(true);

    try {
      await connectGoogleAfterSignup();

      toast.success("Google connected successfully.", {
        description: "You can now sign in with Google or your password.",
      });

      onDone();
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case "auth/popup-closed-by-user":
            toast.error("Google connection was cancelled.");
            break;

          case "auth/credential-already-in-use":
            toast.error(
              "This Google account is already connected to another account.",
            );
            break;

          case "auth/provider-already-linked":
            toast.info("Google is already connected to your account.");
            onDone();
            break;

          default:
            toast.error("Something went wrong. Please try again.", {
              duration: 4000,
            });
        }
      } else {
        toast.error("Unable to connect Google. Please try again.", {
          duration: 4000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const BRAND_GREEN = "#5A9C43" as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/80 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8 text-center">
        <div className="text-center mb-8">
          <img
            src="/prep-flow.png"
            alt="PrepFlow"
            className="mx-auto h-16 w-16 object-contain mb-2"
          />

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            PrepFlow
          </h1>

          <p className="mt-3 text-sm text-slate-600">
            Your interview preparation companion.
          </p>
        </div>

        <h2 className="text-xl font-semibold text-slate-700">
          Connect your Google account
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Connect Google to your PrepFlow account so you can sign in with either
          Google or your password.
        </p>

        <button
          type="button"
          onClick={() => void handleConnect()}
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 font-medium text-slate-700 transition-all duration-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Connecting..." : "Continue with Google"}
        </button>

        <button
          type="button"
          onClick={onDone}
          disabled={loading}
          className="mt-3 w-full text-sm font-medium text-slate-500 hover:text-slate-700 disabled:opacity-50"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

export default ConnectGooglePrompt;
