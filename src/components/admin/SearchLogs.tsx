'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, TrendingDown, TrendingUp } from 'lucide-react';

export default function SearchLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      const { data } = await supabase
        .from('search_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (data) setLogs(data);
      setLoading(false);
    }
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-black text-white p-8 flex justify-between items-center">
        <div>
          <h3 className="text-[14px] font-black uppercase tracking-widest mb-1">Search Intelligence</h3>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Real-time demand forecasting</p>
        </div>
        <Search size={32} className="opacity-20" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center opacity-20 uppercase font-black tracking-widest">Scanning logs...</div>
        ) : logs.length > 0 ? (
          logs.map((log) => (
            <div key={log.id} className="p-6 border border-border bg-white flex items-center justify-between hover:border-black transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-3 ${log.found ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {log.found ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                </div>
                <div>
                  <p className="font-black text-[16px] uppercase tracking-tighter">{log.query}</p>
                  <p className="text-muted text-[10px] font-bold uppercase tracking-widest">
                    {new Date(log.created_at).toLocaleTimeString()} • {log.found ? 'CONVERTED' : 'BOUNCED'}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-black uppercase px-3 py-1 ${log.found ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                {log.found ? 'Found' : 'Missing'}
              </span>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center opacity-20 uppercase font-black tracking-widest">No search activity recorded</div>
        )}
      </div>
    </div>
  );
}
