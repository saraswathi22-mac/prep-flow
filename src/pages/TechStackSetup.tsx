import { useNavigate } from "react-router-dom";

import TechStackSelector from "../components/TechStackSelector";

import { auth } from "../firebase/config";
import { completeTechStackSetup } from "../firebase/techStackStorage";

interface TechStackSetupProps {
  onComplete: () => void;
}

const TechStackSetup = ({ onComplete }: TechStackSetupProps) => {
  const navigate = useNavigate();

  const handleSave = async (techStacks: string[]) => {
    if (!auth.currentUser) return;

    await completeTechStackSetup(auth.currentUser, techStacks);

    onComplete();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-50 px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <img
            src="/prep-flow.png"
            alt="PrepFlow"
            className="mx-auto h-14 w-14 object-contain"
          />

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Choose your Tech Stack
          </h1>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500 sm:text-base">
            Select 5–10 technologies you want to practice. These will be used to
            personalize your Tech Tasks.
          </p>
        </div>

        <TechStackSelector
          onSave={handleSave}
          saveLabel="Continue →"
          savingLabel="Saving..."
        />
      </div>
    </div>
  );
};

export default TechStackSetup;
