import { lazy, Suspense, startTransition } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollManager from './components/ScrollManager';
import ErrorBoundary from './components/ErrorBoundary';
import RouterErrorBoundary from './components/RouterErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import { CartProvider } from './contexts/CartContext';
import LightweightLoader from './components/LightweightLoader';
import WelcomeModal from './components/WelcomeModal';
import './styles/enhanced-mobile.css';

// Optimized QueryClient with better defaults for performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

// Lazy load pages with optimized chunking
// Using webpack magic comments for better chunk names and prefetching hints
const Index = lazy(() => import(/* webpackChunkName: "index" */ './pages/Index'));
const About = lazy(() => import(/* webpackChunkName: "about" */ './pages/About'));
const EcoVote = lazy(() => import(/* webpackChunkName: "vote" */ './pages/EcoVote'));
const EcoActions = lazy(() => import(/* webpackChunkName: "actions" */ './pages/EcoActions'));
const Shop = lazy(() => import(/* webpackChunkName: "shop" */ './pages/Shop'));
const SocialMissionShop = lazy(() => import(/* webpackChunkName: "shop-legacy" */ './pages/SocialMissionShop'));
const EcoStories = lazy(() => import(/* webpackChunkName: "stories" */ './pages/EcoStories'));
const Profile = lazy(() => import(/* webpackChunkName: "profile" */ './pages/Profile'));
const Partners = lazy(() => import(/* webpackChunkName: "partners" */ './pages/Partners'));
const Team = lazy(() => import(/* webpackChunkName: "team" */ './pages/Team'));
const Contacts = lazy(() => import(/* webpackChunkName: "contacts" */ './pages/Contacts'));
const ProductDetail = lazy(() => import(/* webpackChunkName: "product" */ './pages/ProductDetail'));
const NotFound = lazy(() => import(/* webpackChunkName: "notfound" */ './pages/NotFound'));

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
              <ScrollManager />
              <WelcomeModal />
              <Suspense fallback={<LightweightLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/vote" element={<EcoVote />} />
                  <Route path="/actions" element={<EcoActions />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/shop-legacy" element={<SocialMissionShop />} />
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