import { useRecoilValue } from 'recoil';
import { useForm } from 'react-hook-form';
import { Spinner } from '@librechat/client';
import { useParams } from 'react-router-dom';
import { Constants } from 'librechat-data-provider';
import React from 'react';
import DemoChatForm from './Input/DemoChatForm';
import { cn } from '~/utils';

function LoadingSpinner() {
  return (
    <div className="relative flex-1 overflow-hidden overflow-y-auto">
      <div className="relative flex h-full items-center justify-center">
        <Spinner className="text-text-primary" />
      </div>
    </div>
  );
}

function ChatView() {
  return (
    <div className="flex h-full w-full flex-col">
      <div
        className={cn(
          'flex flex-col',
          'flex-1 items-center justify-end sm:justify-center',
        )}
      >
        <div
          className={cn(
            'w-full',
            'max-w-3xl transition-all duration-200 xl:max-w-4xl',
          )}
        >
          <div className="w-full">
            <DemoChatForm />
            <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Dies ist eine Vorschau - erstelle ein Konto, um zu chatten
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatView;
