'use client';

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 w-full h-[84px] bg-white border-t border-border z-50 md:hidden flex items-center justify-between px-10 pb-safe">
      <div className="flex flex-col items-center gap-1 relative">
        <span className="material-symbols-outlined text-[28px]">home</span>
        <span className="text-[10px] font-black uppercase tracking-widest">Home</span>
        <div className="absolute -bottom-2 w-1.5 h-1.5 bg-black rounded-full"></div>
      </div>
      
      <div className="flex flex-col items-center gap-1 opacity-30">
        <span className="material-symbols-outlined text-[28px]">search</span>
        <span className="text-[10px] font-black uppercase tracking-widest">Search</span>
      </div>
      
      <div className="flex flex-col items-center gap-1 relative">
        <span className="material-symbols-outlined text-[28px]">shopping_bag</span>
        <span className="text-[10px] font-black uppercase tracking-widest">Cart</span>
        <span className="absolute -top-1 -right-3 bg-black text-white text-[9px] w-5 h-5 flex items-center justify-center font-black border-2 border-white">0</span>
      </div>
      
      <div className="flex flex-col items-center gap-1 opacity-30">
        <span className="material-symbols-outlined text-[28px]">person</span>
        <span className="text-[10px] font-black uppercase tracking-widest">Account</span>
      </div>
    </nav>
  );
}
