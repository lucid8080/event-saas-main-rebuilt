import "@/styles/globals.css";

import { 
  fontGeist, 
  fontHeading, 
  fontSans, 
  fontUrban,
  fontPoppins,
  fontRoboto,
  fontOpenSans,
  fontMontserrat,
  fontLato,
  fontRaleway,
  fontNunito,
  fontSourceSans,
  fontDMSans,
  fontWorkSans,
  fontManrope,
  fontInterTight,
  fontOutfit,
  fontPlusJakarta,
  fontAlbertSans,
  fontOnest,
  fontLexend,
  fontFigtree,
  fontSora,
  fontSpaceGrotesk,
  fontJetBrainsMono,
  fontFiraCode,
  fontIBMPlexMono
} from "@/assets/fonts";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

import { cn, constructMetadata } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@/components/analytics";
import ModalProvider from "@/components/modals/providers";
import { TailwindIndicator } from "@/components/tailwind-indicator";

interface RootLayoutProps {
  children: React.ReactNode;
}

export const metadata = constructMetadata();

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontUrban.variable,
          fontHeading.variable,
          fontGeist.variable,
          fontPoppins.variable,
          fontRoboto.variable,
          fontOpenSans.variable,
          fontMontserrat.variable,
          fontLato.variable,
          fontRaleway.variable,
          fontNunito.variable,
          fontSourceSans.variable,
          fontDMSans.variable,
          fontWorkSans.variable,
          fontManrope.variable,
          fontInterTight.variable,
          fontOutfit.variable,
          fontPlusJakarta.variable,
          fontAlbertSans.variable,
          fontOnest.variable,
          fontLexend.variable,
          fontFigtree.variable,
          fontSora.variable,
          fontSpaceGrotesk.variable,
          fontJetBrainsMono.variable,
          fontFiraCode.variable,
          fontIBMPlexMono.variable,
        )}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <ModalProvider>{children}</ModalProvider>
            <Analytics />
            <Toaster richColors closeButton />
            <TailwindIndicator />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
