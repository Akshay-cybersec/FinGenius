"use client";
import React, { useState } from 'react';
import { Moon, Sun, Laptop, Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from 'next/link';

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Common button style to keep things DRY and consistent
  const primaryBtnClass = "bg-[#6336FA] hover:bg-[#5229d1] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-none transform active:scale-95 active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center justify-center";

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Animated Logo */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="relative w-10 h-10 bg-[#6336FA] rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-purple-200 dark:shadow-none">
            <Laptop className="text-white w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-slate-900 animate-ping" />
          </div>
          <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-[#6336FA] to-blue-500 bg-clip-text text-transparent">
            FinGenius
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
          {['Courses', 'Features', 'Pricing', 'Resources'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-[#6336FA] dark:hover:text-purple-400 transition-colors relative group">
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#6336FA] transition-all group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Action Buttons & Theme Toggle */}
        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mr-2"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>
          
          <div className="flex items-center gap-4">
            {/* 1. Logic for Logged Out users */}
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-[#6336FA] transition-colors">
                  Login
                </button>
              </SignInButton>
              
              <SignInButton mode="modal">
                <button className={primaryBtnClass}>
                  Get Started
                </button>
              </SignInButton>
            </SignedOut>
            
            {/* 2. Logic for Logged In users */}
            <SignedIn>
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className={primaryBtnClass}>
                  Get Started
                </Link>
                <div className="border-l border-slate-200 dark:border-slate-700 h-6 ml-2" />
                <UserButton 
                  afterSignOutUrl="/" 
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-10 h-10 border-2 border-[#6336FA]"
                    }
                  }}
                />
              </div>
            </SignedIn>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="lg:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="text-[#6336FA]" /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-8 space-y-4">
          {['Courses', 'Features', 'Pricing'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="block text-lg font-bold">
              {item}
            </a>
          ))}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-4">
             <SignedOut>
                <SignInButton mode="modal">
                  <button className="w-full bg-[#6336FA] text-white py-4 rounded-xl font-bold">Get Started</button>
                </SignInButton>
             </SignedOut>
             <SignedIn>
                <Link href="/dashboard" className="w-full bg-[#6336FA] text-white py-4 rounded-xl font-bold text-center">
                   Get Started
                </Link>
                <div className="flex justify-center pt-2">
                  <UserButton afterSignOutUrl="/" showName />
                </div>
             </SignedIn>
          </div>
        </div>
      )}
    </nav>
  );
}