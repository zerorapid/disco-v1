'use client';

import { MapPin, Navigation, Bike } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function OrderTracker() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => (prev < 100 ? prev + 1 : 0));
    }, 200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white border-thin p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-[20px] font-black uppercase tracking-tighter leading-none mb-2">Targeting Sector 4</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 animate-pulse">Rider at Hub • Loading Cargo</p>
        </div>
        <div className="w-12 h-12 bg-black text-white flex items-center justify-center">
          <Navigation size={20} className="animate-bounce" />
        </div>
      </div>

      {/* ANIMATED MAP TRACK - Tactic 46 */}
      <div className="relative h-20 flex items-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-[2px] bg-uber-gray"></div>
        </div>
        <div className="absolute inset-0 flex items-center">
          <div className="h-[2px] bg-black transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
        
        {/* Hub */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-4 h-4 bg-black rotate-45 border-2 border-white"></div>
          <span className="text-[8px] font-black uppercase tracking-widest mt-6 opacity-30">Hub</span>
        </div>

        {/* Rider */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-300 z-10"
          style={{ left: `${progress}%`, marginLeft: '-12px' }}
        >
          <div className="bg-black text-white p-2 shadow-2xl scale-125">
            <Bike size={14} />
          </div>
        </div>

        {/* Home */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-10 h-10 bg-uber-gray flex items-center justify-center border-thin">
            <MapPin size={16} />
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest mt-6">You</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-uber-gray">
          <p className="text-[8px] font-black uppercase tracking-widest text-muted mb-1">Estimated Arrival</p>
          <p className="text-[14px] font-black">12 MINS</p>
        </div>
        <div className="p-4 bg-uber-gray">
          <p className="text-[8px] font-black uppercase tracking-widest text-muted mb-1">Rider Terminal</p>
          <p className="text-[14px] font-black">RISHABH • 4.9★</p>
        </div>
      </div>

      <button className="w-full h-14 border-thin font-black uppercase text-[10px] tracking-[0.3em] hover:bg-black hover:text-white transition-all">
        Contact Logistics
      </button>
    </div>
  );
}
