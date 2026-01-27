import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from "next-themes"; // standard provider from next-themes
import "./globals.css";

// Your standard functional fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// The "Unique" Serif font for headings
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FinGenius",
  description: "Provide the best way to learn finance with AI-driven insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`
            ${geistSans.variable} 
            ${geistMono.variable} 
            ${playfair.variable} 
            antialiased 
            bg-[#FDFCFB] dark:bg-slate-950 
            transition-colors duration-300
          `}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}