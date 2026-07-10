import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, Cpu, Play, Plus, Trash2, Sparkles, Box, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

function parseInlineMarkdown(text: string) {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  
  html = html.replace(/&lt;br\s*\/?&gt;/g, '<br/>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-extrabold text-white">$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em class="text-slate-455">$1</em>');
  
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

const parseMarkdownToReact = (text: string) => {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  
  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];

  const flushTable = (key: string | number) => {
    if (tableRows.length > 0 || tableHeaders.length > 0) {
      elements.push(
        <div key={`table-${key}`} className="overflow-x-auto my-3 border border-slate-800 rounded-xl bg-slate-950/60 max-w-full">
          <table className="w-full text-left text-xs border-collapse font-sans min-w-[500px]">
            {tableHeaders.length > 0 && (
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                  {tableHeaders.map((h, i) => (
                    <th key={i} className="px-3.5 py-2.5">{parseInlineMarkdown(h)}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-slate-850 text-slate-350">
              {tableRows.map((row, ri) => (
                <tr key={ri} className="hover:bg-slate-900/20 transition-colors">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3.5 py-2.5 leading-normal">{parseInlineMarkdown(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableHeaders = [];
      tableRows = [];
    }
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === '---') {
      flushTable(i);
      elements.push(<hr key={i} className="border-slate-850 my-4" />);
      continue;
    }

    if (line.startsWith('|')) {
      inTable = true;
      const cells = line.split('|').map(c => c.trim());
      if (cells[0] === '') cells.shift();
      if (cells[cells.length - 1] === '') cells.pop();

      const isSeparator = cells.every(c => c.includes('---') || c.includes(':::') || c === '');
      if (isSeparator) {
        continue;
      }

      if (tableHeaders.length === 0 && tableRows.length === 0) {
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else {
      if (inTable) {
        flushTable(i);
      }
    }

    if (line.startsWith('###')) {
      const headingText = line.replace(/^###\s*/, '').replace(/\*\*([^*]+)\*\*/g, '$1');
      elements.push(
        <h4 key={i} className="text-xs font-bold text-slate-200 mt-4 mb-2 flex items-center gap-1.5 border-l-2 border-emerald-500 pl-2 leading-none uppercase tracking-wider">
          {headingText}
        </h4>
      );
      continue;
    }

    if (line.startsWith('*') || line.startsWith('-')) {
      const listContent = line.replace(/^[*+-]\s*/, '');
      elements.push(
        <div key={i} className="flex items-start gap-2 pl-3 text-xs text-slate-350 mb-1.5 leading-relaxed font-sans">
          <span className="text-emerald-500 select-none mt-0.5">•</span>
          <div className="flex-1">{parseInlineMarkdown(listContent)}</div>
        </div>
      );
      continue;
    }

    const orderedMatch = line.match(/^(\d+)\.\s*(.*)/);
    if (orderedMatch) {
      const num = orderedMatch[1];
      const listContent = orderedMatch[2];
      elements.push(
        <div key={i} className="flex items-start gap-2 pl-3 text-xs text-slate-350 mb-2 leading-relaxed font-sans">
          <span className="text-blue-400 font-bold select-none font-mono">{num}.</span>
          <div className="flex-1">{parseInlineMarkdown(listContent)}</div>
        </div>
      );
      continue;
    }

    if (line !== '') {
      elements.push(
        <p key={i} className="text-xs text-slate-350 leading-relaxed mb-2.5 font-sans">
          {parseInlineMarkdown(line)}
        </p>
      );
    }
  }

  flushTable('end');

  return <div className="space-y-0.5">{elements}</div>;
};

export default function ProductionPlanner() {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();

  // Stock Level state (adjustable via range input)
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

  // Yield Conversions
  const maxBenches = Math.floor(stock.plastic / 160);
  const maxTiles = Math.floor(stock.rubber / 15);
  const maxPackaging = Math.floor(stock.paper / 5);

  // Active batches schedule queue
  const [batches, setBatches] = useState<Batch[]>([
    { id: 'b1', name: 'Yunusobod PET Batch', material: 'PET', weight: 400, scheduledDate: '2026-07-08', status: 'In Progress' },
    { id: 'b2', name: 'Chilanzor Tire Batch', material: 'Rubber', weight: 300, scheduledDate: '2026-07-09', status: 'Scheduled' },
    { id: 'b3', name: 'School PET Batch', material: 'PET', weight: 160, scheduledDate: '2026-07-10', status: 'Scheduled' }
  ]);

  // Batch Form State
  const [newBatchName, setNewBatchName] = useState('');
  const [newBatchMaterial, setNewBatchMaterial] = useState<'PET' | 'Rubber' | 'Paper'>('PET');
  const [newBatchWeight, setNewBatchWeight] = useState(200);

  // AI Planner States
  const [optimizerPrompt, setOptimizerPrompt] = useState('');
  const [optimizationResult, setOptimizationResult] = useState<string>('');
  const [isOptimizing, setIsOptimizing] = useState(false);

  const quickPrompts = i18n.language === 'uz' ? [
    "Plastik partiyasini optimallashtirish",
    "Mahsulot unumdorligini oshirish",
    "3 kunlik jadval tuzish"
  ] : i18n.language === 'ru' ? [
    "Оптимизировать партию пластика",
    "Максимизировать выход продукции",
    "Составить график на 3 дня"
  ] : [
    "Optimize plastic batch",
    "Maximize product output",
    "Schedule 3-day window"
  ];

  const handleOptimize = async (promptText: string) => {
    if (!promptText.trim()) return;
    setIsOptimizing(true);
    setOptimizationResult('');

    try {
      const resultText = await getPlannerOptimization(promptText, stock);
      setOptimizationResult(resultText);
      toast.success("AI Optimization Completed!", {
        icon: <Sparkles className="h-4 w-4 text-slate-800" />
      });
    } catch (error) {
      toast.error("Failed to run AI scheduling optimization");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleAddBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName.trim()) {
      toast.error("Please enter a batch description");
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const newBatch: Batch = {
      id: Math.random().toString(36).substring(2, 9),
      name: newBatchName,
      material: newBatchMaterial,
      weight: Number(newBatchWeight),
      scheduledDate: today,
      status: 'Scheduled'
    };

    setBatches([newBatch, ...batches]);
    setNewBatchName('');
    toast.success("Batch scheduled successfully!");
  };

  const toggleBatchStatus = (id: string) => {
    setBatches(batches.map(b => {
      if (b.id === id) {
        const nextStatus: Record<string, 'Scheduled' | 'In Progress' | 'Completed'> = {
          'Scheduled': 'In Progress',
          'In Progress': 'Completed',
          'Completed': 'Scheduled'
        };
        return { ...b, status: nextStatus[b.status] };
      }
      return b;
    }));
    toast.info("Batch status updated!");
  };

  const handleDeleteBatch = (id: string) => {
    setBatches(batches.filter(b => b.id !== id));
    toast.info("Batch removed from queue");
  };

  return (
    <Layout hideBottomNav={true}>
      <div className="relative w-full min-h-screen text-slate-900 font-sans pb-24 overflow-x-hidden">
        
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-50/20 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-50/35 rounded-full blur-[120px] pointer-events-none z-0" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8 relative z-10">
          
          {/* World-Class Minimalist Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.history.back()}
                  className="flex items-center justify-center p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all duration-200 border border-slate-200/50"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Factory Portal</span>
              </div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                AI Production Planner
              </h1>
            </div>

            {/* Premium Flat Status Indicators */}
            <div className="flex items-center gap-5 text-left text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Factory Synced</span>
              </div>
              <div className="h-3 w-px bg-slate-200" />
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span>AI Connected</span>
              </div>
            </div>
          </div>

          {/* Clean Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Feedstock Simulation & Yield Outputs (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Feedstock Reserves Card */}
              <div className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-sm space-y-6 text-left">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Feedstock Reserves</h3>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Simulate Mode</span>
                </div>

                <div className="space-y-6">
                  {[
                    { 
                      key: 'plastic', 
                      name: 'Plastic / PET', 
                      val: stock.plastic, 
                      max: 2000, 
                      accentClass: 'accent-blue-600',
                      incoming: predictedIncoming.plastic,
                      unit: 'kg'
                    },
                    { 
                      key: 'rubber', 
                      name: 'Rubber / Tires', 
                      val: stock.rubber, 
                      max: 1500, 
                      accentClass: 'accent-emerald-600',
                      incoming: predictedIncoming.rubber,
                      unit: 'kg'
                    },
                    { 
                      key: 'paper', 
                      name: 'Paper / Cartons', 
                      val: stock.paper, 
                      max: 1000, 
                      accentClass: 'accent-amber-600',
                      incoming: predictedIncoming.paper,
                      unit: 'kg'
                    },
                  ].map((item) => (
                    <div key={item.key} className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-medium text-slate-700">{item.name}</span>
                        <span className="text-sm font-semibold text-slate-900 font-mono">
                          {item.val} <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span>
                        </span>
                      </div>

                      {/* Native Styled Range Slider for No-Lag dynamic updating and proper custom accents */}
                      <input 
                        type="range"
                        min={0}
                        max={item.max}
                        step={50}
                        value={item.val}
                        onChange={(e) => setStock(prev => ({ ...prev, [item.key]: Number(e.target.value) }))}
                        className={cn("w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer", item.accentClass)}
                      />

                      <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                        <span>Min 0kg</span>
                        <span className="text-emerald-600">+{item.incoming}kg next 30d</span>
                        <span>Max {item.max}kg</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Minimalist Yield Calculations */}
              <div className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-sm space-y-4 text-left">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Target Conversion Yields</h3>
                </div>

                <div className="divide-y divide-slate-100">
                  {/* Row 1 */}
                  <div className="py-3.5 flex justify-between items-center first:pt-0">
                    <div>
                      <h4 className="text-xs font-medium text-slate-800">Community Park Benches</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Calculated from Plastic PET reserves (160kg/unit)</p>
                    </div>
                    <span className="text-lg font-semibold text-slate-900 font-mono">{maxBenches} <span className="text-xs text-slate-400 font-normal">pcs</span></span>
                  </div>
                  {/* Row 2 */}
                  <div className="py-3.5 flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-medium text-slate-800">EPDM-free Safety Tiles</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Calculated from Rubber reserves (15kg/sq m)</p>
                    </div>
                    <span className="text-lg font-semibold text-slate-900 font-mono">{maxTiles} <span className="text-xs text-slate-400 font-normal">m²</span></span>
                  </div>
                  {/* Row 3 */}
                  <div className="py-3.5 flex justify-between items-center last:pb-0">
                    <div>
                      <h4 className="text-xs font-medium text-slate-800">Recycled Delivery Boxes</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Calculated from Paper cartons (5kg/box)</p>
                    </div>
                    <span className="text-lg font-semibold text-slate-900 font-mono">{maxPackaging} <span className="text-xs text-slate-400 font-normal">pcs</span></span>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: AI optimizer & queue workspace (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Premium AI logistics command desk */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md text-left">
                <div className="flex items-center gap-2 pb-4 border-b border-slate-800 mb-4">
                  <Cpu className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-350 uppercase tracking-wider">AI Logistics Optimizer</span>
                </div>

                <div className="space-y-4">
                  {/* Quick request prompts */}
                  <div className="space-y-1 text-left">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Recommended Queries</span>
                    <div className="flex flex-wrap gap-2">
                      {quickPrompts.map((pText, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setOptimizerPrompt(pText);
                            handleOptimize(pText);
                          }}
                          className="text-[10px] font-semibold px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-800/80 text-slate-300 hover:text-white transition-all"
                        >
                          {pText}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input form */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleOptimize(optimizerPrompt);
                    }}
                    className="relative flex items-center bg-slate-950 border border-slate-800 focus-within:border-slate-700 rounded-xl p-1 shadow-inner"
                  >
                    <Input
                      value={optimizerPrompt}
                      onChange={(e) => setOptimizerPrompt(e.target.value)}
                      placeholder={i18n.language === 'uz' ? "Logistika optimallashtirish bo'yicha so'rov..." : i18n.language === 'ru' ? "Запрос по оптимизации логистики..." : "Describe scheduling query..."}
                      className="flex-1 bg-transparent border-0 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder-slate-650 h-10 px-3 text-base md:text-xs font-medium"
                    />
                    <Button
                      type="submit"
                      disabled={!optimizerPrompt.trim() || isOptimizing}
                      className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 h-10 rounded-lg text-xs flex items-center gap-1.5 border border-slate-700"
                    >
                      Optimize
                    </Button>
                  </form>

                  {/* Console Result Output */}
                  <AnimatePresence mode="wait">
                    {(isOptimizing || optimizationResult) && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="border border-slate-800 rounded-xl overflow-hidden shadow-inner"
                      >
                        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                          <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest">AI Scheduler Output</span>
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        </div>
                        
                        <div className="bg-slate-955 p-5 text-left min-h-[120px] flex flex-col justify-center">
                          {isOptimizing ? (
                            <div className="flex items-center gap-2 justify-center py-4 text-slate-500 text-xs uppercase tracking-wider font-mono">
                              <div className="h-3.5 w-3.5 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin" />
                              <span>Re-calculating feedstock scheduling...</span>
                            </div>
                          ) : (
                            <div className="w-full text-slate-350 leading-relaxed">
                              {parseMarkdownToReact(optimizationResult)}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Combined Schedule form & live production list */}
              <div className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-sm space-y-6 text-left">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Queue Pipeline</h3>
                  <span className="text-[9px] font-bold bg-slate-50 border border-slate-200/50 text-slate-500 px-2 py-0.5 rounded">
                    {batches.length} Shifts active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Left part: scheduler form (col-span-5) */}
                  <div className="md:col-span-5 space-y-4 border-r-0 md:border-r border-slate-100 pr-0 md:pr-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Schedule Batch</h4>
                    <form onSubmit={handleAddBatch} className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Batch Description</label>
                        <Input
                          value={newBatchName}
                          onChange={(e) => setNewBatchName(e.target.value)}
                          placeholder="e.g. Chilanzor Paper Box Batch"
                          className="bg-slate-50 border-slate-200 focus-visible:ring-blue-500/20 text-slate-800 text-xs h-9 rounded-lg"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Material Type</label>
                        {/* Styled SELECT with NO clipping height bugs, using safe vertical padding */}
                        <select
                          value={newBatchMaterial}
                          onChange={(e) => setNewBatchMaterial(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-350"
                        >
                          <option value="PET">Plastic / PET</option>
                          <option value="Rubber">Rubber / Tires</option>
                          <option value="Paper">Paper / Cartons</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Feedstock Weight (kg)</label>
                        <Input
                          type="number"
                          value={newBatchWeight}
                          onChange={(e) => setNewBatchWeight(Number(e.target.value))}
                          className="bg-slate-50 border-slate-200 focus-visible:ring-blue-500/20 text-slate-800 text-xs h-9 rounded-lg"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold h-9 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm border-0"
                      >
                        <Plus className="h-4 w-4" />
                        Queue Shift
                      </Button>
                    </form>
                  </div>

                  {/* Right part: queue manager list (col-span-7) */}
                  <div className="md:col-span-7 space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Queue List (Click status to transition)</h4>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-none">
                      {batches.map((batch) => (
                        <div 
                          key={batch.id} 
                          className="bg-white p-3 rounded-xl border border-slate-150 flex items-center justify-between gap-3 text-left hover:border-slate-300 transition-all group shadow-sm"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-slate-850 leading-none">{batch.name}</span>
                              <span className={cn(
                                "text-[8px] font-bold px-1.5 py-0.2 rounded border leading-none",
                                batch.material === 'PET' ? "bg-blue-50 border-blue-100 text-blue-600" :
                                batch.material === 'Rubber' ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                                "bg-amber-50 border-amber-100 text-amber-600"
                              )}>
                                {batch.material}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium font-mono">
                              <span>{batch.weight} kg</span>
                              <span>•</span>
                              <span>{batch.scheduledDate}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Toggle status on click, making it extremely interactive */}
                            <button
                              onClick={() => toggleBatchStatus(batch.id)}
                              title="Click to transition status"
                              className={cn(
                                "text-[9px] font-bold border px-2 py-0.5 rounded uppercase tracking-wider transition-all",
                                batch.status === 'Completed' ? "bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm" :
                                batch.status === 'In Progress' ? "bg-blue-50 border-blue-100 text-blue-700 shadow-sm animate-pulse" :
                                "bg-slate-50 border-slate-200 text-slate-500"
                              )}
                            >
                              {batch.status}
                            </button>
                            
                            <button
                              onClick={() => handleDeleteBatch(batch.id)}
                              className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {batches.length === 0 && (
                        <div className="text-center py-6 text-slate-400 text-xs font-medium">No active production shifts in pipeline.</div>
                      )}
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </Layout>
  );
}
