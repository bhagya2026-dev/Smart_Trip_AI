import React from 'react';
import { AlertOctagon, CornerUpRight, Gauge, MapPin, Play, Square, TrafficCone, Zap } from 'lucide-react';
import { SIMULATION_PRESETS } from '../../data/sensors/TelemetrySimulator';

interface SimControlsBarProps {
  isSimulating: boolean;
  activePresetId: string;
  onSelectPreset: (presetId: string) => void;
  onStartSimulation: () => void;
  onStopSimulation: () => void;
  onTriggerEvent: (event: 'HARD_ACCEL' | 'HARD_BRAKE' | 'SWERVE' | 'TRAFFIC_JAM' | 'PIT_STOP') => void;
}

export const SimControlsBar: React.FC<SimControlsBarProps> = ({
  isSimulating,
  activePresetId,
  onSelectPreset,
  onStartSimulation,
  onStopSimulation,
  onTriggerEvent,
}) => {
  return (
    <div className="glass-panel border border-cyber-border rounded-xl p-3 shadow-glass mb-4">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Left: Preset Selector */}
        <div className="flex items-center space-x-2 w-full lg:w-auto">
          <div className="flex items-center text-xs font-semibold text-cyber-muted uppercase tracking-wider">
            <Zap className="w-4 h-4 text-telemetry-cyan mr-1.5" />
            <span>Preset Route:</span>
          </div>
          <select
            value={activePresetId}
            onChange={(e) => onSelectPreset(e.target.value)}
            disabled={isSimulating}
            className="flex-1 lg:flex-none bg-cyber-bg text-cyber-text text-xs rounded-lg px-3 py-1.5 border border-cyber-border focus:outline-none focus:border-telemetry-cyan font-medium"
          >
            {SIMULATION_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>

          {/* Main Start / Stop Toggle */}
          {!isSimulating ? (
            <button
              onClick={onStartSimulation}
              className="flex items-center space-x-1.5 bg-eco hover:bg-eco-dark text-cyber-bg font-bold px-4 py-1.5 rounded-lg text-xs transition-all shadow-hud-green"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>START DRIVE SIM</span>
            </button>
          ) : (
            <button
              onClick={onStopSimulation}
              className="flex items-center space-x-1.5 bg-telemetry-red hover:bg-red-600 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition-all shadow-hud-red"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>STOP DRIVE</span>
            </button>
          )}
        </div>

        {/* Right: Live Interactive Manual Event Triggers */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
          <span className="text-[11px] text-cyber-muted font-mono uppercase mr-1">Inject Telemetry Events:</span>

          <button
            onClick={() => onTriggerEvent('HARD_ACCEL')}
            disabled={!isSimulating}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-cyber-panel hover:bg-telemetry-blue/20 text-telemetry-blue border border-telemetry-blue/40 text-xs font-mono disabled:opacity-40 transition-all"
            title="Inject rapid acceleration (a_z > 3.5 m/s^2)"
          >
            <Gauge className="w-3 h-3" />
            <span>Hard Accel</span>
          </button>

          <button
            onClick={() => onTriggerEvent('HARD_BRAKE')}
            disabled={!isSimulating}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-cyber-panel hover:bg-telemetry-red/20 text-telemetry-red border border-telemetry-red/40 text-xs font-mono disabled:opacity-40 transition-all"
            title="Inject hard deceleration brake (a_z < -4.0 m/s^2)"
          >
            <AlertOctagon className="w-3 h-3" />
            <span>Hard Brake</span>
          </button>

          <button
            onClick={() => onTriggerEvent('SWERVE')}
            disabled={!isSimulating}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-cyber-panel hover:bg-telemetry-amber/20 text-telemetry-amber border border-telemetry-amber/40 text-xs font-mono disabled:opacity-40 transition-all"
            title="Inject sharp swerving yaw turn (> 45 deg/s)"
          >
            <CornerUpRight className="w-3 h-3" />
            <span>Swerving</span>
          </button>

          <button
            onClick={() => onTriggerEvent('TRAFFIC_JAM')}
            disabled={!isSimulating}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-cyber-panel hover:bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-mono disabled:opacity-40 transition-all"
            title="Simulate traffic jam idle hold for 18 seconds"
          >
            <TrafficCone className="w-3 h-3" />
            <span>Traffic Jam</span>
          </button>

          <button
            onClick={() => onTriggerEvent('PIT_STOP')}
            disabled={!isSimulating}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-cyber-panel hover:bg-telemetry-purple/20 text-telemetry-purple border border-telemetry-purple/40 text-xs font-mono disabled:opacity-40 transition-all"
            title="Simulate pit stop stationary cluster for > 2 mins"
          >
            <MapPin className="w-3 h-3" />
            <span>Pit-Stop</span>
          </button>
        </div>
      </div>
    </div>
  );
};
