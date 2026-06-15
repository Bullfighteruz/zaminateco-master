import React from 'react';
import { motion } from 'framer-motion';
import {
  Users, Target, Globe, Award, TrendingUp, Sparkles, Recycle,
  ChevronRight, CheckCircle2, Building2, Landmark, Package, Heart,
  Smartphone, Mail
} from 'lucide-react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { contactHelpers } from '@/utils/mailto';
import sukhrobjonPhoto from '../../svg/Sukhrobjon Rikhsiboev.jpg';
import azamatPhoto from '../../svg/Azamat Elchibekov.jpg';

/* ────────────────────────────── Data ────────────────────────────── */

const PROBLEM_STATS = [
  { value: '14.8M', unit: 'tons/year', label: 'Waste generated in Uzbekistan', icon: Recycle },
  { value: '~5%', unit: '', label: 'Actually recycled', icon: Target },
  { value: '1M+', unit: 'tons', label: 'Plastic waste accumulated', icon: Globe },
  { value: '1T', unit: 'UZS', label: 'Unrealized economic value', icon: TrendingUp },
];

const PRODUCTS = [
  { name: 'EPDM-free Tiles', image: '/images/EPDM-free Tiles.webp', material: 'Recycled Rubber', price: '219,000 UZS/m²', status: 'Selling' },
  { name: 'EPDM Rubber Tiles', image: '/images/EPDM Tiles.webp', material: 'EPDM + Rubber', price: '539,000 UZS/m²', status: 'Selling' },
  { name: 'EcoBrick', image: '/images/EcoBrick.webp', material: 'Recycled Plastic', price: '99,000 UZS/pc', status: 'Selling' },
  { name: 'Eco Bench', image: '/images/Eco Bench.webp', material: 'Recycled Plastic', price: '790,000 UZS/pc', status: 'Selling' },
  { name: 'Garden Planter', image: '/images/Garden Planter.webp', material: 'Recycled Plastic', price: '149,000 UZS/pc', status: 'Selling' },
  { name: 'ECOBIKE RACK', image: '/images/ECOBIKE RACK.webp', material: 'Recycled Plastic', price: '490,000 UZS/pc', status: 'Selling' },
  { name: 'Waste Bin', image: '/images/Waste Bin.webp', material: 'Recycled Plastic', price: '79,000 UZS/pc', status: 'Selling' },
  { name: 'ECOBUSSTOP', image: '/images/ECOBUSSTOP.webp', material: 'Recycled Materials', price: '8,590,000 UZS', status: 'Selling' },
  { name: 'Art Tiles', image: '/images/art-tiles.webp', material: 'Recycled Rubber', price: '49,000 UZS/pc', status: 'Pilot-Ready' },
  { name: 'Ecostreet Furniture', image: '/images/green-city_5994274.webp', material: 'Recycled Materials', price: 'Custom', status: 'Roadmap' },
];

const ECOAPP_MODULES = [
  { name: 'EcoMap', desc: 'Interactive collection point finder', icon: Globe },
  { name: 'EcoActions', desc: 'Volunteer campaigns & events', icon: Users },
  { name: 'EcoWallet', desc: 'Eco-coins rewards for participation', icon: Sparkles },
  { name: 'EcoStories', desc: 'Community impact stories & media', icon: Heart },
  { name: 'EcoVote', desc: 'Citizens vote on public projects', icon: Landmark },
  { name: 'Impact Dashboard', desc: 'Transparent waste tracking analytics', icon: TrendingUp },
];

const REVENUE_CHANNELS = [
  { name: 'B2G Contracts', desc: 'Municipal & government projects', icon: Landmark },
  { name: 'B2B Sales', desc: 'Developers, landscapers, builders', icon: Building2 },
  { name: 'B2C E-commerce', desc: 'Direct shop on zaminat.eco', icon: Package },
  { name: 'Social Products', desc: 'Art Tiles & EcoKids programs', icon: Heart },
  { name: 'EcoApp Platform', desc: 'Eco-coins & gamification monetization', icon: Smartphone },
  { name: 'Export / Franchise', desc: 'Central Asia expansion model', icon: Globe },
];

const ROADMAP = [
  { year: '2026', title: 'Pilot Year', items: ['First production line', 'Pilot sales 10 customers', 'EcoApp MVP launch', 'EcoKids 3 schools'] },
  { year: '2027', title: 'Growth', items: ['500 t/year production', 'Tashkent city contracts', 'EcoApp 5,000 users', '10 schools enrolled'] },
  { year: '2028', title: 'Scale', items: ['2,000 t/year capacity', 'Break-even achieved', 'Regional expansion pilot', 'National partnerships'] },
  { year: '2029', title: 'Expansion', items: ['Multi-city operations', 'Central Asia market', 'Platform licensing', '$183K net profit/year'] },
];

const TRACTION = [
  'Registered legal entity (LLC)',
  'Production logic & pricing finalized',
  'Website MVP live (zaminat.eco)',
  'EcoApp prototype built',
  'Raw material sourcing confirmed',
  'Equipment suppliers identified',
  'Financial model validated (4-year)',
  'Pilot customer pipeline started',
  'Team of 3 co-founders assembled',
  'Brand & positioning complete',
];

const TEAM = [
  { 
    name: 'Sukhrobjon Rikhsiboev', 
    role: 'Founder / CEO / Strategy & Vision', 
    focus: 'Founder, chiefly responsible for strategy, partnerships, fundraising, brand, and project development.', 
    photo: sukhrobjonPhoto 
  },
  { 
    name: 'Azamat Elchibekov', 
    role: 'Project Team — Operations & Partnerships Support', 
    focus: 'Assists with operational tasks, preparation, communications, partnerships, and organizational support.', 
    photo: azamatPhoto 
  },
  { 
    name: 'Khondamir Alibekov', 
    role: 'Project Team — Digital Platform & Website Demo Support', 
    focus: 'Helps with digital development, website demos, web MVPs, visual presentation, and technical support for pitch demos.', 
    photo: '/images/meet-the-team_15916616.webp' 
  },
];

/* ────────────────────────────── Animations ────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

/* ────────────────────────────── Component ────────────────────────────── */

export default function Pitch() {
  const isMobile = useIsMobile();

  return (
    <Layout title="Investor Pitch Deck">
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/10">
        
        {/* ═══════ SECTION 1: Hero ═══════ */}
        <section 
          className="relative overflow-hidden bg-cover bg-center bg-no-repeat text-white"
          style={{ backgroundImage: "url('/images/pitch-hero-bg.jpg')" }}
        >
          <div className="absolute inset-0 bg-emerald-950/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
          
          <motion.div
            initial="hidden" animate="visible" variants={stagger}
            className={cn("relative z-10 max-w-5xl mx-auto text-center", isMobile ? "px-4 py-12" : "px-6 py-20")}
          >
            <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mb-6">
              <img src="/logo.webp" alt="ZAMINAT.eco" className="h-11 w-11 rounded-xl shadow-lg" />
              <span className="text-2xl font-black tracking-tight">ZAMINAT.eco</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className={cn("font-black leading-tight", isMobile ? "text-3xl" : "text-5xl lg:text-6xl")}>
              Where Waste Ends —<br />
              <span className="text-yellow-300">Life Begins</span>
            </motion.h1>

            <motion.p variants={fadeUp} className={cn("mx-auto mt-4 opacity-90 leading-relaxed", isMobile ? "text-sm max-w-md" : "text-lg max-w-2xl")}>
              A full-cycle <strong className="text-white">Waste-to-Life</strong> infrastructure platform from Uzbekistan.
              Plastic + Tire Waste → Infrastructure Products + Digital Transparency + Education
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {['Tashkent, Uzbekistan', 'Pre-Seed Stage', 'Est. 2025'].map(tag => (
                <Badge key={tag} className="bg-white/15 text-white border-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold">
                  {tag}
                </Badge>
              ))}
            </motion.div>

            {/* Transformation Chain */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-1 mt-8">
              {['Waste', 'Material', 'Product', 'Revenue', 'Impact'].map((step, i) => (
                <React.Fragment key={step}>
                  <span className="px-3 py-1.5 bg-white/10 border border-white/15 rounded-lg text-xs font-bold">
                    {step}
                  </span>
                  {i < 4 && <ChevronRight className="h-4 w-4 opacity-40" />}
                </React.Fragment>
              ))}
            </motion.div>
          </motion.div>
        </section>

        <div className={cn("max-w-6xl mx-auto", isMobile ? "px-3 space-y-10 py-8" : "px-6 space-y-16 py-14")}>

          {/* ═══════ SECTION 2: The Problem / Opportunity ═══════ */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-8">
              <Badge className="bg-red-50 text-red-700 border-red-200 mb-3">The Opportunity</Badge>
              <h2 className={cn("font-bold text-gray-900", isMobile ? "text-2xl" : "text-3xl")}>
                Waste is not an environmental problem.
                <br /><span className="text-emerald-600">It is unused economic value.</span>
              </h2>
            </motion.div>

            <div className={cn("grid gap-4", isMobile ? "grid-cols-2" : "grid-cols-4")}>
              {PROBLEM_STATS.map((stat, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <Card className="text-center h-full border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className={cn(isMobile ? "p-3" : "p-5")}>
                      <stat.icon className={cn("mx-auto mb-2 text-emerald-500", isMobile ? "h-5 w-5" : "h-7 w-7")} />
                      <div className={cn("font-black text-emerald-600", isMobile ? "text-2xl" : "text-3xl")}>{stat.value}</div>
                      {stat.unit && <div className="text-xs font-semibold text-emerald-500 mt-0.5">{stat.unit}</div>}
                      <div className={cn("text-gray-500 mt-1", isMobile ? "text-[10px]" : "text-xs")}>{stat.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ═══════ SECTION 3: Our Solution ═══════ */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-8">
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 mb-3">Our Solution</Badge>
              <h2 className={cn("font-bold text-gray-900", isMobile ? "text-2xl" : "text-3xl")}>
                Three integrated pillars.{' '}
                <span className="text-emerald-600">One impact system.</span>
              </h2>
            </motion.div>

            <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-3")}>
              {[
                { title: 'Physical Products', desc: 'Recycled rubber & plastic → tiles, benches, planters, bricks, bus stops, and more. Real products for real infrastructure.', icon: Package, color: 'emerald' },
                { title: 'Digital EcoApp Platform', desc: 'Gamified citizen engagement — EcoMap, EcoWallet, EcoVote, EcoStories. Making recycling visible, measurable, and participatory.', icon: Smartphone, color: 'teal' },
                { title: 'EcoKids Education', desc: 'Children design Art Tiles in school workshops. Their creativity becomes real public products installed in parks and playgrounds.', icon: Heart, color: 'green' },
              ].map((pillar, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <Card className={cn("h-full border-gray-200/60 shadow-sm hover:shadow-lg transition-all group", isMobile ? "" : "hover:-translate-y-1")}>
                    <CardContent className={cn(isMobile ? "p-4" : "p-6")}>
                      <div className={cn(
                        `p-2.5 rounded-xl bg-${pillar.color}-50 text-${pillar.color}-600 w-fit mb-3`,
                        "group-hover:scale-105 transition-transform"
                      )}>
                        <pillar.icon className="h-6 w-6" />
                      </div>
                      <h3 className={cn("font-bold text-gray-900 mb-2", isMobile ? "text-base" : "text-lg")}>{pillar.title}</h3>
                      <p className={cn("text-gray-600 leading-relaxed", isMobile ? "text-xs" : "text-sm")}>{pillar.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ═══════ SECTION 4: Product Catalog ═══════ */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-8">
              <Badge className="bg-amber-50 text-amber-700 border-amber-200 mb-3">Product Catalog</Badge>
              <h2 className={cn("font-bold text-gray-900", isMobile ? "text-2xl" : "text-3xl")}>
                10 products.{' '}
                <span className="text-emerald-600">All from recycled materials.</span>
              </h2>
            </motion.div>

            <div className={cn("grid gap-3", isMobile ? "grid-cols-2" : "grid-cols-5")}>
              {PRODUCTS.map((p, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <Card className="h-full overflow-hidden border-gray-200/60 shadow-sm hover:shadow-md transition-all group cursor-pointer hover:border-emerald-300">
                    <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                    <CardContent className={cn(isMobile ? "p-2" : "p-3")}>
                      <h4 className={cn("font-bold text-gray-900 leading-tight", isMobile ? "text-[11px]" : "text-xs")}>{p.name}</h4>
                      <div className={cn("text-emerald-600 font-semibold mt-0.5", isMobile ? "text-[10px]" : "text-[11px]")}>{p.material}</div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className={cn("font-bold text-gray-700", isMobile ? "text-[10px]" : "text-[11px]")}>{p.price}</span>
                        <Badge className={cn(
                          "text-[9px] px-1.5 py-0",
                          p.status === 'Selling' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          p.status === 'Pilot-Ready' ? "bg-amber-50 text-amber-700 border-amber-200" :
                          "bg-gray-50 text-gray-600 border-gray-200"
                        )}>{p.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ═══════ SECTION 5: EcoApp Platform ═══════ */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-8">
              <Badge className="bg-teal-50 text-teal-700 border-teal-200 mb-3">Digital Trust Layer</Badge>
              <h2 className={cn("font-bold text-gray-900", isMobile ? "text-2xl" : "text-3xl")}>
                EcoApp makes recycling{' '}
                <span className="text-teal-600">visible & participatory.</span>
              </h2>
            </motion.div>

            <div className={cn("grid gap-3", isMobile ? "grid-cols-2" : "grid-cols-3")}>
              {ECOAPP_MODULES.map((mod, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <Card className="h-full border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className={cn("flex items-start gap-3", isMobile ? "p-3" : "p-4")}>
                      <div className="p-2 rounded-lg bg-teal-50 text-teal-600 flex-shrink-0">
                        <mod.icon className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
                      </div>
                      <div>
                        <h4 className={cn("font-bold text-gray-900", isMobile ? "text-xs" : "text-sm")}>{mod.name}</h4>
                        <p className={cn("text-gray-500 leading-relaxed mt-0.5", isMobile ? "text-[10px]" : "text-xs")}>{mod.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ═══════ SECTION 6: Business Model ═══════ */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-8">
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 mb-3">Business Model</Badge>
              <h2 className={cn("font-bold text-gray-900", isMobile ? "text-2xl" : "text-3xl")}>
                Multiple revenue channels.{' '}
                <span className="text-emerald-600">One integrated system.</span>
              </h2>
            </motion.div>

            <div className={cn("grid gap-3", isMobile ? "grid-cols-2" : "grid-cols-3")}>
              {REVENUE_CHANNELS.map((ch, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <Card className="h-full border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className={cn("flex items-start gap-3", isMobile ? "p-3" : "p-4")}>
                      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 flex-shrink-0">
                        <ch.icon className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
                      </div>
                      <div>
                        <h4 className={cn("font-bold text-gray-900", isMobile ? "text-xs" : "text-sm")}>{ch.name}</h4>
                        <p className={cn("text-gray-500 leading-relaxed mt-0.5", isMobile ? "text-[10px]" : "text-xs")}>{ch.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Key Financial Metrics */}
            <motion.div variants={fadeUp} className={cn("grid gap-3 mt-6", isMobile ? "grid-cols-3" : "grid-cols-6")}>
              {[
                { label: 'TAM', value: '$250M' },
                { label: 'SAM', value: '$5M' },
                { label: 'SOM', value: '$600K–$1M' },
                { label: 'Gross Margin', value: '45%+' },
                { label: 'Break-even', value: '2028' },
                { label: 'ROI (4-yr)', value: '152%' },
              ].map((m, i) => (
                <Card key={i} className="text-center border-gray-200/60 shadow-sm">
                  <CardContent className={cn(isMobile ? "p-2.5" : "p-3")}>
                    <div className={cn("font-black text-emerald-600", isMobile ? "text-base" : "text-lg")}>{m.value}</div>
                    <div className={cn("text-gray-500 mt-0.5", isMobile ? "text-[9px]" : "text-[11px]")}>{m.label}</div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </motion.section>

          {/* ═══════ SECTION 7: Roadmap ═══════ */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-8">
              <Badge className="bg-cyan-50 text-cyan-700 border-cyan-200 mb-3">Roadmap</Badge>
              <h2 className={cn("font-bold text-gray-900", isMobile ? "text-2xl" : "text-3xl")}>
                4-Year Growth Plan
              </h2>
            </motion.div>

            <div className={cn("grid gap-4", isMobile ? "grid-cols-2" : "grid-cols-4")}>
              {ROADMAP.map((yr, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <Card className="h-full border-gray-200/60 shadow-sm">
                    <CardContent className={cn(isMobile ? "p-3" : "p-4")}>
                      <div className={cn("font-black text-emerald-600 mb-1", isMobile ? "text-xl" : "text-2xl")}>{yr.year}</div>
                      <div className={cn("font-bold text-gray-900 mb-2", isMobile ? "text-xs" : "text-sm")}>{yr.title}</div>
                      <ul className="space-y-1">
                        {yr.items.map((item, j) => (
                          <li key={j} className={cn("flex items-start gap-1.5 text-gray-600", isMobile ? "text-[10px]" : "text-xs")}>
                            <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ═══════ SECTION 8: Traction ═══════ */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-8">
              <Badge className="bg-green-50 text-green-700 border-green-200 mb-3">Traction & Readiness</Badge>
              <h2 className={cn("font-bold text-gray-900", isMobile ? "text-2xl" : "text-3xl")}>
                What we've already done.
              </h2>
            </motion.div>

            <div className={cn("grid gap-2", isMobile ? "grid-cols-1" : "grid-cols-2")}>
              {TRACTION.map((item, i) => (
                <motion.div key={i} variants={fadeUp}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-gray-200/60 shadow-sm"
                >
                  <CheckCircle2 className={cn("text-emerald-500 flex-shrink-0", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                  <span className={cn("text-gray-700", isMobile ? "text-xs" : "text-sm")}>{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ═══════ SECTION 9: Team ═══════ */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-8">
              <Badge className="bg-purple-50 text-purple-700 border-purple-200 mb-3">Founding Team</Badge>
              <h2 className={cn("font-bold text-gray-900", isMobile ? "text-2xl" : "text-3xl")}>
                Built by operators, not just dreamers.
              </h2>
            </motion.div>

            <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-3")}>
              {TEAM.map((member, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <Card className="h-full text-center border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className={cn(isMobile ? "p-4" : "p-6")}>
                      <img
                        src={member.photo}
                        alt={member.name}
                        className={cn("mx-auto rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-gray-100", isMobile ? "w-24 h-24 mb-3" : "w-32 h-32 mb-4")}
                        loading="lazy"
                      />
                      <h4 className={cn("font-bold text-gray-900", isMobile ? "text-sm" : "text-base")}>{member.name}</h4>
                      <div className={cn("text-emerald-600 font-semibold mt-0.5", isMobile ? "text-xs" : "text-sm")}>{member.role}</div>
                      <div className={cn("text-gray-500 mt-1", isMobile ? "text-[10px]" : "text-xs")}>{member.focus}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ═══════ SECTION 10: Investment Ask ═══════ */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp}>
              <Card 
                className="border-0 shadow-2xl text-white overflow-hidden relative bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/images/pitch-ask-bg.jpg')" }}
              >
                <div className="absolute inset-0 bg-emerald-950/45" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/35" />
                <CardContent className={cn("relative z-10 text-center", isMobile ? "p-6" : "p-12")}>
                  <Badge className="bg-white/15 text-white border-white/20 mb-4">Pre-Seed · Pilot Preparation</Badge>
                  <div className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-1">Seeking</div>
                  <div className={cn("font-black", isMobile ? "text-4xl" : "text-6xl")}>$350,000</div>
                  
                  <div className={cn("flex items-center justify-center gap-6 mt-4", isMobile ? "gap-4" : "gap-8")}>
                    <div>
                      <div className="text-xs text-white/60">Equity</div>
                      <div className={cn("font-black", isMobile ? "text-xl" : "text-2xl")}>25%</div>
                    </div>
                    <div className="w-px h-8 bg-white/20" />
                    <div>
                      <div className="text-xs text-white/60">Post-Money Valuation</div>
                      <div className={cn("font-bold", isMobile ? "text-base" : "text-lg")}>$1.4M</div>
                    </div>
                  </div>

                  {/* Use of Funds */}
                  <div className={cn("mx-auto mt-8", isMobile ? "max-w-sm" : "max-w-md")}>
                    <div className="text-xs text-white/50 mb-2 uppercase tracking-wide">Use of Funds</div>
                    <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                      <div className="bg-emerald-300 rounded-full" style={{ width: '91%' }} />
                      <div className="bg-yellow-400 rounded-full" style={{ width: '4.5%' }} />
                      <div className="bg-orange-400 rounded-full" style={{ width: '4.5%' }} />
                    </div>
                    <div className={cn("flex flex-col gap-1 mt-3 text-left", isMobile ? "text-[10px]" : "text-xs")}>
                      <div className="flex items-center gap-2 text-white/80">
                        <div className="w-2.5 h-2.5 rounded-sm bg-emerald-300 flex-shrink-0" />
                        $320K (91%) — Equipment, raw materials, certification, production
                      </div>
                      <div className="flex items-center gap-2 text-white/80">
                        <div className="w-2.5 h-2.5 rounded-sm bg-yellow-400 flex-shrink-0" />
                        $15K (4%) — EcoApp development & launch
                      </div>
                      <div className="flex items-center gap-2 text-white/80">
                        <div className="w-2.5 h-2.5 rounded-sm bg-orange-400 flex-shrink-0" />
                        $15K (4%) — Branding, marketing, pilot demos
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/10">
                    <p className={cn("text-white/50 mx-auto", isMobile ? "text-[10px] max-w-sm" : "text-xs max-w-lg")}>
                      Current stage: registered entity, prepared product logic, web MVP, early sourcing discussions, and pilot roadmap.
                      We are honest about where we are — and clear about where we are going.
                    </p>
                  </div>

                  <div className="mt-6">
                    <p className={cn("font-semibold text-white/90", isMobile ? "text-sm" : "text-base")}>
                      Join the first Waste-to-Life infrastructure platform from Uzbekistan.
                    </p>
                    <p className={cn("font-black text-yellow-300 mt-1", isMobile ? "text-lg" : "text-2xl")}>
                      Where waste ends — life begins.
                    </p>
                  </div>

                  <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-6">
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-white p-2 rounded-xl shadow-xl w-28 h-28 flex items-center justify-center group hover:scale-105 transition-transform duration-300">
                        <img src="/images/pitch-qr.png" alt="Scan to open Pitch Deck" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-[10px] text-white/70 font-semibold tracking-wide">
                        Scan to Open Pitch
                      </span>
                    </div>

                    <div className="w-px h-16 bg-white/20 hidden md:block" />

                    <Button
                      onClick={() => contactHelpers.generalInquiry('Investment Inquiry — ZAMINAT.eco Pitch Deck', 'I viewed the ZAMINAT.eco pitch deck and would like to discuss investment opportunities.')}
                      className={cn(
                        "bg-white text-emerald-700 hover:bg-gray-100 font-bold shadow-xl",
                        isMobile ? "px-6 py-2.5 text-sm w-full max-w-[200px]" : "px-8 py-3.5 text-base"
                      )}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Contact Us
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.section>

        </div>
      </div>
    </Layout>
  );
}
