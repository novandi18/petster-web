import { ThemeModeScript } from "flowbite-react";
import type { Metadata } from "next";
import { Albert_Sans } from "next/font/google";
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { AlertProvider } from "@/context/AlertContext";
import AccessControl from "@/components/guards/AccessControl";
import TopLoadingBar from "@/components/TopLoadingBar";

const albertSans = Albert_Sans({
  variable: "--font-albert-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Petster",
  description: "Giving Rescued Animals a Second Chance",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeModeScript />
      </head>
      <body
        className={`${albertSans.variable} flex min-h-screen flex-col bg-white pt-16 text-black antialiased dark:bg-black dark:text-white`}
      >
        <AuthProvider>
          <AccessControl>
            <AlertProvider>
              <TopLoadingBar>
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </TopLoadingBar>
            </AlertProvider>
          </AccessControl>
        </AuthProvider>
      </body>
    </html>
  );
}
