'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, Plus, X, Loader2, Trash2, Zap, ShoppingBag, Info, Send, User, Users } from 'lucide-react';

export default function NotificationManager() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [targetType, setTargetType] = useState<'all' | 'specific'>('all');
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    link: '',
    type: 'info',
    target_phone: ''
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setNotifications(data);
    setLoading(false);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      ...newNotification,
      text: newNotification.message, // Map to legacy column
      target_phone: targetType === 'all' ? null : newNotification.target_phone
    };

    const { error } = await supabase.from('notifications').insert([payload]);
    
    if (!error) {
      setNewNotification({ title: '', message: '', link: '', type: 'info', target_phone: '' });
      fetchNotifications();
    } else {
      alert("Error sending notification: " + error.message);
    }
    setIsSubmitting(false);
  }

  async function deleteNotification(id: string) {
    if (!confirm("Are you sure? This will remove the alert for the customer.")) return;
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (!error) fetchNotifications();
  }

  return (
    <div className="space-y-8">
      {/* SEND FORM */}
      <div className="bg-white border-2 border-black p-8 shadow-xl">
        <div className="flex items-center gap-3 border-b border-uber-gray pb-6 mb-6">
          <Send size={24} />
          <h2 className="text-heading-3 uppercase">Dispatch Alert</h2>
        </div>

        <form onSubmit={handleSend} className="space-y-6">
          {/* TARGET SELECTOR */}
          <div className="flex bg-uber-gray p-1 rounded-sm">
            <button 
              type="button"
              onClick={() => setTargetType('all')}
              className={`flex-1 py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${targetType === 'all' ? 'bg-black text-white shadow-lg' : 'text-black/40 hover:text-black'}`}
            >
              <Users size={14} />
              Broadcast to All
            </button>
            <button 
              type="button"
              onClick={() => setTargetType('specific')}
              className={`flex-1 py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${targetType === 'specific' ? 'bg-black text-white shadow-lg' : 'text-black/40 hover:text-black'}`}
            >
              <User size={14} />
              Specific User
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-caption text-black/40">Alert Title</label>
              <input 
                required 
                type="text" 
                value={newNotification.title}
                onChange={e => setNewNotification({...newNotification, title: e.target.value})}
                placeholder="Short & Punchy"
                className="w-full h-12 bg-uber-gray px-4 font-black" 
              />
            </div>
            
            {targetType === 'specific' ? (
              <div className="space-y-2 animate-in slide-in-from-left duration-300">
                <label className="text-caption text-black/40">Target Phone Number</label>
                <input 
                  required 
                  type="text" 
                  value={newNotification.target_phone}
                  onChange={e => setNewNotification({...newNotification, target_phone: e.target.value})}
                  placeholder="919876543210"
                  className="w-full h-12 bg-uber-gray px-4 font-black border-2 border-black" 
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-caption text-black/40">Alert Type</label>
                <select 
                  value={newNotification.type}
                  onChange={e => setNewNotification({...newNotification, type: e.target.value})}
                  className="w-full h-12 bg-uber-gray px-4 font-black"
                >
                  <option value="info">General Info</option>
                  <option value="deal">Price/Deal Alert</option>
                  <option value="order">Order Update</option>
                </select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-caption text-black/40">Message Content</label>
            <textarea 
              required 
              rows={3}
              value={newNotification.message}
              onChange={e => setNewNotification({...newNotification, message: e.target.value})}
              placeholder="The details..."
              className="w-full bg-uber-gray p-4 font-bold resize-none" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-caption text-black/40">Action Link (Optional)</label>
            <input 
              type="text" 
              value={newNotification.link}
              onChange={e => setNewNotification({...newNotification, link: e.target.value})}
              placeholder="/deals or https://..."
              className="w-full h-12 bg-uber-gray px-4 font-bold" 
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full h-14 text-white text-caption flex items-center justify-center gap-3 active-scale transition-all ${targetType === 'all' ? 'bg-black' : 'bg-green-600'}`}
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={20} />}
            {targetType === 'all' ? 'Broadcast to Everyone' : 'Direct Message User'}
          </button>
        </form>
      </div>

      {/* FEED */}
      <div className="space-y-4">
        <h3 className="text-caption text-black/40 uppercase tracking-widest">Sent History</h3>
        <div className="space-y-2">
          {loading ? (
            <div className="h-40 flex items-center justify-center text-caption animate-pulse">Syncing...</div>
          ) : notifications.map(n => (
            <div key={n.id} className={`border-thin p-6 flex items-center justify-between group hover:border-black transition-all ${n.target_phone ? 'bg-green-50/50' : 'bg-white'}`}>
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white border-thin flex items-center justify-center">
                  {n.target_phone ? <User size={20} className="text-green-600" /> : <Users size={20} />}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="text-body-primary font-black uppercase">{n.title}</h4>
                    {n.target_phone ? (
                      <span className="text-[10px] bg-green-600 text-white px-2 py-0.5 font-bold">TO: {n.target_phone}</span>
                    ) : (
                      <span className="text-[10px] bg-uber-gray px-2 py-0.5 font-bold">BROADCAST</span>
                    )}
                  </div>
                  <p className="text-body-secondary text-xs opacity-60 mt-1">{n.message}</p>
                </div>
              </div>
              <button 
                onClick={() => deleteNotification(n.id)}
                className="w-10 h-10 border-thin flex items-center justify-center text-red-600 hover:bg-red-50 transition-colors active-scale"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
