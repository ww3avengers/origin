import React, { useContext, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRecoilState } from 'recoil';
import { Dropdown, ThemeContext } from '@librechat/client';
import ArchivedChats from './ArchivedChats';
import ToggleSwitch from '../ToggleSwitch';
import { useT } from '~/utils/i18n';
import store from '~/store';

const toggleSwitchConfigs = [
  {
    stateAtom: store.enableUserMsgMarkdown,
    localizationKey: 'com_nav_user_msg_markdown',
    switchId: 'enableUserMsgMarkdown',
    hoverCardText: undefined,
    key: 'enableUserMsgMarkdown',
  },
  {
    stateAtom: store.autoScroll,
    localizationKey: 'com_nav_auto_scroll',
    switchId: 'autoScroll',
    hoverCardText: undefined,
    key: 'autoScroll',
  },
  {
    stateAtom: store.hideSidePanel,
    localizationKey: 'com_nav_hide_panel',
    switchId: 'hideSidePanel',
    hoverCardText: undefined,
    key: 'hideSidePanel',
  },
];

export const ThemeSelector = ({
  theme,
  onChange,
}: {
  theme: string;
  onChange: (value: string) => void;
}) => {
  const t = useT();

  const themeOptions = [
    { value: 'system', label: t('com_nav_theme_system') },
    { value: 'dark', label: t('com_nav_theme_dark') },
    { value: 'light', label: t('com_nav_theme_light') },
  ];

  return (
    <div className="flex items-center justify-between">
      <div>{t('com_nav_theme')}</div>

      <Dropdown
        value={theme}
        onChange={onChange}
        options={themeOptions}
        sizeClasses="w-[180px]"
        testId="theme-selector"
        className="z-50"
      />
    </div>
  );
};

export const LangSelector = ({
  langcode,
  onChange,
}: {
  langcode: string;
  onChange: (value: string) => void;
}) => {
  const t = useT();

  const languageOptions = [
    { value: 'auto', label: t('com_nav_lang_auto') },
    { value: 'en-US', label: t('com_nav_lang_english') },
    { value: 'zh-Hans', label: t('com_nav_lang_chinese') },
    { value: 'zh-Hant', label: t('com_nav_lang_traditional_chinese') },
    { value: 'ar-EG', label: t('com_nav_lang_arabic') },
    { value: 'da-DK', label: t('com_nav_lang_danish') },
    { value: 'de-DE', label: t('com_nav_lang_german') },
    { value: 'es-ES', label: t('com_nav_lang_spanish') },
    { value: 'ca-ES', label: t('com_nav_lang_catalan') },
    { value: 'et-EE', label: t('com_nav_lang_estonian') },
    { value: 'fa-IR', label: t('com_nav_lang_persian') },
    { value: 'fr-FR', label: t('com_nav_lang_french') },
    { value: 'he-HE', label: t('com_nav_lang_hebrew') },
    { value: 'hu-HU', label: t('com_nav_lang_hungarian') },
    { value: 'hy-AM', label: t('com_nav_lang_armenian') },
    { value: 'it-IT', label: t('com_nav_lang_italian') },
    { value: 'pl-PL', label: t('com_nav_lang_polish') },
    { value: 'pt-BR', label: t('com_nav_lang_brazilian_portuguese') },
    { value: 'pt-PT', label: t('com_nav_lang_portuguese') },
    { value: 'ru-RU', label: t('com_nav_lang_russian') },
    { value: 'ja-JP', label: t('com_nav_lang_japanese') },
    { value: 'ka-GE', label: t('com_nav_lang_georgian') },
    { value: 'cs-CZ', label: t('com_nav_lang_czech') },
    { value: 'sv-SE', label: t('com_nav_lang_swedish') },
    { value: 'ko-KR', label: t('com_nav_lang_korean') },
    { value: 'lv-LV', label: t('com_nav_lang_latvian') },
    { value: 'vi-VN', label: t('com_nav_lang_vietnamese') },
    { value: 'th-TH', label: t('com_nav_lang_thai') },
    { value: 'tr-TR', label: t('com_nav_lang_turkish') },
    { value: 'ug', label: t('com_nav_lang_uyghur') },
    { value: 'nl-NL', label: t('com_nav_lang_dutch') },
    { value: 'id-ID', label: t('com_nav_lang_indonesia') },
    { value: 'fi-FI', label: t('com_nav_lang_finnish') },
    { value: 'bo', label: t('com_nav_lang_tibetan') },
    { value: 'uk-UA', label: t('com_nav_lang_ukrainian') },
  ];

  return (
    <div className="flex items-center justify-between">
      <div>{t('com_nav_language')}</div>

      <Dropdown
        value={langcode}
        onChange={onChange}
        sizeClasses="[--anchor-max-height:256px]"
        options={languageOptions}
        className="z-50"
      />
    </div>
  );
};

function General() {
  const { theme, setTheme } = useContext(ThemeContext);

  const [langcode, setLangcode] = useRecoilState(store.lang);

  const changeTheme = useCallback(
    (value: string) => {
      setTheme(value);
    },
    [setTheme],
  );

  const changeLang = useCallback(
    (value: string) => {
      let userLang = value;
      if (value === 'auto') {
        userLang = navigator.language || navigator.languages[0];
      }
      // Normalisiere auf Basissprachen 'de' | 'en' (für i18n)
      const base = (() => {
        const lc = (userLang || '').toLowerCase();
        if (lc.startsWith('de')) return 'de';
        if (lc.startsWith('en')) return 'en';
        // Fallback: behalte bisherigen Code, aber i18n nutzt weiterhin nur de/en
        return 'de';
      })();

      requestAnimationFrame(() => {
        document.documentElement.lang = base;
      });
      setLangcode(base);
      Cookies.set('lang', base, { expires: 365 });
    },
    [setLangcode],
  );

  return (
    <div className="flex flex-col gap-3 p-1 text-sm text-text-primary">
      <div className="pb-3">
        <ThemeSelector theme={theme} onChange={changeTheme} />
      </div>
      <div className="pb-3">
        <LangSelector langcode={langcode} onChange={changeLang} />
      </div>
      {toggleSwitchConfigs.map((config) => (
        <div key={config.key} className="pb-3">
          <ToggleSwitch
            stateAtom={config.stateAtom}
            localizationKey={config.localizationKey}
            hoverCardText={config.hoverCardText}
            switchId={config.switchId}
          />
        </div>
      ))}
      <div className="pb-3">
        <ArchivedChats />
      </div>
    </div>
  );
}

export default React.memo(General);
