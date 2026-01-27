import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from "next-themes"; 
import { ToasterProvider } from "@/components/ToasterProvider"; // Ensure this path is correct
import "./globals.css";

const geistSans = Geist({ 
  variable: "--font-geist-sans", 
  subsets: ["latin"] 
});

const playfair = Playfair_Display({ 
  variable: "--font-playfair", 
  subsets: ["latin"] 
});

export const metadata: Metadata = {
  title: "FinGenius",
  description: "AI-driven financial insights.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${playfair.variable} antialiased`}>
          <ThemeProvider 
            attribute="class" 
            defaultTheme="system" 
            enableSystem
          >
            {/* Toaster resides here to catch all client-side events */}
            <ToasterProvider />
            
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}