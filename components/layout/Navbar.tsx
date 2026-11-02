"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sun,
  Zap,
  Navigation,
  Wallet,
  Building2,
  ShieldCheck,
  Globe,
  UserCheck,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useI18n, Locale } from "../../lib/i18n";
import { FEATURES } from "../../config/features";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, setLocale, t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Demo role toggle state (Citizen vs GEDA Admin)
  const isAdmin = pathname.startsWith("/war-room");

  const toggleRole = () => {
    if (isAdmin) {
      router.push("/audit");
    } else {
      router.push("/war-room");
    }
  };

  const navLinks = [
    { href: "/audit", label: t("nav.audit"), icon: Zap },
    { href: "/solar", label: t("nav.solar"), icon: Sun },
    { href: "/mobility", label: t("nav.mobility"), icon: Navigation },
    { href: "/ecoverse", label: t("nav.ecoverse"), icon: Sparkles },
    { href: "/rewards", label: t("nav.rewards"), icon: Wallet },
    { href: "/war-room", label: t("nav.warRoom"), icon: Building2 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-tealbrand-600 to-solar-500 flex items-center justify-center text-white shadow-sm">
            <Sun className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 leading-none">
              <span>{t("nav.brand")}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-tealbrand-50 text-tealbrand-700 dark:bg-tealbrand-950/60 dark:text-teal-400 border border-tealbrand-200 dark:border-tealbrand-800">
                GEDA
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium hidden sm:block mt-0.5">
              Gujarat Energy Development Agency
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isActive
                    ? "bg-tealbrand-50 text-tealbrand-700 dark:bg-tealbrand-950/60 dark:text-teal-300 font-bold"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-tealbrand-600" : "text-slate-400"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Bar: Role Toggle & Language Switcher */}
        <div className="flex items-center gap-2">
          {/* Demo Role Toggle Button (Section 2 & AC-D4) */}
          {FEATURES.demoRoleToggle && (
            <button
              type="button"
              onClick={toggleRole}
              title="Switch role between Citizen and GEDA State Admin"
              className={`px-2.5 py-1 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all ${
                isAdmin
                  ? "bg-slate-900 text-teal-300 border-slate-700 shadow-xs"
                  : "bg-tealbrand-50 hover:bg-tealbrand-100 text-tealbrand-800 border-tealbrand-200 dark:bg-tealbrand-950/50 dark:text-teal-300 dark:border-tealbrand-800"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Role:</span>{" "}
              {isAdmin ? "GEDA Admin" : "Citizen"}
            </button>
          )}

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold">
            {(["en", "gu", "hi"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLocale(lang)}
                className={`px-2 py-0.5 rounded-lg text-xs transition-colors ${
                  locale === lang
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                {lang === "en" ? "EN" : lang === "gu" ? "ગુજ" : "हिं"}
              </button>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold ${
                  isActive
                    ? "bg-tealbrand-50 text-tealbrand-700 dark:bg-tealbrand-950/60 dark:text-teal-300 font-bold"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                <Icon className="w-4 h-4 text-tealbrand-600" />
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
