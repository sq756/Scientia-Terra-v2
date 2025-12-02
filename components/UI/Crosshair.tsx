import React from 'react';

interface CrosshairProps {
  hovering: boolean;
}

const Crosshair: React.FC<CrosshairProps> = ({ hovering }) => {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40 flex items-center justify-center mix-blend-difference">
      <div className={`relative w-6 h-6 transition-all duration-300 ${hovering ? 'scale-150 rotate-45' : 'scale-100'}`}>
        {/* Horizontal Line */}
        <div className={`absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2 transition-colors duration-200 shadow-sm ${hovering ? 'bg-amber-400 shadow-amber-500/50' : 'bg-cyan-400/80 shadow-cyan-400/50'}`}></div>
        
        {/* Vertical Line */}
        <div className={`absolute top-0 left-1/2 h-full w-0.5 -translate-x-1/2 transition-colors duration-200 shadow-sm ${hovering ? 'bg-amber-400 shadow-amber-500/50' : 'bg-cyan-400/80 shadow-cyan-400/50'}`}></div>
        
        {/* Center Dot (Only visible when hovering for precision feel) */}
        <div className={`absolute top-1/2 left-1/2 w-1 h-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white transition-opacity duration-200 ${hovering ? 'opacity-100' : 'opacity-0'}`}></div>
      </div>
    </div>
  );
};

export default Crosshair;