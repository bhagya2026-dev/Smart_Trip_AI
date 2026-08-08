import React from 'react';
import { Activity, ArrowRight, Calendar, Compass, Flame, MapPin, Navigation, Play, ShieldCheck, Sparkles } from 'lucide-react';
import type { Destination } from '../components/DestinationSearchBar';
import { SRI_LANKA_DESTINATIONS } from '../components/DestinationSearchBar';

interface HomeViewProps {
  onStartTrip: () => void;
  onSelectDestination: (dest: Destination) => void;
  onNavigateToTab: (tab: 'HOME' | 'LIVE_HUD' | 'HISTORY' | 'FUEL' | 'PROFILE') => void;
  totalTripsCount: number;
  totalDistanceKm: number;
  totalIdleCost: number;
  avgSafetyScore: number;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onStartTrip,
  onSelectDestination,
  onNavigateToTab,
  totalTripsCount,
  totalDistanceKm,
  totalIdleCost,
  avgSafetyScore,
}) => {
  return (
    <div className="w-full min-h-screen bg-[#0B1117] text-[#E6F1FF] pb-24 font-sans antialiased px-4 pt-4">
      {/* 1. Futuristic Animated Hero Banner Card with Cyber Car Image */}
      <div className="relative w-full rounded-2xl overflow-hidden mb-6 border border-[#1F2A37] shadow-card-soft group">
        {/* Cyber Car Hero Image Showcase */}
        <div className="h-64 sm:h-72 w-full relative overflow-hidden">
          <img
            src="/hero_car.jpg"
            alt="SmartTrip Cyber Car Driving in Sri Lanka"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {/* Glassmorphic Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1117] via-[#0B1117]/70 to-transparent flex flex-col justify-end p-5" />
        </div>

        {/* Hero Card Content */}
        <div className="p-5 bg-gradient-to-b from-[#111A23] to-[#0B1117] relative z-10 -mt-12 border-t border-[#1F2A37]/80 rounded-b-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="badge-live px-3 py-1 rounded-full text-[11px] font-extrabold font-mono flex items-center">
              <span className="w-2 h-2 mr-1.5 rounded-full bg-[#00E676] animate-ping" />
              SMARTTRIP AI TELEMATICS
            </span>

            {/* Quick Profile Pill */}
            <button
              onClick={() => onNavigateToTab('PROFILE')}
              className="flex items-center space-x-2 bg-[#16212B] hover:bg-[#1F2A37] px-2.5 py-1 rounded-full border border-[#00E676]/40 transition-all cursor-pointer"
            >
              <img src="/driver_avatar.jpg" alt="Kasun Perera" className="w-5 h-5 rounded-full object-cover" />
              <span className="text-[11px] font-mono text-[#E6F1FF] font-bold">Kasun</span>
            </button>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#E6F1FF] tracking-tight leading-tight">
              DRIVE SMARTER ACROSS <span className="bg-gradient-to-r from-[#00E676] to-[#00B8D4] bg-clip-text text-transparent">SRI LANKA</span>
            </h1>
            <p className="text-xs text-[#9FB3C8] font-sans mt-1.5 max-w-md">
              Transform live device sensors into real-time driving safety scores, fuel friction cost analytics, and automated pit-stop logging.
            </p>
          </div>

          {/* Quick Action Hero Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={onStartTrip}
              className="btn-electric-green px-6 py-3 text-xs sm:text-sm font-extrabold font-mono flex items-center space-x-2 shadow-neon-green"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>▶ START TRIP NOW</span>
            </button>

            <button
              onClick={() => onNavigateToTab('LIVE_HUD')}
              className="btn-secondary-green px-5 py-3 text-xs sm:text-sm font-bold font-mono flex items-center space-x-2"
            >
              <Activity className="w-4 h-4 text-[#00E676]" />
              <span>OPEN LIVE HUD</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Quick Stat Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 font-mono">
        <div
          onClick={() => onNavigateToTab('HISTORY')}
          className="cyber-card p-3.5 hover:border-[#00E676]/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-[#9FB3C8] text-[10px] mb-1">
            <span>TOTAL TRIPS</span>
            <Calendar className="w-3.5 h-3.5 text-[#00E676]" />
          </div>
          <div className="text-xl font-extrabold text-[#E6F1FF]">{totalTripsCount}</div>
          <div className="text-[9px] text-[#00E676] mt-0.5 font-bold">Recorded Drives</div>
        </div>

        <div
          onClick={() => onNavigateToTab('LIVE_HUD')}
          className="cyber-card p-3.5 hover:border-[#00B8D4]/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-[#9FB3C8] text-[10px] mb-1">
            <span>DISTANCE</span>
            <Navigation className="w-3.5 h-3.5 text-[#00B8D4]" />
          </div>
          <div className="text-xl font-extrabold text-[#00B8D4]">{totalDistanceKm.toFixed(1)} km</div>
          <div className="text-[9px] text-[#9FB3C8] mt-0.5">Covered so far</div>
        </div>

        <div
          onClick={() => onNavigateToTab('LIVE_HUD')}
          className="cyber-card p-3.5 hover:border-[#00E676]/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-[#9FB3C8] text-[10px] mb-1">
            <span>SAFETY RATING</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#00E676]" />
          </div>
          <div className="text-xl font-extrabold text-[#00E676]">{avgSafetyScore}/100</div>
          <div className="text-[9px] text-[#00E676] mt-0.5 font-bold">EXCELLENT</div>
        </div>

        <div
          onClick={() => onNavigateToTab('FUEL')}
          className="cyber-card p-3.5 hover:border-[#FF5252]/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-[#9FB3C8] text-[10px] mb-1">
            <span>IDLE WASTED</span>
            <Flame className="w-3.5 h-3.5 text-[#FF5252]" />
          </div>
          <div className="text-xl font-extrabold text-[#FF5252]">Rs. {totalIdleCost.toFixed(0)}</div>
          <div className="text-[9px] text-[#9FB3C8] mt-0.5 font-bold">Traffic Fuel Friction</div>
        </div>
      </div>

      {/* 3. Popular Sri Lanka Destinations Cards */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold font-mono text-[#E6F1FF] flex items-center">
            <Compass className="w-4 h-4 text-[#00E676] mr-1.5" />
            FEATURED SRI LANKA DESTINATIONS
          </h3>
          <span className="text-[10px] font-mono text-[#00B8D4]">Tap to Navigate</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SRI_LANKA_DESTINATIONS.slice(0, 4).map((dest) => (
            <div
              key={dest.id}
              onClick={() => {
                onSelectDestination(dest);
                onNavigateToTab('LIVE_HUD');
              }}
              className="cyber-card p-3 hover:border-[#00E676] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-lg bg-[#00E676]/15 text-[#00E676] group-hover:bg-[#00E676] group-hover:text-[#0B1117] transition-all">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-[#00E676] font-bold">~{dest.distanceKmEst} km</span>
                </div>
                <h4 className="text-xs font-bold text-[#E6F1FF] group-hover:text-[#00E676] transition-all line-clamp-1">
                  {dest.name}
                </h4>
                <p className="text-[10px] text-[#9FB3C8] font-mono mt-0.5">{dest.city}, Sri Lanka</p>
              </div>

              <div className="mt-3 text-[10px] font-mono font-bold text-[#00B8D4] flex items-center justify-between group-hover:translate-x-0.5 transition-transform">
                <span>START ROUTE</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Conversational AI Assistant Banner Teaser */}
      <div className="cyber-card p-5 border-l-4 border-l-[#00E676] bg-gradient-to-r from-[#16212B] to-[#111A23] mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#00E676] font-mono text-xs font-bold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>ON-DEVICE CONVERSATIONAL AI ASSISTANT</span>
          </div>
          <h4 className="text-sm font-bold text-[#E6F1FF]">
            Query your driving scores & Sri Lanka fuel waste in natural language!
          </h4>
          <p className="text-xs text-[#9FB3C8] mt-1 max-w-lg">
            Try asking: "How much money did I waste in traffic this week?" or "What was my highest eco score?"
          </p>
        </div>

        <button
          onClick={() => onNavigateToTab('LIVE_HUD')}
          className="btn-secondary-green px-4 py-2 text-xs font-mono font-bold flex items-center space-x-1 whitespace-nowrap"
        >
          <span>TRY AI CHAT</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </button>
      </div>
    </div>
  );
};
