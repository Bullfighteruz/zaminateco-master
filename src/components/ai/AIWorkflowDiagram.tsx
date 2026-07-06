import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Camera, 
  Cpu, 
  MapPin, 
  Vote, 
  Factory, 
  Trees, 
  FileCheck2
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AIWorkflowDiagram() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const steps = [
    { icon: Camera, key: 'userPhoto', color: 'from-emerald-500 to-green-500' },
    { icon: Cpu, key: 'aiRecog', color: 'from-amber-500 to-yellow-500' },
    { icon: MapPin, key: 'collectionPoint', color: 'from-teal-500 to-emerald-500' },
    { icon: Vote, key: 'ecoVote', color: 'from-green-500 to-teal-500' },
    { icon: Factory, key: 'production', color: 'from-amber-600 to-yellow-500' },
    { icon: Trees, key: 'publicObject', color: 'from-emerald-600 to-teal-600' },
    { icon: FileCheck2, key: 'impactReport', color: 'from-teal-600 to-green-600' },
  ];

  return (
    <div className="w-full py-6 select-none">
      {isMobile ? (
        /* Mobile Layout: Premium Vertical Stepper */
        <div className="relative pl-8 pr-2 space-y-6 text-left">
          {/* Vertical Timeline Line */}
          <div className="absolute top-2 bottom-2 left-[19px] w-[3px] bg-slate-100 rounded-full z-0">
            <motion.div 
              className="w-full bg-gradient-to-b from-emerald-500 via-yellow-400 to-teal-500 origin-top rounded-full"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              style={{ height: '100%' }}
            />
          </div>

          {steps.map((step, idx) => {
            const Icon = step.icon;

            return (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="flex items-start gap-4 relative z-10"
              >
                {/* Stepper Node Icon */}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} p-0.5 shadow-md flex items-center justify-center flex-shrink-0`}>
                  <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center text-gray-800">
                    <Icon className="h-4.5 w-4.5 stroke-[2]" />
                  </div>
                </div>

                {/* Node details */}
                <div className="space-y-0.5 pt-0.5">
                  <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider block">
                    Step 0{idx + 1}
                  </span>
                  <h4 className="text-gray-900 font-bold text-xs leading-snug">
                    {t(`ai.workflow.${step.key}`)}
                  </h4>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Desktop Layout: Fluid Horizontal Stepper (Fits width exactly) */
        <div className="w-full flex items-start justify-between relative px-2 py-4">
          
          {/* Background Connector Line */}
          <div className="absolute top-10 left-[7.14%] right-[7.14%] h-[3px] bg-slate-100 rounded-full z-0">
            <motion.div 
              className="h-full bg-gradient-to-r from-emerald-500 via-yellow-400 to-teal-500 origin-left rounded-full"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </div>

          {steps.map((step, idx) => {
            const Icon = step.icon;

            return (
              <div 
                key={idx} 
                className="flex flex-col items-center text-center space-y-2 relative z-10 flex-1 min-w-0"
              >
                {/* Stepper Node Icon */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.7 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.12, type: "spring", stiffness: 100 }}
                  whileHover={{ y: -3 }}
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} p-0.5 shadow-md flex items-center justify-center`}
                >
                  <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center text-gray-800 transition-all duration-300 hover:text-emerald-600">
                    <Icon className="h-5 w-5 stroke-[2]" />
                  </div>
                </motion.div>

                {/* Node details */}
                <div className="px-1 max-w-[90px] md:max-w-[100px] lg:max-w-[110px] mx-auto">
                  <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider mb-0.5">
                    0{idx + 1}
                  </span>
                  <p className="text-gray-800 font-bold text-[11px] lg:text-xs leading-tight break-words">
                    {t(`ai.workflow.${step.key}`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
