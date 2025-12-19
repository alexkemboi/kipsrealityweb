import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { LoadingBar } from "@/components/ui/loading-bar";
import { Suspense } from "react";

import { Inter, Plus_Jakarta_Sans, Sen } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const sen = Sen({
  variable: "--font-sen",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RentFlow360 - Property Management",
  description: "Transform how you manage properties with our all-in-one platform",
  icons: {
    icon: [
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/favicon/apple-touch-icon.png" }],
    other: [
      {
        rel: "manifest",
        url: "/favicon/manifest.json",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${plusJakartaSans.variable} ${inter.variable} ${sen.variable} font-sans antialiased min-h-screen transition-colors duration-500`}
      >
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            </div>
          }
        >
          <AuthProvider>
            <LoadingBar />
            {children}
            <Toaster
              position="top-center"
              expand={false}
              richColors
              closeButton
            />
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
