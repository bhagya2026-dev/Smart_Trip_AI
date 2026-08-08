import React, { useState } from 'react';
import { Award, Car, Edit3, Fuel, Leaf, MapPin, ShieldCheck, Sparkles, User, Zap } from 'lucide-react';
import type { VehicleConfig } from '../../domain/models/telemetry';

interface ProfileViewProps {
  vehicleConfig: VehicleConfig;
  totalTripsCount: number;
  totalDistanceKm: number;
  avgSafetyScore: number;
  onUpdateVehicleConfig: (newConfig: Partial<VehicleConfig>) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  vehicleConfig,
  totalTripsCount,
  totalDistanceKm,
  avgSafetyScore,
  onUpdateVehicleConfig,
}) => {
  const [userName, setUserName] = useState('Sri Lanka Driver');
  const [userTitle, setUserTitle] = useState('Eco-Driver');
  const [isEditing, setIsEditing] = useState(false);

  const ecoScoreVal = 90;
  const overallRatingVal = Math.round((avgSafetyScore + ecoScoreVal) / 2);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-6 pb-24 font-sans bg-[#0B1117] min-h-screen text-[#E6F1FF]">
      {/* 1. Driver Profile Hero Header Card */}
      <div className="cyber-card p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#00E676]/15 via-[#00B8D4]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
          {/* Generic Clean Driver Avatar Badge */}
          <div className="relative group shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-[#16212B] border-2 border-[#00E676] shadow-neon-green flex items-center justify-center text-[#00E676]">
              <User className="w-10 h-10" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#00E676] border-2 border-[#0B1117] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-[#0B1117]" />
            </div>
          </div>

          {/* Driver Information */}
          <div className="flex-1">
            <div className="flex items-center justify-center sm:justify-between">
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="cyber-input px-3 py-1 text-lg font-bold text-[#E6F1FF]"
                  />
                ) : (
                  <h2 className="text-xl font-extrabold text-[#E6F1FF] flex items-center justify-center sm:justify-start">
                    {userName}
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="ml-2 p-1 text-[#9FB3C8] hover:text-[#00E676] transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </h2>
                )}

                {isEditing ? (
                  <input
                    type="text"
                    value={userTitle}
                    onChange={(e) => setUserTitle(e.target.value)}
                    className="cyber-input px-3 py-1 text-xs font-mono text-[#00B8D4] mt-1"
                  />
                ) : (
                  <p className="text-xs font-mono text-[#00B8D4] mt-0.5">{userTitle}</p>
                )}
              </div>

              <span className="hidden sm:inline-flex badge-live px-3 py-1 rounded-full text-xs font-mono font-bold">
                ● LIVE GPS DRIVER VERIFIED
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3 font-mono text-xs text-[#9FB3C8]">
              <span className="flex items-center">
                <MapPin className="w-3.5 h-3.5 text-[#00E676] mr-1" />
                Sri Lanka Real-Time Location
              </span>
              <span>•</span>
              <span className="text-[#00E676] font-bold">{vehicleConfig.vehicleName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Existing Driving Score Overview Gauges */}
      <div className="cyber-card p-5 mb-6">
        <h3 className="text-xs font-bold font-mono text-[#E6F1FF] uppercase mb-4 flex items-center">
          <ShieldCheck className="w-4 h-4 text-[#00E676] mr-2" />
          DRIVER SAFETY & TELEMATICS RATING
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
          {/* Safety Score Gauge */}
          <div className="bg-[#16212B] p-4 rounded-xl border border-[#1F2A37] flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-[#9FB3C8] font-bold mb-1">SAFETY SCORE</span>
            <div className="text-3xl font-extrabold text-[#00E676]">{avgSafetyScore} <span className="text-xs text-[#9FB3C8]">/ 100</span></div>
            <span className="text-[10px] text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded-full border border-[#00E676]/30 mt-2">
              EXCELLENT RATING
            </span>
          </div>

          {/* Eco Score Gauge */}
          <div className="bg-[#16212B] p-4 rounded-xl border border-[#1F2A37] flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-[#9FB3C8] font-bold mb-1">ECO EFFICIENCY</span>
            <div className="text-3xl font-extrabold text-[#00B8D4]">{ecoScoreVal} <span className="text-xs text-[#9FB3C8]">/ 100</span></div>
            <span className="text-[10px] text-[#00B8D4] bg-[#00B8D4]/10 px-2 py-0.5 rounded-full border border-[#00B8D4]/30 mt-2">
              HIGH EFFICIENCY
            </span>
          </div>

          {/* Overall Telematics Rating */}
          <div className="bg-[#16212B] p-4 rounded-xl border border-[#1F2A37] flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-[#9FB3C8] font-bold mb-1">OVERALL DRIVER RATING</span>
            <div className="text-3xl font-extrabold text-[#EEFC07]">{overallRatingVal} <span className="text-xs text-[#9FB3C8]">/ 100</span></div>
            <span className="text-[10px] text-[#EEFC07] bg-[#EEFC07]/10 px-2 py-0.5 rounded-full border border-[#EEFC07]/30 mt-2">
              VERIFIED DRIVER
            </span>
          </div>
        </div>
      </div>

      {/* 3. Driver Badges & Telemetry Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 font-mono">
        <div className="cyber-card p-4 flex items-center justify-between border-l-4 border-l-[#00E676]">
          <div>
            <div className="text-[10px] text-[#9FB3C8] uppercase">TOTAL LOGGED TRIPS</div>
            <div className="text-2xl font-extrabold text-[#00E676] mt-1">{totalTripsCount} Drives</div>
            <div className="text-[10px] text-[#00E676] font-bold mt-0.5">SQLite Persistence</div>
          </div>
          <Car className="w-8 h-8 text-[#00E676]/40" />
        </div>

        <div className="cyber-card p-4 flex items-center justify-between border-l-4 border-l-[#00B8D4]">
          <div>
            <div className="text-[10px] text-[#9FB3C8] uppercase">TOTAL DISTANCE</div>
            <div className="text-2xl font-extrabold text-[#00B8D4] mt-1">{totalDistanceKm.toFixed(1)} km</div>
            <div className="text-[10px] text-[#9FB3C8] mt-0.5">Covered in Sri Lanka</div>
          </div>
          <Leaf className="w-8 h-8 text-[#00B8D4]/40" />
        </div>

        <div className="cyber-card p-4 flex items-center justify-between border-l-4 border-l-[#EEFC07]">
          <div>
            <div className="text-[10px] text-[#9FB3C8] uppercase">SENSOR STREAM</div>
            <div className="text-2xl font-extrabold text-[#EEFC07] mt-1">REAL-TIME GPS</div>
            <div className="text-[10px] text-[#9FB3C8] mt-0.5">Hardware WatchPosition</div>
          </div>
          <Zap className="w-8 h-8 text-[#EEFC07]/40" />
        </div>
      </div>

      {/* 4. Driver Achievements Badges */}
      <div className="cyber-card p-5 mb-6">
        <h3 className="text-xs font-bold font-mono text-[#E6F1FF] uppercase mb-3 flex items-center">
          <Award className="w-4 h-4 text-[#00E676] mr-2" />
          DRIVER ACHIEVEMENTS & CERTIFICATIONS
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#16212B] p-3 rounded-xl border border-[#1F2A37] flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#00E676]/20 text-[#00E676]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#E6F1FF]">Smooth Driver</div>
              <div className="text-[10px] text-[#9FB3C8] font-mono">Zero hard accel events</div>
            </div>
          </div>

          <div className="bg-[#16212B] p-3 rounded-xl border border-[#1F2A37] flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#00B8D4]/20 text-[#00B8D4]">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#E6F1FF]">Eco Master</div>
              <div className="text-[10px] text-[#9FB3C8] font-mono">Efficient drive rating</div>
            </div>
          </div>

          <div className="bg-[#16212B] p-3 rounded-xl border border-[#1F2A37] flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#EEFC07]/20 text-[#EEFC07]">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#E6F1FF]">Sri Lanka Highways</div>
              <div className="text-[10px] text-[#9FB3C8] font-mono">Galle Road A2 Verified</div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Active Vehicle Profile Configuration */}
      <div className="cyber-card p-5">
        <h3 className="text-xs font-bold font-mono text-[#E6F1FF] uppercase mb-3 flex items-center justify-between">
          <span className="flex items-center">
            <Car className="w-4 h-4 text-[#00E676] mr-2" />
            REGISTERED VEHICLE SPECIFICATIONS
          </span>
          <span className="text-[10px] text-[#00E676] font-mono">ACTIVE</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <label className="text-[#9FB3C8] block mb-1">Vehicle Name:</label>
            <input
              type="text"
              value={vehicleConfig.vehicleName}
              onChange={(e) => onUpdateVehicleConfig({ vehicleName: e.target.value })}
              className="cyber-input w-full px-3 py-2 text-xs text-[#E6F1FF]"
            />
          </div>

          <div>
            <label className="text-[#9FB3C8] block mb-1">Fuel Price (LKR / Liter):</label>
            <input
              type="number"
              value={vehicleConfig.fuelPricePerLiter}
              onChange={(e) => onUpdateVehicleConfig({ fuelPricePerLiter: parseFloat(e.target.value) || 370 })}
              className="cyber-input w-full px-3 py-2 text-xs text-[#E6F1FF]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
