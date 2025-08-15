import i18n from './i18n';

describe('i18next translation tests', () => {
  // Ensure i18next is initialized before any tests run
  beforeAll(async () => {
    if (!i18n.isInitialized) {
      await i18n.init();
    }
  });

  const setQueryLng = (lng: string) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('lng', lng);
      window.history.pushState({}, '', url.toString());
    } catch {
      /* noop */
    }
  };

  it('should return the correct translation for a valid key in English', async () => {
    setQueryLng('en');
    await i18n.changeLanguage('en');
    expect(i18n.t('com_ui_cancel')).toBe('Cancel');
  });

  it('should return the correct translation for a valid key in German', async () => {
    setQueryLng('de');
    await i18n.changeLanguage('de');
    expect(i18n.t('com_ui_cancel')).toBe('Abbrechen');
  });

  it('should normalize locale variants to base language (en-US → en)', async () => {
    setQueryLng('en');
    await i18n.changeLanguage('en-US');
    expect(i18n.language.startsWith('en')).toBe(true);
    expect(i18n.t('com_ui_cancel')).toBe('Cancel');
  });
  
  it('should normalize locale variants to base language (de-DE → de)', async () => {
    setQueryLng('de');
    await i18n.changeLanguage('de-DE');
    expect(i18n.language.startsWith('de')).toBe(true);
    expect(i18n.t('com_ui_cancel')).toBe('Abbrechen');
  });

  it('should return the key itself for an invalid key', async () => {
    setQueryLng('en');
    await i18n.changeLanguage('en');
    expect((i18n as any).t('invalid-key')).toBe('invalid-key'); // Returns the key itself
  });

  it('should correctly format placeholders in the translation', async () => {
    setQueryLng('en');
    await i18n.changeLanguage('en');
    expect(i18n.t('com_ui_logo', { 0: 'ACME' })).toBe('ACME logo');
    setQueryLng('de');
    await i18n.changeLanguage('de');
    expect(i18n.t('com_ui_logo', { 0: 'ACME' })).toBe('ACME Logo');
  });

  it('should resolve landing keys correctly: existing returns value, missing uses defaultValue', async () => {
    // Existing landing key: sections.security
    setQueryLng('en');
    await i18n.changeLanguage('en');
    const existingEn = (i18n as any).t('landing:sections.security', { defaultValue: 'Security Fallback' });
    expect(typeof existingEn).toBe('string');
    expect(existingEn).not.toBe('');
    expect(existingEn).not.toBe('Security Fallback');

    setQueryLng('de');
    await i18n.changeLanguage('de');
    const existingDe = (i18n as any).t('landing:sections.security', { defaultValue: 'Sicherheit Fallback' });
    expect(typeof existingDe).toBe('string');
    expect(existingDe).not.toBe('');
    expect(existingDe).not.toBe('Sicherheit Fallback');

    // Missing landing key: security.cta_more (intentionally absent) should use provided defaultValue
    setQueryLng('en');
    await i18n.changeLanguage('en');
    const missingEn = (i18n as any).t('landing:security.cta_more', { defaultValue: 'More about security measures' });
    expect(missingEn).toBe('More about security measures');

    setQueryLng('de');
    await i18n.changeLanguage('de');
    const missingDe = (i18n as any).t('landing:security.cta_more', { defaultValue: 'Mehr zu Sicherheitsmaßnahmen' });
    expect(missingDe).toBe('Mehr zu Sicherheitsmaßnahmen');
  });
});
