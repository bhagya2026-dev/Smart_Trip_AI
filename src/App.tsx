import React, { useEffect, useRef, useState } from 'react';
import type { DrivingScore, DrivingState, PitStop, TelemetryPoint, Trip, VehicleConfig } from './domain/models/telemetry';
import { DrivingStateProcessor } from './domain/stateMachine/DrivingStateProcessor';
import { SafetyEcoScorer } from './domain/analytics/SafetyEcoScorer';
import { DEFAULT_VEHICLE_CONFIG, FuelEngine } from './services/fuelEngine';
import { PitStopDetector } from './services/pitStopDetector';
import { DeviceSensorProvider } from './data/sensors/DeviceSensorProvider';
import { telemetrySimulator } from './data/sensors/TelemetrySimulator';
import { pedometerEngine } from './services/pedometerEngine';
import { localDB } from './data/database/LocalTripDatabase';
import { SmartTripAIChat } from './presentation/components/SmartTripAIChat';
import type { Destination } from './presentation/components/DestinationSearchBar';
import { MobileDeviceFrame } from './presentation/components/MobileDeviceFrame';
import { HomeView } from './presentation/views/HomeView';
import { DashboardView } from './presentation/views/DashboardView';
import { TripHistoryView } from './presentation/views/TripHistoryView';
import { FuelAnalyticsView } from './presentation/views/FuelAnalyticsView';
import { ProfileView } from './presentation/views/ProfileView';
import { TripSummaryModal } from './presentation/components/TripSummaryModal';
import { Calendar, Flame, Home, LayoutDashboard, User } from 'lucide-react';

function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'HOME' | 'LIVE_HUD' | 'HISTORY' | 'FUEL' | 'PROFILE'>('HOME');
  const [travelMode, setTravelMode] = useState<'VEHICLE' | 'WALKING'>('VEHICLE');
  const [useAutoSimulator] = useState<boolean>(false);
  
  // Vehicle Config & Fuel Engine
  const [vehicleConfig, setVehicleConfig] = useState<VehicleConfig>(DEFAULT_VEHICLE_CONFIG);
  const fuelEngineRef = useRef<FuelEngine>(new FuelEngine(DEFAULT_VEHICLE_CONFIG));
  
  // State Machine, Analytics & Sensor Provider Instances
  const stateProcessorRef = useRef<DrivingStateProcessor>(new DrivingStateProcessor());
  const scorerRef = useRef<SafetyEcoScorer>(new SafetyEcoScorer());
  const pitStopDetectorRef = useRef<PitStopDetector>(new PitStopDetector(fuelEngineRef.current));
  const sensorProviderRef = useRef<DeviceSensorProvider>(new DeviceSensorProvider());

  // Live Navigation & Destination Target
  const [destination, setDestination] = useState<Destination | null>(null);
  const [completedTripSummary, setCompletedTripSummary] = useState<Trip | null>(null);

  // Live Telemetry States
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isLiveGpsActive, setIsLiveGpsActive] = useState<boolean>(true);
  const [activePresetId, setActivePresetId] = useState<string>('preset-urban');
  const [drivingState, setDrivingState] = useState<DrivingState>('OFFLINE');

  // Real-time trip recording accumulators
  const [liveRecordedDistanceKm, setLiveRecordedDistanceKm] = useState<number>(0);
  const lastPointRef = useRef<TelemetryPoint | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  
  // Base coordinates
  const [currentPoint, setCurrentPoint] = useState<TelemetryPoint>({
    id: 'init-lk-0',
    tripId: 'active-trip-lk',
    timestamp: Date.now(),
    latitude: 6.6785,
    longitude: 79.9265,
    speedKmH: 0,
    heading: 45,
    accelX: 0,
    accelY: 9.81,
    accelZ: 0,
    gyroX: 0,
    gyroY: 0,
    gyroZ: 0,
    state: 'OFFLINE',
    gForceCombined: 1.0,
  });

  const [telemetryPoints, setTelemetryPoints] = useState<TelemetryPoint[]>([]);
  const [pitStops, setPitStops] = useState<PitStop[]>([]);
  const [score, setScore] = useState<DrivingScore>({
    safetyScore: 100,
    ecoScore: 100,
    overallScore: 100,
    hardAccelerationsCount: 0,
    hardBrakesCount: 0,
    sharpSwervesCount: 0,
    idleTimeSeconds: 0,
    smoothDrivingDistanceKm: 0,
  });
  const [maxSpeedKmH, setMaxSpeedKmH] = useState<number>(0);
  const [activeTripDurationSec, setActiveTripDurationSec] = useState<number>(0);
  const [liveIdleCostPerMin, setLiveIdleCostPerMin] = useState<number>(0);

  // Saved Trip History
  const [trips, setTrips] = useState<Trip[]>([]);

  // Load Trips & Start Real Device GPS Location on Mount
  useEffect(() => {
    const loaded = localDB.getAllTrips();
    setTrips(loaded);

    // Get immediate real device position fix on launch
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCurrentPoint((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            accuracy: position.coords.accuracy || 5,
          }));
        },
        (err) => console.warn('Initial GPS position error:', err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }

    // Initialize Device Location Listener
    startLiveGpsTracking();

    return () => {
      sensorProviderRef.current.stopListening();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const startLiveGpsTracking = async () => {
    await sensorProviderRef.current.requestPermissions();
    setIsLiveGpsActive(true);
    
    sensorProviderRef.current.startListening((partialPoint) => {
      const fullPt: TelemetryPoint = {
        id: `pt-gps-${Date.now()}`,
        tripId: 'live-gps-trip',
        timestamp: partialPoint.timestamp || Date.now(),
        latitude: partialPoint.latitude || currentPoint.latitude,
        longitude: partialPoint.longitude || currentPoint.longitude,
        altitude: partialPoint.altitude || 0,
        speedKmH: partialPoint.speedKmH || 0,
        heading: partialPoint.heading || 0,
        accuracy: partialPoint.accuracy || 5,
        accelX: partialPoint.accelX || 0,
        accelY: partialPoint.accelY || 9.81,
        accelZ: partialPoint.accelZ || 0,
        gyroX: 0,
        gyroY: 0,
        gyroZ: partialPoint.gyroZ || 0,
        state: isSimulating ? 'DRIVING' : 'OFFLINE',
        gForceCombined: 1.0,
      };

      if (!useAutoSimulator) {
        handleIncomingTelemetryPoint(fullPt);
      }
    });
  };

  const toggleLiveGps = () => {
    if (isLiveGpsActive) {
      sensorProviderRef.current.stopListening();
      setIsLiveGpsActive(false);
    } else {
      startLiveGpsTracking();
    }
  };

  const handleUpdateVehicleConfig = (newConfig: Partial<VehicleConfig>) => {
    const updated = fuelEngineRef.current.updateConfig(newConfig);
    setVehicleConfig(updated);
  };

  // Start Real Live GPS Drive / Walk
  const handleStartSimulation = () => {
    stateProcessorRef.current.reset();
    scorerRef.current.reset();
    pitStopDetectorRef.current.reset();
    pedometerEngine.reset();

    setTelemetryPoints([]);
    setPitStops([]);
    setMaxSpeedKmH(0);
    setActiveTripDurationSec(0);
    setLiveRecordedDistanceKm(0);
    lastPointRef.current = null;
    setIsSimulating(true);

    // Live 1-second trip duration timer
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = window.setInterval(() => {
      setActiveTripDurationSec((prev) => prev + 1);
    }, 1000);

    if (useAutoSimulator) {
      // Desktop Demo Auto-Simulator Mode
      telemetrySimulator.setPreset(activePresetId);
      telemetrySimulator.setStartPosition(currentPoint.latitude, currentPoint.longitude);
      if (destination) {
        telemetrySimulator.setDestination(destination.latitude, destination.longitude);
      }

      telemetrySimulator.start((point: TelemetryPoint) => {
        handleIncomingTelemetryPoint(point);
      });
    } else {
      // Real Mobile Device Hardware GPS Mode
      startLiveGpsTracking();
    }
  };

  // Stop Drive & Save Trip to SQLite DB & Show Trip Summary Modal
  const handleStopSimulation = () => {
    if (useAutoSimulator) {
      telemetrySimulator.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsSimulating(false);

    const summaryScore = scorerRef.current.getSummary();
    const isWalking = travelMode === 'WALKING';

    // Pedestrian Steps & Calories Math
    const pedometerSummary = pedometerEngine.getSummary();
    let finalSteps = pedometerSummary.stepsCount;

    if (isWalking && finalSteps === 0) {
      // Fallback: estimate steps from duration & distance if walking
      const estStepsFromTime = Math.round(activeTripDurationSec * 1.7); // ~102 steps / minute
      const estStepsFromDist = Math.round(liveRecordedDistanceKm * 1310);
      finalSteps = Math.max(estStepsFromTime, estStepsFromDist, 85);
    }

    let finalDistanceKm = liveRecordedDistanceKm > 0
      ? parseFloat(liveRecordedDistanceKm.toFixed(2))
      : summaryScore.smoothDrivingDistanceKm;

    if (isWalking) {
      // For walking, ensure distance reflects physical steps
      const distFromSteps = parseFloat((finalSteps / 1310).toFixed(2));
      finalDistanceKm = Math.max(finalDistanceKm, distFromSteps, 0.15);
    }

    const finalCalories = isWalking
      ? Math.round(finalSteps * 0.045)
      : 0;

    const fuelMetrics = isWalking
      ? { totalFuelLiters: 0, idleFuelLiters: 0, totalCost: 0, idleCost: 0, costSavedCruising: 0 }
      : fuelEngineRef.current.calculateTripFuelMetrics(
          finalDistanceKm,
          summaryScore.idleTimeSeconds,
          currentPoint.speedKmH || 42
        );

    const targetTitle = destination
      ? `${isWalking ? 'Walk' : 'Drive'} to ${destination.name}`
      : `Sri Lanka ${isWalking ? 'Walk' : 'Drive'}`;

    const completedTrip: Trip = {
      id: `trip-${Date.now()}`,
      title: `${targetTitle} (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      startTime: telemetryPoints[0]?.timestamp || Date.now() - activeTripDurationSec * 1000,
      endTime: Date.now(),
      durationSeconds: Math.max(1, activeTripDurationSec),
      distanceKm: finalDistanceKm,
      maxSpeedKmH: isWalking ? 5.2 : (maxSpeedKmH || Math.round(currentPoint.speedKmH)),
      avgSpeedKmH: isWalking ? 4.2 : parseFloat((finalDistanceKm / (activeTripDurationSec / 3600 || 0.016)).toFixed(1)),
      totalFuelLiters: fuelMetrics.totalFuelLiters,
      idleFuelLiters: fuelMetrics.idleFuelLiters,
      totalCost: fuelMetrics.totalCost,
      idleCost: fuelMetrics.idleCost,
      costSavedCruising: fuelMetrics.costSavedCruising,
      safetyScore: summaryScore.safetyScore,
      ecoScore: summaryScore.ecoScore,
      stepsCount: isWalking ? finalSteps : undefined,
      caloriesBurned: isWalking ? finalCalories : undefined,
      hardAccelerations: isWalking ? 0 : summaryScore.hardAccelerationsCount,
      hardBrakes: isWalking ? 0 : summaryScore.hardBrakesCount,
      sharpSwerves: isWalking ? 0 : summaryScore.sharpSwervesCount,
      status: 'COMPLETED',
      telemetryPoints,
      pitStops,
    };

    localDB.saveTrip(completedTrip);
    setTrips(localDB.getAllTrips());

    // Show Trip Completion Summary Modal
    setCompletedTripSummary(completedTrip);
    setDrivingState('OFFLINE');
  };

  // Process incoming high-frequency Telemetry Point
  const handleIncomingTelemetryPoint = (point: TelemetryPoint) => {
    if (!isSimulating && !useAutoSimulator) {
      setCurrentPoint(point);
      return;
    }

    // Calculate real Haversine distance delta
    if (lastPointRef.current) {
      const d = calculateHaversineDistanceKm(
        lastPointRef.current.latitude,
        lastPointRef.current.longitude,
        point.latitude,
        point.longitude
      );
      if (d > 0.001 && d < 1.0) { // between 1 meter and 1 km
        setLiveRecordedDistanceKm((prev) => prev + d);
      }
    }
    lastPointRef.current = point;

    setTelemetryPoints((prev) => [...prev.slice(-150), point]);
    setCurrentPoint(point);

    // 1. Process State Machine
    const prevState = drivingState;
    const newState = stateProcessorRef.current.processTelemetry(point);
    point.state = newState;
    setDrivingState(newState);

    // 2. Evaluate Driving Safety & Eco Score
    const evalResult = scorerRef.current.evaluatePoint(point, lastPointRef.current || undefined);
    if (evalResult.penaltyType && travelMode !== 'WALKING') {
      point.safetyPenalty = evalResult.penaltyType;
    }
    const updatedScore = scorerRef.current.getSummary();
    setScore(updatedScore);

    // 3. Evaluate Automated Intermediate Pit Stop Detector
    const detectedStop = pitStopDetectorRef.current.evaluatePoint(point, prevState);
    if (detectedStop) {
      setPitStops((prev) => [...prev, detectedStop]);
    }

    // 4. Update HUD Counters
    if (point.speedKmH > maxSpeedKmH) setMaxSpeedKmH(point.speedKmH);

    const idleWaste = fuelEngineRef.current.calculateIdleWaste(updatedScore.idleTimeSeconds);
    setLiveIdleCostPerMin(idleWaste.costPerMinute);
  };

  const handleTriggerEvent = (event: 'HARD_ACCEL' | 'HARD_BRAKE' | 'SWERVE' | 'TRAFFIC_JAM' | 'PIT_STOP') => {
    telemetrySimulator.triggerManualEvent(event);
  };

  // Distance Math
  const coveredDistanceKm = liveRecordedDistanceKm > 0
    ? liveRecordedDistanceKm
    : (score.smoothDrivingDistanceKm || (activeTripDurationSec * 0.005));

  const remainingDistanceKm = destination
    ? calculateHaversineDistanceKm(
        currentPoint.latitude,
        currentPoint.longitude,
        destination.latitude,
        destination.longitude
      )
    : 0;

  const totalIdleCost = trips.reduce((acc, t) => acc + (t.idleCost || 0), 0);
  const totalIdleLiters = trips.reduce((acc, t) => acc + (t.idleFuelLiters || 0), 0);
  const totalDistanceKmSum = trips.reduce((acc, t) => acc + (t.distanceKm || 0), 0) + coveredDistanceKm;
  const avgSafetyScoreVal = trips.length > 0 ? Math.round(trips.reduce((acc, t) => acc + t.safetyScore, 0) / trips.length) : 95;

  return (
    <MobileDeviceFrame>
      <div className="min-h-full bg-[#0B1117] text-[#E6F1FF] font-sans antialiased relative pb-16">
        {/* TAB 1: HOME VIEW */}
        {activeTab === 'HOME' && (
          <HomeView
            onStartTrip={() => {
              handleStartSimulation();
              setActiveTab('LIVE_HUD');
            }}
            onSelectDestination={(dest) => setDestination(dest)}
            onNavigateToTab={setActiveTab}
            totalTripsCount={trips.length}
            totalDistanceKm={totalDistanceKmSum}
            totalIdleCost={totalIdleCost}
            avgSafetyScore={avgSafetyScoreVal}
          />
        )}

        {/* TAB 2: LIVE HUD VIEW */}
        {activeTab === 'LIVE_HUD' && (
          <DashboardView
            drivingState={drivingState}
            vehicleConfig={vehicleConfig}
            currentPoint={currentPoint}
            telemetryPoints={telemetryPoints}
            pitStops={pitStops}
            score={score}
            maxSpeedKmH={maxSpeedKmH}
            activeTripDurationSec={activeTripDurationSec}
            liveIdleCostPerMin={liveIdleCostPerMin}
            isSimulating={isSimulating}
            isLiveGpsActive={isLiveGpsActive}
            activePresetId={activePresetId}
            destination={destination}
            coveredDistanceKm={coveredDistanceKm}
            remainingDistanceKm={remainingDistanceKm}
            travelMode={travelMode}
            onSelectTravelMode={setTravelMode}
            onSelectDestination={setDestination}
            onSelectPreset={setActivePresetId}
            onStartSimulation={handleStartSimulation}
            onStopSimulation={handleStopSimulation}
            onToggleLiveGps={toggleLiveGps}
            onTriggerEvent={handleTriggerEvent}
            onUpdateVehicleConfig={handleUpdateVehicleConfig}
            onOpenVehicleSettings={() => setActiveTab('FUEL')}
          />
        )}

        {/* TAB 3: TRIP LOGS PERSISTENT SQL VIEW */}
        {activeTab === 'HISTORY' && (
          <TripHistoryView trips={trips} />
        )}

        {/* TAB 4: FUEL FRICTION ANALYZER VIEW */}
        {activeTab === 'FUEL' && (
          <FuelAnalyticsView
            vehicleConfig={vehicleConfig}
            totalIdleCost={totalIdleCost}
            totalIdleLiters={totalIdleLiters}
            onUpdateVehicleConfig={handleUpdateVehicleConfig}
          />
        )}

        {/* TAB 5: USER DRIVER PROFILE VIEW */}
        {activeTab === 'PROFILE' && (
          <ProfileView
            vehicleConfig={vehicleConfig}
            totalTripsCount={trips.length}
            totalDistanceKm={totalDistanceKmSum}
            avgSafetyScore={avgSafetyScoreVal}
            onUpdateVehicleConfig={handleUpdateVehicleConfig}
          />
        )}

        {/* Trip Completion Summary Modal */}
        <TripSummaryModal
          trip={completedTripSummary}
          onClose={() => setCompletedTripSummary(null)}
          onViewHistory={() => setActiveTab('HISTORY')}
          travelMode={travelMode}
        />

        {/* Floating Mobile SmartTrip AI Assistant */}
        <SmartTripAIChat />

        {/* Bottom Navigation Bar */}
        <nav className="absolute bottom-0 left-0 right-0 z-40 bg-[#0B1117]/95 backdrop-blur-md border-t border-[#1F2A37] py-2 px-2 shadow-2xl">
          <div className="flex items-center justify-around font-mono text-xs">
            <button
              onClick={() => setActiveTab('HOME')}
              className={`flex flex-col items-center space-y-1 transition-all ${
                activeTab === 'HOME' ? 'text-[#00E676] font-bold scale-105' : 'text-[#9FB3C8] hover:text-[#E6F1FF]'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[9px]">Home</span>
            </button>

            <button
              onClick={() => setActiveTab('LIVE_HUD')}
              className={`flex flex-col items-center space-y-1 transition-all ${
                activeTab === 'LIVE_HUD' ? 'text-[#00E676] font-bold scale-105' : 'text-[#9FB3C8] hover:text-[#E6F1FF]'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[9px]">Live HUD</span>
            </button>

            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`flex flex-col items-center space-y-1 transition-all ${
                activeTab === 'HISTORY' ? 'text-[#00E676] font-bold scale-105' : 'text-[#9FB3C8] hover:text-[#E6F1FF]'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-[9px]">Trip Logs</span>
            </button>

            <button
              onClick={() => setActiveTab('FUEL')}
              className={`flex flex-col items-center space-y-1 transition-all ${
                activeTab === 'FUEL' ? 'text-[#00E676] font-bold scale-105' : 'text-[#9FB3C8] hover:text-[#E6F1FF]'
              }`}
            >
              <Flame className="w-5 h-5" />
              <span className="text-[9px]">Fuel</span>
            </button>

            <button
              onClick={() => setActiveTab('PROFILE')}
              className={`flex flex-col items-center space-y-1 transition-all ${
                activeTab === 'PROFILE' ? 'text-[#00E676] font-bold scale-105' : 'text-[#9FB3C8] hover:text-[#E6F1FF]'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[9px]">Profile</span>
            </button>
          </div>
        </nav>
      </div>
    </MobileDeviceFrame>
  );
};

export default App;
