import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Recycle, TreePine } from 'lucide-react';

interface LoadingAnimationProps {
  type?: 'spinner' | 'eco' | 'pulse';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ 
  type = 'eco', 
  size = 'md',
  text = "Loading..." 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const containerClasses = {
    sm: 'gap-2 text-sm',
    md: 'gap-3 text-base',
    lg: 'gap-4 text-lg'
  };

  if (type === 'spinner') {
    return (
      <div className={`flex flex-col items-center justify-center ${containerClasses[size]}`}>
        <motion.div
          className={`border-4 border-green-200 border-t-green-600 rounded-full ${sizeClasses[size]}`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        {text && <p className="text-green-700 font-medium">{text}</p>}
      </div>
    );
  }

  if (type === 'pulse') {
    return (
      <div className={`flex flex-col items-center justify-center ${containerClasses[size]}`}>
        <motion.div
          className={`bg-green-500 rounded-full ${sizeClasses[size]}`}
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        {text && <p className="text-green-700 font-medium">{text}</p>}
      </div>
    );
  }

  // Eco animation with rotating icons
  return (
    <div className={`flex flex-col items-center justify-center ${containerClasses[size]}`}>
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="flex items-center justify-center"
        >
          <Recycle className={`text-green-600 ${sizeClasses[size]}`} />
        </motion.div>
        
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          <Leaf className={`text-green-500 ${sizeClasses[size]} opacity-60`} />
        </motion.div>
        
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        >
          <TreePine className={`text-green-400 ${sizeClasses[size]} opacity-40`} />
        </motion.div>
      </div>
      
      {text && (
        <motion.p 
          className="text-green-700 font-medium mt-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

// Block loading animation for page transitions
export const BlockLoadingAnimation: React.FC = () => {
  return (
    <motion.div
      className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <LoadingAnimation type="eco" size="lg" text="Loading ZAMINAT.eco..." />
    </motion.div>
  );
};