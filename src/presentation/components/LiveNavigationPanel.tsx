import React from 'react';
import { Clock, Coffee, Flag, Milestone, Navigation } from 'lucide-react';
import type { Destination } from './DestinationSearchBar';
import type { PitStop } from '../../domain/models/telemetry';

interface LiveNavigationPanelProps {
  destination: Destination | null;
  coveredDistanceKm: number;
  remainingDistanceKm: number;
  currentSpeedKmH: number;
  pitStops: PitStop[];
  activeTripDurationSec?: number;
  isSimulating?: boolean;
  travelMode?: 'VEHICLE' | 'WALKING';
}

export const LiveNavigationPanel: React.FC<LiveNavigationPanelProps> = ({
  destination,
  coveredDistanceKm,
  remainingDistanceKm,
  currentSpeedKmH,
  pitStops,
  activeTripDurationSec: _activeTripDurationSec,
  isSimulating: _isSimulating = false,
  travelMode = 'VEHICLE',
}) => {
  const isWalking = travelMode === 'WALKING';
  const totalStopSeconds = pitStops.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
  const stopMinutes = Math.round(totalStopSeconds / 60);

  // Realistic Sri Lanka Speed & Traffic Delay Math
  let etaMinsTotal = 0;
  if (destination && remainingDistanceKm > 0) {
    if (isWalking) {
      // Human Walking Pace (~4.2 km/h)
      const walkPaceKmH = 4.2;
      etaMinsTotal = Math.max(1, Math.round((remainingDistanceKm / walkPaceKmH) * 60));
    } else {
      // Sri Lanka Coastal City Traffic Average Speed (~24 km/h + traffic signal buffer)
      const realisticSriLankaCitySpeedKmH = currentSpeedKmH > 10 && currentSpeedKmH < 70 ? currentSpeedKmH : 24;
      const baseMins = (remainingDistanceKm / realisticSriLankaCitySpeedKmH) * 60;
      const trafficSignalBufferMins = remainingDistanceKm > 2 ? 3 : 1.5;
      etaMinsTotal = Math.max(3, Math.round(baseMins + trafficSignalBufferMins));
    }
  }

  const etaH = Math.floor(etaMinsTotal / 60);
  const etaM = etaMinsTotal % 60;

  return (
    <div className="cyber-card p-4 mb-4 font-sans">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1F2A37] pb-3 mb-3 gap-2">
        <div className="flex items-center space-x-2">
          <Milestone className="w-4 h-4 text-[#00E676]" />
          <h3 className="text-xs font-bold font-mono text-[#E6F1FF] uppercase tracking-wider">
            {isWalking ? 'LIVE PEDESTRIAN WALK TELEMETRY' : 'LIVE TRIP TELEMETRY & NAVIGATION'}
          </h3>
        </div>

        {destination && (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#00B8D4]/15 text-[#00B8D4] border border-[#00B8D4]/40 flex items-center">
            <Flag className="w-3 h-3 mr-1 text-[#00B8D4]" />
            DEST: {destination.name || destination.city}
          </span>
        )}
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* 1. Past Distance Covered */}
        <div className="bg-[#16212B] p-3 rounded-xl border border-[#1F2A37]">
          <div className="flex items-center justify-between text-[#9FB3C8] mb-1 text-[10px] font-mono">
            <span>PAST COVERED</span>
            <Navigation className="w-3.5 h-3.5 text-[#00E676]" />
          </div>
          <div className="text-lg font-extrabold font-mono text-[#E6F1FF]">
            {coveredDistanceKm.toFixed(1)} <span className="text-xs font-normal text-[#9FB3C8]">km</span>
          </div>
          <div className="text-[9px] text-[#9FB3C8] font-mono mt-0.5">
            {isWalking ? 'Walked so far' : 'Driven so far'}
          </div>
        </div>

        {/* 2. Remaining Distance */}
        <div className="bg-[#16212B] p-3 rounded-xl border border-[#1F2A37]">
          <div className="flex items-center justify-between text-[#9FB3C8] mb-1 text-[10px] font-mono">
            <span>REMAINING</span>
            <Flag className="w-3.5 h-3.5 text-[#00B8D4]" />
          </div>
          <div className="text-lg font-extrabold font-mono text-[#00B8D4]">
            {destination ? remainingDistanceKm.toFixed(1) : '--'} <span className="text-xs font-normal text-[#9FB3C8]">km</span>
          </div>
          <div className="text-[9px] text-[#9FB3C8] font-mono mt-0.5">
            {destination ? `To ${destination.name || destination.city}` : 'No target'}
          </div>
        </div>

        {/* 3. Estimated Time of Arrival (ETA) */}
        <div className="bg-[#16212B] p-3 rounded-xl border border-[#1F2A37]">
          <div className="flex items-center justify-between text-[#9FB3C8] mb-1 text-[10px] font-mono">
            <span>ETA TIME</span>
            <Clock className="w-3.5 h-3.5 text-[#00E676]" />
          </div>
          <div className="text-lg font-extrabold font-mono text-[#00E676]">
            {destination ? (etaH > 0 ? `${etaH}h ${etaM}m` : `${etaM}m`) : '--'}
          </div>
          <div className="text-[9px] text-[#9FB3C8] font-mono mt-0.5">
            {isWalking ? 'Walking duration' : 'Traffic ETA duration'}
          </div>
        </div>

        {/* 4. Intermediate Stops Summary */}
        <div className="bg-[#16212B] p-3 rounded-xl border border-[#1F2A37]">
          <div className="flex items-center justify-between text-[#9FB3C8] mb-1 text-[10px] font-mono">
            <span>INTERMEDIATE STOPS</span>
            <Coffee className="w-3.5 h-3.5 text-[#EEFC07]" />
          </div>
          <div className="text-lg font-extrabold font-mono text-[#EEFC07]">
            {pitStops.length} <span className="text-xs font-normal text-[#9FB3C8]">stops</span>
          </div>
          <div className="text-[9px] text-[#9FB3C8] font-mono mt-0.5">
            {stopMinutes > 0 ? `${stopMinutes}m spent paused` : 'No pauses'}
          </div>
        </div>
      </div>
    </div>
  );
};
