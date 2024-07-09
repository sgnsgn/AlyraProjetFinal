import Layout from "@/components/Layout.jsx";
import CustomRainbowKitProvider from "./CustomRainbowKitProvider.jsx";
import "./globals.css";
import { Inter as FontSans } from "next/font/google";

import { Toaster } from "@/components/ui/toaster";

import { cn } from "@/lib/utils";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Alyra Project Final",
  description: "Project Final of Turing Promotion by Akichn, Dan & Nicolas",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full w-full bg-[#1a1b1f]"
    >
      <head />
      <body
        className={cn(
          "min-h-screen bg-[#1a1b1f] font-sans antialiased dark",
          fontSans.variable
        )}
      >
        <CustomRainbowKitProvider>
          <Layout>{children}</Layout>
        </CustomRainbowKitProvider>
        {<Toaster />}
      </body>
    </html>
  );
}
