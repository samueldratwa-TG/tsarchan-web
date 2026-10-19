"use client";

/**
 * "We moved" banner - reference component for the sadot.click -> sadotlab.com migration.
 * Spec: C:\ClaudeProjects\domain-migration\MIGRATION.md section 4. Written by the foundation
 * session (2026-10-17), validated by the waitwise pilot the same day (installed copy:
 * C:\ClaudeProjects\waitwise\components\MovedBanner.tsx). Each project copies this file and adapts
 * the styling through the --moved-banner-* CSS variables; keep the behaviour.
 * hamadad copy (2026-10-19): behaviour identical to shared/, mounted once in app/layout.tsx with
 * lang="he" (the site is Hebrew only); colours in app/globals.css. No storage note: the site keeps
 * no user data in browser storage.
 * Lint: eslint-config-next 16 (react-hooks/set-state-in-effect) rejects the setState in the mount
 * effect; the targeted disable below is deliberate, keep it when copying.
 *
 * Behaviour
 * - Renders nothing unless the URL carries moved=1 (added by the old host's 308 redirect).
 * - On mount it always removes `moved` from the URL with history.replaceState, keeping every other
 *   query param byte-for-byte (shivatime admin_token etc.) and the hash.
 * - Dismiss stores a flag in localStorage (try/catch); once dismissed it never shows again on this
 *   origin, but the URL is still cleaned.
 * - Fixed position, so it never shifts the layout. role="status", real button with an aria-label.
 *
 * Usage: render once inside <body> of the root layout.
 *   <MovedBanner newHost="flightstatus.sadotlab.com" />
 *   <MovedBanner newHost="smart-power-calc.sadotlab.com" storageNote />
 *   <MovedBanner newHost="il-taxi-price-estimator.sadotlab.com" lang={locale} storageNote={{ he: "...", en: "..." }} />
 * Pass `lang` when the page knows it. Without it: /en path prefix (hub, TaxiTa), then the `locale`
 * cookie (shivatime, flightstatus), then Hebrew.
 */

import { useEffect, useState, type ReactNode } from "react";

type Lang = "he" | "en";

export interface MovedBannerProps {
  /** The new host shown in the text, e.g. "flightstatus.sadotlab.com". */
  newHost: string;
  /** Page language; detected when omitted (see above). */
  lang?: Lang;
  /**
   * Extra line for apps whose saved data lives in browser storage and did not move
   * (smart-power-calc, TaxiTa). true = the default text; an object = the app's own nouns.
   */
  storageNote?: boolean | { he: string; en: string };
  /** localStorage key for the dismissed flag. */
  storageKey?: string;
  className?: string;
}

const TEXT = {
  he: {
    moved: (host: ReactNode) => (
      <>
        האתר עבר לכתובת חדשה: {host}. קישורים ישנים ממשיכים לעבוד, אבל כדאי לעדכן את הסימניות.
      </>
    ),
    storage: "מסלולים והגדרות ששמרת בכתובת הישנה לא עברו לכתובת החדשה, צריך להזין אותם מחדש.",
    button: "הבנתי",
    // starts with the visible text, so the accessible name contains it (WCAG 2.5.3)
    buttonLabel: "הבנתי - סגירת ההודעה על הכתובת החדשה",
  },
  en: {
    moved: (host: ReactNode) => (
      <>This site has moved to {host}. Old links still work, but please update your bookmarks.</>
    ),
    storage: "Plans and settings saved on the old address did not move with it - please re-enter them.",
    button: "Got it",
    buttonLabel: "Got it - dismiss the new address notice",
  },
} as const;

// Section 4: /en path, then the locale cookie, then Hebrew. <html lang> is deliberately NOT used:
// some apps still carry create-next-app's default lang="en" on Hebrew pages.
function detectLang(): Lang {
  const path = window.location.pathname;
  if (path === "/en" || path.startsWith("/en/")) return "en";
  const cookie = document.cookie.match(/(?:^|;\s*)locale=([^;]+)/);
  if (cookie) return decodeURIComponent(cookie[1]).toLowerCase().startsWith("en") ? "en" : "he";
  return "he";
}

/** Splits location.search on "&" and drops every `moved` param, leaving the others untouched. */
function stripMovedParam(): { wasMoved: boolean } {
  const raw = window.location.search.replace(/^\?/, "");
  if (!raw) return { wasMoved: false };
  const parts = raw.split("&");
  const wasMoved = parts.includes("moved=1");
  if (!wasMoved) return { wasMoved: false };
  const kept = parts.filter((p) => p.split("=")[0] !== "moved");
  const search = kept.length ? `?${kept.join("&")}` : "";
  // null state, as the Next.js docs do: Next patches replaceState and syncs its router from it.
  window.history.replaceState(null, "", `${window.location.pathname}${search}${window.location.hash}`);
  return { wasMoved: true };
}

export default function MovedBanner({
  newHost,
  lang,
  storageNote,
  storageKey = "moved-banner-dismissed",
  className,
}: MovedBannerProps) {
  const [shownLang, setShownLang] = useState<Lang | null>(null);

  useEffect(() => {
    // Only ever switches the banner ON. React StrictMode runs this effect twice in dev, and the
    // second run sees the already-cleaned URL; it must not hide what the first run showed.
    const { wasMoved } = stripMovedParam();
    if (!wasMoved) return;
    let dismissed = false;
    try {
      dismissed = window.localStorage.getItem(storageKey) === "1";
    } catch (err) {
      console.warn("[MovedBanner] localStorage unavailable, showing the notice anyway", err);
    }
    // The URL and localStorage exist only in the browser and the server must render nothing, so
    // the decision has to be taken after hydration: a one-shot effect that sets state once.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!dismissed) setShownLang(lang ?? detectLang());
  }, [lang, storageKey]);

  if (!shownLang) return null;

  const t = TEXT[shownLang];
  const note =
    storageNote === true ? t.storage : storageNote ? storageNote[shownLang] : null;
  const host = (
    <bdi dir="ltr" style={{ fontWeight: 600 }}>
      {newHost}
    </bdi>
  );

  const dismiss = () => {
    try {
      window.localStorage.setItem(storageKey, "1");
    } catch (err) {
      console.warn("[MovedBanner] could not store the dismissed flag", err);
    }
    setShownLang(null);
  };

  return (
    <div
      role="status"
      lang={shownLang}
      dir={shownLang === "he" ? "rtl" : "ltr"}
      className={className}
      style={{
        position: "fixed",
        insetInline: 0,
        bottom: 0,
        zIndex: 1000,
        display: "flex",
        justifyContent: "center",
        padding: "12px 16px calc(12px + env(safe-area-inset-bottom))",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          pointerEvents: "auto",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "8px 16px",
          maxWidth: 720,
          width: "100%",
          padding: "12px 16px",
          borderRadius: 12,
          border: "1px solid var(--moved-banner-border, transparent)",
          background: "var(--moved-banner-bg, #1f2937)",
          color: "var(--moved-banner-fg, #ffffff)",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25)",
          fontSize: 15,
          lineHeight: 1.5,
        }}
      >
        <div style={{ flex: "1 1 260px" }}>
          <p style={{ margin: 0 }}>{t.moved(host)}</p>
          {note ? <p style={{ margin: "4px 0 0" }}>{note}</p> : null}
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t.buttonLabel}
          style={{
            flex: "0 0 auto",
            padding: "6px 16px",
            border: 0,
            borderRadius: 8,
            background: "var(--moved-banner-button-bg, #ffffff)",
            color: "var(--moved-banner-button-fg, #1f2937)",
            fontWeight: 600,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          {t.button}
        </button>
      </div>
    </div>
  );
}

export { MovedBanner };
