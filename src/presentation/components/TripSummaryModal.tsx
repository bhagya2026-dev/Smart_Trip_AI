import React from 'react';
import { Calendar, CheckCircle2, Clock, Footprints, Flame, Fuel, Gauge, MapPin, Navigation, ShieldCheck, Sparkles, X } from 'lucide-react';
import type { Trip } from '../../domain/models/telemetry';

interface TripSummaryModalProps {
  trip: Trip | null;
  onClose: () => void;
  onViewHistory?: () => void;
  travelMode?: 'VEHICLE' | 'WALKING';
}

export const TripSummaryModal: React.FC<TripSummaryModalProps> = ({
  trip,
  onClose,
  onViewHistory,
  travelMode = 'VEHICLE',
}) => {
  if (!trip) return null;

  const isWalking = travelMode === 'WALKING' || (trip.stepsCount && trip.stepsCount > 0);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    if (mins === 0) return `${remainingSecs}s`;
    return `${mins}m ${remainingSecs}s`;
  };

  const stepsTaken = trip.stepsCount ?? Math.round(trip.distanceKm * 1310);
  const caloriesBurned = trip.caloriesBurned ?? Math.round(trip.distanceKm * 62);

  return (
    <div className="fixed inset-0 z-50 bg-[#0B1117]/80 backdrop-blur-md flex items-center justify-center p-4 font-sans animate-fade-in">
      <div className="cyber-card w-full max-w-lg p-6 relative overflow-hidden border-2 border-[#00E676] shadow-2xl">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#00E676]/20 via-transparent to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-[#16212B] hover:bg-[#1F2A37] text-[#9FB3C8] hover:text-[#E6F1FF] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 rounded-xl bg-[#00E676]/20 text-[#00E676]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-[#00E676] font-bold uppercase tracking-wider block">
              {isWalking ? 'WALK TRIP COMPLETED & RECORDED' : 'VEHICLE TRIP COMPLETED & RECORDED'}
            </span>
            <h2 className="text-base sm:text-lg font-extrabold text-[#E6F1FF]">
              {trip.title}
            </h2>
          </div>
        </div>

        {/* Main Stats Grid (Time, Distance, Speed) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 font-mono">
          <div className="bg-[#16212B] p-3 rounded-xl border border-[#1F2A37]">
            <div className="flex items-center justify-between text-[#9FB3C8] text-[10px] mb-1">
              <span>{isWalking ? 'WALK TIME' : 'TRAVEL TIME'}</span>
              <Clock className="w-3.5 h-3.5 text-[#00E676]" />
            </div>
            <div className="text-lg font-extrabold text-[#00E676]">
              {formatDuration(trip.durationSeconds)}
            </div>
            <div className="text-[9px] text-[#9FB3C8] mt-0.5">Elapsed time</div>
          </div>

          <div className="bg-[#16212B] p-3 rounded-xl border border-[#1F2A37]">
            <div className="flex items-center justify-between text-[#9FB3C8] text-[10px] mb-1">
              <span>{isWalking ? 'WALK DISTANCE' : 'TRAVEL DISTANCE'}</span>
              <Navigation className="w-3.5 h-3.5 text-[#00B8D4]" />
            </div>
            <div className="text-lg font-extrabold text-[#00B8D4]">
              {trip.distanceKm.toFixed(1)} <span className="text-xs font-normal">km</span>
            </div>
            <div className="text-[9px] text-[#9FB3C8] mt-0.5">Total distance</div>
          </div>

          <div className="bg-[#16212B] p-3 rounded-xl border border-[#1F2A37] col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-[#9FB3C8] text-[10px] mb-1">
              <span>{isWalking ? 'WALKING PACE' : 'AVG / MAX SPEED'}</span>
              <Gauge className="w-3.5 h-3.5 text-[#EEFC07]" />
            </div>
            <div className="text-base font-extrabold text-[#E6F1FF]">
              {isWalking ? '4.2' : `${Math.round(trip.avgSpeedKmH)} / ${Math.round(trip.maxSpeedKmH)}`} <span className="text-xs font-normal text-[#9FB3C8]">km/h</span>
            </div>
            <div className="text-[9px] text-[#9FB3C8] mt-0.5">{isWalking ? 'Human pace' : 'Speed telemetry'}</div>
          </div>
        </div>

        {/* Fitness (Walking) vs Fuel (Vehicle) Row */}
        <div className="grid grid-cols-2 gap-3 mb-5 font-mono">
          {isWalking ? (
            <>
              <div className="bg-[#16212B] p-3 rounded-xl border border-[#1F2A37]">
                <div className="flex items-center justify-between text-[#9FB3C8] text-[10px] mb-1">
                  <span>STEPS & CALORIES</span>
                  <Footprints className="w-3.5 h-3.5 text-[#00B8D4]" />
                </div>
                <div className="text-base font-extrabold text-[#00B8D4]">
                  {stepsTaken.toLocaleString()} <span className="text-xs text-[#9FB3C8]">steps</span>
                </div>
                <div className="text-[9px] text-[#FF5252] font-bold mt-0.5 flex items-center">
                  <Flame className="w-3 h-3 inline mr-1" />
                  {caloriesBurned} kcal burned
                </div>
              </div>

              <div className="bg-[#16212B] p-3 rounded-xl border border-[#1F2A37]">
                <div className="flex items-center justify-between text-[#9FB3C8] text-[10px] mb-1">
                  <span>ECO FOOTPRINT</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#00E676]" />
                </div>
                <div className="text-base font-extrabold text-[#00E676]">
                  ZERO CARBON
                </div>
                <div className="text-[9px] text-[#00E676] font-bold mt-0.5">
                  0.0 L Fuel (100% Eco)
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-[#16212B] p-3 rounded-xl border border-[#1F2A37]">
                <div className="flex items-center justify-between text-[#9FB3C8] text-[10px] mb-1">
                  <span>FUEL & COST</span>
                  <Fuel className="w-3.5 h-3.5 text-[#FFC107]" />
                </div>
                <div className="text-base font-extrabold text-[#FFC107]">
                  Rs. {trip.totalCost.toFixed(2)}
                </div>
                <div className="text-[9px] text-[#9FB3C8] mt-0.5">
                  {trip.totalFuelLiters.toFixed(2)} Liters used
                </div>
              </div>

              <div className="bg-[#16212B] p-3 rounded-xl border border-[#1F2A37]">
                <div className="flex items-center justify-between text-[#9FB3C8] text-[10px] mb-1">
                  <span>DRIVING SCORES</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00E676]" />
                </div>
                <div className="text-base font-extrabold text-[#00E676]">
                  {trip.safetyScore} <span className="text-xs text-[#9FB3C8]">/ 100</span>
                </div>
                <div className="text-[9px] text-[#00E676] font-bold mt-0.5">
                  Eco: {trip.ecoScore}/100
                </div>
              </div>
            </>
          )}
        </div>

        {/* Stopped Places Log */}
        {trip.pitStops && trip.pitStops.length > 0 && (
          <div className="bg-[#16212B] p-3 rounded-xl border border-[#1F2A37] mb-5 font-mono">
            <div className="text-[10px] text-[#9FB3C8] font-bold uppercase mb-2 flex items-center">
              <MapPin className="w-3.5 h-3.5 text-[#00E676] mr-1" />
              STOPPED PLACES DURING TRIP ({trip.pitStops.length})
            </div>
            <div className="space-y-1.5 text-xs">
              {trip.pitStops.map((stop) => (
                <div key={stop.id} className="flex items-center justify-between text-[#E6F1FF] bg-[#111A23] p-2 rounded-lg border border-[#1F2A37]">
                  <span>📍 {stop.name}</span>
                  <span className="text-[#00E676] font-bold">{Math.round(stop.durationSeconds / 60)} mins</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 btn-electric-green py-3 text-xs font-mono font-bold"
          >
            CLOSE SUMMARY
          </button>

          {onViewHistory && (
            <button
              onClick={() => {
                onClose();
                onViewHistory();
              }}
              className="btn-secondary-green px-4 py-3 text-xs font-mono font-bold flex items-center space-x-1"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>VIEW LOGS</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
