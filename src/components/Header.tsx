'use client';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full h-20 bg-white border-b border-border z-50 px-6 flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted">Delivery to</span>
        <div className="flex items-center gap-2">
          <span className="font-black text-[15px]">Koti Warehouse • 12 mins</span>
          <span className="material-symbols-outlined text-sm">expand_more</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 flex items-center justify-center border border-border">
          <span className="material-symbols-outlined">search</span>
        </button>
        <button className="w-10 h-10 flex items-center justify-center bg-black text-white">
          <span className="material-symbols-outlined">person</span>
        </button>
      </div>
    </header>
  );
}
