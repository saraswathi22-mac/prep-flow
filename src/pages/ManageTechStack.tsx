import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import TechStackSelector from "../components/TechStackSelector";

import { auth } from "../firebase/config";
import { loadTechStacks, saveTechStacks } from "../firebase/techStackStorage";

const ManageTechStack = () => {
  const navigate = useNavigate();

  const [techStacks, setTechStacks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserTechStacks = async () => {
      if (!auth.currentUser) {
        navigate("/");
        return;
      }

      try {
        const savedTechStacks = await loadTechStacks(auth.currentUser);

        setTechStacks(savedTechStacks);
      } catch (error) {
        console.error("Failed to load tech stacks", error);

        toast.error("Failed to load your tech stack");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserTechStacks();
  }, [navigate]);

  const handleSave = async (updatedTechStacks: string[]) => {
    if (!auth.currentUser) return;

    try {
      await saveTechStacks(auth.currentUser, updatedTechStacks);

      toast.success("Tech stack updated successfully");

      navigate("/");
    } catch (error) {
      console.error("Failed to save tech stacks", error);

      toast.error("Failed to update your tech stack");

      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-blue-50 px-4">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#5A9C43]" />

          <p className="mt-3 text-sm text-slate-500">
            Loading your tech stack...
          </p>
        </div>
      </div>
    );
  }

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
            Manage your Tech Stack
          </h1>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500 sm:text-base">
            Update the technologies you want to practice. Your changes will be
            reflected in your Tech Tasks.
          </p>
        </div>

        <TechStackSelector
          initialTechStacks={techStacks}
          onSave={handleSave}
          saveLabel="Save Changes"
          savingLabel="Saving..."
        />

        <button
          type="button"
          onClick={() => navigate("/")}
          className="
            mx-auto
            mt-4
            block
            text-sm
            font-medium
            text-slate-500
            transition-colors
            hover:text-slate-700
          "
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ManageTechStack;
