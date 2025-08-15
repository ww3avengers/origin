import React from 'react';
import { useTranslation } from 'react-i18next';
import type { AgentStep as TAgentStep } from '@/stores/agentRun';

const statusColor: Record<TAgentStep['status'], string> = {
  pending: 'bg-gray-200 text-gray-700',
  running: 'bg-blue-100 text-blue-700',
  done: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
  canceled: 'bg-yellow-100 text-yellow-800',
};

export interface AgentStepProps {
  step: TAgentStep;
}

export const AgentStep: React.FC<AgentStepProps> = ({ step }) => {
  const { t } = useTranslation();
  const fallbackByStatus: Record<TAgentStep['status'], string> = {
    pending: 'Wartet',
    running: 'Läuft…',
    done: 'Fertig',
    failed: 'Fehlgeschlagen',
    canceled: 'Abgebrochen',
  };
  const safeT = (key: string, fallback: string) => {
    const v = (t as any)(key);
    return typeof v === 'string' && v.trim() ? v : fallback;
  };
  const statusLabel = safeT(`agent.step.${step.status}`, fallbackByStatus[step.status]);

  return (
    <div className="rounded-md border border-gray-200 p-3 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{step.title}</div>
        <span
          className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${statusColor[step.status]}`}
        >
          {statusLabel}
        </span>
      </div>
      {step.output && (
        <pre className="mt-2 whitespace-pre-wrap text-xs text-gray-700 dark:text-gray-300">
          {step.output}
        </pre>
      )}
      {step.error && <div className="mt-2 text-xs text-red-600">{step.error}</div>}
    </div>
  );
};

export default AgentStep;
