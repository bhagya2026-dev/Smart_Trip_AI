import React from 'react';
import { DollarSign, Flame, Fuel, Sliders, TrendingDown } from 'lucide-react';
import type { VehicleConfig } from '../../domain/models/telemetry';

interface FuelFrictionCalculatorProps {
  vehicleConfig: VehicleConfig;
  idleDurationSeconds: number;
  totalDistanceKm: number;
  avgSpeedKmH: number;
  onUpdateVehicleConfig: (newConfig: Partial<VehicleConfig>) => void;
}

export const FuelFrictionCalculator: React.FC<FuelFrictionCalculatorProps> = ({
  vehicleConfig,
  idleDurationSeconds,
  onUpdateVehicleConfig,
}) => {
  const idleHours = idleDurationSeconds / 3600;
  const idleLiters = idleHours * vehicleConfig.idleConsumptionRateLph;
  const idleCost = idleLiters * vehicleConfig.fuelPricePerLiter;
  const costPerMin = (vehicleConfig.idleConsumptionRateLph / 60) * vehicleConfig.fuelPricePerLiter;

  const co2Kg = idleLiters * 2.31;
  const potentialSavings = idleCost * 0.7;

  return (
    <div className="cyber-card p-4 mb-4 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#1F2A37] pb-3 mb-3 gap-2">
        <div>
          <h3 className="text-xs font-bold font-mono text-[#E6F1FF] uppercase tracking-wider flex items-center">
            <Flame className="w-4 h-4 text-[#FF5252] mr-1.5" />
            FUEL FRICTION & IDLE COST ANALYZER
          </h3>
          <p className="text-[10px] text-[#9FB3C8] font-mono mt-0.5">
            Engine Draw: {vehicleConfig.idleConsumptionRateLph} L/h | {vehicleConfig.fuelPricePerLiter} LKR/L
          </p>
        </div>

        {/* Congestion Loss Badge */}
        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#FF5252]/15 text-[#FF5252] border border-[#FF5252]/40 flex items-center shadow-hud-red">
          CONGESTION LOSS: Rs. {idleCost.toFixed(2)}
        </span>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-[#16212B] p-3 rounded-xl border border-[#1F2A37] flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-[#9FB3C8] uppercase">MONEY WASTED IDLING</div>
            <div className="text-xl font-extrabold font-mono text-[#FFC107]">Rs. {idleCost.toFixed(2)}</div>
            <div className="text-[10px] text-[#9FB3C8] font-mono">Rs. {costPerMin.toFixed(2)}/min hold rate</div>
          </div>
          <DollarSign className="w-8 h-8 text-[#FFC107]/40" />
        </div>

        <div className="bg-[#16212B] p-3 rounded-xl border border-[#1F2A37] flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-[#9FB3C8] uppercase">FUEL BURNED IN TRAFFIC</div>
            <div className="text-xl font-extrabold font-mono text-[#FF5252]">{idleLiters.toFixed(2)} L</div>
            <div className="text-[10px] text-[#9FB3C8] font-mono">{vehicleConfig.idleConsumptionRateLph} L/h engine draw</div>
          </div>
          <Fuel className="w-8 h-8 text-[#FF5252]/40" />
        </div>

        <div className="bg-[#16212B] p-3 rounded-xl border border-[#1F2A37] flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-[#9FB3C8] uppercase">POTENTIAL SAVINGS</div>
            <div className="text-xl font-extrabold font-mono text-[#00E676]">Rs. {potentialSavings.toFixed(2)}</div>
            <div className="text-[10px] text-[#00E676]/80 font-mono">CO2: {co2Kg.toFixed(2)} kg emitted</div>
          </div>
          <TrendingDown className="w-8 h-8 text-[#00E676]/40" />
        </div>
      </div>

      {/* Interactive Vehicle Config Sliders */}
      <div className="bg-[#16212B] p-3.5 rounded-xl border border-[#1F2A37]">
        <div className="flex items-center space-x-1.5 text-xs font-mono text-[#9FB3C8] mb-3">
          <Sliders className="w-3.5 h-3.5 text-[#00E676]" />
          <span>ADJUST SRI LANKA FUEL & ENGINE PARAMETERS:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          {/* Fuel Price Slider in LKR */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[#9FB3C8]">Fuel Price (LKR/L):</span>
              <span className="text-[#E6F1FF] font-bold">Rs. {vehicleConfig.fuelPricePerLiter.toFixed(0)} / L</span>
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

          {/* Idle Consumption Rate */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[#9FB3C8]">Idle Burn Rate:</span>
              <span className="text-[#E6F1FF] font-bold">{vehicleConfig.idleConsumptionRateLph.toFixed(1)} L / Hour</span>
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

          {/* Engine Size */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[#9FB3C8]">Engine Size:</span>
              <span className="text-[#E6F1FF] font-bold">{vehicleConfig.engineSizeLiters.toFixed(1)} L</span>
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
    </div>
  );
};
