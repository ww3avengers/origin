import React, { memo } from 'react';
import { TerminalSquareIcon } from 'lucide-react';
import { CheckboxButton } from '@librechat/client';
import { PermissionTypes, Permissions } from 'librechat-data-provider';
import { useLocalize, useHasAccess } from '~/hooks';
import { useBadgeRowContext } from '~/Providers';

function CodeInterpreter() {
  const localize = useLocalize();
  const { codeInterpreter, codeApiKeyForm } = useBadgeRowContext();
  const { toggleState: runCode, isToolEnabled, debouncedChange, isPinned } = codeInterpreter;
  const { badgeTriggerRef } = codeApiKeyForm;

  const canRunCode = useHasAccess({
    permissionType: PermissionTypes.RUN_CODE,
    permission: Permissions.USE,
  });

  if (!canRunCode) {
    return null;
  }

  return (
    (isToolEnabled || isPinned) && (
      <CheckboxButton
        ref={badgeTriggerRef}
        className="max-w-fit"
        checked={isToolEnabled}
        setValue={debouncedChange}
        label={localize('com_assistants_code_interpreter')}
        isCheckedClassName="border-brand-purple/40 bg-brand-purple/10 hover:bg-brand-purple/10"
        icon={<TerminalSquareIcon className="icon-md" />}
      />
    )
  );
}

export default memo(CodeInterpreter);
