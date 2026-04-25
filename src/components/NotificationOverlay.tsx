'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUI } from '@/context/UIContext';
import { useAccount } from '@/context/AccountContext';
import { X, Bell, Zap, ShoppingBag, Info, ChevronRight, User } from 'lucide-react';

export default function NotificationOverlay() {
  const { isNotificationsOpen, setIsNotificationsOpen } = useUI();
  const { user } = useAccount();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isNotificationsOpen) {
      fetchNotifications();
    }
  }, [isNotificationsOpen, user?.phone]);

  async function fetchNotifications() {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('is_active', true);

    if (user?.phone) {
      // Fetch notifications where target_phone is NULL (all) OR target_phone matches user
      query = query.or(`target_phone.is.null,target_phone.eq.${user.phone}`);
    } else {
      // Guest users only see global notifications
      query = query.is('target_phone', null);
    }

    const { data } = await query.order('created_at', { ascending: false });
    
    if (data) setNotifications(data);
    setLoading(false);
  }

  if (!isNotificationsOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={() => setIsNotificationsOpen(false)}
      />

      {/* Panel */}
      <div className="relative w-full max-w-[400px] bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-uber-gray flex justify-between items-center bg-black text-white">
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-green-500" />
            <h2 className="text-heading-3 uppercase tracking-tighter">DISCO Updates</h2>
          </div>
          <button 
            onClick={() => setIsNotificationsOpen(false)}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* User Badge if logged in */}
        {user && (
          <div className="px-6 py-2 bg-uber-gray flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-[10px] font-black uppercase opacity-40">Personalized Feed for {user.phone}</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-caption animate-pulse">Syncing Alerts...</div>
          ) : notifications.length > 0 ? (
            notifications.map((n) => (
              <div 
                key={n.id} 
                className={`border-thin p-5 group hover:border-black transition-all cursor-pointer relative overflow-hidden ${n.target_phone ? 'bg-green-50/50 border-green-200' : 'bg-uber-gray/30'}`}
                onClick={() => n.link && (window.location.href = n.link)}
              >
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-white border-thin flex items-center justify-center">
                    {n.target_phone ? <User size={18} className="text-green-600" /> : 
                     n.type === 'deal' ? <Zap size={18} className="text-green-600" fill="currentColor" /> : 
                     n.type === 'order' ? <ShoppingBag size={18} /> : 
                     <Info size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-body-primary font-black uppercase text-sm">{n.title}</h4>
                      <span className="text-[9px] font-bold opacity-30">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-body-secondary text-xs leading-relaxed opacity-60">
                      {n.message}
                    </p>
                  </div>
                </div>
                {n.target_phone && (
                  <div className="mt-2 text-[8px] font-black uppercase text-green-600 tracking-widest">
                    Direct Message
                  </div>
                )}
                {n.link && (
                  <div className="mt-4 flex items-center gap-1 text-[10px] font-black uppercase text-black/40 group-hover:text-black transition-colors">
                    View Details <ChevronRight size={12} />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-4 opacity-20">
              <Bell size={48} strokeWidth={1} />
              <p className="text-caption">No new alerts. Stay disco!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-uber-gray bg-uber-gray/10">
          <p className="text-[10px] font-bold text-center opacity-40 uppercase tracking-widest">
            Notifications are cleared every 24 hours
          </p>
        </div>
      </div>
    </div>
  );
}
