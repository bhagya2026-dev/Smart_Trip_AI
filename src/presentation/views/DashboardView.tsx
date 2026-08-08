import React, { useState } from 'react';
import type { DrivingScore, DrivingState, PitStop, TelemetryPoint, VehicleConfig } from '../../domain/models/telemetry';
import type { Destination } from '../components/DestinationSearchBar';
import { DestinationSearchBar } from '../components/DestinationSearchBar';
import { HeaderHUD } from '../components/HeaderHUD';
import { InteractiveRouteMap } from '../components/InteractiveRouteMap';
import { LiveNavigationPanel } from '../components/LiveNavigationPanel';
import { PitStopTimeline } from '../components/PitStopTimeline';
import { RadialScoreGauge } from '../components/RadialScoreGauge';
import { SpeedometerGForceHUD } from '../components/SpeedometerGForceHUD';
import { StartTripHeroCard } from '../components/StartTripHeroCard';
import type { RouteOption } from '../../services/roadRouting';

interface DashboardViewProps {
  drivingState: DrivingState;
  vehicleConfig: VehicleConfig;
  currentPoint: TelemetryPoint;
  telemetryPoints: TelemetryPoint[];
  pitStops: PitStop[];
  score: DrivingScore;
  maxSpeedKmH: number;
  activeTripDurationSec: number;
  liveIdleCostPerMin: number;
  isSimulating: boolean;
  isLiveGpsActive: boolean;
  activePresetId: string;
  destination: Destination | null;
  coveredDistanceKm: number;
  remainingDistanceKm: number;
  travelMode: 'VEHICLE' | 'WALKING';
  onSelectTravelMode: (mode: 'VEHICLE' | 'WALKING') => void;
  onSelectDestination: (dest: Destination | null) => void;
  onSelectPreset: (presetId: string) => void;
  onStartSimulation: () => void;
  onStopSimulation: () => void;
  onToggleLiveGps: () => void;
  onTriggerEvent: (event: 'HARD_ACCEL' | 'HARD_BRAKE' | 'SWERVE' | 'TRAFFIC_JAM' | 'PIT_STOP') => void;
  onUpdateVehicleConfig: (newConfig: Partial<VehicleConfig>) => void;
  onOpenVehicleSettings: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  drivingState,
  vehicleConfig,
  currentPoint,
  telemetryPoints,
  pitStops,
  score,
  maxSpeedKmH,
  activeTripDurationSec,
  liveIdleCostPerMin,
  isSimulating,
  isLiveGpsActive,
  activePresetId: _activePresetId,
  destination,
  coveredDistanceKm,
  remainingDistanceKm,
  travelMode,
  onSelectTravelMode,
  onSelectDestination,
  onSelectPreset: _onSelectPreset,
  onStartSimulation,
  onStopSimulation,
  onToggleLiveGps,
  onTriggerEvent: _onTriggerEvent,
  onUpdateVehicleConfig: _onUpdateVehicleConfig,
  onOpenVehicleSettings,
}) => {
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);

  // Dynamic real-time remaining distance math (counts down in real time as user drives!)
  const totalRouteDistKm = selectedRoute ? selectedRoute.distanceKm : remainingDistanceKm;
  const liveRemainingDistanceKm = destination
    ? Math.max(0, parseFloat((totalRouteDistKm - coveredDistanceKm).toFixed(1)))
    : 0;

  return (
    <div className="w-full min-h-screen bg-[#0B1117] text-[#E6F1FF] pb-24 font-sans antialiased">
      {/* 1. Header Telematics HUD */}
      <HeaderHUD
        drivingState={drivingState}
        vehicleConfig={vehicleConfig}
        activeTripDurationSec={activeTripDurationSec}
        liveIdleCostPerMin={liveIdleCostPerMin}
        isSimulating={isSimulating}
        isLiveGpsActive={isLiveGpsActive}
        onToggleSimulator={isSimulating ? onStopSimulation : onStartSimulation}
        onToggleLiveGps={onToggleLiveGps}
        onOpenVehicleSettings={onOpenVehicleSettings}
      />

      <main className="max-w-7xl mx-auto px-4 pt-4 space-y-4">
        {/* 2. Destination Search Bar & Mode Selector (Vehicle vs Walking) */}
        <DestinationSearchBar
          selectedDestination={destination}
          travelMode={travelMode}
          onSelectTravelMode={onSelectTravelMode}
          onSelectDestination={(dest) => {
            onSelectDestination(dest);
            setSelectedRoute(null);
          }}
        />

        {/* 3. Single Primary Start / End Trip Hero Button */}
        <StartTripHeroCard
          isSimulating={isSimulating}
          onStartTrip={onStartSimulation}
          onEndTrip={onStopSimulation}
        />

        {/* 4. Live Telemetry & Navigation (Real-time Counting Down Time, Passed Route, Remaining Route, ETA) */}
        <LiveNavigationPanel
          destination={destination}
          coveredDistanceKm={coveredDistanceKm}
          remainingDistanceKm={liveRemainingDistanceKm}
          currentSpeedKmH={currentPoint.speedKmH}
          pitStops={pitStops}
          activeTripDurationSec={activeTripDurationSec}
          isSimulating={isSimulating}
          travelMode={travelMode}
        />

        {/* 5. Speedometer & Real-time Fuel Spend / Walking Steps Card */}
        <SpeedometerGForceHUD
          currentPoint={currentPoint}
          maxSpeedKmH={maxSpeedKmH}
          vehicleConfig={vehicleConfig}
          coveredDistanceKm={coveredDistanceKm}
          idleDurationSeconds={score.idleTimeSeconds}
          travelMode={travelMode}
          routeDistanceKm={totalRouteDistKm}
        />

        {/* 6. Real-time Safety / Walking Cadence Score Gauges */}
        <RadialScoreGauge score={score} travelMode={travelMode} />

        {/* 7. Interactive Route Map */}
        <InteractiveRouteMap
          telemetryPoints={telemetryPoints}
          pitStops={pitStops}
          currentPoint={currentPoint}
          destination={destination}
          selectedRouteId={selectedRoute?.id}
          onSelectRoute={setSelectedRoute}
        />

        {/* 8. Stopped Places (> 5 Mins Pauses) Log */}
        <PitStopTimeline pitStops={pitStops} />
      </main>
    </div>
  );
};
