
import React, { useState, useEffect } from 'react';

const CountdownTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const nextYear = new Date().getFullYear() + 1;
      const difference = +new Date(`${nextYear}-01-01T00:00:00`) - +new Date();
      
      let timeLeft = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      };

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }

      return timeLeft;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const TimeUnit = ({ value, label }: { value: number, label: string }) => (
    <div className="flex flex-col items-center mx-2 md:mx-4">
      <div className="bg-slate-900/50 backdrop-blur-md border border-amber-500/30 rounded-lg p-3 md:p-6 w-16 md:w-24 flex items-center justify-center shadow-lg shadow-amber-900/20">
        <span className="text-2xl md:text-4xl font-black text-amber-400 font-mono">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="mt-2 text-xs md:text-sm font-semibold uppercase tracking-widest text-slate-400">{label}</span>
    </div>
  );

  return (
    <div className="flex flex-wrap justify-center items-center py-8">
      <TimeUnit value={timeLeft.days} label="Days" />
      <TimeUnit value={timeLeft.hours} label="Hours" />
      <TimeUnit value={timeLeft.minutes} label="Mins" />
      <TimeUnit value={timeLeft.seconds} label="Secs" />
    </div>
  );
};

export default CountdownTimer;
