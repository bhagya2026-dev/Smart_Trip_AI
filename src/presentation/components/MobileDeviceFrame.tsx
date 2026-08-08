import React, { useState } from 'react';
import { Battery, Smartphone, Wifi } from 'lucide-react';

interface MobileDeviceFrameProps {
  children: React.ReactNode;
}

export const MobileDeviceFrame: React.FC<MobileDeviceFrameProps> = ({ children }) => {
  const [usePhoneFrame, setUsePhoneFrame] = useState(true);

  // Live time for mobile status bar
  const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-[#070B0E] text-[#E6F1FF] flex flex-col items-center justify-start p-0 md:p-6 font-sans antialiased">
      {/* Desktop Top Control Bar */}
      <div className="hidden md:flex items-center justify-between w-full max-w-md mb-3 px-2 text-xs font-mono">
        <div className="flex items-center space-x-2 text-[#00E676] font-bold">
          <Smartphone className="w-4 h-4 text-[#00E676]" />
          <span>SMARTTRIP CYBER GREEN APP SIMULATOR</span>
        </div>
        <button
          onClick={() => setUsePhoneFrame(!usePhoneFrame)}
          className="px-3 py-1 rounded-xl bg-[#111A23] hover:bg-[#16212B] border border-[#00E676]/40 text-[#E6F1FF] transition-all font-sans font-medium"
        >
          {usePhoneFrame ? 'Expand Full Screen' : 'Show Phone Frame'}
        </button>
      </div>

      {/* Main Smartphone Shell Container */}
      {usePhoneFrame ? (
        <div className="relative w-full max-w-[430px] h-[100vh] md:h-[880px] bg-[#0B1117] rounded-none md:rounded-[48px] border-0 md:border-[10px] border-[#111A23] shadow-[0_0_50px_rgba(0,230,118,0.20)] overflow-hidden flex flex-col">
          {/* Top Camera & Speaker Notch */}
          <div className="hidden md:flex absolute top-0 left-1/2 transform -translate-x-1/2 w-36 h-6 bg-[#111A23] rounded-b-2xl z-50 items-center justify-center space-x-2 border-b border-[#1F2A37]">
            <div className="w-3 h-3 rounded-full bg-[#0B1117] border border-[#00E676]/40" />
            <div className="w-10 h-1.5 rounded-full bg-[#1F2A37]" />
          </div>

          {/* Native Mobile Status Bar */}
          <div className="w-full bg-[#0B1117]/95 pt-2 px-6 pb-1 flex items-center justify-between text-[11px] font-semibold text-[#9FB3C8] z-40 select-none border-b border-[#1F2A37]">
            <span>{currentTimeStr}</span>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-[#00E676] font-bold">5G</span>
              <Wifi className="w-3.5 h-3.5 text-white" />
              <Battery className="w-4 h-4 text-[#00E676] fill-current" />
            </div>
          </div>

          {/* Mobile Screen Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-none">
            {children}
          </div>

          {/* Bottom Native Home Indicator */}
          <div className="w-full bg-[#0B1117]/95 py-1.5 flex items-center justify-center z-50 border-t border-[#1F2A37]">
            <div className="w-32 h-1 bg-[#00E676]/40 rounded-full" />
          </div>
        </div>
      ) : (
        <div className="w-full max-w-4xl min-h-screen bg-[#0B1117] shadow-card-soft rounded-2xl overflow-hidden border border-[#1F2A37]">
          {children}
        </div>
      )}
    </div>
  );
};
