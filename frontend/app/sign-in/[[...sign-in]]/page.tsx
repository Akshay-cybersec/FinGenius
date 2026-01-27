"use client";

import { SignIn } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-6">
      {/* Back Button */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link 
          href="/" 
          className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-medium"
        >
          <ArrowLeft size={18} />
          Back to home
        </Link>
      </motion.div>

      {/* Unique Auth Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        {/* Decorative Background Block */}
        <div className="absolute inset-0 bg-[#6336FA] rounded-[2rem] translate-x-3 translate-y-3 -z-10" />
        
        <div className="bg-white border-2 border-black rounded-[2rem] overflow-hidden shadow-xl">
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: 
                  "bg-[#6336FA] hover:bg-[#5229d1] text-sm normal-case border-0 shadow-none",
                card: "shadow-none border-0",
                headerTitle: "font-serif text-3xl tracking-tight text-[#1a1a1a]",
                headerSubtitle: "text-gray-500",
                socialButtonsBlockButton: "border-2 border-gray-100 hover:border-black transition-all",
                footerActionLink: "text-[#6336FA] hover:text-[#5229d1] font-bold"
              }
            }}
          />
        </div>
      </motion.div>

      {/* Floating Sparkle Decoration */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="mt-12 text-purple-200"
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M20 0L24.5 15.5L40 20L24.5 24.5L20 40L15.5 24.5L0 20L15.5 15.5L20 0Z" fill="currentColor"/>
        </svg>
      </motion.div>
    </div>
  );
}