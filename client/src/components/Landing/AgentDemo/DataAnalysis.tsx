import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface DataAnalysisProps {
  isActive: boolean;
}

export const DataAnalysis = ({ isActive }: DataAnalysisProps) => {
  const [step, setStep] = useState(0);
  
  useEffect(() => {
    if (!isActive) return;
    
    const timer = setInterval(() => {
      setStep(prev => (prev + 1) % 4);
    }, 2500);
    
    return () => clearInterval(timer);
  }, [isActive]);
  
  const renderChart = () => {
    const charts = [
      // Balkendiagramm
      <div key="bar" className="h-32 flex items-end space-x-1">
        {[30, 50, 75, 90, 60, 40].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <motion.div 
              className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm"
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            />
            <div className="text-[8px] text-gray-400 mt-1">Q{i+1}</div>
          </div>
        ))}
      </div>,
      
      // Liniendiagramm
      <div key="line" className="h-32 relative">
        <svg viewBox="0 0 200 80" className="w-full h-full">
          <path 
            d="M10,60 L40,40 L70,50 L100,20 L130,40 L160,10 L190,30" 
            fill="none" 
            stroke="#3b82f6" 
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="0"
          />
          <circle cx="10" cy="60" r="3" fill="#3b82f6" />
          <circle cx="40" cy="40" r="3" fill="#3b82f6" />
          <circle cx="70" cy="50" r="3" fill="#3b82f6" />
          <circle cx="100" cy="20" r="3" fill="#3b82f6" />
          <circle cx="130" cy="40" r="3" fill="#3b82f6" />
          <circle cx="160" cy="10" r="3" fill="#3b82f6" />
          <circle cx="190" cy="30" r="3" fill="#3b82f6" />
        </svg>
      </div>,
      
      // Tortendiagramm
      <div key="pie" className="h-32 relative">
        <svg viewBox="0 0 100 100" className="w-32 h-32 mx-auto">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#1f2937" strokeWidth="20" />
          <motion.circle 
            cx="50" 
            cy="50" 
            r="40" 
            fill="none" 
            stroke="#3b82f6" 
            strokeWidth="20"
            strokeDasharray="251.2"
            strokeDashoffset="125.6"
            transform="rotate(-90 50 50)"
            initial={{ strokeDashoffset: 251.2 }}
            animate={{ strokeDashoffset: 125.6 }}
            transition={{ duration: 1 }}
          />
          <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="text-xs fill-gray-300">
            50%
          </text>
        </svg>
      </div>,
      
      // Heatmap
      <div key="heatmap" className="grid grid-cols-5 gap-1 p-2">
        {Array(25).fill(0).map((_, i) => {
          const intensity = Math.floor(Math.random() * 5);
          const colors = [
            'bg-gray-700',
            'bg-blue-300',
            'bg-blue-400',
            'bg-blue-500',
            'bg-blue-600',
          ];
          return (
            <motion.div 
              key={i}
              className={`w-full aspect-square ${colors[intensity]} rounded-sm`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
            />
          );
        })}
      </div>
    ];
    
    return charts[step % charts.length];
  };
  
  return (
    <div className="bg-gray-900 rounded-lg p-4 h-full">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium text-gray-200">Datenanalyse</h4>
        <div className="flex space-x-1">
          {['Balken', 'Linie', 'Kreis', 'Heatmap'].map((label, i) => (
            <button 
              key={i}
              className={`px-2 py-1 text-xs rounded ${
                step % 4 === i ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setStep(i)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-32">
        {renderChart()}
      </div>
      <div className="mt-2 text-xs text-gray-400">
        {[
          'Quartalsbericht 2024',
          'Umsatzentwicklung',
          'Marktanteile',
          'Klickraten-Analyse'
        ][step % 4]}
      </div>
    </div>
  );
};
