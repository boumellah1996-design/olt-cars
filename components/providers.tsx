"use client";

import { FleetProvider } from "lib/fleet";
import { I18nProvider } from "lib/i18n";
import { StoreProvider } from "lib/store";
import { ThemeProvider } from "lib/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <FleetProvider>
          <StoreProvider>{children}</StoreProvider>
        </FleetProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
