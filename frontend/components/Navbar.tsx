"use client";
import React, { useState, useEffect } from 'react';
import { Moon, Sun, Laptop, ChevronDown } from 'lucide-react';
import { useTheme } from 'next-themes';
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname?.startsWith('/dashboard')) return null;
  if (!mounted) return <div className="h-20" />;

  const isDark = theme === 'dark';

  return (
    <nav 
      className="sticky top-0 z-50 transition-all duration-500 border-b backdrop-blur-md"
      style={{ 
        backgroundColor: isDark ? '#1A2B56' : 'rgba(255, 255, 255, 0.8)',
        borderColor: isDark ? 'rgba(30, 58, 138, 0.3)' : 'rgba(241, 245, 249, 1)'
      }}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="w-10 h-10 bg-[#2D5BFF] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20"
            >
              <Laptop className="text-white w-6 h-6" />
            </motion.div>
            <span className="text-xl font-black tracking-tighter flex items-center gap-1">
              <span className={`uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>Fin</span>
              <span className="text-[#2D5BFF] uppercase">Genius</span>
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className={`hidden xl:flex items-center gap-10 text-[15px] font-medium ${isDark ? 'text-blue-100/80' : 'text-slate-600'}`}>
          {['Home', 'Courses', 'My Learning', 'Community'].map((name) => (
            <Link 
              key={name} 
              href="/"
              className={`relative py-1 transition-colors hover:text-[#2D5BFF] ${isDark && name === 'Home' ? 'text-white' : ''}`}
            >
              {name}
              {name === 'Home' && (
                <motion.span layoutId="nav-underline" className="absolute -bottom-[26px] left-0 w-full h-[3px] bg-[#2D5BFF] rounded-full" />
              )}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 lg:gap-6">
          <button 
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-blue-800/50' : 'hover:bg-slate-100'}`}
          >
            {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          <div className={`h-6 w-px hidden sm:block ${isDark ? 'bg-blue-800' : 'bg-slate-200'}`} />

          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className={`text-sm font-bold transition-colors ${isDark ? 'text-blue-100 hover:text-white' : 'text-slate-700 hover:text-[#2D5BFF]'}`}>
                  Login
                </button>
              </SignInButton>
              <Link href="/dashboard" className="bg-[#2D5BFF] text-white px-6 py-2 rounded-full font-semibold text-sm shadow-md">
                Dashboard
              </Link>
            </SignedOut>

            <SignedIn>
              <Link href="/dashboard" className={`hidden md:block text-sm font-bold transition-colors ${isDark ? 'text-blue-100 hover:text-white' : 'text-slate-700 hover:text-[#2D5BFF]'}`}>
                 Dashboard
              </Link>
              <div className={`flex items-center gap-2 p-1 pr-3 rounded-full border transition-all ${isDark ? 'bg-blue-800/40 border-blue-700' : 'bg-slate-50 border-slate-200'}`}>
                <UserButton afterSignOutUrl="/" />
                <ChevronDown className={`w-4 h-4 ${isDark ? 'text-blue-300' : 'text-slate-400'}`} />
              </div>
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  );
}