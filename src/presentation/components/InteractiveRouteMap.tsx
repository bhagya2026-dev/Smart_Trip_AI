import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { PitStop, TelemetryPoint } from '../../domain/models/telemetry';
import type { Destination } from './DestinationSearchBar';
import { Locate, Navigation, Zap } from 'lucide-react';
import type { RouteOption } from '../../services/roadRouting';
import { fetchMultiRoadRoutes } from '../../services/roadRouting';
import { telemetrySimulator } from '../../data/sensors/TelemetrySimulator';

interface InteractiveRouteMapProps {
  telemetryPoints: TelemetryPoint[];
  pitStops: PitStop[];
  currentPoint?: TelemetryPoint;
  destination?: Destination | null;
  selectedRouteId?: string;
  onSelectRoute?: (route: RouteOption) => void;
}

export const InteractiveRouteMap: React.FC<InteractiveRouteMapProps> = ({
  telemetryPoints,
  pitStops,
  currentPoint,
  destination,
  selectedRouteId: externalSelectedRouteId,
  onSelectRoute,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const vehicleMarkerRef = useRef<L.Marker | null>(null);
  const polylineLayerRef = useRef<L.LayerGroup | null>(null);
  const navLineLayerRef = useRef<L.LayerGroup | null>(null);
  const pitStopLayerRef = useRef<L.LayerGroup | null>(null);

  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [activeRouteId, setActiveRouteId] = useState<string>('route-0');

  const currentActiveRouteId = externalSelectedRouteId || activeRouteId;

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const baseLat = currentPoint?.latitude || 6.6785;
    const baseLng = currentPoint?.longitude || 79.9265;

    const map = L.map(containerRef.current, {
      center: [baseLat, baseLng],
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Google-Style Colorful Map Tiles (CartoDB Voyager)
    const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    polylineLayerRef.current = L.layerGroup().addTo(map);
    navLineLayerRef.current = L.layerGroup().addTo(map);
    pitStopLayerRef.current = L.layerGroup().addTo(map);

    // Vehicle Location Marker (#00E676 Electric Green)
    const vehicleIcon = L.divIcon({
      className: 'custom-vehicle-marker',
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(0, 230, 118, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 22px; height: 22px; border-radius: 50%; background: #00E676; border: 3px solid #FFFFFF; box-shadow: 0 0 12px rgba(0, 230, 118, 0.8); display: flex; align-items: center; justify-content: center; transform: rotate(${currentPoint?.heading || 0}deg);">
            <div style="width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-bottom: 8px solid #0B1117; margin-top: -2px;"></div>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    vehicleMarkerRef.current = L.marker([baseLat, baseLng], { icon: vehicleIcon }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Vehicle Location Marker & Pan map smoothly
  useEffect(() => {
    if (!mapRef.current || !currentPoint || !vehicleMarkerRef.current) return;

    const lat = currentPoint.latitude;
    const lng = currentPoint.longitude;

    vehicleMarkerRef.current.setLatLng([lat, lng]);

    const vehicleIcon = L.divIcon({
      className: 'custom-vehicle-marker',
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(0, 230, 118, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 22px; height: 22px; border-radius: 50%; background: #00E676; border: 3px solid #FFFFFF; box-shadow: 0 0 12px rgba(0, 230, 118, 0.8); display: flex; align-items: center; justify-content: center; transform: rotate(${currentPoint.heading || 0}deg);">
            <div style="width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-bottom: 8px solid #0B1117; margin-top: -2px;"></div>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    vehicleMarkerRef.current.setIcon(vehicleIcon);
  }, [currentPoint]);

  // Driven Telemetry Trail Layer
  useEffect(() => {
    if (!mapRef.current || !polylineLayerRef.current) return;
    polylineLayerRef.current.clearLayers();
  }, [telemetryPoints]);

  // Fetch & Render Route line ONLY when destination is selected!
  useEffect(() => {
    if (!mapRef.current || !navLineLayerRef.current) return;

    // Clear any existing route lines immediately when no destination is selected
    navLineLayerRef.current.clearLayers();

    if (!destination || !currentPoint) {
      setRoutes([]);
      telemetrySimulator.setDestination(null, null, []);
      return;
    }

    const startLat = currentPoint.latitude;
    const startLng = currentPoint.longitude;

    fetchMultiRoadRoutes(startLat, startLng, destination.latitude, destination.longitude, destination.name).then(
      (fetchedRoutes) => {
        if (!navLineLayerRef.current || !mapRef.current) return;

        setRoutes(fetchedRoutes);
        navLineLayerRef.current.clearLayers();

        if (fetchedRoutes.length === 0) return;

        // Select Active Route (default to first route)
        const activeRoute = fetchedRoutes.find((r) => r.id === currentActiveRouteId) || fetchedRoutes[0];

        // 1. Pass road polyline coordinates to Telemetry Simulator
        telemetrySimulator.setDestination(destination.latitude, destination.longitude, activeRoute.coordinates);

        // 2. Render Outer Glow Polyline (#00C853)
        const outerPolyline = L.polyline(activeRoute.coordinates, {
          color: '#00C853',
          weight: 8,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(navLineLayerRef.current);

        // 3. Render Inner Core Polyline (#00E676)
        L.polyline(activeRoute.coordinates, {
          color: '#00E676',
          weight: 5,
          opacity: 1.0,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(navLineLayerRef.current);

        // 4. Destination Pin Marker (#FF5252 Finish Pin)
        const destIcon = L.divIcon({
          className: 'custom-dest-marker',
          html: `
            <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(255, 82, 82, 0.4); animation: ping 2s infinite;"></div>
              <div style="width: 26px; height: 26px; border-radius: 50%; background: #FF5252; border: 2.5px solid #FFFFFF; box-shadow: 0 0 15px #FF5252; display: flex; align-items: center; justify-content: center; font-size: 13px;">
                🏁
              </div>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        L.marker([destination.latitude, destination.longitude], { icon: destIcon })
          .bindPopup(`<b>Destination: ${destination.name}</b><br/>${destination.city}, Sri Lanka`)
          .addTo(navLineLayerRef.current);

        // 5. Fit Map Bounds to show whole route smoothly!
        try {
          const bounds = outerPolyline.getBounds();
          if (bounds.isValid()) {
            mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
          }
        } catch (e) {
          console.warn('fitBounds warning:', e);
        }
      }
    );
  }, [destination, currentPoint?.latitude, currentPoint?.longitude, currentActiveRouteId]);

  // Update Pit Stop Pins
  useEffect(() => {
    if (!mapRef.current || !pitStopLayerRef.current) return;

    pitStopLayerRef.current.clearLayers();

    pitStops.forEach((stop) => {
      const pitIcon = L.divIcon({
        className: 'custom-pit-marker',
        html: `
          <div style="width: 28px; height: 28px; border-radius: 50%; background: #00B8D4; border: 2px solid #FFFFFF; box-shadow: 0 0 10px #00B8D4; display: flex; align-items: center; justify-content: center; font-size: 13px;">
            ☕
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const mins = Math.round(stop.durationSeconds / 60);

      L.marker([stop.latitude, stop.longitude], { icon: pitIcon })
        .bindPopup(
          `<b>${stop.name}</b><br/>${stop.address}<br/><span style="color:#00B8D4;font-weight:bold;">Spent ${mins} mins paused here</span>`
        )
        .addTo(pitStopLayerRef.current!);
    });
  }, [pitStops]);

  const handleCenterGps = () => {
    if (mapRef.current && currentPoint) {
      mapRef.current.setView([currentPoint.latitude, currentPoint.longitude], 13, { animate: true });
    }
  };

  const handleRouteSelect = (route: RouteOption) => {
    setActiveRouteId(route.id);
    if (onSelectRoute) onSelectRoute(route);
  };

  return (
    <div className="cyber-card overflow-hidden mb-4 relative z-10">
      {/* Header Bar */}
      <div className="p-3.5 bg-[#16212B] border-b border-[#1F2A37] flex items-center justify-between">
        <div>
          <span className="text-xs font-mono font-bold text-[#E6F1FF] uppercase tracking-wider block">
            SRI LANKA LIVE MAP
          </span>
          <span className="text-[10px] text-[#9FB3C8] font-mono">
            {destination ? `Routing to: ${destination.name}` : 'Live Device Location Fix'}
          </span>
        </div>

        <button
          onClick={handleCenterGps}
          className="btn-secondary-green flex items-center space-x-1 px-3 py-1.5 text-xs font-mono font-bold"
        >
          <Locate className="w-3.5 h-3.5" />
          <span>CENTER GPS</span>
        </button>
      </div>

      {/* Multi-Route Selection Bar */}
      {destination && routes.length > 0 && (
        <div className="p-2 bg-[#111A23] border-b border-[#1F2A37] flex items-center space-x-2 overflow-x-auto scrollbar-none z-20">
          <span className="text-[10px] font-mono text-[#9FB3C8] uppercase whitespace-nowrap px-1">
            CHOOSE ROUTE:
          </span>
          {routes.map((rt) => {
            const isSelected = rt.id === currentActiveRouteId;
            return (
              <button
                key={rt.id}
                onClick={() => handleRouteSelect(rt)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono border transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-[#00E676] text-[#0B1117] border-[#00E676] font-bold shadow-neon-green'
                    : 'bg-[#16212B] text-[#9FB3C8] border-[#1F2A37] hover:border-[#00E676]/60 hover:text-[#E6F1FF]'
                }`}
              >
                {rt.type === 'EXPRESSWAY' ? (
                  <Zap className={`w-3.5 h-3.5 ${isSelected ? 'text-[#0B1117]' : 'text-[#FFC107]'}`} />
                ) : (
                  <Navigation className={`w-3.5 h-3.5 ${isSelected ? 'text-[#0B1117]' : 'text-[#00B8D4]'}`} />
                )}
                <div className="text-left">
                  <span className="block text-[11px] font-bold">{rt.name}</span>
                  <span className="block text-[9px] opacity-80 font-mono">
                    ~{rt.distanceKm} km • {Math.floor(rt.durationMins / 60) > 0 ? `${Math.floor(rt.durationMins / 60)}h ` : ''}
                    {rt.durationMins % 60}m
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Map Canvas */}
      <div ref={containerRef} className="w-full h-80 sm:h-96 relative z-10" />
    </div>
  );
};
