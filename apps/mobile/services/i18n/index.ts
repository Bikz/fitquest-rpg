import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { STORAGE_KEYS } from "@/data/storage/keys";
import { storage } from "@/data/storage/kv";
import de from "@/locales/de.json";
import en from "@/locales/en.json";
import es from "@/locales/es.json";
import fr from "@/locales/fr.json";
import ja from "@/locales/ja.json";
import ko from "@/locales/ko.json";
import ptBR from "@/locales/pt-BR.json";

const resources = {
  en: { translation: en },
  es: { translation: es },
  "pt-BR": { translation: ptBR },
  fr: { translation: fr },
  de: { translation: de },
  ja: { translation: ja },
  ko: { translation: ko },
};

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Espanol" },
  { code: "pt-BR", label: "Portugues (Brasil)" },
  { code: "fr", label: "Francais" },
  { code: "de", label: "Deutsch" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
];

const DEFAULT_LANGUAGE = "en";

const normalizeLanguage = (value: string) => {
  const normalized = value.replace("_", "-");
  if (normalized in resources) {
    return normalized as keyof typeof resources;
  }
  const base = normalized.split("-")[0];
  if (base === "pt") {
    return "pt-BR";
  }
  if (base in resources) {
    return base as keyof typeof resources;
  }
  return DEFAULT_LANGUAGE;
};

const detectLanguage = () => {
  const stored = storage.getString(STORAGE_KEYS.appLanguage);
  if (stored) {
    return normalizeLanguage(stored);
  }
  const locale = Localization.getLocales()[0]?.languageTag ?? DEFAULT_LANGUAGE;
  return normalizeLanguage(locale);
};

void i18n.use(initReactI18next).init({
  resources,
  lng: detectLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: Object.keys(resources),
  interpolation: {
    escapeValue: false,
  },
});

export const setAppLanguage = async (language: string) => {
  const normalized = normalizeLanguage(language);
  storage.set(STORAGE_KEYS.appLanguage, normalized);
  await i18n.changeLanguage(normalized);
};

export const getAppLanguage = () => i18n.language;

export default i18n;
