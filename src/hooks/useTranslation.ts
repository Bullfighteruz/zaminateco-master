import { useTranslation as useReactI18nextTranslation } from 'react-i18next';

export const useTranslation = (defaultNs?: string) => {
  return useReactI18nextTranslation(defaultNs);
};