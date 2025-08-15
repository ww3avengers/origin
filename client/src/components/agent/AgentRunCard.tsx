import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAgentRunStore } from '@/stores/agentRun';
import AgentStep from './AgentStep';

export interface AgentRunCardProps {
  runId?: string; // if undefined, uses currentRunId
  className?: string;
}

export const AgentRunCard: React.FC<AgentRunCardProps> = ({ runId, className }) => {
  const { t } = useTranslation();
  const currentRunId = useAgentRunStore((s) => s.currentRunId);
  const runs = useAgentRunStore((s) => s.runs);
  const id = runId ?? currentRunId;

  if (!id) return null;
  const run = runs[id];
  if (!run) return null;

  const isActive = run.status === 'running' || run.status === 'pending';

  return (
    <div
      className={`w-full rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className ?? ''}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" aria-hidden />
          <h4 className="text-sm font-semibold">{run.title}</h4>
        </div>
        <div className="text-xs text-zinc-500">
          {isActive ? String(t('agent.run.active')) : String(t('agent.run.finished'))}
        </div>
      </div>

      <div className="mb-3 h-2 w-full rounded bg-zinc-200 dark:bg-zinc-800">
        <div
          className="h-2 rounded bg-emerald-500 transition-all"
          style={{ width: `${run.progress}%` }}
        />
      </div>

      <div className="flex flex-col gap-2">
        {run.steps.map((s) => (
          <AgentStep key={s.id} step={s} />
        ))}
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        {/* Reserved for future: copy, retry, cancel */}
        {/* <button className="text-xs text-zinc-600 hover:underline">{t('agent.actions.copy')}</button> */}
      </div>
    </div>
  );
};

export default AgentRunCard;
