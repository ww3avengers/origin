import React from 'react';
import { Button } from '@librechat/client';
import { useT } from '~/utils/i18n';

type ActionButtonProps = {
  onClick: () => void;
};

export default function ActionButton({ onClick }: ActionButtonProps) {
  const t = useT();
  return (
    <div className="w-32">
      <Button
        className="w-full rounded-md border border-black bg-white p-0 text-black hover:bg-black hover:text-white"
        onClick={onClick}
      >
        {/* Action Button */}
        {t('com_ui_action_button')}
      </Button>
    </div>
  );
}
