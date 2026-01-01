
import React from 'react';

const CelebrationHeader: React.FC = () => {
  return (
    <header className="relative text-center py-20 px-4 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-gradient-to-b from-amber-500/10 to-transparent blur-3xl rounded-full -z-10" />
      
      <h1 className="text-5xl md:text-8xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 animate-pulse mb-4">
        Happy New Year
      </h1>
      
      <p className="text-xl md:text-2xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
        A new chapter unfolds. Time to celebrate the memories of the past and the possibilities of the future.
      </p>
      
      <div className="mt-8 flex justify-center gap-4">
        <div className="h-1 w-12 bg-amber-500 rounded-full" />
        <div className="h-1 w-4 bg-amber-500/50 rounded-full" />
        <div className="h-1 w-2 bg-amber-500/20 rounded-full" />
      </div>
    </header>
  );
};

export default CelebrationHeader;
