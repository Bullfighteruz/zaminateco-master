import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { ZamiConversationProvider } from "./contexts/ZamiConversationContext";
import ErrorBoundary from "./components/ErrorBoundary";
import RouterErrorBoundary from "./components/RouterErrorBoundary";
import ScrollToTop from "./components/ScrollToTop";
import LanguageRouteWrapper from "./components/LanguageRouteWrapper";
import { SuspenseFallback } from "./components/ui/loading-skeleton";

// Lazy load pages for optimal bundle splitting
const Index = lazy(() => import("./pages/Index"));
const EcoVote = lazy(() => import("./pages/EcoVote"));
const EcoActions = lazy(() => import("./pages/EcoActions"));
const Shop = lazy(() => import("./pages/Shop"));
const ShopLegacy = lazy(() => import("./pages/SocialMissionShop"));
const EcoStories = lazy(() => import("./pages/EcoStories"));
const Profile = lazy(() => import("./pages/Profile"));
const About = lazy(() => import("./pages/About"));
const Partners = lazy(() => import("./pages/Partners"));
const Team = lazy(() => import("./pages/Team"));
const Contacts = lazy(() => import("./pages/Contacts"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Pitch = lazy(() => import("./pages/Pitch"));
const PitchLive = lazy(() => import("./pages/PitchLive"));
const Scanner = lazy(() => import("./pages/Scanner"));
const EcoCoach = lazy(() => import("./pages/EcoCoach"));
const ProductionPlanner = lazy(() => import("./pages/ProductionPlanner"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Founder = lazy(() => import("./pages/Founder"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ErrorBoundary>
        <CartProvider>
          <ZamiConversationProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <RouterErrorBoundary>
                <ScrollToTop />
                <Suspense fallback={<SuspenseFallback />}>
                  <Routes>
                    {/* Multilingual Parent Route: /:lang */}
                    <Route path="/:lang" element={<LanguageRouteWrapper />}>
                      <Route index element={<Index />} />
                      <Route path="about" element={<About />} />
                      <Route path="team" element={<Team />} />
                      <Route path="founder/sukhrobjon-rikhsiboev" element={<Founder />} />
                      <Route path="vote" element={<EcoVote />} />
                      <Route path="actions" element={<EcoActions />} />
                      <Route path="shop" element={<Shop />} />
                      <Route path="shop-legacy" element={<ShopLegacy />} />
                      <Route path="stories" element={<EcoStories />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="partners" element={<Partners />} />
                      <Route path="contacts" element={<Contacts />} />
                      <Route path="product/:id" element={<ProductDetail />} />
                      <Route path="pitch" element={<Pitch />} />
                      <Route path="pitch-live" element={<PitchLive />} />
                      <Route path="scanner" element={<Scanner />} />
                      <Route path="coach" element={<EcoCoach />} />
                      <Route path="planner" element={<ProductionPlanner />} />
                      <Route path="analytics" element={<Analytics />} />
                      <Route path="map" element={<Navigate to="/actions?mode=collection#collection-map" replace />} />
                      <Route path="ecomap" element={<Navigate to="/actions?mode=collection#collection-map" replace />} />
                    </Route>

                    {/* Root URL redirect to default language */}
                    <Route path="/" element={<Navigate to="/en" replace />} />

                    {/* Legacy Unprefixed Route Redirects to default language */}
                    <Route path="/about" element={<Navigate to="/en/about" replace />} />
                    <Route path="/vote" element={<Navigate to="/en/vote" replace />} />
                    <Route path="/actions" element={<Navigate to="/en/actions" replace />} />
                    <Route path="/map" element={<Navigate to="/actions?mode=collection#collection-map" replace />} />
                    <Route path="/ecomap" element={<Navigate to="/actions?mode=collection#collection-map" replace />} />
                    <Route path="/shop" element={<Navigate to="/en/shop" replace />} />
                    <Route path="/shop-legacy" element={<Navigate to="/en/shop-legacy" replace />} />
                    <Route path="/stories" element={<Navigate to="/en/stories" replace />} />
                    <Route path="/profile" element={<Navigate to="/en/profile" replace />} />
                    <Route path="/partners" element={<Navigate to="/en/partners" replace />} />
                    <Route path="/team" element={<Navigate to="/en/team" replace />} />
                    <Route path="/contacts" element={<Navigate to="/en/contacts" replace />} />
                    <Route path="/product/:id" element={<Navigate to="/en/product/:id" replace />} />
                    <Route path="/pitch" element={<Navigate to="/en/pitch" replace />} />
                    <Route path="/pitch-live" element={<Navigate to="/en/pitch-live" replace />} />
                    <Route path="/scanner" element={<Navigate to="/en/scanner" replace />} />
                    <Route path="/coach" element={<Navigate to="/en/coach" replace />} />
                    <Route path="/planner" element={<Navigate to="/en/planner" replace />} />
                    <Route path="/analytics" element={<Navigate to="/en/analytics" replace />} />

                    {/* Multilingual Founder Canonical Aliases */}
                    <Route path="/founder/sukhrobjon-rikhsiboev" element={<Navigate to="/en/founder/sukhrobjon-rikhsiboev" replace />} />
                    <Route path="/founder/suxrobjon-rixsiboyev" element={<Navigate to="/uz/founder/sukhrobjon-rikhsiboev" replace />} />
                    <Route path="/founder/sukhrobjon-rixsiboyev" element={<Navigate to="/en/founder/sukhrobjon-rikhsiboev" replace />} />
                    <Route path="/founder/suxrobjon-rikhsiboev" element={<Navigate to="/ru/founder/sukhrobjon-rikhsiboev" replace />} />
                    <Route path="/founder" element={<Navigate to="/en/founder/sukhrobjon-rikhsiboev" replace />} />

                    {/* Catch-all 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </RouterErrorBoundary>
            </BrowserRouter>
          </ZamiConversationProvider>
        </CartProvider>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;