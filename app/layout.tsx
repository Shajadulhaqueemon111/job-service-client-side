import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/lib/i18n/context";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { ShebaRoboWidget } from "@/components/ai/ShebaRoboWidget";

export const metadata: Metadata = {
  title: "ShebaBD - Local Service Finder Marketplace for Bangladesh",
  description:
    "Find trusted plumbers, electricians, tutors, AC repair, cleaning, and appliance technicians near you across 64 districts in Bangladesh.",
  keywords: [
    "service marketplace bangladesh",
    "local plumber dhaka",
    "electrician mirpur",
    "ac servicing bangladesh",
    "home tutor chattogram",
    "sheba bd",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('sheba_theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                  document.documentElement.style.colorScheme = 'light';
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans antialiased">
        <ThemeProvider>
          <I18nProvider>
            <AuthProvider>
              {children}
              <Toaster position="top-right" richColors closeButton />
              <ShebaRoboWidget />
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
