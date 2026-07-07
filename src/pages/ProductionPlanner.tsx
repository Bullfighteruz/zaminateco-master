import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Factory, Calendar, TrendingUp, RefreshCcw, 
  ArrowLeft, Cpu, Sliders, Play, Plus, Trash2, CheckCircle2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import Layout from '@/components/Layout';
import { getPlannerOptimization } from '@/lib/gemini';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface Batch {
  id: string;
  name: string;
  material: 'PET' | 'Rubber' | 'Paper';
  weight: number;
  scheduledDate: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
}

export default function ProductionPlanner() {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();

  const [activeTab, setActiveTab] = useState<'feedstock' | 'scheduler'>('feedstock');

  // Feedstock state
  const [stock, setStock] = useState({
    plastic: 1200,
    rubber: 850,
    paper: 400
  });

  // Predicted incoming streams (next 30 days)
  const predictedIncoming = {
    plastic: 450,
    rubber: 320,
    paper: 180
  };

  // Conversions: 1 Bench = 160kg PET, 1 Pavement Tile (sq m) = 15kg
  const maxBenches = Math.floor(stock.plastic / 160);
  const maxTiles = Math.floor(stock.rubber / 15);

  // Schedules state
  const [batches, setBatches] = useState<Batch[]>([
    { id: 'b1', name: 'Yunusobod PET Batch', material: 'PET', weight: 400, scheduledDate: '2026-07-08', status: 'Scheduled' },
    { id: 'b2', name: 'Chilanzor Tire Batch', material: 'Rubber', weight: 300, scheduledDate: '2026-07-09', status: 'Scheduled' },
    { id: 'b3', name: 'School PET Batch', material: 'PET', weight: 160, scheduledDate: '2026-07-10', status: 'Scheduled' }
  ]);

  // AI prompt optimizer states
  const [optimizerPrompt, setOptimizerPrompt] = useState('');
  const [optimizationResult, setOptimizationResult] = useState<string>('');
  const [isOptimizing, setIsOptimizing] = useState(false);

  const quickPrompts = i18n.language === 'uz' ? [
    "Plastik partiyasini optimallashtirish",
    "Pavelka plitalarini ko'paytirish",
    "Uch kunlik jadval tuzish"
  ] : i18n.language === 'ru' ? [
    "Оптимизировать партию пластика",
    "Увеличить выпуск плитки",
    "Составить график на 3 дня"
  ] : [
    "Optimize plastic batch",
    "Maximize tile output",
    "Schedule 3-day window"
  ];

  const handleOptimize = async (promptText: string) => {
    if (!promptText.trim()) return;
    setIsOptimizing(true);
    setOptimizationResult('');

    try {
      const resultText = await getPlannerOptimization(promptText, stock);
      setOptimizationResult(resultText);
      toast.success("AI optimization completed!");
    } catch (error) {
      toast.error("Failed to run ИИ scheduling optimization");
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <Layout hideBottomNav={true}>
      <div className="min-h-screen bg-slate-950 text-white flex flex-col relative overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Custom Header */}
        <div className="relative z-20 px-4 pt-4 pb-2">
          <div className="max-w-4xl mx-auto bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl px-4 py-3 flex items-center justify-between shadow-2xl">
            <button 
              onClick={() => window.history.back()}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-xs font-semibold">{t('scanner.back', { defaultValue: 'Back' })}</span>
            </button>
            
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-sm font-black text-white/95 uppercase tracking-widest">AI Planner</span>
            </div>

            <div className="w-6" /> {/* Spacer */}
          </div>
        </div>

        {/* Core content */}
        <div className="flex-1 max-w-4xl w-full mx-auto p-4 space-y-6 relative z-10 overflow-y-auto scrollbar-none">
          
          <div className="space-y-1.5">
            <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-emerald-400 to-teal-300">
              AI Production Planner
            </h2>
            <p className="text-xs text-slate-400">
              {i18n.language === 'uz' 
                ? "Resurslarni boshqarish va mahsulot ishlab chiqarishni bashorat qilish tizimi."
                : i18n.language === 'ru'
                ? "Управление сырьевыми ресурсами и планирование производственных потоков с ИИ."
                : "Manage feedstock warehouse limits and optimize production batch schedules using AI."}
            </p>
          </div>

          {/* Switch tabs */}
          <div className="flex bg-slate-900/80 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab('feedstock')}
              className={cn(
                "flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                activeTab === 'feedstock' ? "bg-white text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
              )}
            >
              <Sliders className="h-4.5 w-4.5" />
              {i18n.language === 'uz' ? "Ombor & Zaxira" : i18n.language === 'ru' ? "Склад и Продукты" : "Feedstock & Stock"}
            </button>
            <button
              onClick={() => setActiveTab('scheduler')}
              className={cn(
                "flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                activeTab === 'scheduler' ? "bg-white text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
              )}
            >
              <Calendar className="h-4.5 w-4.5" />
              {i18n.language === 'uz' ? "Ishlab chiqarish jadvali" : i18n.language === 'ru' ? "Расписание и Оптимизатор" : "Production Batches"}
            </button>
          </div>

          {/* TAB 1: FEEDSTOCK STOCK LEVELS */}
          {activeTab === 'feedstock' && (
            <div className="space-y-6">
              
              {/* Meters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: 'plastic', name: 'Plastic / PET', val: stock.plastic, max: 2000, color: 'from-blue-600 to-indigo-600', incoming: predictedIncoming.plastic },
                  { key: 'rubber', name: 'Rubber / Tires', val: stock.rubber, max: 1500, color: 'from-emerald-600 to-teal-600', incoming: predictedIncoming.rubber },
                  { key: 'paper', name: 'Paper / Cartons', val: stock.paper, max: 1000, color: 'from-amber-600 to-orange-600', incoming: predictedIncoming.paper },
                ].map((item) => (
                  <Card key={item.key} className="bg-slate-900/60 border-white/5 text-white">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-lg font-black">{item.val} <span className="text-xs font-medium text-slate-400">kg</span></span>
                        <span className="text-[10px] text-slate-500">Max {item.max} kg</span>
                      </div>
                      
                      {/* Meter bar */}
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
                        <div 
                          className={cn("h-full bg-gradient-to-r", item.color)} 
                          style={{ width: `${(item.val / item.max) * 100}%` }}
                        />
                      </div>

                      {/* Forecasting incoming stream */}
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded-lg w-fit border border-emerald-500/10">
                        <TrendingUp className="h-3 w-3" />
                        <span>+{item.incoming} kg forecast (30d)</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Conversion Outputs */}
              <Card className="bg-slate-900/60 border-white/5 text-white p-5 space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 pb-1.5 border-b border-white/5">
                  <Factory className="h-5 w-5" />
                  <h4 className="font-extrabold text-sm uppercase tracking-wider">Target Conversion Yields</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Benches card */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Community Benches</div>
                      <div className="text-2xl font-black text-blue-400">{maxBenches} <span className="text-xs font-medium text-slate-400">units</span></div>
                      <p className="text-[9px] text-slate-400 mt-1">Requires: 160 kg PET each</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Tiles card */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase">EPDM-free Tiles</div>
                      <div className="text-2xl font-black text-emerald-400">{maxTiles} <span className="text-xs font-medium text-slate-400">sq m</span></div>
                      <p className="text-[9px] text-slate-400 mt-1">Requires: 15 kg Rubber each</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </Card>

            </div>
          )}

          {/* TAB 2: SCHEDULER & AI OPTIMIZER */}
          {activeTab === 'scheduler' && (
            <div className="space-y-6">
              
              {/* Batch list */}
              <Card className="bg-slate-900/60 border-white/5 text-white">
                <CardHeader className="p-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-extrabold uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="h-4.5 w-4.5 text-blue-400" />
                    Production Batches
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-500 font-bold uppercase text-[9px] tracking-widest">
                        <th className="py-2.5">Batch Name</th>
                        <th className="py-2.5">Material</th>
                        <th className="py-2.5">Feedstock (kg)</th>
                        <th className="py-2.5">Scheduled Date</th>
                        <th className="py-2.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium text-slate-200">
                      {batches.map((batch) => (
                        <tr key={batch.id}>
                          <td className="py-3 font-bold">{batch.name}</td>
                          <td className="py-3">{batch.material}</td>
                          <td className="py-3 tabular-nums">{batch.weight} kg</td>
                          <td className="py-3 tabular-nums">{batch.scheduledDate}</td>
                          <td className="py-3 text-right">
                            <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold px-2 py-0.5 rounded text-[10px]">
                              {batch.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* AI Schedulers Box */}
              <Card className="bg-gradient-to-b from-slate-900 to-slate-950 border-white/5 text-white p-5 space-y-4">
                <div className="flex items-center gap-2 text-blue-400 pb-1.5 border-b border-white/5">
                  <Cpu className="h-5 w-5" />
                  <h4 className="font-extrabold text-sm uppercase tracking-wider">AI Logistics Optimizer</h4>
                </div>

                <div className="space-y-4">
                  {/* Quick Prompts */}
                  <div className="flex flex-wrap gap-1.5">
                    {quickPrompts.map((pText, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setOptimizerPrompt(pText);
                          handleOptimize(pText);
                        }}
                        className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white transition-all"
                      >
                        {pText}
                      </button>
                    ))}
                  </div>

                  {/* Input form */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleOptimize(optimizerPrompt);
                    }}
                    className="relative flex items-center gap-2 bg-slate-950 border border-white/5 rounded-xl p-1.5"
                  >
                    <Input
                      value={optimizerPrompt}
                      onChange={(e) => setOptimizerPrompt(e.target.value)}
                      placeholder={i18n.language === 'uz' ? "Logistika optimallashtirish bo'yicha so'rov..." : i18n.language === 'ru' ? "Запрос по оптимизации логистики..." : "Describe scheduling query..."}
                      className="flex-1 bg-transparent border-0 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder-slate-500 h-10 px-3 text-xs sm:text-sm"
                    />
                    <Button
                      type="submit"
                      disabled={!optimizerPrompt.trim() || isOptimizing}
                      className="bg-blue-600 hover:bg-blue-500 font-bold px-4 h-10 rounded-lg text-xs flex items-center gap-1.5"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      Optimize
                    </Button>
                  </form>

                  {/* Results area */}
                  <AnimatePresence>
                    {(isOptimizing || optimizationResult) && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="bg-slate-900 border border-white/5 rounded-xl p-4 space-y-2 text-left"
                      >
                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1">
                          <Cpu className="h-3.5 w-3.5 animate-pulse" />
                          AI Scheduler Proposal
                        </span>
                        
                        {isOptimizing ? (
                          <div className="flex items-center gap-2 py-4">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                            <span className="text-xs text-slate-500 font-medium">Re-calculating feedstock pipelines...</span>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-line bg-slate-950 p-3 rounded-lg border border-white/5">
                            {optimizationResult}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </Card>

            </div>
          )}

        </div>

      </div>
    </Layout>
  );
}
