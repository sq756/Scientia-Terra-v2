
import React, { useState } from 'react';
import { PaperEntity, NodeState, LogicGateType } from '../../types';
import { materializeKnowledge } from '../../services/geminiService';

interface TerminalOverlayProps {
  node: PaperEntity;
  onClose: () => void;
  onRefineComplete: (id: string, analysis: any) => void;
  onUpdateLogic: (id: string, logicType: LogicGateType) => void;
}

const TerminalOverlay: React.FC<TerminalOverlayProps> = ({ node, onClose, onRefineComplete, onUpdateLogic }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [terminalLog, setTerminalLog] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'CONSTRUCT' | 'LOGIC'>('CONSTRUCT');

  const addToLog = (msg: string) => {
    setTerminalLog(prev => [...prev, `> ${msg}`]);
  };

  const handleConstruct = async () => {
    setIsProcessing(true);
    addToLog("INITIATING LOGOS ENGINE...");
    addToLog("CHECKING STRUCTURAL INTEGRITY OF ARGUMENTS...");
    
    try {
      const startTime = Date.now();
      const result = await materializeKnowledge(node.abstract, node.title);
      const duration = Date.now() - startTime;
      
      addToLog(`PHYSICS SIMULATION COMPLETE IN ${duration}ms`);
      addToLog(`STABILITY RATING: ${result.stability}%`);
      addToLog(`FORM FACTOR: ${result.structureType.toUpperCase()}`);

      setTimeout(() => {
        onRefineComplete(node.id, result);
      }, 1200);
    } catch (e) {
      addToLog("CRITICAL FAILURE: LOGIC COLLAPSE");
      setIsProcessing(false);
    }
  };

  const handleLogicSet = (type: LogicGateType) => {
    onUpdateLogic(node.id, type);
    addToLog(`REPROGRAMMING MATTER STATE TO [ ${type} ] GATE`);
    addToLog(`TURING COMPLETENESS: UPDATED`);
  };

  const getStabilityColor = (val: number) => {
    if (val < 30) return "text-red-500";
    if (val < 70) return "text-amber-500";
    return "text-green-500";
  };

  return (
    <div className="absolute top-0 right-0 h-full w-full md:w-[500px] bg-slate-950/95 border-l-2 border-cyan-900 backdrop-blur-xl p-8 flex flex-col z-50 text-cyan-100 shadow-[0_0_80px_rgba(8,145,178,0.15)]">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-8 border-b border-cyan-800/50 pb-6">
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            MATTER FABRICATOR
          </h2>
          <span className="text-xs text-cyan-700 font-mono mt-1">LOGOS ENGINE V4.2 // {activeTab} MODE</span>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center border border-cyan-800 hover:bg-cyan-900/50 text-cyan-500 transition-colors rounded-sm"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      {node.state === NodeState.CONSTRUCTED && (
        <div className="flex mb-4 gap-2">
          <button 
            onClick={() => setActiveTab('CONSTRUCT')}
            className={`flex-1 py-2 text-xs font-mono font-bold border ${activeTab === 'CONSTRUCT' ? 'bg-cyan-900 border-cyan-500 text-white' : 'border-slate-800 text-slate-500 hover:border-slate-600'}`}
          >
            STRUCTURAL ANALYSIS
          </button>
          <button 
            onClick={() => setActiveTab('LOGIC')}
            className={`flex-1 py-2 text-xs font-mono font-bold border ${activeTab === 'LOGIC' ? 'bg-purple-900 border-purple-500 text-white' : 'border-slate-800 text-slate-500 hover:border-slate-600'}`}
          >
            LOGIC PROGRAMMING
          </button>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-8">
        
        {/* Input Slot (Always Visible) */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <label className="text-xs font-mono text-cyan-600 uppercase tracking-widest">Input Material</label>
            <span className="text-xs font-mono text-slate-500">{node.id}</span>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-sm relative overflow-hidden group">
             <h3 className="text-cyan-100 font-bold mb-2 pr-8">{node.title}</h3>
             <p className="text-slate-400 text-sm font-mono leading-relaxed h-16 overflow-y-auto custom-scrollbar">
               {node.abstract}
             </p>
          </div>
        </div>

        {/* LOGIC PROGRAMMING TAB */}
        {activeTab === 'LOGIC' && node.state === NodeState.CONSTRUCTED && (
           <div className="space-y-4 animate-in slide-in-from-right-10">
              <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-sm">
                 <div className="text-xs text-purple-400 font-mono mb-2">CURRENT LOGIC STATE</div>
                 <div className="text-2xl font-bold text-white mb-1">
                   {node.logic ? node.logic.type : "PASSIVE MATTER"}
                 </div>
                 <div className="text-xs text-slate-400">
                   {node.logic ? (node.logic.isActive ? "OUTPUT: HIGH (1)" : "OUTPUT: LOW (0)") : "No logic gate assigned."}
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {Object.values(LogicGateType).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleLogicSet(type)}
                    className={`
                      p-3 border text-xs font-mono font-bold hover:bg-white/5 transition-colors
                      ${node.logic?.type === type ? 'border-purple-400 text-purple-300 bg-purple-900/30' : 'border-slate-700 text-slate-400'}
                    `}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 font-mono italic">
                * NAND Gates are functionally complete. You can build a computer with them.
              </p>
           </div>
        )}

        {/* CONSTRUCTION TAB */}
        {activeTab === 'CONSTRUCT' && (
          <>
            {/* Construction Result */}
            {node.state === NodeState.CONSTRUCTED && node.construction && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
                
                {/* Visualizer */}
                <div className="relative h-32 bg-gradient-to-b from-slate-900 to-black border-y border-cyan-900/30 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                  <div className="z-10 text-center p-4">
                    <div className="text-xs font-mono text-cyan-600 mb-1">VISUAL MANIFESTATION</div>
                    <div className="text-cyan-100 italic font-light">"{node.construction.visualManifestation}"</div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-sm">
                    <div className="text-xs text-slate-500 font-mono mb-1">TYPE</div>
                    <div className="text-cyan-300 font-bold">{node.construction.structureType}</div>
                  </div>
                  <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-sm">
                    <div className="text-xs text-slate-500 font-mono mb-1">STABILITY</div>
                    <div className={`text-2xl font-bold font-mono ${getStabilityColor(node.construction.stability)}`}>
                      {node.construction.stability}%
                    </div>
                  </div>
                </div>

                {/* AI Analysis */}
                <div className="p-4 border-l-2 border-cyan-500 bg-cyan-950/10">
                  <label className="text-xs font-mono text-cyan-600 block mb-2">ENGINEERING REPORT</label>
                  <p className="text-cyan-100 text-sm leading-relaxed">
                    {node.construction.analysis}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Console Log */}
        {(isProcessing || terminalLog.length > 0) && (
          <div className="font-mono text-xs space-y-1 p-4 bg-black/80 rounded border border-slate-800 h-40 overflow-y-auto">
            {terminalLog.map((log, i) => (
              <div key={i} className={`${log.includes("FAILURE") ? 'text-red-500' : 'text-cyan-500/80'}`}>
                {log}
              </div>
            ))}
            {isProcessing && <div className="animate-pulse text-cyan-500">_</div>}
          </div>
        )}

      </div>

      {/* Footer Actions */}
      <div className="mt-6 pt-4 border-t border-slate-800">
        {node.state === NodeState.RAW ? (
          <button
            onClick={handleConstruct}
            disabled={isProcessing}
            className={`
              w-full py-5 uppercase font-bold tracking-[0.2em] text-sm transition-all duration-300 relative group overflow-hidden
              ${isProcessing 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-cyan-700 hover:bg-cyan-600 text-white shadow-[0_0_30px_rgba(8,145,178,0.4)]'
              }
            `}
          >
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.1)_10px,rgba(0,0,0,0.1)_20px)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            {isProcessing ? 'Simulating Physics...' : 'Materialize Structure'}
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-green-500 py-4 bg-green-950/20 border border-green-900/30 rounded">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            STRUCTURE STABILIZED IN REALITY
          </div>
        )}
      </div>
    </div>
  );
};

export default TerminalOverlay;
