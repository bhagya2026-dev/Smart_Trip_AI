import React from 'react';
import { Coffee, MapPin } from 'lucide-react';
import type { PitStop } from '../../domain/models/telemetry';

interface PitStopTimelineProps {
  pitStops: PitStop[];
}

export const PitStopTimeline: React.FC<PitStopTimelineProps> = ({ pitStops }) => {
  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="cyber-card p-4 mb-4 font-sans">
      <div className="flex items-center justify-between border-b border-[#1F2A37] pb-2 mb-3 text-xs font-mono">
        <span className="flex items-center font-bold text-[#E6F1FF]">
          <MapPin className="w-4 h-4 text-[#00E676] mr-1.5" />
          INTERMEDIATE STOPS & PIT-STOP LOG
        </span>
        <span className="text-[10px] text-[#9FB3C8]">
          {pitStops.length} STOPS DETECTED
        </span>
      </div>

      {pitStops.length === 0 ? (
        <div className="p-4 text-center text-xs font-mono text-[#9FB3C8] bg-[#16212B] rounded-xl border border-[#1F2A37]">
          No intermediate stops logged yet during this trip.
        </div>
      ) : (
        <div className="relative pl-4 space-y-3 border-l-2 border-[#00E676]/40 ml-2">
          {pitStops.map((stop) => (
            <div key={stop.id} className="relative group">
              {/* Green Pin Dot */}
              <div className="absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#00E676] border-2 border-[#0B1117] shadow-neon-green" />

              <div className="bg-[#16212B] p-3 rounded-xl border border-[#1F2A37] hover:border-[#00E676]/50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Coffee className="w-4 h-4 text-[#00E676]" />
                    <h4 className="text-xs font-bold text-[#E6F1FF]">{stop.name}</h4>
                  </div>
                  <span className="text-[10px] font-mono text-[#00B8D4] bg-[#00B8D4]/10 px-2 py-0.5 rounded-md border border-[#00B8D4]/30">
                    {formatTime(stop.startTime)}
                  </span>
                </div>

                <div className="text-[11px] text-[#9FB3C8] font-mono mt-1">
                  📍 {stop.address}
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-[#9FB3C8] border-t border-[#1F2A37]/80 pt-2 mt-2">
                  <span>DWELL DURATION: <b className="text-[#00E676]">{formatDuration(stop.durationSeconds)}</b></span>
                  <span className="text-[#FFC107] font-bold">Idle Cost: Rs. {stop.idleFuelCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
