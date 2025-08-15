import React, { useState } from 'react';
import { RefreshCcw, ShieldX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TUser } from 'librechat-data-provider';
import {
  OGDialog,
  OGDialogContent,
  OGDialogTitle,
  OGDialogTrigger,
  Button,
  Label,
  TooltipAnchor,
  useToastContext,
} from '@librechat/client';
import InlineSpinner from '~/components/ui/InlineSpinner';
import { useRegenerateBackupCodesMutation } from '~/data-provider';
import { useAuthContext, useLocalize } from '~/hooks';
import { useSetRecoilState } from 'recoil';
import store from '~/store';
import { Badge } from '~/components/ui/Badge';

// Local types to avoid fragile external named exports and fix implicit any lints
type BackupCode = {
  codeHash: string;
  used: boolean;
  usedAt: string | null; // ISO string from API; formatted via toLocaleDateString
};

type RegenerateBackupCodesResponse = {
  backupCodes: string[]; // plain codes for download
  backupCodesHash: string[]; // hashed codes for storing in user
};

const BackupCodesItem: React.FC = () => {
  const localize = useLocalize();
  const { user } = useAuthContext();
  const { showToast } = useToastContext();
  const setUser = useSetRecoilState(store.user);
  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);
  const [liveMessage, setLiveMessage] = useState<string>('');

  const { mutate: regenerateBackupCodes, isLoading } = useRegenerateBackupCodesMutation();

  const fetchBackupCodes = (auto: boolean = false) => {
    regenerateBackupCodes(undefined, {
      onSuccess: (data: RegenerateBackupCodesResponse) => {
        const newBackupCodes: BackupCode[] = data.backupCodesHash.map((codeHash: string) => ({
          codeHash,
          used: false,
          usedAt: null,
        }));

        setUser((prev: TUser) => ({ ...prev, backupCodes: newBackupCodes }) as TUser);
        showToast({
          message: localize('com_ui_backup_codes_regenerated'),
          status: 'success',
        });

        // Trigger file download only when user explicitly clicks the button.
        if (!auto && newBackupCodes.length) {
          const codesString = data.backupCodes.join('\n');
          const now = new Date();
          const isoDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
            now.getDate(),
          ).padStart(2, '0')}`;
          const blob = new Blob([codesString], { type: 'text/plain;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `backup-codes_${isoDate}.txt`;
          a.click();
          URL.revokeObjectURL(url);
        }
      },
      onError: () =>
        showToast({
          message: localize('com_ui_backup_codes_regenerate_error'),
          status: 'error',
        }),
    });
  };

  const handleRegenerate = () => {
    fetchBackupCodes(false);
  };

  return (
    <OGDialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Label className="font-light">{localize('com_ui_backup_codes')}</Label>
        </div>
        <OGDialogTrigger asChild>
          <Button aria-label={localize('com_ui_show')} variant="outline">
            {localize('com_ui_show')}
          </Button>
        </OGDialogTrigger>
      </div>

      <OGDialogContent className="w-11/12 max-w-lg">
        <OGDialogTitle className="mb-6 text-2xl font-semibold">
          {localize('com_ui_backup_codes')}
        </OGDialogTitle>
        {/* Local aria-live region for screen readers */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">{liveMessage}</div>

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-4"
          >
            {Array.isArray(user?.backupCodes) && user?.backupCodes.length > 0 ? (
              <>
                <ul role="list" className="grid grid-cols-2 gap-4">
                  {user?.backupCodes.map((code: BackupCode, index: number) => {
                    const isUsed = code.used;
                    const usedDate = code.usedAt ? new Date(code.usedAt).toLocaleDateString() : '';
                    const description = isUsed
                      ? `${localize('com_ui_backup_code')} #${index + 1} — ${localize('com_ui_used')}${
                          usedDate ? ` (${usedDate})` : ''
                        }`
                      : `${localize('com_ui_backup_code')} #${index + 1} — ${localize('com_ui_not_used')}`;

                    return (
                      <motion.li
                        key={code.codeHash}
                        tabIndex={0}
                        aria-label={description}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onFocus={() => {
                          setLiveMessage(description);
                        }}
                        className={`flex flex-col rounded-xl border p-4 backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          isUsed
                            ? 'border-red-200 bg-red-50/80 dark:border-red-800 dark:bg-red-900/20'
                            : 'border-green-200 bg-green-50/80 dark:border-green-800 dark:bg-green-900/20'
                        } `}
                      >
                        <div className="flex items-center justify-between" aria-hidden="true">
                          <span className="text-sm font-medium text-text-secondary">
                            #{index + 1}
                          </span>
                          <TooltipAnchor
                            description={
                              code.usedAt ? new Date(code.usedAt).toLocaleDateString() : ''
                            }
                            disabled={!isUsed}
                            focusable={false}
                            className={isUsed ? 'cursor-pointer' : 'cursor-default'}
                            render={
                              <Badge
                                size="xs"
                                tone="soft"
                                variant={isUsed ? 'danger' : 'success'}
                                aria-live="polite"
                              >
                                {isUsed ? localize('com_ui_used') : localize('com_ui_not_used')}
                              </Badge>
                            }
                          />
                        </div>
                      </motion.li>
                    );
                  })}
                </ul>
                <div className="mt-12 flex justify-center">
                  <Button
                    onClick={handleRegenerate}
                    disabled={isLoading}
                    variant="default"
                    className="px-8 py-3 transition-all disabled:opacity-50"
                    aria-busy={isLoading}
                    aria-disabled={isLoading}
                  >
                    {isLoading ? (
                      <InlineSpinner size="sm" ariaLabel={localize`com_ui_loading`} />
                    ) : (
                      <RefreshCcw className="mr-2 h-4 w-4" />
                    )}
                    {isLoading
                      ? localize('com_ui_regenerating')
                      : localize('com_ui_regenerate_backup')}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 p-6 text-center">
                <ShieldX className="h-12 w-12 text-text-primary" />
                <p className="text-lg text-text-secondary">{localize('com_ui_no_backup_codes')}</p>
                <Button
                  onClick={handleRegenerate}
                  disabled={isLoading}
                  variant="default"
                  className="px-8 py-3 transition-all disabled:opacity-50"
                  aria-busy={isLoading}
                  aria-disabled={isLoading}
                >
                  {isLoading && <InlineSpinner size="sm" ariaLabel={localize`com_ui_loading`} />}
                  {localize('com_ui_generate_backup')}
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </OGDialogContent>
    </OGDialog>
  );
};

export default React.memo(BackupCodesItem);
