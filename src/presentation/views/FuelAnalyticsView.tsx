import React from 'react';
import { Flame, Leaf } from 'lucide-react';
import type { VehicleConfig } from '../../domain/models/telemetry';

interface FuelAnalyticsViewProps {
  vehicleConfig: VehicleConfig;
  totalIdleCost: number;
  totalIdleLiters: number;
  onUpdateVehicleConfig: (newConfig: Partial<VehicleConfig>) => void;
}

export const FuelAnalyticsView: React.FC<FuelAnalyticsViewProps> = ({
  vehicleConfig,
  totalIdleCost,
  totalIdleLiters,
  onUpdateVehicleConfig,
}) => {
  const annualLossEst = totalIdleCost * 52;

  return (
    <div className="max-w-7xl mx-auto px-4 pt-6 pb-24 font-sans bg-[#0B1117] min-h-screen text-[#E6F1FF]">
      {/* Header Bar */}
      <div className="cyber-card p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold font-mono text-[#E6F1FF] flex items-center">
            <Flame className="w-5 h-5 text-[#FF5252] mr-2" />
            FUEL FRICTION & IDLE COST ANALYZER
          </h2>
          <p className="text-xs text-[#9FB3C8] font-mono mt-0.5">
            Active Vehicle Profile: <b className="text-[#00E676]">{vehicleConfig.vehicleName}</b> ({vehicleConfig.engineSizeLiters}L Engine)
          </p>
        </div>

        {/* Congestion Loss Badge */}
        <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-[#FF5252]/15 text-[#FF5252] border border-[#FF5252]/40 shadow-hud-red">
          CONGESTION LOSS: Rs. {totalIdleCost.toFixed(2)}
        </span>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="cyber-card p-5">
          <div className="text-xs font-mono text-[#9FB3C8] uppercase">MONEY WASTED IDLING</div>
          <div className="text-3xl font-extrabold font-mono text-[#FFC107] mt-2">Rs. {totalIdleCost.toFixed(2)}</div>
          <p className="text-xs text-[#9FB3C8] mt-2">Direct cash burned while vehicle remained stationary in traffic.</p>
        </div>

        <div className="cyber-card p-5 border-l-4 border-l-[#FF5252]">
          <div className="text-xs font-mono text-[#9FB3C8] uppercase">FUEL BURNED IN TRAFFIC</div>
          <div className="text-3xl font-extrabold font-mono text-[#FF5252] mt-2">{totalIdleLiters.toFixed(2)} L</div>
          <p className="text-xs text-[#9FB3C8] mt-2">Unproductively burned fuel in Sri Lankan traffic jams.</p>
        </div>

        <div className="cyber-card p-5 border-l-4 border-l-[#00E676]">
          <div className="text-xs font-mono text-[#9FB3C8] uppercase">PROJECTED ANNUAL TRAFFIC WASTE</div>
          <div className="text-3xl font-extrabold font-mono text-[#00E676] mt-2">Rs. {annualLossEst.toFixed(2)}</div>
          <p className="text-xs text-[#9FB3C8] mt-2">Estimated yearly congestion friction based on weekly patterns.</p>
        </div>
      </div>

      {/* Vehicle Parameters Tuning Card */}
      <div className="cyber-card p-5 mb-6">
        <h3 className="text-sm font-bold font-mono text-[#E6F1FF] mb-3">
          ADJUST SRI LANKA FUEL & ENGINE PARAMETERS
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs font-mono">
          <div>
            <div className="flex justify-between mb-1.5 text-[#9FB3C8]">
              <span>Fuel Price:</span>
              <span className="text-[#00E676] font-bold">Rs. {vehicleConfig.fuelPricePerLiter.toFixed(0)} / L</span>
            </div>
            <input
              type="range"
              min="250"
              max="600"
              step="5"
              value={vehicleConfig.fuelPricePerLiter}
              onChange={(e) => onUpdateVehicleConfig({ fuelPricePerLiter: parseFloat(e.target.value) })}
              className="w-full cursor-pointer accent-[#00E676]"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1.5 text-[#9FB3C8]">
              <span>Idle Burn:</span>
              <span className="text-[#00E676] font-bold">{vehicleConfig.idleConsumptionRateLph.toFixed(1)} L / Hour</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.5"
              step="0.1"
              value={vehicleConfig.idleConsumptionRateLph}
              onChange={(e) => onUpdateVehicleConfig({ idleConsumptionRateLph: parseFloat(e.target.value) })}
              className="w-full cursor-pointer accent-[#00E676]"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1.5 text-[#9FB3C8]">
              <span>Engine Size:</span>
              <span className="text-[#00E676] font-bold">{vehicleConfig.engineSizeLiters.toFixed(1)} L</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.2"
              value={vehicleConfig.engineSizeLiters}
              onChange={(e) => onUpdateVehicleConfig({ engineSizeLiters: parseFloat(e.target.value) })}
              className="w-full cursor-pointer accent-[#00E676]"
            />
          </div>
        </div>
      </div>

      {/* Eco Driving Recommendations Card */}
      <div className="cyber-card p-5 border-l-4 border-l-[#00E676] bg-[#00E676]/5">
        <h3 className="text-sm font-bold font-mono text-[#00E676] flex items-center mb-3">
          <Leaf className="w-4 h-4 mr-2" />
          TELEMATICS ECO-EFFICIENCY RECOMMENDATIONS
        </h3>
        <ul className="space-y-2 text-xs font-mono text-[#E6F1FF]">
          <li className="flex items-start">
            <span className="text-[#00E676] mr-2">✓</span>
            <b>Automatic Engine Start-Stop:</b> Shutting engine off on stops &gt; 30 seconds eliminates up to 88% of idle friction.
          </li>
          <li className="flex items-start">
            <span className="text-[#00E676] mr-2">✓</span>
            <b>Anticipatory Braking:</b> Reducing hard braking events (&lt; -4.0 m/s²) preserves kinetic momentum and saves 0.4L/100km.
          </li>
          <li className="flex items-start">
            <span className="text-[#00E676] mr-2">✓</span>
            <b>Optimum Highway Speed:</b> Cruising between 65–85 km/h minimizes aerodynamic drag overhead.
          </li>
        </ul>
      </div>
    </div>
  );
};
