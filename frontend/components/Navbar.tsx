"use client";
import React, { useState, useEffect } from 'react';
import { Moon, Sun, Laptop } from 'lucide-react';
import { useTheme } from 'next-themes';
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Added this

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export default function Navbar({ isDark, toggleTheme }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname(); // Get current path

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide Navbar if the user is on any dashboard route
  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  const primaryBtnClass = `
    bg-primary hover:bg-primary/90 text-primary-foreground 
    px-4 lg:px-6 py-2.5 rounded-xl font-bold text-xs lg:text-sm 
    shadow-[0_0_20px_rgba(99,54,250,0.3)] 
    hover:shadow-[0_0_30px_rgba(99,54,250,0.5)]
    transform active:scale-95 transition-all duration-300 
    flex items-center justify-center whitespace-nowrap relative overflow-hidden group
  `;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border transition-colors duration-300">
      <div className="w-full px-4 lg:px-12 h-20 flex items-center justify-between">
        
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center gap-4 group cursor-pointer">
            <div className="relative w-9 h-9 lg:w-11 lg:h-11 bg-primary rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-all duration-300 shadow-lg shadow-primary/20">
              <Laptop className="text-primary-foreground w-5 h-5 lg:w-6 lg:h-6" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-background animate-ping" />
            </div>
            <span className="text-xl lg:text-2xl font-black tracking-tight flex items-center">
              <span className="text-foreground transition-colors duration-300">Fin</span>
              <span className="bg-gradient-to-br from-[#6336FA] to-[#8B5CF6] bg-clip-text text-transparent filter drop-shadow-[0_0_1px_rgba(99,54,250,0.2)]">
                Genius
              </span>
            </span>
          </Link>
        </div>

        <div className="hidden xl:flex items-center gap-8 text-sm font-semibold text-muted-foreground">
          {['Courses', 'Features', 'Pricing', 'Resources'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-primary transition-colors relative group">
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-muted transition-colors border border-transparent hover:border-border"
          >
            {!mounted ? <div className="w-5 h-5" /> : theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-foreground" />}
          </button>
          
          <div className="hidden md:flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm font-bold text-foreground hover:text-primary transition-colors px-2">Login</button>
              </SignInButton>
              <SignInButton mode="modal">
                <button className={primaryBtnClass}>
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative z-10">Get Started</span>
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className={primaryBtnClass}>
                 <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                 <span className="relative z-10">Dashboard</span>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  );
}