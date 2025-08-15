import i18next from 'i18next';
// Do not import full locale files to avoid overriding keys with empty strings

// Create an isolated i18n instance for tests to avoid side effects
const setupI18n = async (lng: 'en' | 'de') => {
  const i18n = i18next.createInstance();
  await i18n.init({
    lng,
    fallbackLng: 'en',
    debug: false,
    defaultNS: 'translation',
    ns: ['translation'],
    interpolation: { escapeValue: false },
    resources: {
      en: {
        translation: {
          com_ui_oauth_success_description_one: '{{count}} second',
          com_ui_oauth_success_description_other: '{{count}} seconds',
        },
      },
      de: {
        translation: {
          com_ui_oauth_success_description_one: '{{count}} Sekunde',
          com_ui_oauth_success_description_other: '{{count}} Sekunden',
        },
      },
    },
  });
  return i18n;
};

describe('OAuth success description pluralization', () => {
  it('uses singular in EN for count=1', async () => {
    const i18n = await setupI18n('en');
    const text = i18n.t('com_ui_oauth_success_description', { count: 1 });
    expect(text).toContain('1 second');
  });

  it('uses plural in EN for count>1', async () => {
    const i18n = await setupI18n('en');
    const text = i18n.t('com_ui_oauth_success_description', { count: 2 });
    expect(text).toContain('2 seconds');
  });

  it('uses singular in DE for count=1', async () => {
    const i18n = await setupI18n('de');
    const text = i18n.t('com_ui_oauth_success_description', { count: 1 });
    expect(text).toContain('1 Sekunde');
  });

  it('uses plural in DE for count>1', async () => {
    const i18n = await setupI18n('de');
    const text = i18n.t('com_ui_oauth_success_description', { count: 3 });
    expect(text).toContain('3 Sekunden');
  });
});
