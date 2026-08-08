import React from 'react';
import { Play, ShieldCheck, Square, Zap } from 'lucide-react';

interface StartTripHeroCardProps {
  isSimulating: boolean;
  onStartTrip: () => void;
  onEndTrip: () => void;
}

export const StartTripHeroCard: React.FC<StartTripHeroCardProps> = ({
  isSimulating,
  onStartTrip,
  onEndTrip,
}) => {
  return (
    <div className="cyber-card p-6 mb-4 relative overflow-hidden font-sans border-l-4 border-l-[#00E676]">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#00E676]/15 via-transparent to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-start space-y-3">
        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/40 uppercase tracking-wider">
          SRI LANKA INTELLIGENT TELEMATICS
        </span>

        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#E6F1FF] tracking-tight">
            {isSimulating ? 'TRIP IN PROGRESS' : 'READY TO GO?'}
          </h2>
          <p className="text-xs text-[#9FB3C8] mt-1 max-w-lg">
            {isSimulating
              ? 'Tracking live telemetry, G-force vectors, intermediate pit-stops, and fuel friction cost in real time.'
              : 'Start your trip to track live telemetry, analyze idle fuel waste, and drive smarter across Sri Lanka.'}
          </p>
        </div>

        {/* The ONLY Middle Start / End Trip Button */}
        <div className="pt-2 w-full sm:w-auto">
          {isSimulating ? (
            <button
              onClick={onEndTrip}
              className="btn-danger-red w-full sm:w-auto px-6 py-3.5 text-sm font-extrabold font-mono flex items-center justify-center space-x-2 shadow-hud-red animate-pulse"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>⏹ END TRIP & SAVE LOG</span>
            </button>
          ) : (
            <button
              onClick={onStartTrip}
              className="btn-electric-green w-full sm:w-auto px-8 py-3.5 text-sm font-extrabold font-mono flex items-center justify-center space-x-2 shadow-neon-green"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>▶ START TRIP</span>
            </button>
          )}
        </div>

        {/* Feature Micro-Badges */}
        <div className="flex items-center space-x-4 pt-1 text-[11px] font-mono text-[#9FB3C8]">
          <span className="flex items-center">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00E676] mr-1" />
            Safety AI
          </span>
          <span className="flex items-center">
            <Zap className="w-3.5 h-3.5 text-[#00B8D4] mr-1" />
            Fuel Friction
          </span>
        </div>
      </div>
    </div>
  );
};
