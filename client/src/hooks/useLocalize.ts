import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import store from '~/store';

// Liefert das getypte i18next "t". Dank i18next-Typaugmentierung (siehe `locales/i18n.ts`)
// sind Keys aus den Namespaces `translation` und `landing` korrekt typisiert.
export default function useLocalize(): TFunction<["translation", "landing"], string> {
  const lang = useRecoilValue(store.lang);
  const { t, i18n } = useTranslation(["translation", "landing"]);

  useEffect(() => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  return t;
}
