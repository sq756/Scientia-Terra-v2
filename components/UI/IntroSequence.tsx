import React, { useState, useEffect } from 'react';

interface IntroSequenceProps {
  onComplete: () => void;
}

const IntroSequence: React.FC<IntroSequenceProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [text, setText] = useState('');

  const lines = [
    "INITIALIZING SCIENTIA TERRA PROTOCOL...",
    "YEAR 2140: THE FOG OF IGNORANCE HAS CONSUMED REALITY.",
    "KNOWLEDGE HAS FRAGMENTED INTO RAW DATA.",
    "YOU ARE AN ARCHITECT OF TRUTH.",
    " ",
    "// THE GOLDEN RULE //",
    "DATA VALUE DECAYS WITH OBSERVATION.",
    "1ST DISCOVERY: 100% YIELD",
    "2ND DISCOVERY: 50% YIELD",
    "3RD DISCOVERY: 25% YIELD",
    " ",
    "FIND THE UNKNOWN. REFINE THE TRUTH.",
  ];

  useEffect(() => {
    let currentLineIndex = 0;
    let currentCharIndex = 0;
    let currentText = '';
    let timeoutId: any;

    const typeWriter = () => {
      if (currentLineIndex >= lines.length) {
        setStep(1); // Ready to start
        return;
      }

      const line = lines[currentLineIndex];
      
      if (currentCharIndex < line.length) {
        currentText += line[currentCharIndex];
        setText(currentText);
        currentCharIndex++;
        timeoutId = setTimeout(typeWriter, 30); // Typing speed
      } else {
        currentText += '\n';
        setText(currentText);
        currentCharIndex = 0;
        currentLineIndex++;
        timeoutId = setTimeout(typeWriter, 400); // Pause between lines
      }
    };

    timeoutId = setTimeout(typeWriter, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center p-10 select-none">
      
      {/* Background Matrix Effect (Simple CSS Pulse) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black opacity-80" />
      
      <div className="z-10 w-full max-w-3xl">
        <div className="font-mono text-cyan-500 text-lg md:text-xl whitespace-pre-wrap leading-relaxed min-h-[400px] border-l-2 border-cyan-800 pl-4 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
          {text}
          <span className="animate-pulse inline-block w-3 h-5 bg-cyan-400 ml-1 align-middle"></span>
        </div>

        {step === 1 && (
          <div className="mt-12 flex justify-center animate-in fade-in zoom-in duration-1000">
            <button 
              onClick={onComplete}
              className="group relative px-12 py-4 bg-transparent overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-cyan-950/50 border border-cyan-500 transform skew-x-[-12deg] group-hover:bg-cyan-900 transition-colors duration-300"></div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              
              <span className="relative text-2xl font-bold tracking-[0.2em] text-cyan-100 group-hover:text-white transition-colors">
                JACK IN
              </span>
            </button>
          </div>
        )}
      </div>
      
      {/* Footer decorative text */}
      <div className="absolute bottom-4 right-6 text-xs font-mono text-slate-800">
        SYS_VER 2.0.4 // CONNECTION_SECURE
      </div>
    </div>
  );
};

export default IntroSequence;