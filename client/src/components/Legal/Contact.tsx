import { FC, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import type { TFunction } from 'i18next';
import TopNav from '~/components/Landing/TopNav';
import FooterSection from '~/components/Landing/Sections/FooterSection';
import Meta from '~/components/Seo/Meta';
import { ORG } from '@/config/seo';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { contactSchema, type ContactFormValues } from '@/features/contact/schema';
import { getPrefillFromSearch, buildMailtoHref, isSpam } from '@/features/contact/utils';
import { submitContact } from '@/features/contact/api';

const Contact: FC = () => {
  const { t, i18n } = useTranslation('landing');
  const location = useLocation();

  // Typsichere Übersetzung mit Fallback innerhalb des 'landing'-Namespaces
  const safeT = (tr: TFunction<'landing'>, key: string, fallback: string): string => {
    const v = (tr as any)(key);
    return typeof v === 'string' ? v : fallback;
  };

  // i18n-aware SEO Basics
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = location.pathname || '/contact';
  const currentLang = i18n.language?.split('-')[0] || 'de';
  const languages = Array.from(new Set([currentLang, 'de', 'en']));
  const localeMap: Record<string, string> = { de: 'de_DE', en: 'en_US' };
  const hreflangs = languages.map((lng) => ({ hrefLang: lng, href: `${origin}${pathname}` }));
  const alternateLocales = languages.map((lng) => localeMap[lng]).filter(Boolean) as string[];

  const prefill = useMemo(() => getPrefillFromSearch(location.search), [location.search]);

  const hasPrefill = Object.values(prefill).some(
    (v) => typeof v === 'string' && v.trim().length > 0,
  );

  const mailtoHref = useMemo(() => buildMailtoHref(prefill), [prefill]);

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<ContactFormValues>({
    defaultValues: {
      name: prefill.name || '',
      email: prefill.email || '',
      company: prefill.company || '',
      subject: prefill.subject || '',
      message: prefill.message || '',
      source: prefill.source || '',
      website: '',
    },
    mode: 'onBlur',
  });

  const startRef = useRef<number>(Date.now());

  const onSubmit = async (values: ContactFormValues) => {
    const elapsed = Date.now() - startRef.current;
    // Zod-Validierung
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      parsed.error.issues.forEach((iss) => {
        const path = (iss.path?.[0] as keyof ContactFormValues) || 'message';
        setError(path, { type: 'zod', message: iss.message });
      });
      toast.error(safeT(t as any, 'contact.form.error', 'Bitte Eingaben prüfen.'));
      return;
    }

    // Spam-Check
    if (isSpam(values, elapsed)) {
      toast.error(
        safeT(t as any, 'contact.form.spam', 'Verdacht auf Spam – bitte erneut versuchen.'),
      );
      return;
    }

    // Versuche API-Submit, sonst Mailto-Fallback
    const res = await submitContact(values);
    if (res.ok) {
      toast.success(safeT(t as any, 'contact.form.success', 'Danke! Wir melden uns in Kürze.'));
      reset({ ...values, website: '' });
      return;
    }
    // Fallback: mailto öffnen
    window.location.href = buildMailtoHref(values);
  };

  return (
    <>
      <Meta
        title={safeT(t as any, 'legal.contact.title', 'Kontakt')}
        description={safeT(t as any, 'legal.contact.intro', 'Wir helfen dir gerne weiter.')}
        locale={localeMap[currentLang] || 'de_DE'}
        alternateLocales={alternateLocales}
        hreflangs={hreflangs}
        breadcrumbs={[
          { name: safeT(t as any, 'site.breadcrumb_home', 'Home'), url: '/' },
          { name: safeT(t as any, 'legal.contact.title', 'Kontakt'), url: pathname },
        ]}
        organization={{ name: ORG.name, logo: ORG.logo, sameAs: ORG.sameAs }}
      />
      <TopNav />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[100] focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-black"
      >
        {safeT(t as any, 'a11y.skipToContent', 'Zum Inhalt springen')}
      </a>
      <main
        id="main-content"
        role="main"
        aria-label={safeT(t as any, 'a11y.mainContent', 'Hauptinhalt')}
        className="mx-auto max-w-3xl px-4 py-10 text-gray-200 sm:px-6 lg:px-8"
      >
        <h1 className="mb-2 text-3xl font-semibold">
          {safeT(t as any, 'legal.contact.title', 'Kontakt')}
        </h1>
        <p className="mb-6 text-gray-300">
          {safeT(t as any, 'legal.contact.intro', 'Wir helfen dir gerne weiter.')}
        </p>

        {hasPrefill && (
          <section
            aria-label={safeT(t as any, 'contact.form.prefill_title', 'Deine Anfrage')}
            className="mb-8 rounded-lg border border-gray-700 bg-gray-800/70 p-4"
          >
            <h2 className="mb-2 text-xl font-medium">
              {safeT(t as any, 'contact.form.prefill_title', 'Deine Anfrage')}
            </h2>
            <p className="mb-4 text-gray-400">
              {safeT(
                t as any,
                'contact.form.prefill_hint',
                'Die unten stehenden Daten stammen aus deiner Anfrage und können per E-Mail versendet werden.',
              )}
            </p>
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              {prefill.name && (
                <div>
                  <dt className="text-gray-400">{safeT(t as any, 'contact.form.name', 'Name')}</dt>
                  <dd className="break-words text-gray-200">{prefill.name}</dd>
                </div>
              )}
              {prefill.email && (
                <div>
                  <dt className="text-gray-400">
                    {safeT(t as any, 'contact.form.email', 'Geschäftliche E-Mail')}
                  </dt>
                  <dd className="break-words text-gray-200">{prefill.email}</dd>
                </div>
              )}
              {prefill.company && (
                <div>
                  <dt className="text-gray-400">
                    {safeT(t as any, 'contact.form.company', 'Unternehmen')}
                  </dt>
                  <dd className="break-words text-gray-200">{prefill.company}</dd>
                </div>
              )}
              {prefill.subject && (
                <div>
                  <dt className="text-gray-400">Subject</dt>
                  <dd className="break-words text-gray-200">{prefill.subject}</dd>
                </div>
              )}
              {prefill.source && (
                <div>
                  <dt className="text-gray-400">Source</dt>
                  <dd className="break-words text-gray-200">{prefill.source}</dd>
                </div>
              )}
            </dl>
            {prefill.message && (
              <div className="mt-4">
                <dt className="mb-1 text-gray-400">
                  {safeT(t as any, 'contact.form.message', 'Use Case / Nachricht')}
                </dt>
                <dd className="whitespace-pre-wrap break-words text-gray-200">{prefill.message}</dd>
              </div>
            )}
            <div className="mt-4">
              <a
                href={mailtoHref}
                className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                {safeT(t as any, 'contact.form.submit', 'Anfrage senden')}
              </a>
            </div>
          </section>
        )}

        {/* Kontaktformular */}
        <section
          aria-label={safeT(t as any, 'contact.form.title', 'Kontaktformular')}
          className="mb-10 rounded-lg border border-gray-700 bg-gray-800/70 p-4"
        >
          <h2 className="mb-3 text-xl font-medium">
            {safeT(t as any, 'contact.form.title', 'Kontaktformular')}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Honeypot */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
              {...register('website')}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-gray-300" htmlFor="name">
                  {safeT(t as any, 'contact.form.name', 'Name')}
                </label>
                <input
                  id="name"
                  className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  {...register('name')}
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400" role="alert">
                    {errors.name.message ||
                      safeT(t as any, 'contact.errors.name', 'Bitte gib deinen Namen ein.')}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300" htmlFor="email">
                  {safeT(t as any, 'contact.form.email', 'Geschäftliche E-Mail')}
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  {...register('email')}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400" role="alert">
                    {errors.email.message ||
                      safeT(t as any, 'contact.errors.email', 'Bitte gib eine gültige E-Mail an.')}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300" htmlFor="company">
                  {safeT(t as any, 'contact.form.company', 'Unternehmen')}
                </label>
                <input
                  id="company"
                  className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  {...register('company')}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300" htmlFor="subject">
                  Subject
                </label>
                <input
                  id="subject"
                  className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  {...register('subject')}
                  aria-invalid={!!errors.subject}
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-400" role="alert">
                    {errors.subject.message ||
                      safeT(t as any, 'contact.errors.subject', 'Bitte gib einen Betreff ein.')}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm text-gray-300" htmlFor="message">
                {safeT(t as any, 'contact.form.message', 'Use Case / Nachricht')}
              </label>
              <textarea
                id="message"
                rows={6}
                className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                {...register('message')}
                aria-invalid={!!errors.message}
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-400" role="alert">
                  {errors.message.message ||
                    safeT(t as any, 'contact.errors.message', 'Bitte gib eine Nachricht ein.')}
                </p>
              )}
            </div>

            {/* Hidden source/utm */}
            <input type="hidden" {...register('source')} />

            <div className="mt-4 flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-60"
              >
                {isSubmitting
                  ? safeT(t as any, 'contact.form.sending', 'Senden...')
                  : safeT(t as any, 'contact.form.submit', 'Anfrage senden')}
              </button>
              <a
                href={mailtoHref}
                className="inline-flex items-center rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                {safeT(t as any, 'contact.form.email_fallback', 'Per E-Mail öffnen')}
              </a>
            </div>
          </form>
        </section>

        <ul className="list-disc space-y-2 pl-5 text-gray-300">
          <li>{safeT(t as any, 'legal.contact.email', 'E-Mail: contact@sigmacode.ai')}</li>
          <li>
            {safeT(t as any, 'legal.contact.address', 'Adresse: Musterstraße 1, 10115 Berlin')}
          </li>
          <li>{safeT(t as any, 'legal.contact.response', 'Antwortzeit: 1–2 Werktage')}</li>
        </ul>
      </main>
      <FooterSection />
    </>
  );
};

export default Contact;
