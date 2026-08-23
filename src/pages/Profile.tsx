import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useSEO } from '@/hooks/useSEO';
import { apiClient, IS_BACKEND_AVAILABLE } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { 
  Settings, 
  Coins, 
  Star, 
  Trophy, 
  Crown,
  MapPin,
  School,
  Gift,
  ShoppingBag,
  TrendingUp,
  Share2,
  Target,
  Medal,
  Zap,
  Wallet,
  Award,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Heart,
  MessageCircle,
  Users,
  Calendar,
  Recycle,
  Vote,
  Share,
  UserPlus,
  Sparkles,
  Flame,
  Leaf,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  CheckCircle,
  TrendingDown,
  Percent,
  Tag,
  Coffee,
  Car,
  Utensils,
  ShirtIcon,
  Info,
  ChevronUp,
  ChevronDown,
  Camera,
  CircleDollarSign,
  BadgeCheck,
  Globe,
  Lock,
  LogOut,
  Palette,
  Mail
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import Layout from '@/components/Layout';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { USER_DATA, calculateLevel, calculateLevelProgress, formatWasteAmount } from '@/lib/userData';
import { getUserNameData, saveUserName } from '@/utils/userName';
import { EnhancedAvatar } from '@/components/ui/enhanced-avatar';
import { EnhancedAvatarSystem } from '@/components/ui/enhanced-avatar-system';
import { 
  UserProgress, AZIZA_PROGRESS, PROFILE_FRAMES, PROFILE_BACKGROUNDS,
  loadUserProgress, saveUserProgress, calculateLevelProgress as calcLevelProgress
} from '@/lib/userProgress';
import { getAvatarImage } from '@/lib/avatarImages';

// Enhanced animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  }
};



const progressVariants = {
  initial: { width: 0 },
  animate: (progress: number) => ({
    width: `${progress}%`,
    transition: {
      duration: 1.5,
      ease: "easeOut"
    }
  })
};

// Improved mobile-friendly animation variants for level benefits with better readability and performance
const levelBenefitsVariants = {
  hidden: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.12,
      type: "tween",
      ease: "easeOut"
    }
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.18,
      type: "tween",
      ease: "easeOut",
      staggerChildren: 0.02
    }
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.12,
      type: "tween",
      ease: "easeIn"
    }
  }
};

const benefitItemVariants = {
  hidden: { 
    opacity: 0, 
    y: -4,
    transition: { 
      duration: 0.1,
      type: "tween",
      ease: "easeOut"
    }
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.12,
      type: "tween",
      ease: "easeOut"
    }
  }
};

// Name Change Section Component
const NameChangeSection: React.FC<{ onNameUpdated: () => void; t: TFunction }> = ({ onNameUpdated, t }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    const nameData = getUserNameData();
    setFirstName(nameData.firstName);
    setLastName(nameData.lastName);
  }, []);

  return (
    <div className="space-y-4 pb-4 border-b">
      <h3 className="text-sm font-semibold">
        {t('changeName', { ns: 'profile', defaultValue: 'Change Your Name' })}
      </h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="profile-firstName" className="text-sm font-medium">
            {t('welcome.firstName', { defaultValue: 'First Name' })} 
            <span className="text-gray-400 text-xs ml-1">({t('welcome.optional', { defaultValue: 'optional' })})</span>
          </Label>
          <Input
            id="profile-firstName"
            type="text"
            placeholder={t('welcome.firstNamePlaceholder', { defaultValue: 'Enter your first name' })}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-lastName" className="text-sm font-medium">
            {t('welcome.lastName', { defaultValue: 'Last Name' })} 
            <span className="text-gray-400 text-xs ml-1">({t('welcome.optional', { defaultValue: 'optional' })})</span>
          </Label>
          <Input
            id="profile-lastName"
            type="text"
            placeholder={t('welcome.lastNamePlaceholder', { defaultValue: 'Enter your last name' })}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="h-11"
          />
        </div>

        <Button
          onClick={() => {
            if (!firstName.trim() && !lastName.trim()) {
              toast.error(t('nameRequired', { ns: 'profile', defaultValue: 'Please enter at least a first name' }));
              return;
            }

            // Save exactly what user entered - no defaults
            // If only first name is provided, lastName will be empty string (no default last name added)
            saveUserName(firstName.trim() || '', lastName.trim() || '');
            onNameUpdated();
          }}
        >
          {t('saveName', { ns: 'profile', defaultValue: 'Save Name' })}
        </Button>
      </div>
    </div>
  );
};

// ─── AUTH SCREEN FOR SIGN IN / REGISTER ───
const AuthScreen: React.FC<{ onLoginSuccess: () => void; onSkip?: () => void }> = ({ onLoginSuccess, onSkip }) => {
  const { t } = useTranslation();
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      if (isSupabaseConfigured() && supabase) {
        console.log('[Auth] Redirecting to Google OAuth...');
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin + '/profile'
          }
        });
        if (error) throw error;
      } else {
        // Mock Google sign in
        console.log('[Auth] Supabase not configured. Mocking Google sign in.');
        toast.info(t('googleSignInDemo', { defaultValue: 'Google OAuth simulation active in Demo mode.' }));
        // Simulate login success by reloading user data
        localStorage.setItem('accessToken', 'mock_google_token');
        onLoginSuccess();
      }
    } catch (err: any) {
      toast.error(err.message || 'Google authentication failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t('fillRequired', { defaultValue: 'Please fill in all required fields' }));
      return;
    }
    setSubmitting(true);
    try {
      if (authTab === 'signin') {
        const res = await login({ email, password });
        if (res.success) {
          toast.success(t('welcomeBack', { defaultValue: 'Welcome back!' }));
          onLoginSuccess();
        } else {
          toast.error(res.error || 'Invalid credentials');
        }
      } else {
        if (!firstName) {
          toast.error(t('firstNameRequired', { defaultValue: 'First name is required' }));
          setSubmitting(false);
          return;
        }
        const res = await register({ email, password, firstName, lastName });
        if (res.success) {
          toast.success(t('accountCreated', { defaultValue: 'Account created successfully!' }));
          onLoginSuccess();
        } else {
          toast.error(res.error || 'Failed to create account');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-emerald-50/15">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 text-left space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto">
            <Leaf className="h-6 w-6 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            {authTab === 'signin' ? t('welcomeBack', { defaultValue: 'Welcome Back' }) : t('createAccount', { defaultValue: 'Create Account' })}
          </h2>
          <p className="text-slate-500 text-xs">
            {authTab === 'signin' ? t('signInToSync', { defaultValue: 'Sign in to access your EcoWallet and sync scans.' }) : t('joinEcosystem', { defaultValue: 'Join ZAMINAT and start earning points today.' })}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setAuthTab('signin')}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
              authTab === 'signin' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
            )}
          >
            {t('signIn', { defaultValue: 'Sign In' })}
          </button>
          <button
            onClick={() => setAuthTab('signup')}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
              authTab === 'signup' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
            )}
          >
            {t('register', { defaultValue: 'Register' })}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {authTab === 'signup' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="firstName" className="text-xs font-semibold text-slate-700">{t('welcome.firstName', { defaultValue: 'First Name' })}</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Suxrob"
                  className="h-11 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName" className="text-xs font-semibold text-slate-700">{t('welcome.lastName', { defaultValue: 'Last Name' })}</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Rustamov"
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs font-semibold text-slate-700">{t('email', { defaultValue: 'Email Address' })}</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="eco@zaminat.local"
                className="h-11 pl-10 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="text-xs font-semibold text-slate-700">{t('password', { defaultValue: 'Password' })}</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 pl-10 rounded-xl"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-500/10 active:scale-95 transition-all"
          >
            {submitting ? (
              <div className="animate-spin rounded-full h-4.5 w-4.5 border-b-2 border-white"></div>
            ) : (
              authTab === 'signin' ? t('signIn', { defaultValue: 'Sign In' }) : t('createAccount', { defaultValue: 'Create Account' })
            )}
          </Button>
        </form>

        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <span className="relative px-3 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">
            {t('or', { defaultValue: 'OR' })}
          </span>
        </div>

        {/* Google Sign In Button */}
        <Button
          onClick={handleGoogleSignIn}
          variant="outline"
          className="w-full h-11 rounded-xl border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2.5 text-slate-700 active:scale-95 transition-all"
        >
          <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="font-bold text-xs">{t('continueWithGoogle', { defaultValue: 'Continue with Google' })}</span>
        </Button>

        {onSkip && (
          <Button
            onClick={onSkip}
            variant="ghost"
            className="w-full h-11 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50/50 flex items-center justify-center gap-1.5 active:scale-95 transition-all mt-3 border border-dashed border-slate-200"
          >
            <span className="font-bold text-xs">{t('skipToDemo', { defaultValue: 'Skip to see Demo Stats' })} →</span>
          </Button>
        )}
      </motion.div>
    </div>
  );
};

const Profile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();

  useSEO({
    title: t('profileTitle', { defaultValue: 'My Profile' }),
    description: 'Personal eco stats, token balance, and impact dashboard',
    noindex: true,
  });

  const { user, isAuthenticated, loading: authLoading, logout, login, register, checkAuth } = useAuth();
  
  // Load user progress from localStorage or use default
  const [userProgress, setUserProgress] = useState<UserProgress>(() => loadUserProgress());
  const [activeTab, setActiveTab] = useState('wallet');
  const [levelExpanded, setLevelExpanded] = useState(false);
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const touchHandledRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [forceGuestMode, setForceGuestMode] = useState(() => localStorage.getItem('forceGuestMode') === 'true');

  // Backend sync is completely optional and non-blocking
  useEffect(() => {
    // Always use localStorage first (works offline, no backend needed)
    const savedProgress = loadUserProgress();
    setUserProgress(savedProgress);
    setLoading(false);


    if (IS_BACKEND_AVAILABLE && isAuthenticated && user) {
      // Run in background, don't wait for it
      apiClient.getUserProfile()
        .then((userData) => {
          // Only update if backend data is available
          if (userData?.profile) {
            setUserProgress(prev => ({
              ...prev,
              // Keep localStorage name (user's choice), only sync points/coins if available
              ecoPoints: userData.profile.ecoPoints ?? prev.ecoPoints,
              ecoCoins: userData.profile.ecoCoins ?? prev.ecoCoins,
              level: userData.profile.level ?? prev.level,
            }));
          }
        })
        .catch(() => {
          // Silently fail - localStorage data is already loaded and working
          // No error needed, app works fine without backend
        });
    }
  }, [isAuthenticated, user]);

  if (IS_BACKEND_AVAILABLE && authLoading) {
    return (
      <Layout title={t('profile')}>
        <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-50 to-emerald-50/20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="text-slate-400 text-sm font-semibold">{t('loading', { defaultValue: 'Syncing session...' })}</p>
        </div>
      </Layout>
    );
  }

  if (IS_BACKEND_AVAILABLE && !isAuthenticated && !forceGuestMode) {
    return (
      <Layout title={t('profile')}>
        <AuthScreen 
          onLoginSuccess={checkAuth} 
          onSkip={() => {
            setForceGuestMode(true);
            localStorage.setItem('forceGuestMode', 'true');
          }}
        />
      </Layout>
    );
  }

  // Calculate level progress
  const { progress: levelProgress, pointsToNext } = calcLevelProgress(userProgress.ecoPoints, userProgress.level);
  const wasteFormatted = formatWasteAmount(userProgress.wasteCollected);

  // Get current profile frame and background
  const currentFrame = PROFILE_FRAMES[userProgress.profileFrame] || PROFILE_FRAMES.default;
  const currentBackground = PROFILE_BACKGROUNDS[userProgress.profileBackground] || PROFILE_BACKGROUNDS.default;

  // Mock data with translated text
  const mockBadges = [
    { id: 1, name: t('firstCollection'), icon: '🏆', unlocked: true, description: t('firstCollectionDesc') },
    { id: 2, name: t('treePlanter'), icon: '🌳', unlocked: true, description: t('treePlanterDesc') },
    { id: 3, name: t('communityHero'), icon: '👥', unlocked: true, description: t('communityHeroDesc') },
    { id: 4, name: t('energyMaster'), icon: '⚡', unlocked: true, description: t('energyMasterDesc') },
    { id: 5, name: t('waterGuardian'), icon: '💧', unlocked: true, description: t('waterGuardianDesc') },
    { id: 6, name: t('streakChampion'), icon: '🔥', unlocked: true, description: t('streakChampionDesc') },
    { id: 7, name: t('communityBuilder'), icon: '🤝', unlocked: true, description: t('communityBuilderDesc') },
    { id: 8, name: t('ecoChampion'), icon: '🌟', unlocked: true, description: t('ecoChampionDesc') }
  ];

  // Leaderboard sorted by actual points (descending)
  const leaderboardData = [
    { 
      rank: 1, 
      name: userProgress.name, 
      points: userProgress.ecoPoints, 
      avatar: userProgress.activeAvatar,
      isCurrentUser: true
    },
    { rank: 2, name: 'Sardor Umarov', points: 13500, avatar: '🦸‍♂️', isCurrentUser: false },
    { rank: 3, name: 'Bobur Rahimov', points: 12800, avatar: '👨‍🎓', isCurrentUser: false },
    { rank: 4, name: 'Malika Tursunova', points: 11200, avatar: '👩‍🏫', isCurrentUser: false },
    { rank: 5, name: 'Jasur Karimov', points: 9600, avatar: '👨‍💻', isCurrentUser: false },
    { rank: 6, name: 'Dilnoza Saidova', points: 8800, avatar: '👩‍🎓', isCurrentUser: false },
    { rank: 7, name: 'Eldor Tursunov', points: 8200, avatar: '👨‍🔬', isCurrentUser: false },
    { rank: 8, name: 'Feruza Nazarova', points: 7900, avatar: '👩‍💻', isCurrentUser: false },
    { rank: 9, name: 'Hasan Yusupov', points: 7500, avatar: '👨‍🌾', isCurrentUser: false },
    { rank: 10, name: 'Iroda Toshmatova', points: 7100, avatar: '👩‍⚕️', isCurrentUser: false }
  ];

  // Keep old mockLeaderboard for backward compatibility
  const mockLeaderboard = leaderboardData;

  const REWARDS_DATA = [
    {
      id: 1,
      emoji: "🌳",
      image: "/images/plant-a-tree_6675353.webp",
      title: t('plantTree'),
      description: t('plantTreeDesc'),
      coins: 50
    },
    {
      id: 2,
      emoji: "🎁",
      image: "/images/Children's Souvenirs.webp",
      title: t('childrenSouvenirs'),
      description: t('childrenSouvenirsDesc'),
      coins: 75
    },
    {
      id: 3,
      emoji: "🏠",
      image: "/images/Home Decor Set.webp",
      title: t('homeDecorSet'),
      description: t('homeDecorSetDesc'),
      coins: 150
    },
    {
      id: 4,
      emoji: "📚",
      image: "/images/Eco Education Kit.webp",
      title: t('ecoEducationKit'),
      description: t('ecoEducationKitDesc'),
      coins: 100
    }
  ];

  // Realistic partner offers for Tashkent, Uzbekistan
  const PARTNER_OFFERS = [
    {
      id: 1,
      partner: t('carrefourTashkent'),
      discount: "15%",
      description: t('carrefourDesc'),
      minCoins: 30,
      icon: ShoppingBag,
      color: "green"
    },
    {
      id: 2,
      partner: t('yandexTaxi'),
      discount: "20%",
      description: t('yandexTaxiDesc'),
      minCoins: 25,
      icon: Car,
      color: "yellow"
    },
    {
      id: 3,
      partner: t('coffeeBeanCafe'),
      discount: "10%",
      description: t('coffeeBeanDesc'),
      minCoins: 15,
      icon: Coffee,
      color: "brown"
    },
    {
      id: 4,
      partner: t('samarkandDarvoza'),
      discount: "25%",
      description: t('samarkandDesc'),
      minCoins: 40,
      icon: Utensils,
      color: "orange"
    },
    {
      id: 5,
      partner: t('korzinkaUz'),
      discount: "12%",
      description: t('korzinkaDesc'),
      minCoins: 20,
      icon: ShoppingBag,
      color: "blue"
    },
    {
      id: 6,
      partner: t('uzbekistanAirways'),
      discount: "5%",
      description: t('uzbekistanAirwaysDesc'),
      minCoins: 100,
      icon: Target,
      color: "sky"
    }
  ];

  // Analytics mock data
  const analyticsData = {
    weeklyEngagement: [
      { day: 'Mon', actions: 3, streak: 1 },
      { day: 'Tue', actions: 5, streak: 2 },
      { day: 'Wed', actions: 2, streak: 3 },
      { day: 'Thu', actions: 7, streak: 4 },
      { day: 'Fri', actions: 4, streak: 5 },
      { day: 'Sat', actions: 8, streak: 6 },
      { day: 'Sun', actions: 6, streak: 7 }
    ],
    monthlyStats: {
      totalWaste: 85.5,
      totalPoints: 14400,
      eventsAttended: 12,
      treesPlanted: 15,
      referrals: 5
    },
    achievements: {
      thisMonth: 3,
      total: 12,
      nextGoal: t('climateHero')
    },
    impact: {
      wasteCollected: 85.5, // kg - realistic based on user activity
      eventsAttended: 12,
      treesPlanted: 15,
      friendsReferred: 5
    }
  };

  const handleAvatarSelect = (emoji: string) => {
    const updatedProgress = {
      ...userProgress,
      activeAvatar: emoji
    };
    setUserProgress(updatedProgress);
    saveUserProgress(updatedProgress);
  };

  const handleProgressUpdate = (newProgress: UserProgress) => {
    setUserProgress(newProgress);
  };

  const RewardCard: React.FC<{ reward: typeof REWARDS_DATA[0] }> = ({ reward }) => {
    const isAvailable = userProgress.ecoCoins >= reward.coins;
    const progress = Math.min((userProgress.ecoCoins / reward.coins) * 100, 100);

    return (
      <motion.div
        whileHover={isMobile ? {} : { scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="cursor-pointer"
      >
        <Card className={cn(
          "transition-all duration-300 group h-full border-2",
          isMobile ? "" : "hover:shadow-lg hover:border-green-200"
        )}>
          <CardContent className={cn("text-center", isMobile ? "p-2 space-y-2" : "p-3 sm:p-4 space-y-3")}>
            <motion.div 
              className={cn("inline-block transition-transform duration-300", isMobile ? "" : "group-hover:scale-110")}
              whileHover={isMobile ? {} : { rotate: [0, -10, 10, 0] }}
            >
              <img 
                src={reward.image || reward.emoji} 
                alt={reward.title} 
                className={cn(
                  "object-contain",
                  isMobile ? "w-8 h-8" : "w-10 h-10 sm:w-12 sm:h-12"
                )} 
                loading="lazy" 
              />
            </motion.div>
            <div>
              <h4 className={cn("font-medium", isMobile ? "text-xs" : "text-sm sm:text-base")}>
                {reward.title}
              </h4>
              <p className={cn("text-gray-600 mt-1 line-clamp-2", isMobile ? "text-[10px]" : "text-xs")}>
                {reward.description}
              </p>
            </div>
            <div className={cn(isMobile ? "space-y-1.5" : "space-y-2")}>
              <div className={cn("flex items-center justify-between", isMobile ? "text-[10px]" : "text-xs")}>
                <span className="text-gray-500">{t('progress')}</span>
                <span className={cn("flex items-center gap-1", isAvailable ? 'text-green-600' : 'text-orange-600')}>
                  {userProgress.ecoCoins}/{reward.coins} <img src="/images/eco coins.webp" alt="eco coins" className={cn("inline-block", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                </span>
              </div>
              <Progress value={progress} className={cn(isMobile ? "h-1.5" : "h-2")} />
              <div className={cn("font-bold text-green-600 flex items-center gap-1", isMobile ? "text-xs" : "text-sm")}>
                {reward.coins} <img src="/images/eco coins.webp" alt="eco coins" className={cn("inline-block", isMobile ? "h-3 w-3" : "h-4 w-4")} />
              </div>
              <Button 
                className={cn(
                  "w-full transition-all duration-300",
                  isMobile ? "h-10 text-xs min-h-[44px]" : "h-9 text-xs"
                )} 
                disabled={!isAvailable}
                variant={isAvailable ? "default" : "secondary"}
                onClick={() => {
                  if (isAvailable) {
                    const updatedProgress = {
                      ...userProgress,
                      ecoCoins: userProgress.ecoCoins - reward.coins
                    };
                    setUserProgress(updatedProgress);
                    saveUserProgress(updatedProgress);
                  }
                }}
                style={{ touchAction: 'manipulation' }}
              >
                {isAvailable ? t('redeemNow') : t('needMoreCoins')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const PartnerOfferCard: React.FC<{ offer: typeof PARTNER_OFFERS[0] }> = ({ offer }) => {
    const isAvailable = userProgress.ecoCoins >= offer.minCoins;
    const IconComponent = offer.icon;

    return (
      <div className="cursor-pointer">
        <Card className={`hover:shadow-xl transition-all duration-400 group h-full border-2 ${
          isAvailable 
            ? 'border-green-200 bg-gradient-to-br from-green-50 to-white hover:border-green-300' 
            : 'border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:border-gray-300'
        }`}>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div
                className={`p-3 rounded-full ${
                  isAvailable ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                } transition-all duration-300`}
              >
                <IconComponent className="h-5 w-5" />
              </div>
              <div className="text-right">
                <Badge 
                  variant={isAvailable ? "default" : "secondary"} 
                  className={`text-sm font-bold ${
                    isAvailable 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {offer.discount} {t('off')}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-bold text-base text-gray-900 group-hover:text-green-700 transition-colors">
                {offer.partner}
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">{offer.description}</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-medium">{t('required')}:</span>
                <span className={cn("font-bold flex items-center gap-1", isAvailable ? 'text-green-600' : 'text-red-500')}>
                  {offer.minCoins} <img src="/images/eco coins.webp" alt="eco coins" className="h-4 w-4 inline-block" />
                </span>
              </div>
              
              <div>
                <Button 
                  className={`w-full h-10 text-sm font-semibold transition-all duration-300 ${
                    isAvailable 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl' 
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  }`}
                  disabled={!isAvailable}
                >
                  {isAvailable ? (
                    <>
                      <Gift className="h-4 w-4 mr-2" />
                      {t('claimDiscount')}
                    </>
                  ) : (
                    <>
                      <Coins className="h-4 w-4 mr-2" />
                      {t('need')} {offer.minCoins - userProgress.ecoCoins} {t('more')} <img src="/images/eco coins.webp" alt="eco coins" className="h-4 w-4 inline-block ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const BadgeCard: React.FC<{ badge: typeof mockBadges[0] }> = ({ badge }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
      <Card className={`${badge.unlocked ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' : 'bg-gray-50 border-gray-200'} hover:shadow-md transition-all duration-300 h-full`}>
        <CardContent className="p-3 sm:p-4 text-center">
          <div 
            className={`text-2xl sm:text-3xl mb-2 ${!badge.unlocked ? 'grayscale opacity-50' : ''}`}
          >
            {badge.icon}
          </div>
          <h4 className={`font-semibold text-sm sm:text-base mb-1 ${badge.unlocked ? 'text-yellow-800' : 'text-gray-500'}`}>
            {badge.name}
          </h4>
          <p className={`text-xs ${badge.unlocked ? 'text-yellow-600' : 'text-gray-400'}`}>
            {badge.description}
          </p>
          {badge.unlocked && (
            <Badge className="mt-2 bg-yellow-100 text-yellow-800 text-xs">
              {t('unlocked')}
            </Badge>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  // FIXED: Enhanced mobile-responsive WeeklyEngagementChart with proper text handling
  const WeeklyEngagementChart: React.FC = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">{t('dailyEngagementStreak')}</h4>
        <Badge variant="outline" className="text-xs bg-gradient-to-r from-orange-100 to-red-100 border-orange-300">
          <Flame className="h-3 w-3 mr-1 text-orange-500" />
          {userProgress.streakDays} {t('dayStreak')}
        </Badge>
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {analyticsData.weeklyEngagement.map((day, index) => {
          const maxActions = Math.max(...analyticsData.weeklyEngagement.map(d => d.actions));
          const height = (day.actions / maxActions) * 100;
          
          return (
            <motion.div 
              key={day.day} 
              className="flex flex-col items-center space-y-1"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: index * 0.03,
                duration: 0.12,
                type: "tween",
                ease: "easeOut"
              }}
              style={{ willChange: 'transform, opacity' }}
            >
              <div className="text-xs text-gray-500 font-medium">{day.day}</div>
              <div className="w-6 h-16 bg-gray-100 rounded-sm relative overflow-hidden">
                <motion.div 
                  className="absolute bottom-0 w-full bg-gradient-to-t from-orange-500 to-yellow-400 rounded-sm"
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
              </div>
              {/* FIXED: Better mobile text layout with responsive sizing and word wrapping */}
              <div className="text-xs font-semibold text-orange-600 text-center leading-tight">
                <div>{day.actions}</div>
                <div className="text-[10px] sm:text-xs break-words">{t('actions')}</div>
              </div>
              <div className="text-xs text-gray-400 text-center leading-tight">
                <div className="text-[10px] sm:text-xs">{t('day')} {day.streak}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-600">
          <Flame className="h-4 w-4 inline mr-1 text-orange-500" />
          {t('youreOnStreak')} {userProgress.streakDays}-{t('dayStreak')}! {t('keepItUpStreak')}
        </p>
      </div>
    </div>
  );

  const ImpactMetrics: React.FC = () => (
    <div className="grid grid-cols-2 gap-4">
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardContent className="p-5 text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-green-100 border border-green-200 flex items-center justify-center">
            <Recycle className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-700">{userProgress.wasteCollected}kg</div>
          <div className="text-xs font-medium text-green-600">{t('wasteCollected', { ns: 'profile' })}</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
        <CardContent className="p-5 text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-teal-100 border border-teal-200 flex items-center justify-center">
            <Leaf className="w-6 h-6 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-teal-700">{userProgress.treesPlanted}</div>
          <div className="text-xs font-medium text-teal-600">{t('treesPlanted', { ns: 'profile' })}</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-sky-50 to-sky-100 border-sky-200">
        <CardContent className="p-5 text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-sky-700">{userProgress.eventsAttended}</div>
          <div className="text-xs font-medium text-sky-600">{t('eventsAttended', { ns: 'profile' })}</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
        <CardContent className="p-5 text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center">
            <Users className="w-6 h-6 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700">{userProgress.referrals}</div>
          <div className="text-xs font-medium text-amber-600">{t('friendsReferred', { ns: 'profile' })}</div>
        </CardContent>
      </Card>
    </div>
  );

  const ReferralSection: React.FC = () => (
    <Card className="glass-card border border-white/40 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-base sm:text-lg">
          <UserPlus className="h-5 w-5 mr-2 text-green-600" />
          {t('referralProgram')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl">
          <h3 className="text-lg font-bold text-gray-800 mb-2">{t('youveReferred')} {userProgress.referrals} {t('friendsSoFar')}</h3>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">50</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <img src="/images/eco coins.webp" alt="eco coins" className="h-4 w-4 inline-block" /> {t('perReferral')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">{userProgress.referrals * 50}</div>
              <div className="text-sm text-gray-600">{t('totalEarned')}</div>
            </div>
          </div>
        </div>
        <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold">
          <Share2 className="h-4 w-4 mr-2" />
          {t('shareReferralLink')}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Layout title={t('profile')}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-blue-50/30 relative overflow-hidden">


        <div className={cn(
          "w-full py-4 sm:py-6",
          isMobile ? "px-2" : "px-3 sm:px-4 md:px-6 lg:px-8"
        )}>
          <motion.div 
            className={cn(
              "space-y-4 sm:space-y-6",
              isMobile && "space-y-3"
            )}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Enhanced Profile Header with Dynamic Background */}
            <motion.div variants={itemVariants}>
              <Card 
                className="text-white overflow-hidden relative shadow-xl border-0"
                style={{
                  background: currentBackground.gradient || `linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #2563eb 100%)`
                }}
              >
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-black/10" />
                
                <CardContent className={cn("relative z-10", isMobile ? "p-2" : "p-4 sm:p-6 lg:p-8")}>

                  <div className={cn("flex flex-col sm:flex-row sm:items-start sm:justify-between", isMobile ? "mb-2" : "mb-4 sm:mb-6")}>
                    <div className={cn("flex items-center sm:mb-0", isMobile ? "space-x-2 mb-1.5" : "space-x-3 sm:space-x-4 mb-4")}>
                      <div className="relative group">
                        <div 
                          className="relative z-10 cursor-pointer"
                          onClick={(e) => {
                            if (!touchHandledRef.current) {
                              setIsAvatarSelectorOpen(true);
                            }
                            touchHandledRef.current = false;
                          }}
                          onTouchStart={(e) => {
                            touchHandledRef.current = true;
                          }}
                          onTouchEnd={(e) => {
                            e.stopPropagation();
                            if (touchHandledRef.current) {
                              setIsAvatarSelectorOpen(true);
                              touchHandledRef.current = false;
                            }
                          }}
                          style={{ touchAction: 'manipulation' }}
                        >
                          <EnhancedAvatar
                            emoji={userProgress.activeAvatar}
                            image={getAvatarImage(userProgress.activeAvatar)}
                            size={isMobile ? "xl" : "2xl"}
                            glowColor="green"
                            showCrown={true}
                            profileFrame={userProgress.profileFrame}
                            noBackground={true}
                          />
                        </div>
                        
                        <button 
                          className="absolute -bottom-2 -right-2 bg-white/20 backdrop-blur-sm rounded-full p-2 
                                   opacity-0 group-hover:opacity-100 transition-all duration-200 
                                   hover:bg-white/30 hover:scale-110"
                          onClick={(e) => {
                            if (!touchHandledRef.current) {
                              setIsAvatarSelectorOpen(true);
                            }
                            touchHandledRef.current = false;
                          }}
                          onTouchStart={(e) => {
                            touchHandledRef.current = true;
                          }}
                          onTouchEnd={(e) => {
                            e.stopPropagation();
                            if (touchHandledRef.current) {
                              setIsAvatarSelectorOpen(true);
                              touchHandledRef.current = false;
                            }
                          }}
                          style={{ touchAction: 'manipulation' }}
                        >
                          <Camera className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        </button>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className={cn(
                            "font-bold bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent",
                            isMobile ? "text-sm leading-tight" : "text-lg sm:text-xl lg:text-2xl"
                          )}>
                            {userProgress.name}
                          </h2>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 sm:h-7 px-2.5 sm:px-3 text-[10px] sm:text-xs font-semibold text-white/90 bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm rounded-lg flex items-center gap-1 active:scale-95 transition-all duration-200"
                            onClick={() => setIsSettingsOpen(true)}
                          >
                            <Settings className="h-3 w-3" />
                            <span>{t('editProfile', { defaultValue: 'Edit Profile' })}</span>
                          </Button>
                        </div>
                        <div className="flex items-center space-x-1 mt-0.5">
                          <p className={cn(
                            "text-white/90 font-medium",
                            isMobile ? "text-[10px]" : "text-sm sm:text-base"
                          )}>
                            {t('climateHero')}
                          </p>
                          <Flame className={cn("text-orange-300", isMobile ? "h-2.5 w-2.5" : "h-4 w-4")} />
                        </div>
                        
                        <div className={cn(
                          "flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-white/80 sm:space-y-0",
                          isMobile ? "mt-0.5 space-y-0 text-[9px]" : "mt-2 space-y-1 text-xs sm:text-sm"
                        )}>
                          <div className="flex items-center space-x-1">
                            <MapPin className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3")} />
                            <span>{t('chilonzorDistrict')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <School className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3")} />
                            <span>{t('school45', { ns: 'profile' })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Stats Grid */}
                  <div className={cn(
                    "grid sm:mb-4 sm:mb-6",
                    isMobile ? "grid-cols-2 gap-1.5 mb-2" : "grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-3"
                  )}>
                    {/* EcoCoins Card - Golden Theme */}
                    <div 
                      className={cn(
                        "relative overflow-hidden rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300",
                        "bg-white/10 border-white/25 hover:bg-white/15 hover:border-yellow-400/40 hover:-translate-y-0.5",
                        isMobile ? "p-2.5" : "p-3.5 sm:p-5"
                      )}
                    >
                      
                      <div className="relative z-10 flex items-center justify-between gap-3 h-full">
                        <div className="flex-1 min-w-0 text-left">
                          <span className={cn(
                            "font-semibold text-white/70 block uppercase tracking-wider mb-0.5",
                            isMobile ? "text-[8px]" : "text-[10px]"
                          )}>
                            {t('ecoCoins')}
                          </span>
                          <div className={cn(
                            "font-extrabold bg-gradient-to-r from-yellow-100 via-yellow-200 to-amber-200 bg-clip-text text-transparent drop-shadow-sm",
                            isMobile ? "text-sm" : "text-lg sm:text-2xl lg:text-3xl"
                          )}>
                            {userProgress.ecoCoins}
                          </div>
                        </div>
                        
                        {/* Icon Container */}
                        <div className="p-2 rounded-xl bg-yellow-400/10 text-yellow-300 border border-yellow-400/20 shadow-sm flex-shrink-0">
                          <img 
                            src="/images/eco coins.webp" 
                            alt="Eco Coins" 
                            className={cn("object-contain", isMobile ? "h-6 w-6" : "h-8 w-8")}
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </div>

                    {/* EcoPoints Card - Blue/Cyan Theme */}
                    <div 
                      className={cn(
                        "relative overflow-hidden rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300",
                        "bg-white/10 border-white/25 hover:bg-white/15 hover:border-sky-400/40 hover:-translate-y-0.5",
                        isMobile ? "p-2.5" : "p-3.5 sm:p-5"
                      )}
                    >
                      
                      <div className="relative z-10 flex items-center justify-between gap-3 h-full">
                        <div className="flex-1 min-w-0 text-left">
                          <span className={cn(
                            "font-semibold text-white/70 block uppercase tracking-wider mb-0.5",
                            isMobile ? "text-[8px]" : "text-[10px]"
                          )}>
                            {t('ecoPoints')}
                          </span>
                          <div className={cn(
                            "font-extrabold bg-gradient-to-r from-sky-100 via-cyan-200 to-teal-200 bg-clip-text text-transparent drop-shadow-sm",
                            isMobile ? "text-sm" : "text-lg sm:text-2xl lg:text-3xl"
                          )}>
                            {userProgress.ecoPoints.toLocaleString()}
                          </div>
                        </div>
                        
                        {/* Icon Container */}
                        <div className="p-2 rounded-xl bg-cyan-400/10 text-cyan-200 border border-cyan-400/20 shadow-sm flex-shrink-0">
                          <img 
                            src="/images/eco-points.webp" 
                            alt="Eco Points" 
                            className={cn("object-contain", isMobile ? "h-6 w-6" : "h-8 w-8")}
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Waste Collected Card - Green/Emerald Theme */}
                    <div
                      className={cn(
                        "relative overflow-hidden rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300",
                        "bg-white/10 border-white/25 hover:bg-white/15 hover:border-emerald-400/40 hover:-translate-y-0.5",
                        isMobile ? "p-2.5" : "p-3.5 sm:p-5"
                      )}
                    >
                      
                      <div className="relative z-10 flex items-center justify-between gap-3 h-full">
                        <div className="flex-1 min-w-0 text-left">
                          <span className={cn(
                            "font-semibold text-white/70 block uppercase tracking-wider mb-0.5",
                            isMobile ? "text-[8px]" : "text-[10px]"
                          )}>
                            {t('wasteCollected')}
                          </span>
                          <div className={cn(
                            "font-extrabold bg-gradient-to-r from-emerald-100 via-emerald-200 to-teal-200 bg-clip-text text-transparent drop-shadow-sm",
                            isMobile ? "text-sm" : "text-lg sm:text-2xl lg:text-3xl"
                          )}>
                            {wasteFormatted.value}{wasteFormatted.unit}
                          </div>
                        </div>
                        
                        {/* Icon Container */}
                        <div className="p-2 rounded-xl bg-emerald-400/10 text-emerald-300 border border-emerald-400/20 shadow-sm flex-shrink-0">
                          <img 
                            src="/images/Waste Collected.webp" 
                            alt="Waste Collected" 
                            className={cn("object-contain", isMobile ? "h-6 w-6" : "h-8 w-8")}
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Badges Card - Purple/Pink Theme */}
                    <div
                      className={cn(
                        "relative overflow-hidden rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300",
                        "bg-white/10 border-white/25 hover:bg-white/15 hover:border-purple-400/40 hover:-translate-y-0.5",
                        isMobile ? "p-2.5" : "p-3.5 sm:p-5"
                      )}
                    >
                      
                      <div className="relative z-10 flex items-center justify-between gap-3 h-full">
                        <div className="flex-1 min-w-0 text-left">
                          <span className={cn(
                            "font-semibold text-white/70 block uppercase tracking-wider mb-0.5",
                            isMobile ? "text-[8px]" : "text-[10px]"
                          )}>
                            {t('badges')}
                          </span>
                          <div className={cn(
                            "font-extrabold bg-gradient-to-r from-purple-100 via-pink-200 to-purple-200 bg-clip-text text-transparent drop-shadow-sm",
                            isMobile ? "text-sm" : "text-lg sm:text-2xl lg:text-3xl"
                          )}>
                            {userProgress.badgesEarned}
                          </div>
                        </div>
                        
                        {/* Icon Container */}
                        <div className="p-2 rounded-xl bg-purple-400/10 text-purple-300 border border-purple-400/20 shadow-sm flex-shrink-0">
                          <img 
                            src="/images/badges.webp" 
                            alt="Badges" 
                            className={cn("object-contain", isMobile ? "h-6 w-6" : "h-8 w-8")}
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Level Progress with Improved Text Readability */}
                  <div 
                    className={cn(
                      "bg-white/10 backdrop-blur-md rounded-xl text-white border border-white/20 shadow-lg",
                      isMobile ? "p-2" : "p-4 sm:p-6"
                    )}
                  >
                    {/* Header Row - Level, Icon, and Points Badge - Aligned Horizontally */}
                    <div className={cn(
                      "flex items-center justify-between",
                      isMobile ? "mb-2" : "mb-3"
                    )}>
                      {/* Left: Level Text */}
                      <div className="flex items-center h-full">
                        <p className={cn(
                          "font-semibold text-white m-0 leading-none",
                          isMobile ? "text-xs" : "text-sm sm:text-base"
                        )}>
                          {t('levelFifteen')} {userProgress.level}
                        </p>
                      </div>
                      
                      {/* Center: Level Icon */}
                      <div className="flex items-center justify-center flex-1">
                        <div className="flex items-center justify-center">
                          <img 
                            src="/images/level.webp" 
                            alt="Level" 
                            className={cn(
                              "object-contain drop-shadow-lg",
                              isMobile ? "h-12 w-12" : "h-16 w-16 sm:h-20 sm:w-20"
                            )}
                            loading="lazy"
                          />
                        </div>
                      </div>
                      
                      {/* Right: Points Badge */}
                      <div className="flex items-center h-full">
                        <Badge className={cn(
                          "bg-gradient-to-r from-white/20 to-white/10 text-white border-white/30 backdrop-blur-sm shadow-lg flex items-center",
                          isMobile ? "text-[9px] px-1.5 py-0.5" : "text-xs sm:text-sm px-3 py-1.5"
                        )}>
                          <Sparkles className={cn(isMobile ? "h-2 w-2 mr-0.5" : "h-3 w-3 mr-1")} />
                          {userProgress.ecoPoints.toLocaleString()} {t('pts', { ns: 'profile' })}
                        </Badge>
                      </div>
                    </div>

                    {/* Title Row - Sustainability Expert and Chevron - Aligned Horizontally */}
                    <div className={cn(
                      "flex items-center justify-between",
                      isMobile ? "mb-3" : "mb-4"
                    )}>
                      <p className={cn(
                        "font-bold bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent",
                        isMobile ? "text-sm" : "text-base sm:text-lg"
                      )}>
                        {t('sustainabilityExpert')}
                      </p>
                      <motion.button
                        onClick={() => setLevelExpanded(!levelExpanded)}
                        className={cn(
                          "rounded-full hover:bg-white/20 transition-colors touch-feedback btn-touch flex-shrink-0",
                          isMobile ? "p-1 min-h-[24px] min-w-[24px]" : "p-1.5 min-h-[28px] min-w-[28px]"
                        )}
                        whileHover={isMobile ? {} : { scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        style={{ willChange: 'transform', touchAction: 'manipulation' }}
                      >
                        {levelExpanded ? <ChevronUp className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} /> : <ChevronDown className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />}
                      </motion.button>
                    </div>
                    
                    {/* Progress Section - Well Structured */}
                    <motion.div 
                      className={cn(isMobile ? "space-y-2" : "space-y-3")}
                      layout
                    >
                      {/* Progress Label and Percentage - Aligned Horizontally */}
                      <div className={cn(
                        "flex items-center justify-between",
                        isMobile ? "mb-1.5" : "mb-2"
                      )}>
                        <span className={cn(
                          "font-medium text-white/90",
                          isMobile ? "text-[10px]" : "text-xs sm:text-sm"
                        )}>
                          {t('progressToLevel')} {userProgress.level + 1}
                        </span>
                        <span className={cn(
                          "font-semibold text-white flex-shrink-0",
                          isMobile ? "text-[10px]" : "text-xs sm:text-sm"
                        )}>
                          {Math.round(levelProgress)}%
                        </span>
                      </div>
                      
                      {/* Elegant Liquid Wave Progress Bar */}
                      <div className="relative">
                        {/* Glassmorphism Track Background */}
                        <div className={cn(
                          "relative rounded-full overflow-hidden",
                          "bg-white/5 backdrop-blur-sm border border-white/10",
                          isMobile ? "h-2.5" : "h-4"
                        )}
                        style={{
                          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1), 0 1px 3px rgba(0,0,0,0.1)',
                        }}
                        >
                          {/* Progress Fill with Liquid Wave Effect */}
                          <motion.div
                            className="relative h-full rounded-full overflow-hidden"
                            initial={{ width: 0 }}
                            animate={{ width: `${levelProgress}%` }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            style={{
                              background: `linear-gradient(90deg, 
                                #facc15 0%,
                                #fb923c ${levelProgress * 0.5}%,
                                #f87171 ${levelProgress}%
                              )`,
                              filter: `drop-shadow(0 0 ${2 + (levelProgress / 100) * 4}px rgba(251, 146, 60, 0.6))`,
                            }}
                          >
                             {/* Animated Liquid Wave Layer 1 */}
                             <div
                               className="absolute inset-0 wave-layer-1"
                               style={{
                                 background: `linear-gradient(90deg, 
                                   transparent 0%,
                                   rgba(255, 255, 255, 0.3) 30%,
                                   rgba(255, 255, 255, 0.5) 50%,
                                   rgba(255, 255, 255, 0.3) 70%,
                                   transparent 100%
                                 )`
                               }}
                             />
                             
                             {/* Animated Liquid Wave Layer 2 - slower */}
                             <div
                               className="absolute inset-0 wave-layer-2"
                               style={{
                                 background: `linear-gradient(90deg, 
                                   transparent 0%,
                                   rgba(255, 255, 255, 0.2) 40%,
                                   rgba(255, 255, 255, 0.4) 60%,
                                   rgba(255, 255, 255, 0.2) 80%,
                                   transparent 100%
                                 )`
                               }}
                             />
                            
                            {/* Shimmer Effect at Progress Edge */}
                            <motion.div
                              className="absolute top-0 bottom-0 right-0"
                              style={{
                                width: '20px',
                                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
                                filter: 'blur(4px)',
                                left: `${levelProgress}%`,
                                transform: 'translateX(-50%)',
                              }}
                              animate={{
                                opacity: [0.3, 0.8, 0.3],
                                scaleX: [0.8, 1.2, 0.8],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />
                          </motion.div>
                        </div>
                      </div>
                      
                      {/* Points to Next Level - Aligned Left */}
                      <motion.p 
                        className={cn(
                          "opacity-90 text-white/90 font-medium",
                          isMobile ? "text-[9px] leading-tight mt-1.5" : "text-xs sm:text-sm mt-2"
                        )}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.9 }}
                        transition={{ delay: 1 }}
                      >
                        <span className="text-yellow-200 font-semibold">{pointsToNext}</span> {t('pointsToNextLevel')}
                      </motion.p>

                      {/* Improved Level Benefits with Better Text Readability */}
                      <AnimatePresence initial={false}>
                        {levelExpanded && (
                          <motion.div
                            key="level-benefits"
                            variants={levelBenefitsVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className={cn(
                              "bg-white/20 rounded-lg border border-white/30 shadow-inner",
                              isMobile ? "mt-2 p-2.5" : "mt-4 p-4"
                            )}
                            style={{ 
                              willChange: 'transform, opacity',
                              transform: 'translateZ(0)',
                              backfaceVisibility: 'hidden'
                            }}
                          >
                            <motion.h4 
                              className={cn(
                                "font-bold flex items-center text-white",
                                isMobile ? "text-xs mb-2" : "text-sm mb-3"
                              )}
                              variants={benefitItemVariants}
                            >
                              <Info className={cn(isMobile ? "h-3 w-3 mr-1.5" : "h-4 w-4 mr-2")} />
                              {t('levelBenefits')}
                            </motion.h4>
                            <motion.ul 
                              className={cn(
                                "space-y-2 text-white/95 font-medium",
                                isMobile ? "text-[10px] space-y-1.5" : "text-sm space-y-2"
                              )}
                              variants={levelBenefitsVariants}
                            >
                              <motion.li variants={benefitItemVariants} className="flex items-center">
                                <span className={cn(
                                  "bg-yellow-300 rounded-full flex-shrink-0",
                                  isMobile ? "w-1.5 h-1.5 mr-2" : "w-2 h-2 mr-3"
                                )}></span>
                                {t('accessExclusiveOffers')}
                              </motion.li>
                              <motion.li variants={benefitItemVariants} className="flex items-center">
                                <span className={cn(
                                  "bg-yellow-300 rounded-full flex-shrink-0",
                                  isMobile ? "w-1.5 h-1.5 mr-2" : "w-2 h-2 mr-3"
                                )}></span>
                                {t('priorityEventRegistration')}
                              </motion.li>
                              <motion.li variants={benefitItemVariants} className="flex items-center">
                                <span className={cn(
                                  "bg-yellow-300 rounded-full flex-shrink-0",
                                  isMobile ? "w-1.5 h-1.5 mr-2" : "w-2 h-2 mr-3"
                                )}></span>
                                {t('monthlyBonusEcoCoins')}
                              </motion.li>
                              <motion.li variants={benefitItemVariants} className="flex items-center">
                                <span className={cn(
                                  "bg-yellow-300 rounded-full flex-shrink-0",
                                  isMobile ? "w-1.5 h-1.5 mr-2" : "w-2 h-2 mr-3"
                                )}></span>
                                {t('specialRecognitionBadges')}
                              </motion.li>
                            </motion.ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tabs */}
            <motion.div variants={itemVariants}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className={cn(
                  "grid w-full grid-cols-4 glass-card border border-white/40 shadow-lg",
                  isMobile ? "h-11 mb-3" : "h-12 sm:h-14 mb-4 sm:mb-6"
                )}>
                  <TabsTrigger 
                    value="wallet" 
                    className={cn(
                      "flex items-center justify-center font-medium transition-all duration-300",
                      isMobile ? "space-x-0.5 text-[10px] min-h-[44px]" : "space-x-1 sm:space-x-2 text-xs sm:text-sm"
                    )}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <Wallet className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                    {!isMobile && <span className="hidden sm:inline">{t('wallet')}</span>}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="offers" 
                    className={cn(
                      "flex items-center justify-center font-medium transition-all duration-300",
                      isMobile ? "space-x-0.5 text-[10px] min-h-[44px]" : "space-x-1 sm:space-x-2 text-xs sm:text-sm"
                    )}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <Tag className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                    {!isMobile && <span className="hidden sm:inline">{t('offers')}</span>}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="badges" 
                    className={cn(
                      "flex items-center justify-center font-medium transition-all duration-300",
                      isMobile ? "space-x-0.5 text-[10px] min-h-[44px]" : "space-x-1 sm:space-x-2 text-xs sm:text-sm"
                    )}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <Award className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                    {!isMobile && <span className="hidden sm:inline">{t('badges')}</span>}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="analytics" 
                    className={cn(
                      "flex items-center justify-center font-medium transition-all duration-300",
                      isMobile ? "space-x-0.5 text-[10px] min-h-[44px]" : "space-x-1 sm:space-x-2 text-xs sm:text-sm"
                    )}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <BarChart3 className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                    {!isMobile && <span className="hidden sm:inline">{t('analytics')}</span>}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="wallet" className="space-y-4 sm:space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.15,
                      type: "tween",
                      ease: "easeOut"
                    }}
                    style={{ willChange: 'transform, opacity' }}
                    className="space-y-4 sm:space-y-6"
                  >
                      {/* Rewards Store */}
                      <Card className="glass-card border border-white/40 shadow-lg">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                            <div className="flex items-center">
                              <Gift className="h-5 w-5 mr-2 text-green-600" />
                              {t('ecoRewardsStore')}
                            </div>
                            <motion.div 
                              className="text-sm text-gray-600 flex items-center space-x-2"
                              whileHover={{ scale: 1.05 }}
                            >
                              <img src="/images/eco coins.webp" alt="eco coins" className="h-5 w-5 inline-block" />
                              <span>{userProgress.ecoCoins}</span>
                            </motion.div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            {REWARDS_DATA.map((reward) => (
                              <RewardCard key={reward.id} reward={reward} />
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Referral Section */}
                      <ReferralSection />

                      {/* Recent Transactions */}
                      <Card className="glass-card border border-white/40 shadow-lg">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                            <div className="flex items-center">
                              <TrendingUp className="h-5 w-5 mr-2 text-teal-600" />
                              {t('recentTransactions')}
                            </div>
                            <Button variant="ghost" size="sm" className="text-sm hover:bg-gray-100">{t('viewAll')}</Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="space-y-0">
                            {[
                              { type: 'earned' as const, title: t('plasticCollectionCentralPark'), time: `2 ${t('hoursAgo')}`, amount: 50 },
                              { type: 'spent' as const, title: t('childrenSouvenirsPurchase'), time: `1 ${t('dayAgo')}`, amount: -75 },
                              { type: 'earned' as const, title: t('treePlantingEventParticipation'), time: `3 ${t('daysAgo')}`, amount: 100 },
                              { type: 'earned' as const, title: t('communityCleanupVolunteer'), time: `5 ${t('daysAgo')}`, amount: 25 }
                            ].map((transaction, index) => (
                              <motion.div
                                key={index}
                                className="p-3 sm:p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0"
                                whileHover={{ x: 4 }}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ 
                                  delay: index * 0.03,
                                  duration: 0.12,
                                  type: "tween",
                                  ease: "easeOut"
                                }}
                                style={{ willChange: 'transform, opacity' }}
                              >
                                <div className="flex items-center space-x-3">
                                  <motion.div 
                                    className={`p-2 rounded-full ${
                                      transaction.type === 'earned' 
                                        ? 'bg-green-100 text-green-600' 
                                        : 'bg-red-100 text-red-600'
                                    }`}
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                  >
                                    {transaction.type === 'earned' ? 
                                      <ArrowUpRight className="h-4 w-4" /> : 
                                      <ArrowDownRight className="h-4 w-4" />
                                    }
                                  </motion.div>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-medium text-sm sm:text-base truncate">{transaction.title}</p>
                                    <p className="text-xs text-gray-500">{transaction.time}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 flex-shrink-0">
                                  <div className={cn("font-semibold text-sm sm:text-base flex items-center gap-1", transaction.amount > 0 ? 'text-green-600' : 'text-red-600')}>
                                    {transaction.amount > 0 ? '+' : ''}{transaction.amount} <img src="/images/eco coins.webp" alt="eco coins" className="h-4 w-4 inline-block" />
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-gray-400" />
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="offers" className="mt-4 sm:mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                      <Card className="glass-card border border-white/40 shadow-lg">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                            <div className="flex items-center">
                              <Tag className="h-5 w-5 mr-2 text-teal-600" />
                              {t('partnerDiscountOffers')}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className="bg-teal-100 text-teal-700 text-xs">
                                {PARTNER_OFFERS.filter(offer => userProgress.ecoCoins >= offer.minCoins).length} {t('available')}
                              </Badge>
                              <div className="flex items-center text-sm text-gray-600 gap-1">
                                <img src="/images/eco coins.webp" alt="eco coins" className="h-5 w-5 inline-block" />
                                {userProgress.ecoCoins}
                              </div>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {PARTNER_OFFERS.map((offer, index) => (
                              <PartnerOfferCard key={offer.id} offer={offer} />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="badges" className="mt-4 sm:mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                      <Card className="glass-card border border-white/40 shadow-lg">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center text-base sm:text-lg">
                            <Award className="h-5 w-5 mr-2 text-yellow-600" />
                            {t('achievementBadges')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                            {mockBadges.map((badge) => (
                              <BadgeCard key={badge.id} badge={badge} />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="analytics" className="mt-4 sm:mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.15,
                      type: "tween",
                      ease: "easeOut"
                    }}
                    style={{ willChange: 'transform, opacity' }}
                    className="space-y-4 sm:space-y-6"
                  >
                      {/* Analytics Overview */}
                      <Card className="glass-card border border-white/40 shadow-lg">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center text-base sm:text-lg">
                            <Activity className="h-5 w-5 mr-2 text-teal-600" />
                            {t('yourEngagementAnalytics')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Weekly Engagement Chart */}
                          <WeeklyEngagementChart />
                          
                          {/* Monthly Summary */}
                          <div className="space-y-4">
                            <h4 className="font-semibold text-sm">{t('monthlySummary')}</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              {[
                                { value: userProgress.eventsAttended, label: t('eventsAttended'), color: 'green' },
                                { value: userProgress.treesPlanted, label: t('treesPlanted'), color: 'blue' },
                                { value: analyticsData.achievements.thisMonth, label: t('newBadges'), color: 'purple' },
                                { value: `#${mockLeaderboard.find(u => u.name === userProgress.name)?.rank || '5'}`, label: t('leaderboardRank'), color: 'orange' }
                              ].map((stat, index) => (
                                <motion.div
                                  key={stat.label}
                                  className={`text-center p-3 rounded-lg`}
                                  style={{
                                    backgroundColor: `var(--${stat.color}-50)`,
                                    color: `var(--${stat.color}-600)`,
                                    willChange: 'transform, opacity'
                                  }}
                                  whileHover={{ scale: 1.05, y: -2 }}
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ 
                                    delay: index * 0.03,
                                    duration: 0.12,
                                    type: "tween",
                                    ease: "easeOut"
                                  }}
                                >
                                  <div className="text-lg font-bold">{stat.value}</div>
                                  <div className="text-xs">{stat.label}</div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Environmental Impact */}
                      <Card className="glass-card border border-white/40 shadow-lg">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center text-base sm:text-lg">
                            <Leaf className="h-5 w-5 mr-2 text-green-600" />
                            {t('yourEnvironmentalImpact')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ImpactMetrics />
                        </CardContent>
                      </Card>

                      {/* Goal Progress */}
                      <Card className="glass-card border border-white/40 shadow-lg">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center text-base sm:text-lg">
                            <Target className="h-5 w-5 mr-2 text-teal-600" />
                            {t('goalProgress')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {[
                            { label: `${t('nextBadge')}: ${analyticsData.achievements.nextGoal}`, current: 85, total: 100, unit: t('kg') },
                            { label: t('monthlyWasteGoal'), current: userProgress.wasteCollected, total: 100, unit: t('kg') },
                            { label: t('communityEvents'), current: userProgress.eventsAttended, total: 15, unit: t('events') }
                          ].map((goal, index) => (
                            <motion.div
                              key={goal.label}
                              className="space-y-3"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">{goal.label}</span>
                                <span className="text-sm text-gray-600">
                                  {goal.current}/{goal.total} {goal.unit}
                                </span>
                              </div>
                              <Progress value={(goal.current / goal.total) * 100} className="h-2" />
                            </motion.div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Leaderboard */}
                      <Card className="glass-card border border-white/40 shadow-lg">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                            <div className="flex items-center">
                              <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                              {t('leaderboard', { ns: 'profile' })}
                            </div>
                            {leaderboardData[0]?.isCurrentUser && (
                              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                                <Crown className="h-3 w-3 mr-1" />
                                {t('topPerformer', { ns: 'profile' })}
                              </Badge>
                            )}
                          </CardTitle>
                          <p className={cn("text-gray-600 mt-1", isMobile ? "text-xs" : "text-sm")}>
                            {t('leaderboardDescription', { ns: 'profile' })}
                          </p>
                        </CardHeader>
                        <CardContent>
                          {/* User rank highlight */}
                          {(() => {
                            const userRank = leaderboardData.find(d => d.isCurrentUser)?.rank;
                            if (!userRank || userRank > 3) return null;
                            const isFirst = userRank === 1;
                            return (
                              <div
                                className={cn(
                                  "mb-4 p-3 rounded-lg text-white font-semibold text-center shadow-lg",
                                  isFirst 
                                    ? "bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600" 
                                    : "bg-gradient-to-r from-emerald-500 to-teal-500",
                                  isMobile ? "text-xs" : "text-sm"
                                )}
                              >
                                <div className="flex items-center justify-center gap-2">
                                  {isFirst 
                                    ? <Crown className={cn("text-yellow-200", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                                    : <Trophy className={cn("text-yellow-200", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                                  }
                                  <span>
                                    {isFirst 
                                      ? t('congratulations', { ns: 'profile', defaultValue: "Congratulations! You're #1!" })
                                      : t('yourRank', { ns: 'profile', defaultValue: `You're ranked #${userRank}!` })
                                    }
                                  </span>
                                  {isFirst && <Crown className={cn("text-yellow-200", isMobile ? "h-4 w-4" : "h-5 w-5")} />}
                                </div>
                              </div>
                            );
                          })()}

                          {/* Leaderboard Table - Desktop View */}
                          <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-gray-200">
                                  <th className={cn("text-left py-3 px-4 font-semibold text-gray-700", isMobile ? "text-xs" : "text-sm")}>
                                    {t('rank', { ns: 'profile' })}
                                  </th>
                                  <th className={cn("text-left py-3 px-4 font-semibold text-gray-700", isMobile ? "text-xs" : "text-sm")}>
                                    {t('player', { ns: 'profile' })}
                                  </th>
                                  <th className={cn("text-right py-3 px-4 font-semibold text-gray-700", isMobile ? "text-xs" : "text-sm")}>
                                    {t('points', { ns: 'profile' })}
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {leaderboardData.map((player, index) => (
                                  <motion.tr
                                    key={`table-${player.rank}-${index}`}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ 
                                      delay: index * 0.02,
                                      duration: 0.1,
                                      type: "tween",
                                      ease: "easeOut"
                                    }}
                                    style={{ willChange: 'transform, opacity' }}
                                    className={cn(
                                      "border-b border-gray-100 transition-colors",
                                      player.isCurrentUser 
                                        ? "bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100" 
                                        : "hover:bg-gray-50"
                                    )}
                                  >
                                    <td className={cn("py-3 px-4", isMobile ? "text-xs" : "text-sm")}>
                                      <div className="flex items-center gap-2">
                                        {player.rank === 1 && (
                                          <Crown className={cn("text-yellow-500", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                                        )}
                                        {player.rank === 2 && (
                                          <Medal className={cn("text-gray-400", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                                        )}
                                        {player.rank === 3 && (
                                          <Medal className={cn("text-orange-400", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                                        )}
                                        <span className={cn(
                                          "font-bold",
                                          player.rank <= 3 ? "text-lg" : "text-base",
                                          player.isCurrentUser ? "text-orange-600" : "text-gray-700"
                                        )}>
                                          #{player.rank}
                                        </span>
                                      </div>
                                    </td>
                                    <td className={cn("py-3 px-4", isMobile ? "text-xs" : "text-sm")}>
                                      <div className="flex items-center gap-3">
                                        <div className="relative">
                                          <Avatar className={cn(
                                            player.isCurrentUser 
                                              ? "ring-2 ring-yellow-400 ring-offset-2" 
                                              : "",
                                            isMobile ? "h-8 w-8" : "h-10 w-10"
                                          )}>
                                            <AvatarFallback className={cn(
                                              "text-lg",
                                              player.isCurrentUser 
                                                ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white" 
                                                : "bg-gray-200"
                                            )}>
                                              {player.avatar}
                                            </AvatarFallback>
                                          </Avatar>
                                          {player.isCurrentUser && (
                                            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                                              <CheckCircle className="h-2.5 w-2.5 text-white" />
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                           <div className="flex items-center gap-1.5 w-full min-w-0">
                                             <span className={cn(
                                               "font-semibold truncate flex-1 min-w-0",
                                               player.isCurrentUser ? "text-orange-600" : "text-gray-900",
                                               isMobile ? "text-xs" : "text-sm"
                                             )}>
                                               {player.name}
                                             </span>
                                             {player.isCurrentUser && (
                                               <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-[10px] px-1.5 py-0 flex-shrink-0">
                                                 {t('you', { ns: 'profile' })}
                                               </Badge>
                                             )}
                                           </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className={cn("py-3 px-4 text-right", isMobile ? "text-xs" : "text-sm")}>
                                      <div className={cn(
                                        "font-bold",
                                        player.isCurrentUser ? "text-orange-600" : "text-gray-700",
                                        isMobile ? "text-sm" : "text-base"
                                      )}>
                                        {player.points.toLocaleString()}
                                      </div>
                                    </td>
                                  </motion.tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Leaderboard Cards - Mobile View */}
                          <div className="sm:hidden space-y-2">
                            {leaderboardData.map((player, index) => (
                              <motion.div
                                key={`mobile-${player.rank}-${index}`}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ 
                                  delay: index * 0.02,
                                  duration: 0.1,
                                  type: "tween",
                                  ease: "easeOut"
                                }}
                                style={{ willChange: 'transform, opacity' }}
                                className={cn(
                                  "p-3 rounded-lg border transition-all",
                                  player.isCurrentUser
                                    ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 shadow-md"
                                    : "bg-white border-gray-200"
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                      {player.rank === 1 && (
                                        <Crown className="h-4 w-4 text-yellow-500" />
                                      )}
                                      {player.rank === 2 && (
                                        <Medal className="h-4 w-4 text-gray-400" />
                                      )}
                                      {player.rank === 3 && (
                                        <Medal className="h-4 w-4 text-orange-400" />
                                      )}
                                      <span className={cn(
                                        "font-bold text-xs",
                                        player.isCurrentUser ? "text-orange-600" : "text-gray-700"
                                      )}>
                                        #{player.rank}
                                      </span>
                                    </div>
                                    <Avatar className={cn(
                                      "h-8 w-8 flex-shrink-0",
                                      player.isCurrentUser ? "ring-2 ring-yellow-400" : ""
                                    )}>
                                      <AvatarFallback className={cn(
                                        "text-sm",
                                        player.isCurrentUser 
                                          ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white" 
                                          : "bg-gray-200"
                                      )}>
                                        {player.avatar}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0 ml-2">
                                       <div className="flex items-center gap-1 w-full min-w-0">
                                         <span className={cn(
                                           "font-semibold truncate text-xs flex-1 min-w-0",
                                           player.isCurrentUser ? "text-orange-600" : "text-gray-900"
                                         )}>
                                           {player.name}
                                         </span>
                                         {player.isCurrentUser && (
                                           <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-[9px] px-1 py-0 flex-shrink-0">
                                             {t('you', { ns: 'profile' })}
                                           </Badge>
                                         )}
                                       </div>
                                     </div>
                                  </div>
                                  <div className={cn(
                                    "font-bold text-sm flex-shrink-0 ml-2",
                                    player.isCurrentUser ? "text-orange-600" : "text-gray-700"
                                  )}>
                                    {player.points.toLocaleString()}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Settings Modal */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t('settings', { ns: 'profile' })}
            </DialogTitle>
            <DialogDescription>
              {t('settingsDescription', { ns: 'profile' })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4 max-h-[75vh] overflow-y-auto px-1">
            {/* Name Change Section */}
            <NameChangeSection 
              onNameUpdated={() => {
                const savedProgress = loadUserProgress();
                setUserProgress(savedProgress);
              }}
              t={t}
            />

            {/* Language Settings */}
            <div className="pt-4 border-t space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-800">
                <Globe className="h-4 w-4 text-emerald-500" />
                {t('language', { defaultValue: 'App Language' })}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { code: 'uz', label: "O'zbekcha" },
                  { code: 'ru', label: 'Русский' },
                  { code: 'en', label: 'English' }
                ].map((lang) => (
                  <Button
                    key={lang.code}
                    variant={i18n.language === lang.code ? 'default' : 'outline'}
                    className={i18n.language === lang.code ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 shadow-sm' : 'text-slate-600'}
                    size="sm"
                    onClick={() => {
                      i18n.changeLanguage(lang.code);
                      toast.success(t('languageChanged', { defaultValue: 'Language updated!' }));
                    }}
                  >
                    {lang.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Theme & Customization */}
            <div className="pt-4 border-t space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-800">
                <Palette className="h-4 w-4 text-purple-500" />
                {t('appearanceTheme', { defaultValue: 'Appearance & Themes' })}
              </h3>
              <Button
                variant="outline"
                className="w-full justify-start flex items-center gap-2 border-slate-200 hover:bg-slate-50 text-slate-700"
                onClick={() => {
                  setIsSettingsOpen(false);
                  setTimeout(() => setIsAvatarSelectorOpen(true), 250);
                }}
              >
                <Palette className="h-4 w-4 text-purple-500" />
                <span>{t('changeAvatarBackground', { defaultValue: 'Change Avatar & Profile Theme' })}</span>
              </Button>
            </div>

            {/* Security Settings */}
            <div className="pt-4 border-t space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-800">
                <Lock className="h-4 w-4 text-blue-500" />
                {t('security', { defaultValue: 'Security & Password' })}
              </h3>
              
              {!isChangingPassword ? (
                <Button
                  variant="outline"
                  className="w-full justify-start border-slate-200 hover:bg-slate-50 text-slate-700"
                  onClick={() => setIsChangingPassword(true)}
                >
                  {t('changePassword', { defaultValue: 'Update Account Password' })}
                </Button>
              ) : (
                <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-700">{t('newPassword', { defaultValue: 'New Password' })}</Label>
                    <Input 
                      type="password" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      placeholder="••••••••"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-700">{t('confirmPassword', { defaultValue: 'Confirm Password' })}</Label>
                    <Input 
                      type="password" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      placeholder="••••••••"
                      className="h-9"
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => {
                      setIsChangingPassword(false);
                      setNewPassword('');
                      setConfirmPassword('');
                    }}>{t('cancel', { defaultValue: 'Cancel' })}</Button>
                    <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={async () => {
                      if (newPassword.length < 6) {
                        toast.error(t('passwordMinLength', { defaultValue: 'Password must be at least 6 characters' }));
                        return;
                      }
                      if (newPassword !== confirmPassword) {
                        toast.error(t('passwordsDontMatch', { defaultValue: 'Passwords do not match' }));
                        return;
                      }
                      
                      // If Supabase is active, update
                      if (isSupabaseConfigured() && supabase) {
                        const { error } = await supabase.auth.updateUser({ password: newPassword });
                        if (error) {
                          toast.error(error.message);
                          return;
                        }
                      }
                      
                      toast.success(t('passwordUpdated', { defaultValue: 'Password updated successfully!' }));
                      setIsChangingPassword(false);
                      setNewPassword('');
                      setConfirmPassword('');
                    }}>{t('save', { defaultValue: 'Save' })}</Button>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="pt-4 border-t space-y-3">
              <h3 className="text-sm font-semibold text-slate-800">
                {t('notifications', { ns: 'profile' })}
              </h3>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications" className="text-sm font-medium text-slate-700">
                    {t('notifications', { ns: 'profile' })}
                  </Label>
                  <p className="text-xs text-slate-500">
                    {t('notificationsDescription', { ns: 'profile' })}
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={(checked) => {
                    setNotificationsEnabled(checked);
                    toast.success(t('settingsSaved', { ns: 'profile' }));
                  }}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label htmlFor="email-updates" className="text-sm font-medium text-slate-700">
                    {t('emailUpdates', { ns: 'profile' })}
                  </Label>
                  <p className="text-xs text-slate-500">
                    {t('emailUpdatesDescription', { ns: 'profile' })}
                  </p>
                </div>
                <Switch
                  id="email-updates"
                  checked={emailUpdates}
                  onCheckedChange={(checked) => {
                    setEmailUpdates(checked);
                    toast.success(t('settingsSaved', { ns: 'profile' }));
                  }}
                />
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold mb-3 text-slate-800">
                {t('privacy', { ns: 'profile' })}
              </h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start text-slate-700 border-slate-200"
                  onClick={() => {
                    toast.info(t('privacyPolicyComingSoon', { ns: 'profile' }));
                  }}
                >
                  {t('viewPrivacyPolicy', { ns: 'profile' })}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-slate-700 border-slate-200"
                  onClick={() => {
                    toast.info(t('termsComingSoon', { ns: 'profile' }));
                  }}
                >
                  {t('viewTerms', { ns: 'profile' })}
                </Button>
              </div>
            </div>

            {/* Account Actions */}
            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold mb-3 text-slate-800">
                {t('account', { ns: 'profile' })}
              </h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start text-slate-700 border-slate-200"
                  onClick={() => {
                    toast.info(t('exportDataComingSoon', { ns: 'profile' }));
                  }}
                >
                  {t('exportData', { ns: 'profile' })}
                </Button>
                
                {forceGuestMode ? (
                  <Button
                    variant="outline"
                    className="w-full justify-start text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200 flex items-center gap-2"
                    onClick={() => {
                      localStorage.removeItem('forceGuestMode');
                      setForceGuestMode(false);
                      setIsSettingsOpen(false);
                      toast.success(t('guestModeExited', { defaultValue: 'Exited guest mode!' }));
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('signInOrCreateAccount', { defaultValue: 'Sign In / Register' })}</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 flex items-center gap-2"
                    onClick={() => {
                      logout();
                      localStorage.removeItem('forceGuestMode');
                      setForceGuestMode(false);
                      setIsSettingsOpen(false);
                      toast.success(t('loggedOut', { defaultValue: 'Logged out successfully!' }));
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('logout', { defaultValue: 'Sign Out Session' })}</span>
                  </Button>
                )}

                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={() => {
                    if (window.confirm(t('deleteAccountConfirm', { ns: 'profile' }))) {
                      toast.error(t('deleteAccountComingSoon', { ns: 'profile' }));
                    }
                  }}
                >
                  {t('deleteAccount', { ns: 'profile' })}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Avatar System Modal - FIXED PROPS */}
      <EnhancedAvatarSystem
        isOpen={isAvatarSelectorOpen}
        onClose={() => {
          setIsAvatarSelectorOpen(false);
          // Reload progress after closing to ensure theme is updated
          const savedProgress = loadUserProgress();
          setUserProgress(savedProgress);
        }}
        selectedAvatar={userProgress.activeAvatar}
        onAvatarSelect={handleAvatarSelect}
        onThemeChange={(themeId) => {
          // Use functional update to ensure we have the latest state
          setUserProgress((prevProgress) => {
            const updated = { ...prevProgress, profileBackground: themeId };
            saveUserProgress(updated);
            return updated;
          });
        }}
      />
    </Layout>
  );
};

export default Profile;