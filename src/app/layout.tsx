import type { Metadata } from"next";
import { SessionProvider } from"next-auth/react";
import QueryProvider from"@/providers/QueryProvider";
import RateLimitBanner from"@/components/RateLimitBanner";
import Navbar from"@/components/Navbar";
import"./globals.css";
import { Geist } from"next/font/google";
import { cn } from"@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ||"https://gitpulltalent.vercel.app/"),
  title:"GPT - Git Pull Talent",
  description:"Score your open source impact. See where your GitHub contributions truly matter.",
  openGraph: {
    title:"Git Pull Talent — GitHub Contribution Analytics",
    description:"Score your open source impact. See where your GitHub contributions truly matter.",
    images: ["/og-image.png"],
    type:"website",
  },
  twitter: {
    card:"summary_large_image",
    title:"Git Pull Talent — GitHub Contribution Analytics",
    description:"Score your open source impact. See where your GitHub contributions truly matter.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="antialiased min-h-screen relative" suppressHydrationWarning>
        <div className="grain-overlay pointer-events-none" aria-hidden="true" />
        <SessionProvider>
          <QueryProvider>
            <Navbar />
            <main className="relative z-10">{children}</main>
            <RateLimitBanner />
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
