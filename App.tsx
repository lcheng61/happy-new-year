
import React, { useState } from 'react';
import FireworksDisplay from './components/FireworksDisplay.tsx';
import CelebrationHeader from './components/CelebrationHeader.tsx';
import CountdownTimer from './components/CountdownTimer.tsx';
import ResolutionBuddy from './components/ResolutionBuddy.tsx';
import FestiveGallery from './components/FestiveGallery.tsx';
import SpeechSection from './components/SpeechSection.tsx';
import AchievementsGallery from './components/AchievementsGallery.tsx';
import MusicPlayer from './components/MusicPlayer.tsx';
import { generateSpeechAudio } from './services/geminiService.ts';
import { playRawPcm } from './utils/audioUtils.ts';

const App: React.FC = () => {
  const [loadingGreeting, setLoadingGreeting] = useState(false);

  const handleFestiveGreeting = async () => {
    if (loadingGreeting) return;
    setLoadingGreeting(true);
    try {
      const audioData = await generateSpeechAudio(
        "Welcome to the New Year Celebration Hub! Happy New Year to you and your loved ones. Let's make this year extraordinary.",
        'Puck'
      );
      if (audioData) {
        await playRawPcm(audioData);
      }
    } catch (error) {
      console.error("Greeting failed", error);
    } finally {
      setLoadingGreeting(false);
    }
  };

  return (
    <div className="min-h-screen relative text-slate-200 selection:bg-amber-500/30">
      {/* Background Layer */}
      <FireworksDisplay />
      
      {/* Background Music Control */}
      <MusicPlayer />
      
      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 pb-20">
        <CelebrationHeader />
        
        <section className="mb-24">
          <CountdownTimer />
        </section>

        {/* Action Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24">
          <div className="animate-in fade-in slide-in-from-left duration-1000">
            <ResolutionBuddy />
          </div>
          <div className="animate-in fade-in slide-in-from-right duration-1000">
            <FestiveGallery />
          </div>
        </div>

        {/* Speech Section */}
        <SpeechSection />

        {/* Achievements Section moved to the very end of the page content */}
        <section className="mb-24">
          <AchievementsGallery />
        </section>

        {/* Footer */}
        <footer className="text-center py-10 opacity-50 text-sm">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-10 bg-slate-700" />
            <span className="font-display italic text-lg">Fin de l'année</span>
            <div className="h-px w-10 bg-slate-700" />
          </div>
          <p>© {new Date().getFullYear()} Celebration Hub • Powered by Gemini AI</p>
        </footer>
      </main>

      {/* Persistent Audio Player Simulation (Now Functional) */}
      <div className="fixed bottom-6 right-6 z-50 group">
        <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-slate-800 p-3 rounded-full shadow-2xl hover:scale-105 transition-all">
          <div className="flex gap-1 items-end h-4 w-6 px-1">
            <div className="w-1 bg-amber-500 animate-[bounce_1s_infinite_100ms]" style={{ height: '60%' }} />
            <div className="w-1 bg-amber-500 animate-[bounce_1s_infinite_300ms]" style={{ height: '100%' }} />
            <div className="w-1 bg-amber-500 animate-[bounce_1s_infinite_500ms]" style={{ height: '80%' }} />
          </div>
          <div className="overflow-hidden w-0 group-hover:w-32 transition-all duration-500 whitespace-nowrap">
            <p className="text-xs font-bold text-slate-300">Festive Greeting</p>
          </div>
          <button 
            onClick={handleFestiveGreeting}
            disabled={loadingGreeting}
            className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 transition-transform active:scale-90 hover:bg-amber-400 disabled:opacity-50"
          >
            {loadingGreeting ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
