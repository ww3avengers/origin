import { memo } from 'react';
import { PermissionTypes, Permissions } from 'librechat-data-provider';
import HoverCardSettings from '~/components/Nav/SettingsTabs/HoverCardSettings';
import { useHasAccess } from '~/hooks';
import { useT } from '~/utils/i18n';
import SlashCommandSwitch from './SlashCommandSwitch';
import PlusCommandSwitch from './PlusCommandSwitch';
import AtCommandSwitch from './AtCommandSwitch';

function Commands() {
  const t = useT();

  const hasAccessToPrompts = useHasAccess({
    permissionType: PermissionTypes.PROMPTS,
    permission: Permissions.USE,
  });

  const hasAccessToMultiConvo = useHasAccess({
    permissionType: PermissionTypes.MULTI_CONVO,
    permission: Permissions.USE,
  });

  return (
    <div className="space-y-4 p-1">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-medium text-text-primary">{t('com_nav_chat_commands')}</h3>
        <HoverCardSettings side="bottom" text="com_nav_chat_commands_info" />
      </div>
      {/* Card-like container to match other settings sections */}
      <div className="rounded-xl border border-border-medium bg-background/40 p-3 shadow-sm">
        <div className="flex flex-col gap-3 text-sm text-text-primary">
          <AtCommandSwitch />
          {hasAccessToMultiConvo === true && (
            <>
              <div className="h-px bg-border-medium" role="none" />
              <PlusCommandSwitch />
            </>
          )}
          {hasAccessToPrompts === true && (
            <>
              <div className="h-px bg-border-medium" role="none" />
              <SlashCommandSwitch />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(Commands);
