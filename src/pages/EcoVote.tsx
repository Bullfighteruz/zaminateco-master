import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Vote, 
  Heart, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Trophy,
  Target,
  CheckCircle,
  TrendingUp,
  Clock,
  Award,
  Sparkles,
  Eye,
  Share2,
  Download,
  BarChart3,
  Zap,
  Star,
  Camera,
  Play,
  Pause,
  Recycle,
  TreePine,
  Leaf,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Dialog, DialogContent, DialogTitle } from '../components/ui/dialog';
import { votingProjects } from '../lib/mockData';
import { useTranslation } from '../hooks/useTranslation';
import { getIconForProductOrCategory } from '../lib/iconMatcher';
import { useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import DonationDialog from '../components/DonationDialog';
import { apiClient, IS_BACKEND_AVAILABLE } from '../lib/api-client';
import AnimatedCounter from '../components/AnimatedCounter';

// Types for completed projects
interface TimelineItem {
  date: string;
  event: string;
  votes?: number;
  amount?: string;
}

interface CompletedProject {
  id: string;
  title: string;
  description: string;
  image: string;
  location: string;
  completedDate: Date;
  materialsUsed: number;
  beneficiaries: number;
  impact: string;
  co2Saved: number;
  treesEquivalent: number;
  beforeAfter: {
    before: string;
    after: string;
  };
  timeline: TimelineItem[];
  gallery: string[];
  satisfaction: number;
  views: number;
  shares: number;
}

// FIXED: Add proper type for voting project
interface VotingProject {
  id: string;
  title: string;
  description: string;
  image: string;
  location: string;
  category: string;
  status: string;
  currentVotes: number;
  totalVotes: number;
  deadline: Date;
  requiredMaterials: number;
  donationTarget?: number;
  donationRaised?: number;
}

// Backend project shape (partial) - used when mapping backend responses
interface BackendProject {
  id?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  district?: string;
  location?: string;
  category?: string;
  status?: string;
  voteCount?: number;
  targetVotes?: number;
  endDate?: string;
  materialsRequiredKg?: number;
  budgetRequired?: number;
  fundsRaised?: number;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

const cardHoverVariants = {
  hover: {
    scale: 1.02,
    y: -5,
    transition: {
      duration: 0.3
    }
  }
};

const floatingVariants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const pulseVariants = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

interface CompletedProjectCardProps {
  project: CompletedProject;
  setLightboxImage: React.Dispatch<React.SetStateAction<{ 
    src: string; 
    title: string; 
    images?: string[]; 
    activeIndex?: number; 
  } | null>>;
}

const CompletedProjectCard = ({ project, setLightboxImage }: CompletedProjectCardProps) => {
  const { t } = useTranslation(['translation', 'common']);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeImageTab, setActiveImageTab] = useState<'after' | 'before'>('after');

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <Card className="glass-card glass-card-hover rounded-3xl overflow-hidden">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column: Premium Interactive Before/After Image */}
            <div className="md:col-span-4 w-full">
              <div 
                className="relative aspect-video md:aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 shadow-sm border border-slate-200/40 cursor-pointer group"
                onClick={() => {
                  const currentSrc = activeImageTab === 'after' ? project.image : project.beforeAfter.before;
                  const activeIndex = project.gallery.indexOf(currentSrc);
                  setLightboxImage({ 
                    src: currentSrc, 
                    title: `${project.title} (${activeImageTab === 'after' ? t('translation:after', { defaultValue: 'After' }) : t('translation:before', { defaultValue: 'Before' })})`,
                    images: project.gallery,
                    activeIndex: activeIndex !== -1 ? activeIndex : 0
                  });
                }}
              >
                <img 
                  src={activeImageTab === 'after' ? project.image : project.beforeAfter.before} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Micro Camera Indicator overlay */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Camera className="w-4 h-4" />
                </div>

                {/* Before/After Toggle Pill */}
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md p-0.5 rounded-full flex gap-0.5 shadow-sm border border-slate-200/50">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveImageTab('before'); }}
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-all uppercase tracking-wider ${
                      activeImageTab === 'before' 
                        ? 'bg-slate-800 text-white' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {t('translation:before', { defaultValue: 'Before' })}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveImageTab('after'); }}
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-all uppercase tracking-wider ${
                      activeImageTab === 'after' 
                        ? 'bg-emerald-600 text-white' 
                        : 'text-slate-500 hover:text-emerald-700'
                    }`}
                  >
                    {t('translation:after', { defaultValue: 'After' })}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Details & Impact */}
            <div className="md:col-span-8 flex flex-col h-full justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                  <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-100 hover:bg-emerald-100 font-semibold shadow-sm text-xs px-2.5 py-0.5 rounded-full">
                    <CheckCircle className="h-3 w-3 mr-1 text-emerald-600" />
                    {t('completedWithSparkles')}
                  </Badge>
                  <span className="text-xs text-slate-500 flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-slate-400 flex-shrink-0" />
                    {project.location}
                  </span>
                </div>
                
                <h4 className="font-extrabold text-slate-800 text-lg sm:text-xl md:text-2xl mb-2 flex items-center gap-2">
                  <span>{project.title}</span>
                  <Sparkles className="h-4 w-4 text-amber-500 animate-pulse flex-shrink-0" />
                </h4>
                
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  {project.description}
                </p>

                {/* Impact stats grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-3 text-center">
                    <div className="text-slate-450 text-[10px] font-bold uppercase tracking-wider mb-1">{t('recycled', { defaultValue: 'Recycled' })}</div>
                    <div className="text-sm sm:text-base font-extrabold text-emerald-700 flex items-center justify-center gap-1">
                      <Recycle className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{project.materialsUsed}kg</span>
                    </div>
                  </div>
                  <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-3 text-center">
                    <div className="text-slate-455 text-[10px] font-bold uppercase tracking-wider mb-1">{t('beneficiaries', { defaultValue: 'Benefited' })}</div>
                    <div className="text-sm sm:text-base font-extrabold text-indigo-700 flex items-center justify-center gap-1">
                      <Users className="h-3.5 w-3.5 text-indigo-600 flex-shrink-0" />
                      <span>{project.beneficiaries}+</span>
                    </div>
                  </div>
                  <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-3 text-center">
                    <div className="text-slate-460 text-[10px] font-bold uppercase tracking-wider mb-1">{t('co2Saved', { defaultValue: 'CO₂ Saved' })}</div>
                    <div className="text-sm sm:text-base font-extrabold text-teal-700 flex items-center justify-center gap-1">
                      <Leaf className="h-3.5 w-3.5 text-teal-600 flex-shrink-0" />
                      <span>{project.co2Saved}t</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gallery thumbnails */}
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-thin">
                {project.gallery.map((imgSrc, idx) => {
                  const isBefore = imgSrc.includes('before');
                  return (
                    <motion.div 
                      key={idx}
                      className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200/60 flex-shrink-0 cursor-pointer shadow-sm relative group/thumb"
                      whileHover={{ scale: 1.08 }}
                      onClick={() => setLightboxImage({ 
                        src: imgSrc, 
                        title: `${project.title} (${isBefore ? t('translation:before', { defaultValue: 'Before' }) : t('translation:after', { defaultValue: 'After' })})`,
                        images: project.gallery,
                        activeIndex: idx
                      })}
                    >
                      <img src={imgSrc} alt="Gallery item" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300" />
                    </motion.div>
                  );
                })}
              </div>

              {/* Toggle details */}
              <Button
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50/50 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-100/50"
              >
                <span>{isExpanded ? t('translation:hideDetails', { defaultValue: 'Hide Info' }) : t('translation:viewDetails', { defaultValue: 'Details' })}</span>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Eye className="h-4 w-4" />
                </motion.div>
              </Button>
            </div>
          </div>

          {/* Expandable Details content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.04, 0.62, 0.23, 0.98] }}
                className="overflow-hidden"
              >
                <div className="mt-6 p-5 bg-slate-50/80 border border-slate-200/30 rounded-2xl space-y-4">
                  <div>
                    <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-slate-500" />
                      {t('translation:projectTimeline')}
                    </h5>
                    <div className="relative border-l-2 border-slate-200 pl-4 ml-1.5 space-y-3">
                      {project.timeline.map((item, index) => (
                        <div key={index} className="relative">
                          <div className="absolute -left-[22px] top-1.5 w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full shadow-sm" />
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="text-xs font-bold text-slate-800">{item.event}</div>
                              <div className="text-[10px] text-slate-500">{item.date}</div>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              {item.votes && (
                                <Badge variant="outline" className="text-[9px] px-2 py-0 bg-white border-slate-200">
                                  {item.votes} {t('translation:votes')}
                                </Badge>
                              )}
                              {item.amount && (
                                <Badge variant="outline" className="text-[9px] px-2 py-0 bg-emerald-50 border-emerald-100 text-emerald-800">
                                  {item.amount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center flex-shrink-0">
                        <Star className="h-4.5 w-4.5 text-yellow-500 fill-yellow-500" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('translation:satisfaction', { defaultValue: 'Satisfaction' })}</div>
                        <div className="text-sm font-extrabold text-slate-700">{project.satisfaction}% {t('translation:rating', { defaultValue: 'Rating' })}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                        <TreePine className="h-4.5 w-4.5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('translation:treeEquivalent', { defaultValue: 'Tree Equivalent' })}</div>
                        <div className="text-sm font-extrabold text-slate-700">+{project.treesEquivalent} {t('translation:trees', { defaultValue: 'Trees' })}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

function EcoVote() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('active');
  const [selectedProject, setSelectedProject] = useState<VotingProject | null>(null);
  const [isPlaying, setIsPlaying] = useState<Record<string, boolean>>({});
  const [donationDialogOpen, setDonationDialogOpen] = useState(false);
  const [selectedProjectForDonation, setSelectedProjectForDonation] = useState<VotingProject | null>(null);
  const [projects, setProjects] = useState<VotingProject[]>(votingProjects);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<{ 
    src: string; 
    title: string; 
    images?: string[]; 
    activeIndex?: number; 
  } | null>(null);
  const backendNoticeShownRef = useRef(false);

  // Keyboard navigation for image lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxImage || !lightboxImage.images || lightboxImage.activeIndex === undefined) return;
      
      if (e.key === 'ArrowLeft') {
        const newIndex = (lightboxImage.activeIndex - 1 + lightboxImage.images.length) % lightboxImage.images.length;
        const newSrc = lightboxImage.images[newIndex];
        const isBefore = newSrc.includes('before');
        const newTitle = lightboxImage.title.split(' - ')[0].split(' (')[0] + 
          (isBefore ? ` (${t('before', { defaultValue: 'Before' })})` : ` (${t('after', { defaultValue: 'After' })})`);
        setLightboxImage({
          ...lightboxImage,
          src: newSrc,
          activeIndex: newIndex,
          title: newTitle
        });
      } else if (e.key === 'ArrowRight') {
        const newIndex = (lightboxImage.activeIndex + 1) % lightboxImage.images.length;
        const newSrc = lightboxImage.images[newIndex];
        const isBefore = newSrc.includes('before');
        const newTitle = lightboxImage.title.split(' - ')[0].split(' (')[0] + 
          (isBefore ? ` (${t('before', { defaultValue: 'Before' })})` : ` (${t('after', { defaultValue: 'After' })})`);
        setLightboxImage({
          ...lightboxImage,
          src: newSrc,
          activeIndex: newIndex,
          title: newTitle
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage, t]);

  // Fetch projects from backend
  useEffect(() => {
    if (!IS_BACKEND_AVAILABLE) {
      if (!backendNoticeShownRef.current) {
        toast.info(
          t('backendUnavailable', {
            defaultValue: 'Backend is offline, showing sample projects.',
          })
        );
        backendNoticeShownRef.current = true;
      }
      setProjects(votingProjects);
      setLoading(false);
      return;
    }

    const fetchProjects = async () => {
      try {
        setLoading(true);
        const status = activeTab === 'active' ? 'ACTIVE' : 'COMPLETED';
        const backendProjects = await apiClient.getProjects(status, 'votes');
        
        if (backendProjects && Array.isArray(backendProjects) && backendProjects.length > 0) {
          // Transform backend data to match frontend format
          const transformedProjects: VotingProject[] = backendProjects.map((p: BackendProject) => ({
            id: p.id || '',
            title: p.title || '',
            description: p.description || '',
            image: p.imageUrl || '🏫',
            location: p.district || p.location || '',
            category: p.category || 'general',
            status: p.status?.toLowerCase() || 'active',
            currentVotes: p.voteCount || 0,
            totalVotes: p.targetVotes || 1000,
            deadline: p.endDate ? new Date(p.endDate) : new Date(),
            requiredMaterials: p.materialsRequiredKg || 0,
            donationTarget: p.budgetRequired || 0,
            donationRaised: p.fundsRaised || 0,
          }));
          setProjects(transformedProjects);
        }
      } catch (error) {
        // Fallback to mock data if backend is unavailable
        if (
          error instanceof Error &&
          error.message === 'BACKEND_DISABLED' &&
          !backendNoticeShownRef.current
        ) {
          toast.info(
            t('backendUnavailable', {
              defaultValue: 'Backend is offline, showing sample projects.',
            })
          );
          backendNoticeShownRef.current = true;
        }
        setProjects(votingProjects);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [activeTab]);

  const formatCurrency = (amount: number) => {
    return `${(amount / 1000000).toFixed(1)}M ${t('currency')}`;
  };

  // FIXED: Function to get translated project title with proper typing
  const getTranslatedTitle = (project: VotingProject) => {
    switch (project.id) {
      case '1':
        return t('newPlaygroundTitle');
      case '2':
        return t('ecoParkBenchesTitle');
      case '3':
        return t('kindergartenGardenPathTitle');
      case '4':
        return t('chirchiqCleanupTitle');
      default:
        return project.title;
    }
  };

  // FIXED: Function to get translated project description with proper typing
  const getTranslatedDescription = (project: VotingProject) => {
    switch (project.id) {
      case '1':
        return t('playgroundDescription');
      case '2':
        return t('ecoParkBenchesDescription');
      case '3':
        return t('kindergartenGardenPathDescription');
      case '4':
        return t('chirchiqCleanupDesc');
      default:
        return project.description;
    }
  };

  // FIXED: Function to get translated location with proper typing
  const getTranslatedLocation = (project: VotingProject) => {
    switch (project.location) {
      case 'Chilonzor District':
        return t('chilonzorDistrict');
      case 'Alisher Navoi Park':
        return t('alisherNavoiPark');
      case 'Mirzo Ulugbek District':
        return t('mirzoUlugbekDistrict');
      case 'Chirchiq River, Tashkent':
        return t('chirchiqLocation');
      default:
        return project.location;
    }
  };

  // FIXED: Function to get translated category with proper typing
  const getTranslatedCategory = (project: VotingProject) => {
    switch (project.category) {
      case 'school':
        return t('school');
      case 'park':
        return t('park');
      case 'kindergarten':
        return t('kindergarten');
      case 'cleanup':
        return t('cleanup');
      default:
        return project.category;
    }
  };

  // Get projects with dynamically matched icons
  const projectsWithIcons = useMemo(() => {
    return projects.map(project => {
      const projectTitle = getTranslatedTitle(project);
      const projectCategory = project.category;
      
      // High-quality WebP image paths for specific project IDs
      let imagePath = project.image;
      if (project.id === '1') {
        imagePath = '/images/New Playground for School.webp';
      } else if (project.id === '2') {
        imagePath = '/images/eco-park-benches.webp';
      } else if (project.id === '3') {
        imagePath = '/images/kindergarten-garden-path.webp';
      }
      
      // Try to match icon based on title first, then category, then original title
      let iconPath = getIconForProductOrCategory(projectTitle, project.image);
      
      // If title matching didn't work well, try category
      if (iconPath === project.image || !iconPath.startsWith('/images/')) {
        iconPath = getIconForProductOrCategory(projectCategory, project.image);
      }
      
      // If still not found, try original title
      if (iconPath === project.image || !iconPath.startsWith('/images/')) {
        iconPath = getIconForProductOrCategory(project.title, project.image);
      }
      
      return {
        ...project,
        image: imagePath,
        iconPath,
        translatedTitle: projectTitle,
        translatedDescription: getTranslatedDescription(project),
        translatedLocation: getTranslatedLocation(project)
      };
    });
  }, [projects, t]);

  // Translate voting projects with icons
  const translatedProjects = projectsWithIcons.map(project => {
    return {
      ...project,
      iconPath: project.iconPath, // Explicitly preserve iconPath
      title: project.translatedTitle,
      description: project.translatedDescription,
      location: project.translatedLocation,
      category: getTranslatedCategory(project as VotingProject)
    };
  });

  const activeProjects = translatedProjects.filter(p => p.status === 'active');
  
  const completedProjects: CompletedProject[] = [
    {
      id: 'completed-1',
      title: t('ecoPlaygroundAtSchool12'),
      description: t('ecoPlaygroundDescription'),
      image: '/images/eco-playground-school-12.webp',
      location: t('shaykhantaurDistrict'),
      completedDate: new Date('2025-08-15'),
      materialsUsed: 1800,
      beneficiaries: 450,
      impact: t('high'),
      co2Saved: 2.4,
      treesEquivalent: 120,
      beforeAfter: {
        before: '/images/eco-playground-school-12-before.webp',
        after: '/images/eco-playground-school-12.webp'
      },
      timeline: [
        { date: '2025-06-01', event: t('projectApproved'), votes: 1250 },
        { date: '2025-06-15', event: t('fundingComplete'), amount: '2.1M' },
        { date: '2025-07-01', event: t('constructionStarted') },
        { date: '2025-08-15', event: t('projectCompleted') }
      ],
      gallery: ['/images/eco-playground-school-12-before.webp', '/images/eco-playground-school-12.webp'],
      satisfaction: 96,
      views: 15420,
      shares: 234
    },
    {
      id: 'completed-2',
      title: t('communityGardenBenches'),
      description: t('communityBenchesDescription'),
      image: '/images/community-garden-benches.webp',
      location: t('alisherNavoiPark'),
      completedDate: new Date('2025-07-22'),
      materialsUsed: 960,
      beneficiaries: 200,
      impact: t('medium'),
      co2Saved: 1.2,
      treesEquivalent: 60,
      beforeAfter: {
        before: '/images/community-garden-benches-before.webp',
        after: '/images/community-garden-benches.webp'
      },
      timeline: [
        { date: '2025-05-10', event: t('projectApproved'), votes: 890 },
        { date: '2025-05-25', event: t('fundingComplete'), amount: '1.2M' },
        { date: '2025-06-10', event: t('installationStarted') },
        { date: '2025-07-22', event: t('projectCompleted') }
      ],
      gallery: ['/images/community-garden-benches-before.webp', '/images/community-garden-benches.webp'],
      satisfaction: 89,
      views: 8930,
      shares: 156
    }
  ];  return (
    <Layout title={t('ecoVote')}>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/15 uzbek-pattern">
        {/* ── Premium Hero Banner ── */}
        <div className="relative overflow-hidden">
          {/* Rich gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900" />
          
          {/* Mesh gradient overlays */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-400/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-600/10 rounded-full blur-[80px] pointer-events-none" />
          
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
          
          {/* Floating animated decorative elements */}
          <motion.div
            className="absolute top-8 left-[10%] text-emerald-400/20 pointer-events-none"
            animate={{ y: [-8, 8, -8], rotate: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Vote className="h-10 w-10" />
          </motion.div>
          <motion.div
            className="absolute top-16 right-[12%] text-teal-400/15 pointer-events-none"
            animate={{ y: [6, -6, 6], rotate: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          >
            <Trophy className="h-8 w-8" />
          </motion.div>
          <motion.div
            className="absolute bottom-12 left-[20%] text-emerald-300/10 pointer-events-none"
            animate={{ y: [-5, 5, -5], rotate: [0, 8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          >
            <Recycle className="h-12 w-12" />
          </motion.div>
          <motion.div
            className="absolute bottom-8 right-[18%] text-teal-300/10 pointer-events-none"
            animate={{ y: [4, -4, 4] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          >
            <Leaf className="h-7 w-7" />
          </motion.div>
          
          {/* Hero Content */}
          <div className="relative z-10 pt-10 pb-16 px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto">
              {/* Small pill badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-1.5 mb-5"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="text-emerald-200 text-xs font-semibold tracking-wide">
                  {activeProjects.length} {t('activeProjects')}
                </span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-3 text-wrap-balance leading-[1.1]"
              >
                {t('democraticVoting')}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-sm sm:text-base text-emerald-100/70 mb-8 max-w-2xl mx-auto leading-relaxed text-wrap-pretty"
              >
                {t('votingDescription')}
              </motion.p>
              
              {/* Premium Stats Grid */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto"
              >
                {/* Stat Card 1 */}
                <div className="group bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10">
                  <div className="w-9 h-9 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-2.5 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Vote className="h-4.5 w-4.5 text-emerald-300" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white leading-none">
                    <AnimatedCounter end={2847} />
                  </div>
                  <div className="text-[10px] font-bold text-emerald-300/60 uppercase tracking-widest mt-1.5">{t('totalVotes')}</div>
                </div>

                {/* Stat Card 2 */}
                <div className="group bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-teal-500/10">
                  <div className="w-9 h-9 bg-teal-500/20 rounded-xl flex items-center justify-center mb-2.5 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Zap className="h-4.5 w-4.5 text-teal-300" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white leading-none">
                    <AnimatedCounter end={6} />
                  </div>
                  <div className="text-[10px] font-bold text-emerald-300/60 uppercase tracking-widest mt-1.5">{t('activeProjects')}</div>
                </div>

                {/* Stat Card 3 */}
                <div className="group bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10">
                  <div className="w-9 h-9 bg-emerald-400/20 rounded-xl flex items-center justify-center mb-2.5 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Trophy className="h-4.5 w-4.5 text-emerald-300" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white leading-none">
                    <AnimatedCounter end={12} />
                  </div>
                  <div className="text-[10px] font-bold text-emerald-300/60 uppercase tracking-widest mt-1.5">{t('completed')}</div>
                </div>

                {/* Stat Card 4 */}
                <div className="group bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-teal-500/10">
                  <div className="w-9 h-9 bg-teal-400/20 rounded-xl flex items-center justify-center mb-2.5 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Recycle className="h-4.5 w-4.5 text-teal-300" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white leading-none flex items-baseline justify-center">
                    <AnimatedCounter end={4.2} decimals={1} />
                    <span className="text-sm font-bold text-emerald-300/80 ml-0.5">M</span>
                  </div>
                  <div className="text-[10px] font-bold text-emerald-300/60 uppercase tracking-widest mt-1.5">{t('materialsRecycled')}</div>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Bottom curved edge */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
              <path d="M0 60L1440 60L1440 0C1440 0 1080 40 720 40C360 40 0 0 0 0L0 60Z" fill="white" fillOpacity="0.03" />
              <path d="M0 60L1440 60L1440 20C1440 20 1080 50 720 50C360 50 0 20 0 20L0 60Z" className="fill-slate-50" />
            </svg>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
          {/* Segmented Tab Toggles */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <div className="p-1.5 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl inline-flex items-center gap-1 shadow-lg shadow-slate-200/50">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all duration-300 ${
                  activeTab === 'active'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25'
                    : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50/50'
                }`}
              >
                <Vote className="h-4 w-4" />
                <span>{t('activeProjects')}</span>
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all duration-300 ${
                  activeTab === 'completed'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25'
                    : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50/50'
                }`}
              >
                <Trophy className="h-4 w-4" />
                <span>{t('successStories')}</span>
              </button>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === 'active' && (
              <motion.div
                key="active"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-6"
              >
                {/* Active Voting Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  {activeProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      variants={itemVariants}
                      whileHover={{ y: -6 }}
                      transition={{ duration: 0.3 }}
                      className="flex"
                    >
                      <Card className="glass-card glass-card-hover group/card rounded-3xl overflow-hidden flex flex-col w-full relative">
                        {/* Image banner with overlays */}
                        <div 
                          className="relative aspect-video w-full overflow-hidden cursor-pointer group"
                          onClick={() => setLightboxImage({ src: project.image, title: project.title })}
                        >
                          <img 
                            src={project.image} 
                            alt={project.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110" 
                            loading="lazy"
                          />
                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                          
                          <div className="absolute top-4 left-4 flex gap-2">
                            <Badge className="bg-white/95 backdrop-blur-md text-emerald-800 border-0 shadow-sm font-semibold uppercase tracking-wider text-[10px]">
                              {project.category}
                            </Badge>
                          </div>
                          <div className="absolute top-4 right-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
                            #{index + 1}
                          </div>
                          
                          {/* Bottom image stats overlay */}
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                              <MapPin className="h-3 w-3 text-white/80" />
                              <span className="text-[11px] font-semibold text-white/90">{project.location}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-emerald-600/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-400/20">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                              </span>
                              <span className="text-[11px] font-bold text-white">{t('active', { defaultValue: 'Live' })}</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Content */}
                        <CardContent className="p-6 flex flex-col justify-between flex-grow space-y-4">
                          <div className="space-y-2">
                            <h4 className="font-extrabold text-slate-800 text-lg sm:text-xl line-clamp-1">
                              {project.title}
                            </h4>
                            
                            <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                              {project.description}
                            </p>
                          </div>

                          <div className="space-y-4 pt-2">
                            {/* Votes / Target block */}
                            <div className="flex justify-between items-center bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border border-emerald-100/60 rounded-2xl p-4">
                              <div>
                                <div className="text-[10px] text-emerald-600/70 font-bold uppercase tracking-wider">{t('votes')}</div>
                                <div className="text-2xl sm:text-3xl font-black text-emerald-700 leading-none mt-1">
                                  {project.currentVotes.toLocaleString()}
                                </div>
                              </div>
                              <div className="w-px h-10 bg-emerald-200/50" />
                              <div className="text-right">
                                <div className="text-[10px] text-emerald-600/70 font-bold uppercase tracking-wider">{t('targetVotes', { defaultValue: 'Target' })}</div>
                                <div className="text-sm font-bold text-emerald-600/80 mt-1">
                                  {project.totalVotes.toLocaleString()}
                                </div>
                              </div>
                            </div>

                            {/* Progress bars */}
                            <div className="space-y-3">
                              {/* Voting Progress */}
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-xs font-bold text-slate-600">
                                  <span className="flex items-center gap-1">
                                    <Trophy className="h-3.5 w-3.5 text-emerald-500" />
                                    {t('communitySupport')}
                                  </span>
                                  <span className="text-emerald-600 font-black">
                                    {((project.currentVotes / project.totalVotes) * 100).toFixed(1)}%
                                  </span>
                                </div>
                                <Progress 
                                  value={(project.currentVotes / project.totalVotes) * 100} 
                                  className="h-2 bg-emerald-100/60 rounded-full"
                                />
                              </div>

                              {/* Funding Progress */}
                              {project.donationTarget && project.donationRaised && (
                                <div className="space-y-1.5">
                                  <div className="flex justify-between text-xs font-bold text-slate-600">
                                    <span className="flex items-center gap-1">
                                      <Target className="h-3.5 w-3.5 text-teal-500" />
                                      {t('fundingProgress')}
                                    </span>
                                    <span className="text-teal-600 font-black">
                                      {formatCurrency(project.donationRaised)} / {formatCurrency(project.donationTarget)}
                                    </span>
                                  </div>
                                  <Progress 
                                    value={(project.donationRaised / project.donationTarget) * 100} 
                                    className="h-2 bg-teal-100/60 rounded-full"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Materials and deadline */}
                            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                              <div className="flex items-center text-slate-600 bg-slate-50/70 border border-slate-100 rounded-xl p-2.5">
                                <Calendar className="h-4 w-4 mr-2 text-amber-500 flex-shrink-0" />
                                <span>{t('deadline')}: {project.deadline.toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center text-slate-600 bg-slate-50/70 border border-slate-100 rounded-xl p-2.5">
                                <Users className="h-4 w-4 mr-2 text-emerald-500 flex-shrink-0" />
                                <span>{project.requiredMaterials}kg {t('materialsNeeded')}</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2">
                              <Button 
                                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 shadow-md hover:shadow-lg transition-all duration-300 text-xs sm:text-sm rounded-xl"
                                onClick={async () => {
                                  if (!IS_BACKEND_AVAILABLE) {
                                    toast.info(t('backendUnavailable', { defaultValue: 'Backend is offline, showing demo data.' }));
                                    return;
                                  }
                                  try {
                                    await apiClient.voteForProject(project.id);
                                    toast.success(t('voteRecorded', { defaultValue: 'Your vote has been recorded!' }));
                                    // Refresh projects to get updated vote count
                                    const status = activeTab === 'active' ? 'ACTIVE' : 'COMPLETED';
                                    const updatedProjects = await apiClient.getProjects(status, 'votes');
                                    if (updatedProjects && Array.isArray(updatedProjects) && updatedProjects.length > 0) {
                                      const transformedProjects: VotingProject[] = updatedProjects.map((p: Record<string, unknown>) => {
                                        const backendProject = p as unknown as BackendProject;
                                        return {
                                        id: backendProject.id || '',
                                        title: backendProject.title || '',
                                        description: backendProject.description || '',
                                        image: backendProject.imageUrl || '🏫',
                                        location: backendProject.district || backendProject.location || '',
                                        category: backendProject.category || 'general',
                                        status: backendProject.status?.toLowerCase() || 'active',
                                        currentVotes: backendProject.voteCount || 0,
                                        totalVotes: backendProject.targetVotes || 1000,
                                        deadline: backendProject.endDate ? new Date(backendProject.endDate) : new Date(),
                                        requiredMaterials: backendProject.materialsRequiredKg || 0,
                                        donationTarget: backendProject.budgetRequired || 0,
                                        donationRaised: backendProject.fundsRaised || 0,
                                        };
                                      });
                                      setProjects(transformedProjects);
                                    }
                                  } catch (error: unknown) {
                                    const message = error instanceof Error ? error.message : String(error);
                                    toast.error(message || t('voteError') || 'Failed to submit vote');
                                  }
                                }}
                              >
                                <Vote className="h-4 w-4 mr-1.5" />
                                {t('voteNow')}
                              </Button>
                              
                              <Button 
                                variant="outline" 
                                className="flex-1 border border-emerald-600/30 text-emerald-700 hover:bg-emerald-50/50 font-bold py-3.5 shadow-sm transition-all duration-300 text-xs sm:text-sm rounded-xl"
                                onClick={() => {
                                  setSelectedProjectForDonation(project);
                                  setDonationDialogOpen(true);
                                }}
                              >
                                <DollarSign className="h-4 w-4 mr-1.5" />
                                {t('donate')}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'completed' && (
              <motion.div
                key="completed"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-6"
              >
                {/* Success Stories Header */}
                <div className="glass-card flex items-center justify-between rounded-2xl px-5 py-3">
                  <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                    <Trophy className="h-4.5 w-4.5 text-emerald-600 animate-pulse" />
                    <span>{t('successStories')}</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-bold bg-white px-2.5 py-1 rounded-full border border-slate-100 shadow-sm">{completedProjects.length} {t('completed')}</span>
                </div>

                {/* Completed Projects list */}
                <div className="space-y-6">
                  {completedProjects.map((project) => (
                    <CompletedProjectCard key={project.id} project={project} setLightboxImage={setLightboxImage} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* How It Works Section */}
          <motion.div
            variants={itemVariants}
          >
            <Card className="glass-card border rounded-3xl overflow-hidden shadow-sm shadow-slate-200/30">
              <CardHeader className="pb-2 px-6 pt-6">
                <CardTitle className="text-slate-800 text-xl sm:text-2xl font-extrabold flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/20">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  {t('howVotingWorks')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { step: '01', text: t('votingStep1'), icon: Vote, gradient: 'from-emerald-500 to-emerald-600' },
                    { step: '02', text: t('votingStep2'), icon: Users, gradient: 'from-teal-500 to-teal-600' },
                    { step: '03', text: t('votingStep3'), icon: Trophy, gradient: 'from-emerald-600 to-teal-600' },
                    { step: '04', text: t('votingStep4'), icon: Target, gradient: 'from-teal-500 to-emerald-600' },
                    { step: '05', text: t('votingStep5'), icon: CheckCircle, gradient: 'from-emerald-500 to-teal-500' }
                  ].map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <motion.div
                        key={index}
                        whileHover={{ y: -6, scale: 1.02 }}
                        className="glass-card glass-card-hover group p-5 rounded-2xl relative flex flex-col justify-between"
                      >
                        <div className={`absolute top-4 right-4 text-3xl font-black bg-gradient-to-br ${item.gradient} bg-clip-text text-transparent opacity-20 select-none group-hover:opacity-40 transition-opacity duration-300`}>
                          {item.step}
                        </div>
                        <div className="space-y-4">
                          <div className={`w-10 h-10 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/15 group-hover:scale-110 transition-transform duration-300`}>
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 font-semibold leading-relaxed">{item.text}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Call to Action Block */}
          <motion.div
            variants={itemVariants}
          >
            <Card className="relative overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white shadow-2xl">
              {/* Subtle light flares */}
              <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
              
              <CardContent className="relative z-10 p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-3xl mx-auto space-y-6">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shadow-inner">
                  <Vote className="w-6 h-6 text-emerald-400" />
                </div>
                
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                  {t('makeVoiceHeard')}
                </h3>
                
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {t('everyVoteHelps')}
                </p>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-sm sm:text-base px-8 py-5 sm:py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => {
                      setActiveTab('active');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <Vote className="h-5 w-5 mr-2" />
                    {t('viewAllProjects')}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Donation Dialog */}
        <DonationDialog
          open={donationDialogOpen}
          onOpenChange={setDonationDialogOpen}
          projectTitle={selectedProjectForDonation ? getTranslatedTitle(selectedProjectForDonation) : ''}
        />

        {/* Image Lightbox Dialog */}
        <Dialog open={!!lightboxImage} onOpenChange={(open) => !open && setLightboxImage(null)}>
          <DialogContent className="w-auto sm:w-fit max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[1200px] p-2 bg-black/95 border border-white/10 overflow-hidden rounded-2xl">
            <DialogTitle className="sr-only">{t('projectImagePreview', { defaultValue: 'Project Image Preview' })}</DialogTitle>
            <div className="relative w-full h-full max-h-[88vh] flex items-center justify-center p-2 group/lightbox">
              {lightboxImage && (
                <img 
                  src={lightboxImage.src} 
                  alt={lightboxImage.title} 
                  className="w-auto h-auto max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl transition-all duration-300" 
                />
              )}

              {/* Navigation Arrows */}
              {lightboxImage?.images && lightboxImage.images.length > 1 && lightboxImage.activeIndex !== undefined && (
                <>
                  {/* Left Arrow */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newIndex = (lightboxImage.activeIndex! - 1 + lightboxImage.images!.length) % lightboxImage.images!.length;
                      const newSrc = lightboxImage.images![newIndex];
                      const isBefore = newSrc.includes('before');
                      const newTitle = lightboxImage.title.split(' - ')[0].split(' (')[0] + 
                        (isBefore ? ` (${t('before', { defaultValue: 'Before' })})` : ` (${t('after', { defaultValue: 'After' })})`);
                      setLightboxImage({
                        ...lightboxImage,
                        src: newSrc,
                        activeIndex: newIndex,
                        title: newTitle
                      });
                    }}
                    className="absolute left-6 z-50 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white/85 hover:text-white flex items-center justify-center border border-white/10 transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    aria-label={t('previousImage', { defaultValue: 'Previous image' })}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>

                  {/* Right Arrow */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newIndex = (lightboxImage.activeIndex! + 1) % lightboxImage.images!.length;
                      const newSrc = lightboxImage.images![newIndex];
                      const isBefore = newSrc.includes('before');
                      const newTitle = lightboxImage.title.split(' - ')[0].split(' (')[0] + 
                        (isBefore ? ` (${t('before', { defaultValue: 'Before' })})` : ` (${t('after', { defaultValue: 'After' })})`);
                      setLightboxImage({
                        ...lightboxImage,
                        src: newSrc,
                        activeIndex: newIndex,
                        title: newTitle
                      });
                    }}
                    className="absolute right-6 z-50 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white/85 hover:text-white flex items-center justify-center border border-white/10 transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    aria-label={t('nextImage', { defaultValue: 'Next image' })}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-xl text-center text-sm font-semibold border border-white/10">
                {lightboxImage?.title}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

export default EcoVote;