import React from 'react';
import { TutorialStep } from '../../types';

interface TutorialOverlayProps {
  step: TutorialStep;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ step }) => {
  if (step === TutorialStep.COMPLETED || step === TutorialStep.INTRO) return null;

  const steps = [
    { title: "Initialization", desc: "Loading..." }, // Placeholder for 0
    { 
      title: "Movement", 
      desc: "Use [W, A, S, D] to traverse the Data Ocean. Use [SPACE] to Jump.",
      key: "W"
    },
    { 
      title: "Prospecting", 
      desc: "Aim at a Data Node and [RIGHT CLICK] to Scan its value. Newer nodes yield more energy.",
      key: "R-CLICK"
    },
    { 
      title: "Refinement", 
      desc: "Approach the Node and [LEFT CLICK] to open the Refiner Terminal.",
      key: "L-CLICK"
    },
  ];

  const current = steps[step];

  return (
    <div className="absolute bottom-32 left-1/2 -translate-x-1/2 md:left-auto md:right-10 md:translate-x-0 z-40 animate-in slide-in-from-right-10 duration-500">
      <div className="bg-slate-900/90 border-l-4 border-amber-500 p-6 max-w-sm shadow-[0_0_30px_rgba(245,158,11,0.2)] backdrop-blur-md clip-path-polygon-[0_0,100%_0,100%_85%,90%_100%,0_100%]">
        <div className="flex justify-between items-start mb-2">
           <h3 className="text-amber-500 font-bold uppercase tracking-widest text-sm">Tutorial Protocol</h3>
           <span className="text-slate-500 font-mono text-xs">{step}/3</span>
        </div>
        
        <h4 className="text-xl text-white font-bold mb-2">{current.title}</h4>
        <p className="text-slate-300 text-sm leading-relaxed mb-4">
          {current.desc}
        </p>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded border border-slate-600 bg-slate-800 flex items-center justify-center text-xs font-mono text-amber-400 font-bold animate-pulse">
            {current.key}
          </div>
          <span className="text-xs text-slate-500 italic">Required to proceed</span>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;