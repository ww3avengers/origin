import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useT } from '~/utils/i18n';
import {
  OGDialog,
  OGDialogTemplate,
  Button,
  Input,
  Label,
  Checkbox,
  Textarea,
} from '@librechat/client';
import { contactSchema, type ContactFormValues } from '@/features/contact/schema';

export interface RequestDemoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef?: React.RefObject<HTMLButtonElement>;
  source?: string;
}

type FieldErrors = Partial<Record<keyof ContactFormValues, string>>;

const RequestDemoDialog: FC<RequestDemoDialogProps> = ({
  open,
  onOpenChange,
  triggerRef,
  source = 'landing_modal',
}) => {
  const t = useT();
  const subject = t('landing.hero.cta.primary') as string;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState<boolean | 'indeterminate'>(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const firstInvalidRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!open) {
      setName('');
      setEmail('');
      setCompany('');
      setMessage('');
      setConsent(false);
      setErrors({});
    }
  }, [open]);

  const formValues: ContactFormValues = {
    name: name.trim(),
    email: email.trim(),
    company: company.trim(),
    subject,
    message: message,
    source,
    website: '',
  } as any; // website optional in schema; cast to satisfy type with provided fields

  const translateErr = (msg: string) => t(msg as any) as string;

  const validate = (): boolean => {
    const res = contactSchema.safeParse(formValues);
    if (res.success) {
      setErrors({});
      return true;
    }
    const fieldErrs: FieldErrors = {};
    res.error.issues.forEach((issue) => {
      const path = issue.path[0] as keyof ContactFormValues;
      if (path && !fieldErrs[path]) {
        fieldErrs[path] = translateErr(issue.message);
      }
    });
    setErrors(fieldErrs);
    // focus first invalid
    setTimeout(() => {
      firstInvalidRef.current?.focus();
    }, 0);
    return false;
  };

  const canSubmit = consent === true && !Object.keys(errors).length;

  const handleSubmit = () => {
    // run validation before redirect
    if (!validate()) return;
    // Navigation zu /contact mit Query-Params als leichter, sicherer Fallback
    const params = new URLSearchParams({
      subject,
      name,
      email,
      company,
      message,
      source,
    });
    window.location.href = `/contact?${params.toString()}`;
  };

  return (
    <OGDialog open={open} onOpenChange={onOpenChange} triggerRef={triggerRef}>
      <OGDialogTemplate
        title={t('landing.hero.cta.primary')}
        className="max-w-full sm:max-w-xl"
        main={
          <div className="flex w-full flex-col gap-5">
            <div className="grid w-full gap-4">
              <div className="grid w-full gap-2">
                <Label htmlFor="demo-name">{t('landing.contact.form.name')}</Label>
                <Input
                  id="demo-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('landing.contact.form.name_placeholder')}
                  ref={
                    errors.name && !firstInvalidRef.current
                      ? (el) => (firstInvalidRef.current = el)
                      : undefined
                  }
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'demo-name-error' : undefined}
                />
                {errors.name && (
                  <p id="demo-name-error" className="text-sm text-red-400">
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="grid w-full gap-2">
                <Label htmlFor="demo-email">{t('landing.contact.form.email')}</Label>
                <Input
                  id="demo-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('landing.contact.form.email_placeholder')}
                  ref={
                    errors.email && !firstInvalidRef.current
                      ? (el) => (firstInvalidRef.current = el)
                      : undefined
                  }
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'demo-email-error' : undefined}
                />
                {errors.email && (
                  <p id="demo-email-error" className="text-sm text-red-400">
                    {errors.email}
                  </p>
                )}
              </div>
              <div className="grid w-full gap-2">
                <Label htmlFor="demo-company">{t('landing.contact.form.company')}</Label>
                <Input
                  id="demo-company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={t('landing.contact.form.company_placeholder')}
                  aria-invalid={!!errors.company}
                />
                {errors.company && <p className="text-sm text-red-400">{errors.company}</p>}
              </div>
              <div className="grid w-full gap-2">
                <Label htmlFor="demo-message">{t('landing.contact.form.message')}</Label>
                <Textarea
                  id="demo-message"
                  value={message}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setMessage(e.target.value)
                  }
                  placeholder={t('landing.contact.form.message_placeholder')}
                  ref={
                    errors.message && !firstInvalidRef.current
                      ? (el) => (firstInvalidRef.current = el as any)
                      : undefined
                  }
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? 'demo-message-error' : undefined}
                />
                {errors.message && (
                  <p id="demo-message-error" className="text-sm text-red-400">
                    {errors.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox id="demo-consent" checked={consent} onCheckedChange={setConsent} />
              <label htmlFor="demo-consent" className="text-sm text-gray-300">
                {t('landing.contact.form.consent')}
              </label>
            </div>
          </div>
        }
        buttons={
          <Button onClick={handleSubmit} variant="submit" disabled={!canSubmit}>
            {t('landing.contact.form.submit')}
          </Button>
        }
        selection={undefined}
      />
    </OGDialog>
  );
};

export default RequestDemoDialog;
