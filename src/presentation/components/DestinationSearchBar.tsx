import React, { useState } from 'react';
import { Car, Compass, Footprints, Flag, Locate, MapPin, Navigation, Search } from 'lucide-react';
import { searchSriLankaLocations } from '../../services/geocodingService';

export interface Destination {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  distanceKmEst: number;
}

export const SRI_LANKA_DESTINATIONS: Destination[] = [
  { id: 'thalpitiya', name: 'Thalpitiya', city: 'Wadduwa', latitude: 6.6785, longitude: 79.9265, distanceKmEst: 3 },
  { id: 'wadduwa', name: 'Wadduwa Beach', city: 'Wadduwa', latitude: 6.6667, longitude: 79.9325, distanceKmEst: 33 },
  { id: 'panadura', name: 'Panadura Town', city: 'Panadura', latitude: 6.713, longitude: 79.9026, distanceKmEst: 27 },
  { id: 'kalutara', name: 'Kalutara Bodhiya', city: 'Kalutara', latitude: 6.5854, longitude: 79.9607, distanceKmEst: 43 },
  { id: 'galle', name: 'Galle Fort', city: 'Galle', latitude: 6.0535, longitude: 80.221, distanceKmEst: 118 },
  { id: 'colombo', name: 'Colombo Lotus Tower', city: 'Colombo', latitude: 6.9271, longitude: 79.8612, distanceKmEst: 0 },
  { id: 'kandy', name: 'Temple of the Tooth', city: 'Kandy', latitude: 7.2906, longitude: 80.6337, distanceKmEst: 115 },
  { id: 'ella', name: 'Ella Nine Arch', city: 'Ella', latitude: 6.8667, longitude: 81.0466, distanceKmEst: 200 },
  { id: 'sigiriya', name: 'Sigiriya Rock Fortress', city: 'Matale', latitude: 7.957, longitude: 80.7603, distanceKmEst: 170 },
];

interface DestinationSearchBarProps {
  selectedDestination: Destination | null;
  onSelectDestination: (dest: Destination | null) => void;
  onUseLiveLocation?: () => void;
  startLocationName?: string;
  travelMode: 'VEHICLE' | 'WALKING';
  onSelectTravelMode: (mode: 'VEHICLE' | 'WALKING') => void;
}

export const DestinationSearchBar: React.FC<DestinationSearchBarProps> = ({
  selectedDestination,
  onSelectDestination,
  onUseLiveLocation,
  startLocationName = 'Thalpitiya / Live GPS',
  travelMode,
  onSelectTravelMode,
}) => {
  const [query, setQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [liveSearchResults, setLiveSearchResults] = useState<Destination[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const filteredLocal = SRI_LANKA_DESTINATIONS.filter(
    (d) =>
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.city.toLowerCase().includes(query.toLowerCase())
  );

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setIsDropdownOpen(true);

    if (val.trim().length >= 2) {
      setIsSearching(true);
      searchSriLankaLocations(val)
        .then((res) => {
          setLiveSearchResults(res);
          setIsSearching(false);
        })
        .catch(() => setIsSearching(false));
    } else {
      setLiveSearchResults([]);
    }
  };

  const handleSelect = (dest: Destination) => {
    onSelectDestination(dest);
    setQuery(dest.name);
    setIsDropdownOpen(false);
  };

  const clearSelection = () => {
    onSelectDestination(null);
    setQuery('');
  };

  return (
    <div className="relative w-full mb-4 font-sans z-30 space-y-2">
      {/* MODE TOGGLE SWITCH: VEHICLE vs WALKING */}
      <div className="bg-[#16212B] p-1.5 rounded-2xl border border-[#1F2A37] flex items-center justify-between">
        <span className="text-[10px] font-mono text-[#9FB3C8] font-bold uppercase px-2">
          SELECT MODE:
        </span>
        <div className="flex items-center space-x-1 font-mono text-xs">
          <button
            onClick={() => onSelectTravelMode('VEHICLE')}
            className={`px-3.5 py-1.5 rounded-xl border flex items-center space-x-1.5 transition-all ${
              travelMode === 'VEHICLE'
                ? 'bg-[#00E676] text-[#0B1117] border-[#00E676] font-bold shadow-neon-green'
                : 'bg-[#111A23] text-[#9FB3C8] border-[#1F2A37] hover:text-[#E6F1FF]'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>🚗 VEHICLE (DRIVING)</span>
          </button>

          <button
            onClick={() => onSelectTravelMode('WALKING')}
            className={`px-3.5 py-1.5 rounded-xl border flex items-center space-x-1.5 transition-all ${
              travelMode === 'WALKING'
                ? 'bg-[#00B8D4] text-[#0B1117] border-[#00B8D4] font-bold shadow-cyan'
                : 'bg-[#111A23] text-[#9FB3C8] border-[#1F2A37] hover:text-[#E6F1FF]'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>🚶 WALKING (PEDESTRIAN)</span>
          </button>
        </div>
      </div>

      {/* Route Start / End Indicator Pills */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 font-mono text-xs">
        {/* START LOCATION (LIVE GPS) */}
        <div className="flex-1 bg-[#16212B] p-2.5 rounded-xl border border-[#00E676]/40 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00E676] animate-ping" />
            <div>
              <span className="text-[9px] text-[#9FB3C8] block font-bold">STARTING LOCATION</span>
              <span className="text-xs font-extrabold text-[#00E676] flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-[#00E676]" />
                {startLocationName}
              </span>
            </div>
          </div>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#00E676]/15 text-[#00E676] font-bold">
            LIVE GPS
          </span>
        </div>

        {/* ENDING LOCATION (SEARCHED DESTINATION) */}
        <div className="flex-1 bg-[#16212B] p-2.5 rounded-xl border border-[#00B8D4]/40 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flag className="w-4 h-4 text-[#FF5252]" />
            <div>
              <span className="text-[9px] text-[#9FB3C8] block font-bold">ENDING LOCATION</span>
              <span className="text-xs font-extrabold text-[#00B8D4]">
                {selectedDestination ? selectedDestination.name : 'Search Target Below...'}
              </span>
            </div>
          </div>
          {selectedDestination && (
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#00B8D4]/15 text-[#00B8D4] font-bold">
              ~{selectedDestination.distanceKmEst} km
            </span>
          )}
        </div>
      </div>

      {/* Input Search Container */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 flex items-center pointer-events-none text-[#00E676]">
          <Search className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => setIsDropdownOpen(true)}
          placeholder="Search Wadduwa, Panadura, Kalutara, Galle or any address..."
          className="cyber-input w-full pl-10 pr-24 py-3 text-xs sm:text-sm text-[#E6F1FF] placeholder-[#9FB3C8] shadow-card-soft"
        />

        <div className="absolute right-2 flex items-center space-x-1.5">
          {selectedDestination ? (
            <button
              onClick={clearSelection}
              className="px-2.5 py-1 text-[10px] font-mono font-bold bg-[#FF5252]/15 text-[#FF5252] border border-[#FF5252]/40 rounded-lg hover:bg-[#FF5252]/30 transition-all"
            >
              CLEAR
            </button>
          ) : (
            onUseLiveLocation && (
              <button
                onClick={onUseLiveLocation}
                className="px-2 py-1 text-[10px] font-mono font-bold bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/40 rounded-lg flex items-center space-x-1 hover:bg-[#00E676]/30 transition-all"
                title="Center Map to My Live Location"
              >
                <Locate className="w-3 h-3 text-[#00E676]" />
                <span className="hidden sm:inline">LIVE GPS</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Auto-suggest Dropdown */}
      {isDropdownOpen && (query.length > 0 || filteredLocal.length > 0) && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#111A23] border border-[#00E676]/40 rounded-xl shadow-2xl overflow-hidden z-[100] max-h-72 overflow-y-auto">
          {isSearching && (
            <div className="p-3 text-center text-xs font-mono text-[#00B8D4]">
              Searching OpenStreetMap Sri Lanka...
            </div>
          )}

          {/* Live Nominatim API Search Results */}
          {liveSearchResults.length > 0 && (
            <div>
              <div className="px-3 py-1.5 bg-[#16212B] text-[10px] font-mono text-[#00E676] font-bold border-b border-[#1F2A37]">
                LIVE SRI LANKA GEOCODING RESULTS
              </div>
              {liveSearchResults.map((dest) => (
                <div
                  key={dest.id}
                  onClick={() => handleSelect(dest)}
                  className="p-3 hover:bg-[#16212B] border-b border-[#1F2A37]/50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-[#00E676] shrink-0" />
                    <div>
                      <div className="font-bold text-[#E6F1FF]">{dest.name}</div>
                      <div className="text-[10px] text-[#9FB3C8]">{dest.city}, Sri Lanka</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#00B8D4]">SELECT</span>
                </div>
              ))}
            </div>
          )}

          {/* Quick Popular Local Destinations */}
          <div>
            <div className="px-3 py-1.5 bg-[#16212B] text-[10px] font-mono text-[#9FB3C8] font-bold border-b border-[#1F2A37]">
              POPULAR SRI LANKAN TOWNS & CITY TARGETS
            </div>
            {filteredLocal.map((dest) => (
              <div
                key={dest.id}
                onClick={() => handleSelect(dest)}
                className="p-3 hover:bg-[#16212B] border-b border-[#1F2A37]/50 cursor-pointer flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Navigation className="w-3.5 h-3.5 text-[#00B8D4] shrink-0" />
                  <div>
                    <span className="font-bold text-[#E6F1FF]">{dest.name}</span>
                    <span className="text-[10px] text-[#9FB3C8] ml-2">({dest.city})</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#00E676] font-bold">
                  ~{dest.distanceKmEst} km
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Chips Row */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pt-1 pb-1 scrollbar-none text-[11px] font-mono">
        <span className="text-[#9FB3C8] font-bold shrink-0 flex items-center mr-1">
          <Compass className="w-3 h-3 text-[#00E676] mr-1" />
          TARGETS:
        </span>

        {SRI_LANKA_DESTINATIONS.map((dest) => {
          const isSelected = selectedDestination?.id === dest.id;
          return (
            <button
              key={dest.id}
              onClick={() => handleSelect(dest)}
              className={`px-3 py-1 rounded-full whitespace-nowrap border transition-all ${
                isSelected
                  ? 'bg-[#00E676] text-[#0B1117] font-bold border-[#00E676] shadow-neon-green'
                  : 'bg-[#111A23] text-[#E6F1FF] border-[#1F2A37] hover:border-[#00E676]/40 hover:text-[#00E676]'
              }`}
            >
              {dest.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
