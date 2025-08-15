import { useMemo } from 'react';
import { OGDialog, OGDialogTemplate, useToastContext } from '@librechat/client';
import type { TTermsOfService } from 'librechat-data-provider';
import MarkdownLite from '~/components/Chat/Messages/Content/MarkdownLite';
import { useAcceptTermsMutation } from '~/data-provider';
import { useLocalize } from '~/hooks';

type ModalContent = {
  title?: string;
  content: string;
  accept?: string;
  decline?: string;
};

type TermsAndConditionsModalProps = {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAccept: () => void;
  onDecline: () => void;
  title?: string;
  contentUrl?: string;
  modalContent?: string | string[] | ModalContent;
};

export function TermsAndConditionsModal({
  open,
  onOpenChange,
  onAccept,
  onDecline,
  title,
  modalContent,
  contentUrl,
}: TermsAndConditionsModalProps) {
  const localize = useLocalize();
  const { showToast } = useToastContext();
  const { mutate: acceptTerms } = useAcceptTermsMutation({
    onSuccess: () => {
      showToast({ message: localize('com_auth_terms_accepted') as string, status: 'success' });
      onAccept();
    },
    onError: (error: unknown) => {
      let errorMessage = 'Unknown error';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else {
        errorMessage = JSON.stringify(error);
      }

      showToast({
        message: `${localize('com_auth_error_accepting_terms')}: ${errorMessage}`,
        status: 'error' as const,
      });
    },
  });

  const handleAccept = () => {
    acceptTerms();
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onDecline();
    }
    onOpenChange(isOpen);
  };

  const defaultContent = useMemo(
    () => ({
      title: localize('com_auth_terms_of_service') as string,
      content: localize('com_auth_terms_of_service_use') as string,
      accept: localize('com_auth_terms_accept') as string,
      decline: localize('com_auth_terms_decline') as string,
    }),
    [localize],
  );

  const {
    content,
    title: contentTitle,
    accept: acceptText,
    decline: declineText,
  } = useMemo(() => {
    if (typeof modalContent === 'string') {
      return {
        content: modalContent,
        title: defaultContent.title,
        accept: defaultContent.accept,
        decline: defaultContent.decline,
      };
    } else if (Array.isArray(modalContent)) {
      return {
        content: modalContent.join('\n'),
        title: defaultContent.title,
        accept: defaultContent.accept,
        decline: defaultContent.decline,
      };
    } else if (modalContent && typeof modalContent === 'object') {
      return {
        content: modalContent.content || defaultContent.content,
        title: modalContent.title || defaultContent.title,
        accept: modalContent.accept || defaultContent.accept,
        decline: modalContent.decline || defaultContent.decline,
      };
    }
    return defaultContent;
  }, [modalContent, defaultContent]);

  const currentTitle = title || contentTitle || defaultContent.title;
  const acceptButtonText = acceptText || defaultContent.accept;
  const declineButtonText = declineText || defaultContent.decline;

  return (
    <OGDialog open={open} onOpenChange={handleOpenChange}>
      <OGDialogTemplate
        title={currentTitle}
        className="max-w-2xl"
        main={
          <div className="prose dark:prose-invert max-h-[60vh] overflow-y-auto p-4 text-sm">
            {contentUrl ? (
              <iframe src={contentUrl} className="h-[60vh] w-full border-0" title={currentTitle} />
            ) : (
              <MarkdownLite content={content} />
            )}
          </div>
        }
        selection={{
          selectHandler: handleAccept,
          selectText: acceptButtonText,
          selectClasses:
            'inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        }}
        buttons={
          <button
            type="button"
            onClick={onDecline}
            className="inline-flex justify-center rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
          >
            {declineButtonText}
          </button>
        }
        showCancelButton={false}
      />
    </OGDialog>
  );
}
