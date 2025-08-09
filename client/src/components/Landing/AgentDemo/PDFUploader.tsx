import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface PDFUploaderProps {
  isActive: boolean;
}

export const PDFUploader = ({ isActive }: PDFUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
  // Setze Fokus auf das Dropzone-Element, wenn es aktiv wird
  useEffect(() => {
    if (isActive && dropZoneRef.current) {
      dropZoneRef.current.focus();
    }
  }, [isActive]);

  // Simuliere den Upload- und Analysevorgang
  const simulateUpload = useCallback(() => {
    setError(null);
    setUploadProgress(0);
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    
    // Simuliere eine zufällige Fehlerwahrscheinlichkeit von 10%
    const shouldFail = Math.random() < 0.1;
    
    // Upload-Fortschritt simulieren
    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        const increment = Math.random() * 15 + 5; // 5-20% pro Schritt
        let newProgress = prev + increment;
        
        if (newProgress >= 100) {
          newProgress = 100;
          clearInterval(uploadInterval);
          
          if (shouldFail) {
            // Fehlerfall simulieren
            setTimeout(() => {
              setError('Fehler beim Hochladen. Bitte versuchen Sie es erneut.');
              setIsAnalyzing(false);
            }, 500);
          } else {
            // Erfolgsfall
            setTimeout(() => {
              setAnalysisComplete(true);
              setIsAnalyzing(false);
            }, 800);
          }
        }
        
        return Math.min(newProgress, 100);
      });
    }, 300);

    return () => clearInterval(uploadInterval);
  }, []);
  
  // Starte den Upload, wenn die Komponente aktiv wird
  useEffect(() => {
    if (isActive) {
      simulateUpload();
    } else {
      setUploadProgress(0);
      setIsAnalyzing(false);
      setAnalysisComplete(false);
      setError(null);
    }
  }, [isActive, simulateUpload]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging && !isAnalyzing && !analysisComplete) {
      setIsDragging(true);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAnalyzing && !analysisComplete) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Prüfe, ob wir das Drop-Zone-Element tatsächlich verlassen
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (isAnalyzing || analysisComplete) return;
    
    // Prüfe, ob es sich um eine PDF-Datei handelt
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        // Hier würde der tatsächliche Upload stattfinden
        // Für die Demo starten wir einfach die Simulation
        simulateUpload();
      } else {
        setError('Bitte laden Sie nur PDF-Dateien hoch.');
      }
    }
  };

  const handleClick = () => {
    if (!isAnalyzing && !analysisComplete) {
      fileInputRef.current?.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        simulateUpload();
      } else {
        setError('Bitte wählen Sie eine gültige PDF-Datei aus.');
      }
    }
  };
  
  const resetUploader = () => {
    setUploadProgress(0);
    setIsAnalyzing(false);
    setAnalysisComplete(false);
    setError(null);
  };

  // Animationen reduzieren, wenn der Benutzer dies bevorzugt
  const animationProps = shouldReduceMotion ? {} : {
    whileHover: { scale: 1.01 },
    whileTap: { scale: 0.99 },
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      ref={dropZoneRef}
      role="button"
      tabIndex={0}
      aria-label="PDF-Datei zum Hochladen hier ablegen oder klicken zum Auswählen"
      aria-busy={isAnalyzing}
      aria-live="polite"
      className={`relative p-6 border-2 border-dashed rounded-lg text-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
        isDragging 
          ? 'border-blue-500 bg-blue-500/10' 
          : error
            ? 'border-red-500 bg-red-500/10'
            : 'border-gray-600 bg-gray-800/50 hover:border-blue-400 hover:bg-gray-800/70'
      }`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        } else if (e.key === 'Escape' && (isAnalyzing || analysisComplete || error)) {
          resetUploader();
        }
      }}
      {...animationProps}
      style={{
        willChange: 'transform, opacity',
        transform: 'translateZ(0)', // Hardware-Beschleunigung aktivieren
      }}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        className="sr-only" 
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        aria-label="PDF-Datei auswählen"
        disabled={isAnalyzing || analysisComplete}
      />
      
      <div className="flex flex-col items-center justify-center space-y-4">
        <motion.div 
          className="p-4 rounded-full"
          animate={{
            backgroundColor: isDragging 
              ? 'rgba(59, 130, 246, 0.2)' 
              : 'rgba(59, 130, 246, 0.1)',
            scale: isDragging ? 1.1 : 1
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          <svg
            className="w-12 h-12 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </motion.div>
        
        <div>
          <h3 className="text-lg font-medium text-white mb-1">
            {isDragging ? 'Datei hier ablegen' : 'PDF-Datei hochladen'}
          </h3>
          
          <AnimatePresence mode="wait">
            {!isAnalyzing && !analysisComplete && (
              <motion.p 
                className="text-gray-400 text-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                Ziehe eine PDF-Datei hierher oder klicke zum Auswählen
              </motion.p>
            )}
            
            {isAnalyzing && (
              <motion.div
                className="mt-4 w-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-blue-500"
                    initial={{ width: '0%' }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  {uploadProgress < 100 
                    ? `Hochladen... ${Math.round(uploadProgress)}%` 
                    : 'Analyse wird durchgeführt...'}
                </p>
              </motion.div>
            )}
            
            {analysisComplete && (
              <motion.div
                className="mt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex items-center justify-center text-green-400">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="font-medium">Analyse abgeschlossen</span>
                </div>
                <p className="text-sm text-gray-400 mt-1" id="analysis-success">
                  Die PDF wurde erfolgreich analysiert.
                </p>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetUploader();
                  }}
                  className="mt-3 px-4 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-md transition-colors"
                  whileHover={{ scale: shouldReduceMotion ? 1 : 1.05 }}
                  whileTap={{ scale: shouldReduceMotion ? 1 : 0.98 }}
                  aria-label="Neue Datei hochladen"
                >
                  Neue Datei hochladen
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Fehleranzeige */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-left"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                role="alert"
                aria-live="assertive"
              >
                <div className="flex items-center text-red-400">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="font-medium">Fehler</span>
                </div>
                <p className="text-sm text-red-300 mt-1">{error}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetUploader();
                  }}
                  className="mt-2 text-xs text-red-300 hover:text-white focus:outline-none focus:ring-1 focus:ring-red-400 rounded px-2 py-1 transition-colors"
                  aria-label="Erneut versuchen"
                >
                  Erneut versuchen
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
         