import { TPromptGroup } from 'librechat-data-provider';
import CategoryIcon from '~/components/Prompts/Groups/CategoryIcon';

export default function PromptCard({ promptGroup }: { promptGroup?: TPromptGroup }) {
  return (
    <div className="metal-surface relative flex w-40 cursor-pointer flex-col gap-2 rounded-2xl px-3 pb-4 pt-3 text-start align-top text-[15px] transition-colors duration-300 ease-in-out fade-in hover:brightness-[1.02]">
      <div className="">
        <CategoryIcon className="size-4" category={promptGroup?.category ?? ''} />
      </div>
      <p className="break-word line-clamp-3 text-balance text-gray-600 dark:text-gray-400">
        {(promptGroup?.oneliner ?? '') || promptGroup?.productionPrompt?.prompt}
      </p>
    </div>
  );
}
