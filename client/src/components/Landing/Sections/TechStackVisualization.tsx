import { motion, useTransform } from 'framer-motion';

interface TechStackVisualizationProps {
  y1: any;
  y2: any;
  y3: any;
}

const TechStackVisualization: React.FC<TechStackVisualizationProps> = ({ y1, y2, y3 }) => {
  return (
    <div className="relative h-96 w-full">
      {/* UI Layer */}
      <motion.div 
        style={{ y: y1 }} 
        className="absolute left-1/2 top-0 -translate-x-1/2 w-64 z-30"
        aria-label="UI Layer"
      >
        <div className="p-4 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-sm border border-indigo-600/20 rounded-xl text-center">
          <div className="mb-2 text-indigo-400 font-medium">UI Layer</div>
          <p className="text-sm text-gray-300">React, TailwindCSS, TypeScript</p>
        </div>
      </motion.div>
      
      {/* API Layer */}
      <motion.div 
        style={{ y: y2 }} 
        className="absolute left-1/4 top-1/3 -translate-x-1/2 w-56 z-20"
        aria-label="API Layer"
      >
        <div className="p-4 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-sm border border-blue-600/20 rounded-xl text-center">
          <div className="mb-2 text-blue-400 font-medium">API Layer</div>
          <p className="text-sm text-gray-300">Express, Node.js, REST</p>
        </div>
      </motion.div>
      
      {/* AI Integration */}
      <motion.div 
        style={{ y: y2 }} 
        className="absolute left-3/4 top-1/3 -translate-x-1/2 w-56 z-20"
        aria-label="AI Integration"
      >
        <div className="p-4 bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-600/20 rounded-xl text-center">
          <div className="mb-2 text-purple-400 font-medium">AI Integration</div>
          <p className="text-sm text-gray-300">OpenAI, Claude, Custom Endpoints</p>
        </div>
      </motion.div>
      
      {/* Data Layer */}
      <motion.div 
        style={{ y: y3 }} 
        className="absolute left-1/2 top-2/3 -translate-x-1/2 w-64 z-10"
        aria-label="Data Layer"
      >
        <div className="p-4 bg-gradient-to-br from-emerald-600/20 to-green-600/20 backdrop-blur-sm border border-emerald-600/20 rounded-xl text-center">
          <div className="mb-2 text-emerald-400 font-medium">Data Layer</div>
          <p className="text-sm text-gray-300">MongoDB, Redis, MeiliSearch</p>
        </div>
      </motion.div>
      
      {/* Connecting Lines */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <line x1="50%" y1="12%" x2="25%" y2="33%" stroke="url(#line-gradient)" strokeWidth="2" strokeDasharray="5,5" />
        <line x1="50%" y1="12%" x2="75%" y2="33%" stroke="url(#line-gradient)" strokeWidth="2" strokeDasharray="5,5" />
        <line x1="25%" y1="33%" x2="50%" y2="67%" stroke="url(#line-gradient)" strokeWidth="2" strokeDasharray="5,5" />
        <line x1="75%" y1="33%" x2="50%" y2="67%" stroke="url(#line-gradient)" strokeWidth="2" strokeDasharray="5,5" />
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default TechStackVisualization;
