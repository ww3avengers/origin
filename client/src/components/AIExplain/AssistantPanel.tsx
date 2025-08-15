import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getActiveBreakpoint } from '@/lib/ai-explain/breakpoints';
import { getAllSections } from '@/lib/ai-explain/registry';
import { useVisibleSections } from '@/lib/ai-explain/useVisibleSections';

const panelBase = 'fixed bottom-5 right-5 z-[120]';

export default function AssistantPanel() {
  const [open, setOpen] = useState(false);
  const visible = useVisibleSections();
  const bp = getActiveBreakpoint();

  const docs = useMemo(() => getAllSections(), []);

  const explanation = useMemo(() => {
    const names = visible.map((v) => v.title || v.id).join(', ');
    return {
      title: 'Seitenüberblick',
      body: `Aktiver Breakpoint: ${bp}. Sichtbar: ${names || 'keine Sektionen erkannt'}.`,
    };
  }, [visible, bp]);

  return (
    <div className={panelBase} aria-label="AI Explain Assistant">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-full bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-indigo-500"
      >
        {open ? 'Schließen' : 'Erklären'}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="mt-3 w-[320px] rounded-lg border border-gray-800 bg-gray-900/95 p-4 text-gray-100 shadow-2xl backdrop-blur sm:w-[380px]"
            role="dialog"
            aria-modal="true"
          >
            <h3 className="mb-2 text-sm font-semibold text-indigo-300">{explanation.title}</h3>
            <p className="mb-3 text-sm text-gray-300">{explanation.body}</p>

            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {docs.map((d) => (
                <div key={d.section.id} className="rounded-md border border-gray-800 p-2">
                  <div className="text-sm font-medium">{d.section.title}</div>
                  <div className="text-xs text-gray-400">{d.section.description}</div>
                  {d.section.breakpoints && (
                    <div className="mt-1 text-xs text-gray-500">
                      Varianten:{' '}
                      {Object.entries(d.section.breakpoints)
                        .map(([k, v]) => `${k}:${v?.layout}`)
                        .join(' · ')}
                    </div>
                  )}
                </div>
              ))}
              {docs.length === 0 && (
                <div className="text-xs text-gray-500">Noch keine Metadaten registriert.</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
