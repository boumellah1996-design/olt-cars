"use client";

import { I18nProvider } from "lib/i18n";
import { StoreProvider } from "lib/store";
import { ThemeProvider } from "lib/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <StoreProvider>{children}</StoreProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
