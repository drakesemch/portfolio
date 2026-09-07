import { ScriptOnce } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string; // This acts as your cookie name
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

// Inlined script that parses the cookie on the raw HTML stream to prevent flashes
function getThemeScript(cookieName: string, defaultTheme: Theme) {
  const key = JSON.stringify(`${cookieName}=`);
  const fallback = JSON.stringify(defaultTheme);

  return `(function(){try{
		var c=document.cookie.split('; ').find(function(r){return r.indexOf(${key})===0});
		var t=c?c.split('=')[1]:'';
		if(t!=='light'&&t!=='dark'&&t!=='system'){t=${fallback}}
		var d=matchMedia('(prefers-color-scheme: dark)').matches;
		var r=t==='system'?(d?'dark':'light'):t;
		var e=document.documentElement;
		e.classList.add('ui--'+r);
		e.style.colorScheme=r;
	}catch(e){}})();`;
}

const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: "system",
  setTheme: () => {},
});

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("ui--light", "ui--dark");

  const resolved =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "ui--dark"
        : "ui--light"
      : `ui--${theme}`;

  root.classList.add(resolved);
  root.style.colorScheme = resolved.replace("ui--", "");
}

// Client-side cookie reader helper
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null;
  return null;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // 1. Initial hydration check
  useEffect(() => {
    const stored = getCookie(storageKey);
    setThemeState(
      stored === "light" || stored === "dark" || stored === "system"
        ? (stored as Theme)
        : defaultTheme,
    );
    setMounted(true);
  }, [defaultTheme, storageKey]);

  // 2. Apply theme classes to DOM when state updates
  useEffect(() => {
    if (!mounted) return;
    applyTheme(theme);
  }, [theme, mounted]);

  // 3. Keep cookie updated if OS theme switches while on "system" mode
  useEffect(() => {
    if (!mounted || theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const onChange = () => {
      applyTheme("system");
      const isDark = media.matches;
      const cookieValue = isDark ? "dark" : "light";
      document.cookie = `${storageKey}=${cookieValue}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme, mounted, storageKey]);

  // 4. Update state and resolve system values into the cookie
  const setTheme = (next: Theme) => {
    let cookieValue = next;

    if (next === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      cookieValue = isDark ? "dark" : "light";
    }

    document.cookie = `${storageKey}=${cookieValue}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    setThemeState(next);
  };

  return (
    <ThemeProviderContext value={{ theme, setTheme }}>
      <ScriptOnce>{getThemeScript(storageKey, defaultTheme)}</ScriptOnce>
      {children}
    </ThemeProviderContext>
  );
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
