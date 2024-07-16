import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import Providers from "@/components/Providers";
import { ProvidersSession } from "@/components/ProvidersSessions";
import { Toaster } from "@/components/ui/toaster";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: " IAG MagicSlides.app Submission",
  description: " IAG MagicSlides.app Submission By Hardik",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("grainy", inter.className)}>
        <ProvidersSession>
          <Providers>{children}</Providers>
        </ProvidersSession>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
