import React from 'react';
import { Settings } from 'lucide-react';
import type { DrivingState, VehicleConfig } from '../../domain/models/telemetry';

interface HeaderHUDProps {
  drivingState: DrivingState;
  vehicleConfig: VehicleConfig;
  activeTripDurationSec: number;
  liveIdleCostPerMin: number;
  isSimulating: boolean;
  isLiveGpsActive: boolean;
  onToggleSimulator: () => void;
  onToggleLiveGps: () => void;
  onOpenVehicleSettings: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  drivingState: _drivingState,
  vehicleConfig: _vehicleConfig,
  activeTripDurationSec,
  liveIdleCostPerMin,
  isLiveGpsActive,
  onToggleLiveGps,
  onOpenVehicleSettings,
}) => {
  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? `${hrs}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="w-full bg-[#0B1117]/95 backdrop-blur-md border-b border-[#1F2A37] px-4 py-3 sticky top-0 z-40 font-sans shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo & AI Badge Requirement #6 & #7 */}
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-[#00E676] to-[#00B8D4] text-[#0B1117] font-extrabold flex items-center justify-center shadow-neon-green">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-base font-extrabold tracking-tight text-[#E6F1FF]">
                Smart<span className="text-[#00E676]">Trip</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/40">
                AI
              </span>
            </div>
            <p className="text-[9px] font-mono text-[#9FB3C8]">INTELLIGENT ROUTE TELEMATICS</p>
          </div>
        </div>

        {/* Status Indicators & Live Badge */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="hidden sm:flex items-center space-x-3 text-[#9FB3C8]">
            <span>TIME: <b className="text-[#E6F1FF]">{formatTimer(activeTripDurationSec)}</b></span>
            <span>IDLE: <b className="text-[#FFC107]">Rs. {liveIdleCostPerMin.toFixed(2)}/m</b></span>
          </div>

          {/* Live GPS Sensor Indicator Toggle */}
          <button
            onClick={onToggleLiveGps}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all flex items-center space-x-1 ${
              isLiveGpsActive
                ? 'bg-[#00E676]/15 text-[#00E676] border-[#00E676]/40 shadow-neon-green'
                : 'bg-[#111A23] text-[#9FB3C8] border-[#1F2A37]'
            }`}
            title="Toggle Live Hardware GPS Sensor Stream"
          >
            <span className={`w-2 h-2 rounded-full ${isLiveGpsActive ? 'bg-[#00E676] animate-ping' : 'bg-[#9FB3C8]'}`} />
            <span>● LIVE</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenVehicleSettings}
            className="p-1.5 rounded-xl bg-[#16212B] hover:bg-[#1F2A37] border border-[#1F2A37] text-[#9FB3C8] hover:text-[#00E676] transition-colors"
            title="Vehicle Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
