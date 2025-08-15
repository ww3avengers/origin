import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { AnnounceOptions } from '~/common';
import AnnouncerContext from '~/Providers/AnnouncerContext';
import { useT } from '~/utils/i18n';
import Announcer from './Announcer';

interface LiveAnnouncerProps {
  children: React.ReactNode;
}

const LiveAnnouncer: React.FC<LiveAnnouncerProps> = ({ children }) => {
  const [statusMessage, setStatusMessage] = useState('');
  const [logMessage, setLogMessage] = useState('');

  const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const t = useT();

  const events: Record<string, string | undefined> = useMemo(
    () => ({
      start: t('com_a11y_start'),
      end: t('com_a11y_end'),
      composing: t('com_a11y_ai_composing'),
    }),
    [t],
  );

  const announceStatus = useCallback((message: string) => {
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
    }

    setStatusMessage(message);

    statusTimeoutRef.current = setTimeout(() => {
      setStatusMessage('');
    }, 1000);
  }, []);

  const announceLog = useCallback((message: string) => {
    setLogMessage(message);
  }, []);

  const announcePolite = useCallback(
    ({ message, isStatus = false }: AnnounceOptions) => {
      const finalMessage = (events[message] ?? message).replace(/[*`_]/g, '');

      if (isStatus) {
        announceStatus(finalMessage);
      } else {
        announceLog(finalMessage);
      }
    },
    [events, announceStatus, announceLog],
  );

  const announceAssertive = announcePolite;

  const contextValue = {
    announcePolite,
    announceAssertive,
  };

  useEffect(() => {
    return () => {
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
    };
  }, []);

  return (
    <AnnouncerContext.Provider value={contextValue}>
      {children}
      <Announcer statusMessage={statusMessage} logMessage={logMessage} />
    </AnnouncerContext.Provider>
  );
};

export default LiveAnnouncer;
