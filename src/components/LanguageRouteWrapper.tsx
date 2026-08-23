import React, { useEffect, useLayoutEffect } from 'react';
import { useParams, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { isSupportedLanguage, normalizeLanguage, type SupportedLanguage } from '@/lib/i18nRouting';
import NotFound from '@/pages/NotFound';

export default function LanguageRouteWrapper() {
  const { lang } = useParams<{ lang?: string }>();
  const { i18n } = useTranslation();
  const location = useLocation();

  const isValidLanguage = isSupportedLanguage(lang);
  const currentLang = normalizeLanguage(lang);

  // Synchronously update i18n language and document lang before render
  useLayoutEffect(() => {
    if (isValidLanguage && lang) {
      if (i18n.language !== lang) {
        i18n.changeLanguage(lang);
      }
      document.documentElement.lang = lang;
    }
  }, [lang, isValidLanguage, i18n]);

  useEffect(() => {
    if (isValidLanguage && lang) {
      try {
        localStorage.setItem('i18nextLng', lang);
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [lang, isValidLanguage]);

  if (!isValidLanguage) {
    return <NotFound />;
  }

  return <Outlet />;
}
