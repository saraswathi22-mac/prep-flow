import { useState } from "react";

import { TECH_STACK_OPTIONS } from "../constants/interviewTaskOptions";
import { useNavigate } from "react-router-dom";

import { auth } from "../firebase/config";
import { saveTechStacks } from "../firebase/techStackStorage";

const MIN_TECH_STACKS = 5;
const MAX_TECH_STACKS = 10;

interface TechStackSetupProps {
  onComplete: () => void;
}

const TechStackSetup = ({ onComplete }: TechStackSetupProps) => {
  const [selectedTechStacks, setSelectedTechStacks] = useState<string[]>([]);
  const [customTechStack, setCustomTechStack] = useState("");

  const navigate = useNavigate();

  const [isSaving, setIsSaving] = useState(false);

  const canContinue =
    selectedTechStacks.length >= MIN_TECH_STACKS &&
    selectedTechStacks.length <= MAX_TECH_STACKS;

  const handleContinue = async () => {
    if (!canContinue || !auth.currentUser) return;

    try {
      setIsSaving(true);

      await saveTechStacks(auth.currentUser, selectedTechStacks);

      onComplete();
      navigate("/");
    } catch (error) {
      console.error("Failed to save tech stack", error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTechStack = (techStack: string) => {
    setSelectedTechStacks((current) => {
      if (current.includes(techStack)) {
        return current.filter((item) => item !== techStack);
      }

      if (current.length >= MAX_TECH_STACKS) {
        return current;
      }

      return [...current, techStack];
    });
  };

  const handleAddCustomTechStack = () => {
    const techStack = customTechStack.trim();

    if (!techStack) return;

    const alreadySelected = selectedTechStacks.some(
      (item) => item.toLowerCase() === techStack.toLowerCase(),
    );

    if (alreadySelected || selectedTechStacks.length >= MAX_TECH_STACKS) {
      return;
    }

    setSelectedTechStacks((current) => [...current, techStack]);
    setCustomTechStack("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-50 px-4 py-8">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-md sm:p-8">
        {/* Header */}
        <div className="text-center">
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

        {/* Selection count */}
        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">
            Available Technologies
          </p>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              canContinue
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {selectedTechStacks.length} / {MAX_TECH_STACKS} selected
          </span>
        </div>

        {/* Tech Stack Options */}
        <div className="mt-4 flex flex-wrap gap-3">
          {TECH_STACK_OPTIONS.map((techStack) => {
            const isSelected = selectedTechStacks.includes(techStack);
            const isDisabled =
              !isSelected && selectedTechStacks.length >= MAX_TECH_STACKS;

            return (
              <button
                key={techStack}
                type="button"
                onClick={() => toggleTechStack(techStack)}
                disabled={isDisabled}
                className={`
                  rounded-full
                  border
                  px-4
                  py-2
                  text-sm
                  font-medium
                  transition-all
                  ${
                    isSelected
                      ? "border-[#5A9C43] bg-[#5A9C43] text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-[#5A9C43] hover:bg-[#5A9C43]/5"
                  }
                  ${isDisabled ? "cursor-not-allowed opacity-40" : ""}
                `}
              >
                {isSelected ? "✓ " : ""}
                {techStack}
              </button>
            );
          })}
        </div>

        {/* Custom Tech Stack */}
        <div className="mt-8 border-t border-slate-100 pt-6">
          <p className="text-sm font-semibold text-slate-700">
            Don't see your technology?
          </p>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={customTechStack}
              onChange={(event) => setCustomTechStack(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleAddCustomTechStack();
                }
              }}
              placeholder="e.g. GraphQL"
              disabled={selectedTechStacks.length >= MAX_TECH_STACKS}
              className="
                flex-1
                rounded-lg
                border
                border-slate-200
                px-3
                py-2.5
                text-sm
                text-slate-700
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-[#5A9C43]
                focus:ring-2
                focus:ring-[#5A9C43]/20
                disabled:cursor-not-allowed
                disabled:bg-slate-50
              "
            />

            <button
              type="button"
              onClick={handleAddCustomTechStack}
              disabled={
                !customTechStack.trim() ||
                selectedTechStacks.length >= MAX_TECH_STACKS
              }
              className="
                rounded-lg
                bg-slate-800
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-slate-700
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              + Add
            </button>
          </div>
        </div>

        {/* Selected Technologies */}
        {selectedTechStacks.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Your Tech Stack
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {selectedTechStacks.map((techStack) => (
                <span
                  key={techStack}
                  className="
                    rounded-full
                    bg-slate-100
                    px-3
                    py-1.5
                    text-xs
                    font-medium
                    text-slate-700
                  "
                >
                  {techStack}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Continue */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue || isSaving}
          className="
    mt-8
    w-full
    rounded-xl
    bg-[#5A9C43]
    px-5
    py-3
    text-sm
    font-semibold
    text-white
    shadow-sm
    transition
    hover:bg-[#4f8d3a]
    disabled:cursor-not-allowed
    disabled:bg-slate-200
    disabled:text-slate-400
    disabled:shadow-none
  "
        >
          {isSaving ? "Saving..." : "Continue →"}
        </button>

        {!canContinue && (
          <p className="mt-3 text-center text-xs text-slate-400">
            Select at least {MIN_TECH_STACKS} technologies to continue.
          </p>
        )}
      </div>
    </div>
  );
};

export default TechStackSetup;
