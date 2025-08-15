import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { buttonVariants } from '@librechat/client';
import { useT } from '~/utils/i18n';
import { cn } from '~/utils';

export default function BackToChat({ className }: { className?: string }) {
  const navigate = useNavigate();
  const t = useT();
  const clickHandler = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.button === 0 && !(event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      navigate('/c/new');
    }
  };
  return (
    <a
      className={cn(buttonVariants({ variant: 'outline' }), className)}
      href="/"
      onClick={clickHandler}
    >
      <ArrowLeft className="icon-xs mr-2" />
      {t('com_ui_back_to_chat')}
    </a>
  );
}
