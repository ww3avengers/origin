import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAgentRunStore } from '@/stores/agentRun';
import type { AgentRun } from '@/stores/agentRun';

export interface AgentRunPanelProps {
  className?: string;
}

export const AgentRunPanel: React.FC<AgentRunPanelProps> = ({ className }) => {
  const { t } = useTranslation();
  const { runs, currentRunId, setCurrentRun } = useAgentRunStore((s) => ({
    runs: s.runs,
    currentRunId: s.currentRunId,
    setCurrentRun: s.setCurrentRun,
  }));

  const runEntries = (Object.values(runs) as AgentRun[]).sort((a, b) => b.startedAt - a.startedAt);

  return (
    <aside
      className={`rounded-md border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900 ${className ?? ''}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {t('agent.panel.title') as string}
        </h3>
        <div className="text-[10px] text-zinc-500">{runEntries.length}</div>
      </div>
      <div className="flex max-h-64 flex-col gap-2 overflow-auto">
        {runEntries.length === 0 ? (
          <div className="text-xs text-zinc-500">{t('agent.panel.empty') as string}</div>
        ) : (
          runEntries.map((run) => {
            const isActive = run.status === 'running' || run.status === 'pending';
            return (
              <button
                key={run.id}
                onClick={() => setCurrentRun(run.id)}
                className={`flex w-full items-center justify-between rounded-md border p-2 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 ${
                  currentRunId === run.id
                    ? 'border-emerald-400'
                    : 'border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <div>
                  <div className="text-xs font-medium">{run.title}</div>
                  <div className="mt-0.5 text-[10px] text-zinc-500">
                    {isActive
                      ? (t('agent.run.active') as string)
                      : (t('agent.run.finished') as string)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-20 rounded bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-2 rounded bg-emerald-500"
                      style={{ width: `${run.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-600 dark:text-zinc-400">
                    {run.progress}%
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default AgentRunPanel;
