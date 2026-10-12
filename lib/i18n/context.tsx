"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { en } from "./en";
import { bn } from "./bn";

export type Locale = "en" | "bn";
export type Translations = typeof en;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
  isBn: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("sheba_locale") as Locale;
    if (saved === "en" || saved === "bn") {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("sheba_locale", newLocale);
  };

  const t = locale === "bn" ? bn : en;

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        isBn: locale === "bn",
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    return {
      locale: "en",
      setLocale: () => {},
      t: en,
      isBn: false,
    };
  }
  return context;
}
