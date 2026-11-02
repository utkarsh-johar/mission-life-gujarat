"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import en from "../messages/en.json";
import gu from "../messages/gu.json";
import hi from "../messages/hi.json";

export type Locale = "en" | "gu" | "hi";

const messages: Record<Locale, any> = { en, gu, hi };

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
  formatNumber: (n: number, maximumFractionDigits?: number) => string;
  formatCurrency: (n: number) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: (k) => k,
  formatNumber: (n) => n.toString(),
  formatCurrency: (n) => `₹${n}`,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("life_locale") as Locale;
    if (saved && ["en", "gu", "hi"].includes(saved)) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("life_locale", l);
  };

  const t = (path: string): string => {
    const parts = path.split(".");
    let curr = messages[locale] || messages.en;
    for (const p of parts) {
      if (curr && typeof curr === "object" && p in curr) {
        curr = curr[p];
      } else {
        // Fallback to English
        let fallback = messages.en;
        for (const fp of parts) {
          if (fallback && typeof fallback === "object" && fp in fallback) {
            fallback = fallback[fp];
          } else {
            return path;
          }
        }
        return typeof fallback === "string" ? fallback : path;
      }
    }
    return typeof curr === "string" ? curr : path;
  };

  const formatNumber = (n: number, maximumFractionDigits = 2): string => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits,
    }).format(n);
  };

  const formatCurrency = (n: number): string => {
    return `₹${formatNumber(Math.round(n))}`;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, formatNumber, formatCurrency }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
