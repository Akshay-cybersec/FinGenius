// components/Hero.tsx
import React from 'react';

export default function Hero() {
  return (
    <section className="relative min-h-screen pt-24 pb-12 px-6 overflow-hidden bg-gradient-to-br from-[#7e57c2] via-[#ab47bc] to-[#ff7043]">
      {/* Animated Clouds/Blobs */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-[10%] left-[-5%] w-96 h-96 bg-white rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-300 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="text-white space-y-6">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            Learn New Skills <br />
            <span className="text-yellow-300">Anytime, Anywhere!</span>
          </h1>
          <p className="text-lg text-white/90 max-w-md">
            Unlock Your Potential with Our Online Courses. Join thousands of learners worldwide.
          </p>
          <div className="flex gap-4">
            <button className="px-8 py-3 bg-orange-500 hover:bg-orange-600 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg">
              Explore Courses &gt;
            </button>
            <button className="px-8 py-3 bg-indigo-700/50 hover:bg-indigo-700 backdrop-blur-md border border-white/30 rounded-full font-bold transition-all">
              Get Started &gt;
            </button>
          </div>
        </div>

        {/* Illustration Placeholder */}
        <div className="relative flex justify-center">
          <div className="w-full max-w-lg aspect-square bg-white/20 backdrop-blur-xl rounded-3xl border border-white/30 flex items-center justify-center shadow-2xl">
             <p className="text-white font-medium">Main Illustration (Rocket/Study)</p>
          </div>
        </div>
      </div>
    </section>
  );
}