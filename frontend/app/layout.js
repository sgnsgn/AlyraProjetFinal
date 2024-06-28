import Layout from "@/components/Layout.jsx";
import CustomRainbowKitProvider from "./CustomRainbowKitProvider.jsx";
import "./globals.css";
import { Inter as FontSans } from "next/font/google";

// import { Toaster } from "@/components/ui/toaster";

import { cn } from "@/lib/utils";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Alyra Project Final",
  description: "Project Final of Turing Promotion by Akhichn, Dan & Nicolas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased dark",
          fontSans.variable
        )}
      >
        <CustomRainbowKitProvider>
          <Layout>{children}</Layout>
        </CustomRainbowKitProvider>
        {/* <Toaster /> */}
      </body>
    </html>
  );
}
