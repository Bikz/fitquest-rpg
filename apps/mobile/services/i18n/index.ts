import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { STORAGE_KEYS } from "@/data/storage/keys";
import { storage } from "@/data/storage/kv";
import de from "@/locales/de.json";
import en from "@/locales/en.json";
import es from "@/locales/es.json";
import fr from "@/locales/fr.json";
import it from "@/locales/it.json";
import ja from "@/locales/ja.json";
import ko from "@/locales/ko.json";
import nl from "@/locales/nl.json";
import ptBR from "@/locales/pt-BR.json";
import zhHans from "@/locales/zh-Hans.json";

const resources = {
  en: { translation: en },
  es: { translation: es },
  "pt-BR": { translation: ptBR },
  fr: { translation: fr },
  de: { translation: de },
  it: { translation: it },
  nl: { translation: nl },
  ja: { translation: ja },
  ko: { translation: ko },
  "zh-Hans": { translation: zhHans },
};

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "pt-BR", label: "Português (Brasil)" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "nl", label: "Nederlands" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "zh-Hans", label: "简体中文" },
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
  if (base === "zh") {
    return "zh-Hans";
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
