"use client";

import React, { useState } from "react";
import {
  EcoTask,
  ECO_TASK_CATALOGUE,
  LivingSituation,
  LIVING_PERSONAS,
} from "../../config/ecoverse";
import {
  CheckCircle2,
  RefreshCw,
  XCircle,
  Zap,
  Sparkles,
  Award,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface EcoQuestBoardProps {
  currentPersona: LivingSituation;
  onTaskCompleted: (task: EcoTask) => void;
  onPersonaChange?: (newPersona: LivingSituation) => void;
}

export const EcoQuestBoard: React.FC<EcoQuestBoardProps> = ({
  currentPersona,
  onTaskCompleted,
  onPersonaChange,
}) => {
  // Filter tasks suitable for active persona
  const suitableTasks = ECO_TASK_CATALOGUE.filter((t) =>
    t.suitablePersonas.includes(currentPersona)
  );

  // Initialize with the first 3 suitable tasks
  const [activeTasks, setActiveTasks] = useState<EcoTask[]>(suitableTasks.slice(0, 3));
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [celebrationTask, setCelebrationTask] = useState<EcoTask | null>(null);

  // Complete a task
  const handleComplete = (task: EcoTask) => {
    if (completedIds.includes(task.id)) return;
    setCompletedIds((prev) => [...prev, task.id]);
    setCelebrationTask(task);
    onTaskCompleted(task);
    setTimeout(() => {
      setCelebrationTask(null);
    }, 4000);
  };

  // Skip a task (replaces it from pool)
  const handleSkip = (taskId: string) => {
    handleSwap(taskId);
  };

  // Swap / Replace task with an unselected suitable task
  const handleSwap = (currentTaskId: string) => {
    const existingIds = new Set(activeTasks.map((t) => t.id));
    const availablePool = suitableTasks.filter((t) => !existingIds.has(t.id));

    if (availablePool.length === 0) {
      // If pool exhausted, wrap around from entire catalogue
      const genericPool = ECO_TASK_CATALOGUE.filter((t) => !existingIds.has(t.id));
      if (genericPool.length > 0) {
        const replacement = genericPool[0];
        setActiveTasks((prev) => prev.map((t) => (t.id === currentTaskId ? replacement : t)));
      }
      return;
    }

    const replacement = availablePool[Math.floor(Math.random() * availablePool.length)];
    setActiveTasks((prev) => prev.map((t) => (t.id === currentTaskId ? replacement : t)));
  };

  const personaMeta = LIVING_PERSONAS[currentPersona];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Header & Persona Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tealbrand-50 dark:bg-tealbrand-950/40 text-tealbrand-700 dark:text-teal-400 text-xs font-bold">
            <Zap className="w-3.5 h-3.5" />
            Personalised EcoQuests · Context-Aware
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Today's Missions for You
          </h3>
          <p className="text-xs text-slate-500">
            Micro-tasks tailored to your actual living constraints. Swap anytime if today doesn't suit.
          </p>
        </div>

        {/* Persona Switcher Pill */}
        {onPersonaChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Profile:</span>
            <select
              value={currentPersona}
              onChange={(e) => onPersonaChange(e.target.value as LivingSituation)}
              className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-1.5 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-tealbrand-500"
            >
              {Object.values(LIVING_PERSONAS).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Rationale Banner */}
      <div className="mb-5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
        <div>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {personaMeta.label}:
          </span>{" "}
          <span>{personaMeta.description}</span>
        </div>
        <div className="text-[11px] font-bold text-tealbrand-600 dark:text-teal-400 whitespace-nowrap ml-2">
          {completedIds.length} of {activeTasks.length} Completed
        </div>
      </div>

      {/* Celebration Notification */}
      {celebrationTask && (
        <div className="mb-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <div>
              <div className="font-bold text-xs">Mission Completed! 🎉</div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-300">
                You earned <strong>+{celebrationTask.credits} LiFE Credits</strong> and prevented{" "}
                <strong>{celebrationTask.co2SavedKg} kg CO₂</strong>!
              </div>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
            +{celebrationTask.credits}
          </span>
        </div>
      )}

      {/* Daily Task Cards */}
      <div className="space-y-3">
        {activeTasks.map((task) => {
          const isDone = completedIds.includes(task.id);
          return (
            <div
              key={task.id}
              className={`p-4 rounded-2xl border transition-all ${
                isDone
                  ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60 opacity-80"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-tealbrand-300 dark:hover:border-tealbrand-800"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {task.category}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      +{task.credits} Credits
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      · {task.co2SavedKg} kg CO₂
                    </span>
                  </div>

                  <h4
                    className={`font-bold text-sm text-slate-900 dark:text-white ${
                      isDone ? "line-through text-slate-500 dark:text-slate-400" : ""
                    }`}
                  >
                    {task.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {task.description}
                  </p>

                  <div className="mt-2 text-[11px] text-tealbrand-700 dark:text-teal-400/90 font-medium italic">
                    💡 Why this fits: {task.rationale}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {isDone ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Completed
                    </div>
                  ) : (
                    <>
                      {/* Swap button */}
                      <button
                        type="button"
                        onClick={() => handleSwap(task.id)}
                        title="Swap with another task"
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>

                      {/* Complete button */}
                      <button
                        type="button"
                        onClick={() => handleComplete(task)}
                        className="px-3.5 py-1.5 rounded-xl bg-tealbrand-600 hover:bg-tealbrand-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
