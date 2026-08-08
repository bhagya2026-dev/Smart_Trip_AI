import React from 'react';
import { Leaf, ShieldCheck, HeartPulse } from 'lucide-react';
import type { DrivingScore } from '../../domain/models/telemetry';

interface RadialScoreGaugeProps {
  score: DrivingScore;
  travelMode?: 'VEHICLE' | 'WALKING';
}

export const RadialScoreGauge: React.FC<RadialScoreGaugeProps> = ({ score, travelMode = 'VEHICLE' }) => {
  const isWalking = travelMode === 'WALKING';

  const getScoreColor = (value: number) => {
    if (value >= 90) return '#00E676'; // Primary Electric Green
    if (value >= 75) return '#00B8D4'; // Teal
    if (value >= 60) return '#FFC107'; // Yellow
    if (value >= 40) return '#F97316'; // Orange
    return '#FF5252';                  // Red
  };

  const getScoreLabel = (value: number) => {
    if (value >= 90) return 'EXCELLENT';
    if (value >= 75) return 'GOOD';
    if (value >= 60) return 'FAIR';
    if (value >= 40) return 'MODERATE';
    return 'CRITICAL';
  };

  const safetyColor = getScoreColor(score.safetyScore);
  const ecoColor = getScoreColor(score.ecoScore);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 font-sans">
      {/* 1. SAFETY / WALKING PACING SCORE CARD */}
      <div className="cyber-card p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-[#1F2A37] pb-2 mb-2 text-xs font-mono">
          <span className="flex items-center font-bold text-[#E6F1FF]">
            {isWalking ? (
              <HeartPulse className="w-4 h-4 mr-1.5 text-[#00B8D4]" />
            ) : (
              <ShieldCheck className="w-4 h-4 mr-1.5" style={{ color: safetyColor }} />
            )}
            {isWalking ? 'WALKING CADENCE SCORE' : 'SAFETY SCORE'}
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-extrabold"
            style={{ backgroundColor: `${isWalking ? '#00B8D4' : safetyColor}20`, color: isWalking ? '#00B8D4' : safetyColor, border: `1px solid ${isWalking ? '#00B8D4' : safetyColor}50` }}
          >
            {isWalking ? 'OPTIMAL PACE' : getScoreLabel(score.safetyScore)}
          </span>
        </div>

        <div className="flex items-center justify-between px-2 my-1">
          {/* Main Circular Score Number */}
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="#1F2A37" strokeWidth="8" fill="transparent" />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke={isWalking ? '#00B8D4' : safetyColor}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - ((isWalking ? 100 : score.safetyScore) / 100) * 251.2}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
                style={{ filter: `drop-shadow(0px 0px 6px ${isWalking ? '#00B8D4' : safetyColor})` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-extrabold font-mono text-[#E6F1FF]">
                {isWalking ? 100 : score.safetyScore}
              </span>
              <span className="text-[9px] font-mono text-[#9FB3C8]">/ 100</span>
            </div>
          </div>

          {/* Supporting Factors */}
          <div className="space-y-1 text-xs font-mono text-[#9FB3C8] text-right">
            {isWalking ? (
              <>
                <div>Pacing: <b className="text-[#00B8D4] ml-1">Steady</b></div>
                <div>Motion: <b className="text-[#00E676] ml-1">Smooth</b></div>
                <div>Stoppages: <b className="text-[#00E676] ml-1">Minimal</b></div>
              </>
            ) : (
              <>
                <div>Hard Accel: <b className={`ml-1 ${score.hardAccelerationsCount > 0 ? 'text-[#FFC107]' : 'text-[#00E676]'}`}>{score.hardAccelerationsCount}</b></div>
                <div>Hard Brakes: <b className={`ml-1 ${score.hardBrakesCount > 0 ? 'text-[#FF5252]' : 'text-[#00E676]'}`}>{score.hardBrakesCount}</b></div>
                <div>Sharp Swerves: <b className={`ml-1 ${score.sharpSwervesCount > 0 ? 'text-[#00B8D4]' : 'text-[#00E676]'}`}>{score.sharpSwervesCount}</b></div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. ECO EFFICIENCY / GREEN FOOTPRINT SCORE CARD */}
      <div className="cyber-card p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-[#1F2A37] pb-2 mb-2 text-xs font-mono">
          <span className="flex items-center font-bold text-[#E6F1FF]">
            <Leaf className="w-4 h-4 mr-1.5" style={{ color: ecoColor }} />
            {isWalking ? 'CLEAN AIR FOOTPRINT' : 'ECO EFFICIENCY SCORE'}
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-extrabold"
            style={{ backgroundColor: `${ecoColor}20`, color: ecoColor, border: `1px solid ${ecoColor}50` }}
          >
            {isWalking ? 'ZERO CARBON' : getScoreLabel(score.ecoScore)}
          </span>
        </div>

        <div className="flex items-center justify-between px-2 my-1">
          {/* Main Circular Score Number */}
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="#1F2A37" strokeWidth="8" fill="transparent" />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke={ecoColor}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - ((isWalking ? 100 : score.ecoScore) / 100) * 251.2}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
                style={{ filter: `drop-shadow(0px 0px 6px ${ecoColor})` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-extrabold font-mono text-[#E6F1FF]">
                {isWalking ? 100 : score.ecoScore}
              </span>
              <span className="text-[9px] font-mono text-[#9FB3C8]">/ 100</span>
            </div>
          </div>

          {/* Metrics */}
          <div className="space-y-1 text-xs font-mono text-[#9FB3C8] text-right">
            {isWalking ? (
              <>
                <div>Carbon Output: <b className="text-[#00E676] ml-1">0 g CO₂</b></div>
                <div>Eco Rating: <b className="text-[#00E676] ml-1">100% GREEN</b></div>
                <div>Health Bonus: <b className="text-[#00B8D4] ml-1">+50 pts</b></div>
              </>
            ) : (
              <>
                <div>Idle Time: <b className="text-[#E6F1FF] ml-1">{score.idleTimeSeconds}s</b></div>
                <div>Eco Rating: <b className="text-[#00E676] ml-1">{getScoreLabel(score.ecoScore)}</b></div>
                <div>Idle Waste: <b className="text-[#00E676] ml-1">0 pts</b></div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
