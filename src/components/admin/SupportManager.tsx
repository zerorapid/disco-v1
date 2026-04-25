'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { MessageSquare, Send, User, Clock, CheckCircle2 } from 'lucide-react';

export default function SupportManager() {
  const [chats, setChats] = useState<any[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChats();
    const channel = supabase
      .channel('admin_support')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages' }, (payload) => {
        fetchChats();
        if (selectedPhone === payload.new.customer_phone) {
          setMessages((prev) => [...prev, payload.new]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedPhone]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchChats = async () => {
    const { data } = await supabase
      .from('support_messages')
      .select('customer_phone, created_at, message')
      .order('created_at', { ascending: false });

    if (data) {
      const uniqueChats = Array.from(new Set(data.map(c => c.customer_phone)))
        .map(phone => data.find(c => c.customer_phone === phone));
      setChats(uniqueChats);
    }
  };

  const fetchMessages = async (phone: string) => {
    const { data } = await supabase
      .from('support_messages')
      .select('*')
      .eq('customer_phone', phone)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  const handleSend = async () => {
    if (!reply.trim() || !selectedPhone) return;
    setLoading(true);
    const { error } = await supabase.from('support_messages').insert({
      customer_phone: selectedPhone,
      sender: 'admin',
      message: reply.trim()
    });
    if (!error) setReply('');
    setLoading(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-300px)] bg-white border border-black/10 overflow-hidden relative">
      {/* CHAT LIST */}
      <div className={`w-full md:w-80 border-r border-black/10 flex flex-col bg-uber-gray/10 ${selectedPhone ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-black/10">
          <h3 className="text-[14px] font-black uppercase tracking-widest">Active Inquiries</h3>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {chats.map((chat) => (
            <button
              key={chat.customer_phone}
              onClick={() => { setSelectedPhone(chat.customer_phone); fetchMessages(chat.customer_phone); }}
              className={`w-full text-left p-6 border-b border-black/5 transition-all hover:bg-white ${
                selectedPhone === chat.customer_phone ? 'bg-white shadow-xl translate-x-1' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-black tracking-tighter">{chat.customer_phone}</span>
                <span className="text-[10px] font-bold text-black/40">{new Date(chat.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="text-[11px] font-medium text-black/60 line-clamp-1">{chat.message}</p>
            </button>
          ))}
          {chats.length === 0 && (
            <div className="p-12 text-center space-y-4">
              <MessageSquare size={32} className="mx-auto text-black/10" />
              <p className="text-[10px] font-black uppercase text-black/20 tracking-widest">No Active Chats</p>
            </div>
          )}
        </div>
      </div>

      {/* CHAT VIEW */}
      <div className={`flex-1 flex flex-col bg-white ${!selectedPhone ? 'hidden md:flex' : 'flex'}`}>
        {selectedPhone ? (
          <>
            <div className="p-4 md:p-6 border-b border-black/10 flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedPhone(null)}
                  className="md:hidden w-10 h-10 flex items-center justify-center bg-uber-gray"
                >
                  <MessageSquare size={20} />
                </button>
                <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black">
                  {selectedPhone.slice(-2)}
                </div>
                <div>
                  <h4 className="text-[14px] font-black tracking-tight">{selectedPhone}</h4>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Live Channel</span>
                  </div>
                </div>
              </div>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-8 space-y-6 bg-uber-gray/5 no-scrollbar"
            >
              {messages.map((msg, i) => (
                <div 
                  key={i}
                  className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] p-4 text-[14px] font-bold ${
                    msg.sender === 'admin' 
                      ? 'bg-black text-white' 
                      : 'bg-white border border-black/10 text-black shadow-lg'
                  }`}>
                    {msg.message}
                    <div className={`text-[9px] mt-2 opacity-40 ${msg.sender === 'admin' ? 'text-right' : ''}`}>
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-black/10 bg-white flex gap-4">
              <input 
                type="text"
                placeholder="Type your response..."
                className="flex-1 h-14 bg-uber-gray px-6 text-sm font-bold outline-none border border-transparent focus:border-black transition-all"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                disabled={loading || !reply.trim()}
                className="px-8 bg-black text-white text-caption font-black uppercase tracking-widest active-scale disabled:opacity-20"
              >
                Send Response
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20 space-y-6">
            <div className="w-24 h-24 bg-uber-gray flex items-center justify-center rounded-full text-black/10">
              <MessageSquare size={48} />
            </div>
            <div>
              <h3 className="text-[18px] font-black uppercase tracking-tighter">Support Command</h3>
              <p className="text-[12px] font-bold text-black/40 uppercase tracking-widest mt-2">Select a channel to begin communication</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
