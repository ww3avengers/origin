import { create } from 'zustand';

export type AgentStepStatus = 'pending' | 'running' | 'done' | 'failed' | 'canceled';

export interface AgentStep {
  id: string;
  title: string;
  status: AgentStepStatus;
  startedAt?: number;
  finishedAt?: number;
  output?: string;
  error?: string;
}

export interface AgentRun {
  id: string;
  title: string;
  progress: number; // 0-100
  steps: AgentStep[];
  startedAt: number;
  finishedAt?: number;
  status: AgentStepStatus;
}

interface AgentRunState {
  runs: Record<string, AgentRun>;
  currentRunId?: string;
  // actions
  startRun: (run: Pick<AgentRun, 'id' | 'title'>) => void;
  startStep: (runId: string, step: Pick<AgentStep, 'id' | 'title'>) => void;
  updateStep: (runId: string, stepId: string, patch: Partial<AgentStep>) => void;
  finishStep: (runId: string, stepId: string, status?: AgentStepStatus) => void;
  setProgress: (runId: string, progress: number) => void;
  finishRun: (runId: string, status?: AgentStepStatus) => void;
  setCurrentRun: (runId?: string) => void;
  resetRun: (runId: string) => void;
}

export const useAgentRunStore = create<AgentRunState>((set, get) => ({
  runs: {},
  currentRunId: undefined,
  startRun: ({ id, title }) => {
    const now = Date.now();
    set((state) => ({
      runs: {
        ...state.runs,
        [id]: {
          id,
          title,
          progress: 0,
          steps: [],
          startedAt: now,
          status: 'running',
        },
      },
      currentRunId: id,
    }));
  },
  startStep: (runId, { id, title }) => {
    const now = Date.now();
    const run = get().runs[runId];
    if (!run) return;
    const step: AgentStep = { id, title, status: 'running', startedAt: now };
    set((state) => ({
      runs: {
        ...state.runs,
        [runId]: { ...run, steps: [...run.steps, step] },
      },
    }));
  },
  updateStep: (runId, stepId, patch) => {
    const run = get().runs[runId];
    if (!run) return;
    set((state) => ({
      runs: {
        ...state.runs,
        [runId]: {
          ...run,
          steps: run.steps.map((s) => (s.id === stepId ? { ...s, ...patch } : s)),
        },
      },
    }));
  },
  finishStep: (runId, stepId, status = 'done') => {
    const now = Date.now();
    const run = get().runs[runId];
    if (!run) return;
    set((state) => ({
      runs: {
        ...state.runs,
        [runId]: {
          ...run,
          steps: run.steps.map((s) => (s.id === stepId ? { ...s, status, finishedAt: now } : s)),
        },
      },
    }));
  },
  setProgress: (runId, progress) => {
    const run = get().runs[runId];
    if (!run) return;
    set((state) => ({
      runs: { ...state.runs, [runId]: { ...run, progress } },
    }));
  },
  finishRun: (runId, status = 'done') => {
    const now = Date.now();
    const run = get().runs[runId];
    if (!run) return;
    set((state) => ({
      runs: { ...state.runs, [runId]: { ...run, finishedAt: now, status, progress: 100 } },
    }));
  },
  setCurrentRun: (runId) => set({ currentRunId: runId }),
  resetRun: (runId) => {
    set((state) => {
      const { [runId]: _, ...rest } = state.runs;
      const nextCurrent = state.currentRunId === runId ? undefined : state.currentRunId;
      return { runs: rest, currentRunId: nextCurrent };
    });
  },
}));

// Simple helper to simulate a demo run (optional)
export async function demoAgentRun() {
  const runId = `run_${Date.now()}`;
  const { startRun, startStep, finishStep, setProgress, finishRun } = useAgentRunStore.getState();
  startRun({ id: runId, title: 'Agent Demo' });

  startStep(runId, { id: 'market', title: 'Marketing-Analyse' });
  await new Promise((r) => setTimeout(r, 800));
  setProgress(runId, 20);
  finishStep(runId, 'market');

  startStep(runId, { id: 'stats', title: 'Datenstatistik' });
  await new Promise((r) => setTimeout(r, 900));
  setProgress(runId, 55);
  finishStep(runId, 'stats');

  startStep(runId, { id: 'report', title: 'Bericht erstellen' });
  await new Promise((r) => setTimeout(r, 700));
  setProgress(runId, 85);
  finishStep(runId, 'report');

  await new Promise((r) => setTimeout(r, 300));
  finishRun(runId);
  return runId;
}
