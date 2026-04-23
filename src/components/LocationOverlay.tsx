'use client';

import { useUI } from '@/context/UIContext';
import { X, Search, MapPin, Navigation, Loader2 } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

const ALL_LOCATIONS = [
  { id: 1, title: "Kempegowda International Airport", area: "Bengaluru (BLR), Karnataka, India" },
  { id: 2, title: "Bangalore Palace", area: "Palace Cross Road, Vasanth Nagar, Bengaluru, India" },
  { id: 3, title: "Bangalore Cantonment Railway Station", area: "Shivaji Nagar, Bengaluru, Karnataka, India" },
  { id: 4, title: "Bangalore Baptist Hospital", area: "Bellary Road, Vinayakanagar, Hebbal, Bengaluru" },
  { id: 5, title: "MG Road Metro Station", area: "MG Road, Bengaluru, Karnataka, India" },
  { id: 6, title: "Indiranagar 100ft Road", area: "Indiranagar, Bengaluru, Karnataka, India" },
  { id: 7, title: "Koramangala 4th Block", area: "Koramangala, Bengaluru, Karnataka, India" },
  { id: 8, title: "Phoenix Marketcity Mall", area: "Whitefield, Bengaluru, Karnataka, India" },
  { id: 9, title: "Cubbon Park", area: "Kasturba Road, Bengaluru, Karnataka, India" },
  { id: 10, title: "Lalbagh Botanical Garden", area: "Mavalli, Bengaluru, Karnataka, India" },
  { id: 11, title: "Brigade Road Shopping", area: "Ashok Nagar, Bengaluru, Karnataka, India" },
  { id: 12, title: "Manyata Tech Park", area: "Nagawara, Bengaluru, Karnataka, India" },
  { id: 13, title: "Electronic City Phase 1", area: "Hosur Road, Bengaluru, Karnataka, India" },
  { id: 14, title: "UB City Mall", area: "Vittal Mallya Road, Bengaluru, Karnataka, India" },
  { id: 15, title: "Commercial Street", area: "Tasker Town, Bengaluru, Karnataka, India" }
];

export default function LocationOverlay() {
  const { isLocationOpen, setIsLocationOpen, setSelectedAddress } = useUI();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Live Search Logic (Debounced)
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${searchTerm}&countrycodes=in&limit=8&addressdetails=1`,
          { headers: { 'Accept-Language': 'en', 'User-Agent': 'LOUD-QuickCommerce' } }
        );
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
          const formatted = data.map((item: any) => ({
            id: item.place_id,
            title: item.display_name.split(',')[0],
            area: item.display_name.split(',').slice(1, 4).join(',').trim()
          }));
          setSearchResults(formatted);
        }
      } catch (error) {
        console.error("Location Search Failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleDetectLocation = () => {
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await response.json();
        
        if (data && data.address) {
          const addr = data.address;
          const title = addr.road || addr.suburb || addr.neighbourhood || "Current Location";
          const area = `${addr.city || addr.town || addr.state}, ${addr.postcode || ''}`;
          
          setSelectedAddress({ title, area });
        } else {
          setSelectedAddress({ 
            title: "Precision Location", 
            area: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` 
          });
        }
      } catch (error) {
        console.error("Reverse Geocoding Failed:", error);
        setSelectedAddress({ title: "Detected Location", area: "Manual check required" });
      } finally {
        setIsDetecting(false);
        setIsLocationOpen(false);
      }
    }, (error) => {
      console.error("Geolocation Error:", error);
      setIsDetecting(false);
      const messages = {
        1: "Permission Denied. Please enable location in settings.",
        2: "Position Unavailable.",
        3: "Request Timed Out."
      };
      alert(messages[error.code as keyof typeof messages] || "Could not detect location.");
    }, { timeout: 10000 });
  };

  const selectLocation = (loc: { title: string; area: string }) => {
    setSelectedAddress(loc);
    setIsLocationOpen(false);
  };

  useEffect(() => {
    if (isLocationOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isLocationOpen]);

  if (!isLocationOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4">
      {/* BACKDROP */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={() => setIsLocationOpen(false)}
      />

      {/* MODAL CONTENT */}
      <div className="relative w-full max-w-lg bg-white rounded-t-[24px] md:rounded-[24px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom md:zoom-in duration-300">
        {/* HEADER */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-[20px] font-black text-black uppercase tracking-tighter">Change Location</h2>
          <button 
            onClick={() => setIsLocationOpen(false)}
            className="w-10 h-10 flex items-center justify-center bg-uber-gray rounded-full hover:bg-black hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* SEARCH SECTION */}
        <div className="p-6 space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 group-focus-within:text-green-600 transition-colors" size={20} />
            <input 
              ref={inputRef}
              type="text"
              placeholder="Search for area, street name..."
              className="w-full h-14 bg-uber-gray border-2 border-transparent rounded-xl px-12 font-bold text-[15px] focus:bg-white focus:border-green-600 outline-none transition-all placeholder:text-black/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button 
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="w-full h-14 bg-green-700 hover:bg-green-800 text-white rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] font-black text-[15px] disabled:opacity-50"
          >
            {isDetecting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Navigation size={18} fill="currentColor" />
            )}
            {isDetecting ? 'Detecting Precision...' : 'Detect my location'}
          </button>
        </div>

        {/* SUGGESTIONS LIST */}
        <div className="pb-8">
          <div className="px-6 py-2 flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-widest text-black/40">
              {searchTerm.length >= 2 ? (isSearching ? 'Searching across India...' : 'Results') : 'Suggested Locations'}
            </span>
            {isSearching && <Loader2 className="animate-spin text-green-600" size={14} />}
          </div>
          
          <div className="max-h-[350px] overflow-y-auto no-scrollbar">
            {(searchTerm.length >= 2 ? searchResults : ALL_LOCATIONS.slice(0, 4)).map((loc) => (
              <div 
                key={loc.id}
                className="px-6 py-5 flex gap-4 hover:bg-uber-gray cursor-pointer transition-colors group border-b border-border last:border-0"
                onClick={() => selectLocation(loc)}
              >
                <div className="w-10 h-10 flex-shrink-0 bg-uber-gray rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
                  <MapPin size={20} className="text-black/40 group-hover:text-green-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-black text-black leading-tight mb-1 line-clamp-1">{loc.title}</span>
                  <span className="text-[13px] text-black/50 font-medium leading-tight line-clamp-1">{loc.area}</span>
                </div>
              </div>
            ))}
            
            {searchTerm.length >= 2 && !isSearching && searchResults.length === 0 && (
              <div className="p-12 text-center">
                <span className="text-[15px] text-black/30 font-bold">No locations found in India.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
