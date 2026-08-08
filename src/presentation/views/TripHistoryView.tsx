import React, { useState } from 'react';
import { Calendar, Download, Filter, ShieldCheck } from 'lucide-react';
import type { Trip } from '../../domain/models/telemetry';

interface TripHistoryViewProps {
  trips: Trip[];
  onSelectTripToView?: (trip: Trip) => void;
}

export const TripHistoryView: React.FC<TripHistoryViewProps> = ({ trips, onSelectTripToView }) => {
  const [filterSort, setFilterSort] = useState<'DATE' | 'ECO' | 'DISTANCE' | 'IDLE_COST'>('DATE');

  const sortedTrips = [...trips].sort((a, b) => {
    if (filterSort === 'ECO') return b.ecoScore - a.ecoScore;
    if (filterSort === 'DISTANCE') return b.distanceKm - a.distanceKm;
    if (filterSort === 'IDLE_COST') return b.idleCost - a.idleCost;
    return b.startTime - a.startTime;
  });

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sortedTrips, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `SmartTrip_Export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportCSV = () => {
    const headers = ['ID', 'Title', 'Distance (km)', 'Duration (s)', 'Safety Score', 'Eco Score', 'Idle Fuel (L)', 'Idle Cost (LKR)'];
    const rows = sortedTrips.map((t) => [
      t.id,
      `"${t.title}"`,
      t.distanceKm,
      t.durationSeconds,
      t.safetyScore,
      t.ecoScore,
      t.idleFuelLiters,
      t.idleCost,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    downloadAnchor.setAttribute('download', `SmartTrip_Telemetry_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-6 pb-24 font-sans bg-[#0B1117] min-h-screen text-[#E6F1FF]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cyber-card p-4 mb-6">
        <div>
          <h2 className="text-lg font-bold font-mono text-[#E6F1FF] flex items-center">
            <Calendar className="w-5 h-5 text-[#00E676] mr-2" />
            HISTORICAL TRIP TELEMETRY & LOGS
          </h2>
          <p className="text-xs text-[#9FB3C8] font-mono mt-0.5">
            Relational SQLite persistent storage | {trips.length} Recorded Trips
          </p>
        </div>

        {/* Sort Controls & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1 bg-[#16212B] border border-[#1F2A37] px-3 py-1.5 rounded-xl text-xs font-mono">
            <Filter className="w-3.5 h-3.5 text-[#9FB3C8]" />
            <span className="text-[#9FB3C8]">Sort:</span>
            <select
              value={filterSort}
              onChange={(e) => setFilterSort(e.target.value as any)}
              className="bg-transparent text-[#E6F1FF] font-bold focus:outline-none cursor-pointer"
            >
              <option value="DATE" className="bg-[#0B1117]">Latest Date</option>
              <option value="ECO" className="bg-[#0B1117]">Highest Eco Score</option>
              <option value="DISTANCE" className="bg-[#0B1117]">Longest Distance</option>
              <option value="IDLE_COST" className="bg-[#0B1117]">Highest Idle Cost</option>
            </select>
          </div>

          <button
            onClick={exportJSON}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#16212B] hover:bg-[#1F2A37] border border-[#1F2A37] text-xs font-mono text-[#E6F1FF] transition-all"
          >
            <Download className="w-3.5 h-3.5 text-[#00B8D4]" />
            <span>JSON</span>
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#16212B] hover:bg-[#1F2A37] border border-[#1F2A37] text-xs font-mono text-[#E6F1FF] transition-all"
          >
            <Download className="w-3.5 h-3.5 text-[#00E676]" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Empty State Requirement #36 */}
      {sortedTrips.length === 0 ? (
        <div className="cyber-card p-8 text-center flex flex-col items-center justify-center space-y-3 my-6">
          <div className="p-3 rounded-full bg-[#00E676]/15 text-[#00E676]">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[#E6F1FF]">NO TRIPS RECORDED YET</h3>
          <p className="text-xs text-[#9FB3C8] max-w-sm">
            Start your first trip to record distance, fuel usage, safety score, eco score, and driving insights.
          </p>
        </div>
      ) : (
        /* Trips Grid List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedTrips.map((trip) => (
            <div
              key={trip.id}
              onClick={() => onSelectTripToView && onSelectTripToView(trip)}
              className="cyber-card p-4 hover:border-[#00E676]/50 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-[#00E676] font-bold">
                    {new Date(trip.startTime).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#16212B] text-[#9FB3C8] border border-[#1F2A37]">
                    {Math.round(trip.durationSeconds / 60)} mins
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#E6F1FF] mb-3 line-clamp-1">{trip.title}</h3>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
                  <div className="bg-[#16212B] p-2 rounded-xl border border-[#1F2A37]">
                    <span className="text-[#9FB3C8] text-[10px] block">DISTANCE</span>
                    <span className="text-[#E6F1FF] font-bold">{trip.distanceKm.toFixed(1)} km</span>
                  </div>
                  <div className="bg-[#16212B] p-2 rounded-xl border border-[#1F2A37]">
                    <span className="text-[#9FB3C8] text-[10px] block">IDLE WASTED</span>
                    <span className="text-[#FFC107] font-bold">Rs. {trip.idleCost.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-[11px] font-mono flex items-center justify-between border-t border-[#1F2A37] pt-2 text-[#9FB3C8] mb-2">
                  <div>
                    Total Spend: <span className="text-[#E6F1FF] font-bold">Rs. {trip.totalCost.toFixed(2)}</span>
                  </div>
                  <div>
                    Idle Fuel: <span className="text-[#FFC107] font-bold">{trip.idleFuelLiters.toFixed(2)}L</span>
                  </div>
                </div>
              </div>

              {/* Scores & Events Footer */}
              <div className="pt-3 border-t border-[#1F2A37] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <span className="text-[#00E676] font-bold">ECO: {trip.ecoScore}</span>
                  <span className="text-[#9FB3C8]">|</span>
                  <span className="text-[#00B8D4] font-bold">SAFE: {trip.safetyScore}</span>
                </div>
                <div className="flex items-center space-x-1 text-[#FF5252]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{trip.hardBrakes + trip.hardAccelerations} events</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
