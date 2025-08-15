import { useId, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Activity, ChevronDown, ChevronUp, Globe, X } from 'lucide-react';
import { useT } from '~/utils/i18n';

export interface ToolDockProps {
  title: string;
  status: string;
  children?: React.ReactNode;
  defaultOpen?: boolean;
  onClose?: () => void;
}

/**
 * Minimaler, andockbarer Tool-Dock für Live-Previews/Logs.
 * - Minimierbar
 * - Sticky Darstellung (Eltern verantwortet die Positionierung)
 */
const ToolDock = ({ title, status, children, defaultOpen = true, onClose }: ToolDockProps) => {
  const t = useT();
  // Labels aus Locale, keine Fallbacks im Code
  const minimizeLbl = t('landing.agentDemo.toolDock.minimize');
  const maximizeLbl = t('landing.agentDemo.toolDock.maximize');
  const closeLbl = t('landing.agentDemo.toolDock.close');
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [open, setOpen] = useState<boolean>(defaultOpen);
  const bodyId = useId();

  return (
    <div
      className="overflow-hidden rounded-xl border border-gray-700 bg-gray-900/95 text-gray-100 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-gray-900/75"
      role="region"
      aria-label={title}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 px-3 py-2">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-300" />
          <span className="text-sm font-medium">{title}</span>
          <span className="text-[11px] text-gray-400" aria-live="polite">
            {status}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="rounded p-1 hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
            type="button"
            aria-label={open ? minimizeLbl : maximizeLbl}
            title={open ? minimizeLbl : maximizeLbl}
            aria-expanded={open}
            aria-controls={bodyId}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
          <button
            className="rounded p-1 hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60"
            type="button"
            aria-label={closeLbl}
            title={closeLbl}
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={bodyId}
            initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
            animate={prefersReducedMotion ? {} : { height: 'auto', opacity: 1 }}
            exit={prefersReducedMotion ? {} : { height: 0, opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ToolDock;
