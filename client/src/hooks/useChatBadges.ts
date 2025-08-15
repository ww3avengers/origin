import { useMemo } from 'react';
import { useRecoilCallback } from 'recoil';
import { useRecoilValue } from 'recoil';
import { MessageCircleDashed, Box } from 'lucide-react';
import type { BadgeItem } from '~/common';
import { useT } from '~/utils/i18n';
import store from '~/store';

interface ChatBadgeConfig {
  id: string;
  icon: typeof Box;
  label: string;
  atom?: any;
}

const badgeConfig: ReadonlyArray<ChatBadgeConfig> = [
  // {
  //   id: '1',
  //   icon: Box,
  //   label: 'com_ui_artifacts',
  //   atom: store.codeArtifacts,
  // },
  // TODO: add more badges here (missing store atoms)
];

export default function useChatBadges(): BadgeItem[] {
  const t = useT();
  const activeBadges = useRecoilValue(store.chatBadges) as Array<{ id: string }>;
  const activeBadgeIds = useMemo(
    () => new Set(activeBadges.map((badge) => badge.id)),
    [activeBadges],
  );
  const allBadges = useMemo(() => {
    return (
      badgeConfig.map((cfg) => ({
        id: cfg.id,
        label: t(cfg.label as string),
        icon: cfg.icon,
        atom: cfg.atom,
        isAvailable: activeBadgeIds.has(cfg.id),
      })) || []
    );
  }, [activeBadgeIds, t]);
  return allBadges;
}

export function useResetChatBadges() {
  return useRecoilCallback(
    ({ reset }) =>
      () => {
        badgeConfig.forEach(({ atom }) => reset(atom));
        reset(store.chatBadges);
      },
    [],
  );
}
