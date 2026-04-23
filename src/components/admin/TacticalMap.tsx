'use client';

import { Navigation, Bike, Package } from 'lucide-react';

export default function TacticalMap() {
  const units = [
    { id: 1, type: 'rider', top: '20%', left: '30%', status: 'Idle' },
    { id: 2, type: 'order', top: '45%', left: '60%', status: 'Pending' },
    { id: 3, type: 'rider', top: '70%', left: '45%', status: 'En-route' },
    { id: 4, type: 'warehouse', top: '50%', left: '50%', status: 'HQ' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-[700px] border border-border bg-uber-gray relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }} 
      />
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-black/5 animate-ping" />
      
      {units.map((u) => (
        <div 
          key={u.id} 
          className="absolute transition-all duration-1000"
          style={{ top: u.top, left: u.left }}
        >
          <div className="group relative flex items-center justify-center">
            {u.type === 'rider' && (
              <div className="p-3 bg-black text-white rounded-full shadow-2xl relative z-10 animate-bounce">
                <Bike size={20} />
              </div>
            )}
            {u.type === 'order' && (
              <div className="p-3 bg-orange-500 text-white rounded-full shadow-2xl relative z-10">
                <Package size={20} />
              </div>
            )}
            {u.type === 'warehouse' && (
              <div className="p-4 bg-red-600 text-white shadow-2xl relative z-10">
                <Navigation size={24} />
              </div>
            )}
            
            <div className="absolute bottom-full mb-3 hidden group-hover:block bg-black text-white p-3 whitespace-nowrap z-50">
              <p className="text-[10px] font-black uppercase tracking-widest">{u.type} #{u.id}</p>
              <p className="text-[9px] font-bold text-white/50 uppercase">{u.status}</p>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black"></div>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute top-8 left-8 bg-black text-white p-6 shadow-2xl space-y-4">
        <h3 className="text-[12px] font-black uppercase tracking-[0.2em] mb-4">Tactical Grid 01</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-green-500">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            GPS SYNC: ACTIVE
          </div>
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
            <Bike size={14} />
            RIDERS: 12 AVAILABLE
          </div>
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
            <Package size={14} />
            PENDING: 4 SECTORS
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 bg-white border border-black p-6 flex gap-6 shadow-2xl">
        <div className="text-center">
          <p className="text-[24px] font-black leading-none">9.2</p>
          <p className="text-[9px] font-black text-muted uppercase tracking-widest mt-1">AVG MINS</p>
        </div>
        <div className="w-[1px] bg-border"></div>
        <div className="text-center">
          <p className="text-[24px] font-black leading-none text-orange-500">4</p>
          <p className="text-[9px] font-black text-muted uppercase tracking-widest mt-1">HOT SPOTS</p>
        </div>
      </div>
    </div>
  );
}
