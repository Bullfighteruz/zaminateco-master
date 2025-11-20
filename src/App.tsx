import { lazy, Suspense } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import RouterErrorBoundary from './components/RouterErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import { CartProvider } from './contexts/CartContext';
import { Skeleton } from './components/ui/loading-skeleton';
import './styles/enhanced-mobile.css';

const queryClient = new QueryClient();

// Lazy load pages for code splitting
const Index = lazy(() => import('./pages/Index'));
const About = lazy(() => import('./pages/About'));
const EcoVote = lazy(() => import('./pages/EcoVote'));
const EcoActions = lazy(() => import('./pages/EcoActions'));
const SocialMissionShop = lazy(() => import('./pages/SocialMissionShop'));
const EcoStories = lazy(() => import('./pages/EcoStories'));
const Profile = lazy(() => import('./pages/Profile'));
const Partners = lazy(() => import('./pages/Partners'));
const Team = lazy(() => import('./pages/Team'));
const Contacts = lazy(() => import('./pages/Contacts'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <div className="space-y-4 w-full max-w-md">
      <Skeleton variant="rectangular" height={200} className="rounded-lg" />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="40%" />
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ErrorBoundary>
        <CartProvider>
          <Toaster />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <RouterErrorBoundary>
              <ScrollToTop />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/vote" element={<EcoVote />} />
                  <Route path="/actions" element={<EcoActions />} />
                  <Route path="/shop" element={<SocialMissionShop />} />
                  <Route path="/stories" element={<EcoStories />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/partners" element={<Partners />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </RouterErrorBoundary>
          </BrowserRouter>
        </CartProvider>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;