import { forwardRef } from 'react';
import type { ForwardedRef } from 'react';
import { CheckIcon } from 'lucide-react';
import { DialogButton } from '@librechat/client';
import InlineSpinner from '~/components/ui/InlineSpinner';
import HoverCardSettings from './HoverCardSettings';
import type { TDangerButtonProps } from '~/common';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils';

const DangerButton = (props: TDangerButtonProps, ref: ForwardedRef<HTMLButtonElement>) => {
  const {
    id,
    onClick,
    mutation,
    disabled,
    confirmClear,
    infoTextCode,
    actionTextCode,
    className = '',
    showText = true,
    dataTestIdInitial,
    dataTestIdConfirm,
    infoDescriptionCode,
    confirmActionTextCode = 'com_ui_confirm_action',
  } = props;
  const localize = useLocalize();

  const renderMutation = (node: React.ReactNode | string) => {
    if (mutation && mutation.isLoading) {
      return <InlineSpinner size="sm" ariaLabel={localize`com_ui_loading`} />;
    }
    return node;
  };

  return (
    <div className="flex items-center justify-between">
      {showText && (
        <div className={`flex items-center ${infoDescriptionCode ? 'space-x-2' : ''}`}>
          <div>{localize(infoTextCode as string)}</div>
          {infoDescriptionCode && <HoverCardSettings side="bottom" text={infoDescriptionCode} />}
        </div>
      )}
      <DialogButton
        id={id}
        ref={ref}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          'btn relative border-none bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-700',
          className,
        )}
      >
        {confirmClear ? (
          <div
            className="flex w-full items-center justify-center gap-2"
            id={`${id}-text`}
            data-testid={dataTestIdConfirm}
          >
            {renderMutation(<CheckIcon className="h-5 w-5" />)}
            {mutation && mutation.isLoading ? null : localize(confirmActionTextCode as string)}
          </div>
        ) : (
          <div
            className="flex w-full items-center justify-center gap-2"
            id={`${id}-text`}
            data-testid={dataTestIdInitial}
          >
            {renderMutation(localize(actionTextCode as string))}
          </div>
        )}
      </DialogButton>
    </div>
  );
};

export default forwardRef(DangerButton);
