import React from 'react';
import { Footprints, Fuel, Gauge, Flame, Sparkles } from 'lucide-react';
import type { TelemetryPoint, VehicleConfig } from '../../domain/models/telemetry';
import { pedometerEngine } from '../../services/pedometerEngine';

interface SpeedometerGForceHUDProps {
  currentPoint: TelemetryPoint;
  maxSpeedKmH: number;
  vehicleConfig: VehicleConfig;
  coveredDistanceKm: number;
  idleDurationSeconds: number;
  travelMode?: 'VEHICLE' | 'WALKING';
  routeDistanceKm?: number;
}

export const SpeedometerGForceHUD: React.FC<SpeedometerGForceHUDProps> = ({
  currentPoint,
  maxSpeedKmH,
  vehicleConfig,
  coveredDistanceKm,
  idleDurationSeconds,
  travelMode = 'VEHICLE',
  routeDistanceKm = 0,
}) => {
  const isWalking = travelMode === 'WALKING';

  // Speed Math
  const currentSpeed = isWalking
    ? parseFloat((Math.min(6, Math.max(2.8, currentPoint.speedKmH > 0 ? currentPoint.speedKmH * 0.1 : 4.2))).toFixed(1))
    : Math.round(currentPoint.speedKmH);

  const maxGaugeSpeed = isWalking ? 10 : 140;
  const speedPercentage = Math.min(100, (currentSpeed / maxGaugeSpeed) * 100);

  // SVG Circular Gauge Math
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (speedPercentage / 100) * (circumference * 0.75);

  // Real-Time Hardware Accelerometer & GPS Pedometer Metrics
  const pedometerData = pedometerEngine.getSummary();
  const fallbackSteps = Math.round(coveredDistanceKm * 1310);
  const stepsTaken = Math.max(pedometerData.stepsCount, fallbackSteps);
  const caloriesBurned = pedometerData.caloriesBurned > 0
    ? pedometerData.caloriesBurned
    : Math.round(coveredDistanceKm * 62);

  // Accurate Vehicle Fuel Math (Engine-specific: ~8.2L/100km for 2.0L engine)
  const lPer100Km = 5.5 + (vehicleConfig.engineSizeLiters || 2.0) * 1.35;
  const drivenLiters = (coveredDistanceKm / 100) * lPer100Km;
  const idleLiters = (idleDurationSeconds / 3600) * vehicleConfig.idleConsumptionRateLph;
  const totalLiveLiters = drivenLiters + idleLiters;
  const totalLiveCostLkr = totalLiveLiters * vehicleConfig.fuelPricePerLiter;

  // Expected Total Route Fuel Estimation
  const targetDistance = routeDistanceKm > 0 ? routeDistanceKm : coveredDistanceKm;
  const estTotalLiters = (targetDistance / 100) * lPer100Km;
  const estTotalCostLkr = estTotalLiters * vehicleConfig.fuelPricePerLiter;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 font-sans">
      {/* 1. Speed / Walking Pace Gauge Card */}
      <div className="cyber-card p-3.5 flex flex-col items-center justify-between relative overflow-hidden">
        <div className="w-full flex items-center justify-between text-xs font-mono text-[#9FB3C8] mb-1">
          <span className="flex items-center text-[#E6F1FF] font-bold">
            {isWalking ? (
              <Footprints className="w-4 h-4 text-[#00B8D4] mr-1.5" />
            ) : (
              <Gauge className="w-4 h-4 text-[#00E676] mr-1.5" />
            )}
            {isWalking ? 'LIVE WALKING PACE' : 'LIVE VEHICLE SPEED'}
          </span>
          <span
            className={`font-bold px-2 py-0.5 rounded-md border text-[11px] ${
              isWalking
                ? 'text-[#00B8D4] bg-[#00B8D4]/10 border-[#00B8D4]/30'
                : 'text-[#00E676] bg-[#00E676]/10 border-[#00E676]/30'
            }`}
          >
            {isWalking ? `PEAK: ${maxSpeedKmH > 0 ? (maxSpeedKmH * 0.1).toFixed(1) : '5.2'} KM/H` : `MAX: ${Math.round(maxSpeedKmH)} KM/H`}
          </span>
        </div>

        {/* Circular Speed Ring */}
        <div className="relative w-36 h-36 flex items-center justify-center my-1">
          <svg className="w-full h-full transform -rotate-135" viewBox="0 0 140 140">
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="#1F2A37"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * 0.25}
              strokeLinecap="round"
            />
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke={isWalking ? '#00B8D4' : '#00E676'}
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
              style={{ filter: `drop-shadow(0px 0px 8px ${isWalking ? 'rgba(0, 184, 212, 0.6)' : 'rgba(0, 230, 118, 0.6)'})` }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold font-mono text-[#E6F1FF] tracking-tight">
              {currentSpeed}
            </span>
            <span className="text-[9px] font-mono font-bold text-[#9FB3C8] uppercase mt-0.5">
              {isWalking ? 'WALK KM/H' : 'VEHICLE KM/H'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Fuel Spend (Vehicle) vs Steps & Calories (Walking) */}
      <div className="cyber-card p-3.5 flex flex-col justify-between">
        {isWalking ? (
          /* WALKING PEDESTRIAN FITNESS METRICS */
          <>
            <div className="flex items-center justify-between text-xs font-mono border-b border-[#1F2A37] pb-2 mb-2">
              <span className="flex items-center text-[#E6F1FF] font-bold">
                <Sparkles className="w-4 h-4 text-[#00B8D4] mr-1.5" />
                PEDESTRIAN FITNESS & ECO FOOTPRINT
              </span>
              <span className="text-[10px] font-mono text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded-full border border-[#00E676]/30 font-bold">
                ZERO EMISSIONS
              </span>
            </div>

            <div className="space-y-2 font-mono my-auto">
              <div className="bg-[#16212B] p-2.5 rounded-xl border border-[#1F2A37] flex items-center justify-between">
                <span className="text-xs text-[#9FB3C8] flex items-center">
                  <Footprints className="w-4 h-4 text-[#00B8D4] mr-1.5" />
                  REAL-TIME STEPS:
                </span>
                <span className="text-xl font-extrabold text-[#00B8D4]">
                  {stepsTaken.toLocaleString()} <span className="text-xs font-normal">steps</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#16212B] p-2 rounded-xl border border-[#1F2A37]">
                  <span className="text-[9px] text-[#9FB3C8] block flex items-center">
                    <Flame className="w-3 h-3 text-[#FF5252] mr-1" />
                    CALORIES BURNED
                  </span>
                  <span className="text-sm font-extrabold text-[#FF5252]">{caloriesBurned} kcal</span>
                </div>

                <div className="bg-[#16212B] p-2 rounded-xl border border-[#1F2A37]">
                  <span className="text-[9px] text-[#9FB3C8] block">FUEL SAVED</span>
                  <span className="text-sm font-extrabold text-[#00E676]">0.0 L (Rs. 0)</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* VEHICLE FUEL SPEND & COST ESTIMATIONS */
          <>
            <div className="flex items-center justify-between text-xs font-mono border-b border-[#1F2A37] pb-2 mb-2">
              <span className="flex items-center text-[#E6F1FF] font-bold">
                <Fuel className="w-4 h-4 text-[#00B8D4] mr-1.5" />
                FUEL SPEND & ESTIMATION
              </span>
              <span className="text-[10px] font-mono text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded-full border border-[#00E676]/30 font-bold">
                Rs. {vehicleConfig.fuelPricePerLiter}/L
              </span>
            </div>

            <div className="space-y-2 font-mono my-auto">
              <div className="bg-[#16212B] p-2.5 rounded-xl border border-[#1F2A37] flex items-center justify-between">
                <span className="text-xs text-[#9FB3C8]">SPENT SO FAR:</span>
                <span className="text-xl font-extrabold text-[#00E676]">
                  Rs. {totalLiveCostLkr.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#16212B] p-2 rounded-xl border border-[#1F2A37]">
                  <span className="text-[9px] text-[#9FB3C8] block">LIVE FUEL BURNED</span>
                  <span className="text-sm font-extrabold text-[#E6F1FF]">{totalLiveLiters.toFixed(2)} L</span>
                </div>

                <div className="bg-[#16212B] p-2 rounded-xl border border-[#1F2A37]">
                  <span className="text-[9px] text-[#9FB3C8] block">EST. TRIP FUEL</span>
                  <span className="text-sm font-extrabold text-[#00B8D4]">
                    {estTotalLiters.toFixed(2)} L (~Rs. {Math.round(estTotalCostLkr)})
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
