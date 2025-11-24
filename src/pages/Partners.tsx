import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Car, Coffee, Utensils, Package, Plane, ExternalLink, Coins, TrendingUp, Users, Gift, Star, X, Info, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import '../styles/mobile-responsive.css';
import { contactHelpers } from '@/utils/mailto';

type Partner = {
  id: number;
  name: string;
  category: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  bgColor?: string;
  borderColor?: string;
  discount: string | number;
  coinsRequired: number;
  description: string;
  details?: string;
  featured?: boolean;
};

// Partner Card Component
const PartnerCard = ({ partner, isMobile }: { partner: Partner; isMobile: boolean }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t, i18n } = useTranslation();
  const IconComponent = partner.icon;

  return (
    <Card
      className={cn(
        "h-full border border-slate-200/60 bg-white/90 shadow-sm hover:shadow-md hover:border-slate-300/60 transition-all duration-200 overflow-hidden relative group",
        isMobile ? "rounded-lg" : "rounded-xl",
        partner.featured && "ring-1 ring-green-400/30 bg-gradient-to-br from-white to-green-50/30"
      )}
    >
      <CardHeader className={cn(
        "relative z-0",
        isMobile ? "pb-2 p-3" : "pb-4 p-5"
      )}>
        <div className="flex items-start justify-between mb-2 gap-1.5">
          <div className={cn(
            `rounded-lg bg-gradient-to-br ${partner.color} text-white shadow-md flex items-center justify-center transition-transform duration-200 group-hover:scale-105 flex-shrink-0`,
            isMobile ? "p-2" : "p-3"
          )}>
            <IconComponent className={cn(isMobile ? "h-4 w-4" : "h-6 w-6")} />
          </div>
          <div className="flex items-start gap-1.5 flex-1 min-w-0">
            {partner.featured && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-[9px] px-1 py-0.5 shadow-sm flex-shrink-0">
                <Star className="h-2 w-2 mr-0.5 fill-white" />
                <span className="whitespace-nowrap">{t('featured', { ns: 'common', defaultValue: 'Featured' })}</span>
              </Badge>
            )}
            <Badge 
              variant="secondary" 
              className={cn(
                "font-medium border border-slate-200 bg-slate-50 text-slate-700 flex-shrink-0",
                isMobile ? "text-[9px] px-1.5 py-0.5" : "text-xs px-2 py-1"
              )}
            >
              {partner.category}
            </Badge>
          </div>
        </div>
        
        <CardTitle className={cn(
          "font-bold text-slate-900 mb-1 leading-tight",
          isMobile ? "text-sm" : "text-lg"
        )}>
          {partner.name}
        </CardTitle>
        
        <CardDescription className={cn(
          "text-slate-600 leading-relaxed",
          isMobile ? "text-[10px] line-clamp-2" : "text-sm line-clamp-2"
        )}>
          {partner.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className={cn(
        "relative z-0",
        isMobile ? "p-3 pt-0 space-y-2" : "p-5 pt-0 space-y-3"
      )}>
        {/* Expandable Details */}
        {isExpanded && (
          <div className={cn(
            "bg-slate-50 rounded-lg border border-slate-200/50 mb-2",
            isMobile ? "p-2" : "p-3 mb-3"
          )}>
            <p className={cn(
              "text-slate-700 leading-relaxed",
              isMobile ? "text-[10px]" : "text-sm"
            )}>
              {partner.details}
            </p>
          </div>
        )}

        {/* Discount and Coins */}
        <div className={cn(
          "flex items-center justify-between",
          isMobile ? "gap-1.5" : "gap-3"
        )}>
          <Badge className={cn(
            `bg-gradient-to-r ${partner.color} text-white font-semibold border-0 shadow-sm`,
            isMobile ? "text-[9px] px-2 py-0.5" : "text-xs px-3 py-1.5"
          )}>
            {partner.discount}% {t('off')}
          </Badge>
          
          <div className={cn(
            "flex items-center text-slate-700 font-semibold bg-amber-50 rounded-md border border-amber-200/50",
            isMobile ? "text-[9px] px-1.5 py-0.5" : "text-xs px-2 py-1"
          )}>
            <Coins className={cn(
              "text-amber-600",
              isMobile ? "h-2.5 w-2.5 mr-0.5" : "h-3.5 w-3.5 mr-1.5"
            )} />
            <span className="whitespace-nowrap">
              {partner.coinsRequired} {t('required')}
            </span>
          </div>
        </div>

        {/* Toggle Details Button */}
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "w-full text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 transition-colors",
            isMobile ? "h-7 text-[9px] py-1" : "h-8 text-xs"
          )}
        >
          {isExpanded ? (
            <>
              <X className={cn("mr-1", isMobile ? "h-2.5 w-2.5" : "h-3.5 w-3.5")} />
              {t('showLess', { ns: 'common' })}
            </>
          ) : (
            <>
              <Info className={cn("mr-1", isMobile ? "h-2.5 w-2.5" : "h-3.5 w-3.5")} />
              {t('showDetails', { ns: 'common' })}
            </>
          )}
        </Button>
        
        {/* CTA Button */}
        <Button 
          className={cn(
            "w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold shadow-sm hover:shadow-md transition-all duration-200 border-0 group/btn",
            isMobile ? "h-8 text-[10px] py-1.5" : "h-10 text-sm"
          )}
          variant="default"
          style={{ touchAction: 'manipulation' }}
          onClick={() => {
            // Navigate to shop or open partner offer
            const currentLanguage = i18n.language || 'en';
            contactHelpers.partnerInquiry(partner.name, currentLanguage);
            toast.info(t('openingEmail', { defaultValue: 'Opening email client...', ns: 'common' }));
          }}
        >
          <ExternalLink className={cn("mr-1 group-hover/btn:translate-x-0.5 transition-transform", isMobile ? "h-3 w-3" : "h-4 w-4")} />
          {t('viewOffer')}
        </Button>
      </CardContent>
    </Card>
  );
};

const Partners = () => {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Safe translation helper with fallbacks
  const safeTranslate = (key: string, defaultValue: string, ns?: string) => {
    try {
      const result = t(key, { ns, defaultValue });
      return result || defaultValue;
    } catch (error) {
      return defaultValue;
    }
  };

  const partners = [
    {
      id: 1,
      name: safeTranslate('carrefourTashkent', 'Carrefour Tashkent'),
      category: safeTranslate('grocery', 'Grocery'),
      icon: ShoppingBag,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      discount: '15',
      coinsRequired: 30,
      description: safeTranslate('carrefourDesc', 'Discount on eco-friendly products'),
      details: safeTranslate('partnerDescriptions.groceryStore', 'Eco-friendly grocery store with organic products', 'shop'),
      featured: true
    },
    {
      id: 2,
      name: safeTranslate('yandexTaxi', 'Yandex Taxi'),
      category: safeTranslate('transport', 'Transport'),
      icon: Car,
      color: 'from-yellow-500 to-amber-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      discount: '10',
      coinsRequired: 25,
      description: safeTranslate('yandexTaxiDesc', 'Eco-friendly rides'),
      details: safeTranslate('partnerDescriptions.taxiRides', 'Eco-friendly taxi rides', 'shop'),
      featured: false
    },
    {
      id: 3,
      name: safeTranslate('coffeeBeanCafe', 'Coffee Bean Cafe'),
      category: safeTranslate('food', 'Food & Drinks'),
      icon: Coffee,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      discount: '25',
      coinsRequired: 15,
      description: safeTranslate('coffeeBeanDesc', 'Sustainable coffee'),
      details: safeTranslate('partnerDescriptions.coffeeShop', 'Sustainable coffee shop', 'shop'),
      featured: true
    },
    {
      id: 4,
      name: safeTranslate('samarkandDarvoza', 'Samarkand Darvoza'),
      category: safeTranslate('restaurant', 'Restaurant'),
      icon: Utensils,
      color: 'from-red-500 to-rose-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      discount: '25',
      coinsRequired: 40,
      description: safeTranslate('samarkandDesc', 'Traditional cuisine'),
      details: safeTranslate('partnerDescriptions.restaurant', 'Traditional restaurant', 'shop'),
      featured: false
    },
    {
      id: 5,
      name: safeTranslate('korzinkaUz', 'Korzinka.uz'),
      category: safeTranslate('delivery', 'Delivery'),
      icon: Package,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      discount: '12',
      coinsRequired: 20,
      description: safeTranslate('korzinkaDesc', 'Online grocery shopping'),
      details: safeTranslate('partnerDescriptions.grocery', 'Online grocery delivery', 'shop'),
      featured: false
    },
    {
      id: 6,
      name: safeTranslate('uzbekistanAirways', 'Uzbekistan Airways'),
      category: safeTranslate('travel', 'Travel'),
      icon: Plane,
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-300',
      discount: '5',
      coinsRequired: 100,
      description: safeTranslate('uzbekistanAirwaysDesc', 'Carbon-neutral flights'),
      details: safeTranslate('partnerDescriptions.airline', 'Carbon-neutral airline', 'shop'),
      featured: true
    }
  ];

  return (
    <Layout title={t('ourPartners')}>
      <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20">
        {/* Enhanced Hero Section with Rich Content */}
        <div className={cn(
          "relative border-b border-slate-200/50 bg-white/90",
          isMobile ? "py-4 px-3" : "py-12 px-6"
        )}>
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgb(148, 163, 184) 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }} />
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center">
              {/* Icon with Glow Effect */}
              <div className={cn(
                "inline-flex items-center justify-center",
                isMobile ? "mb-2" : "mb-5"
              )}>
                <div className={cn(
                  "relative bg-gradient-to-br from-green-500 via-blue-500 to-purple-600 rounded-xl shadow-lg",
                  isMobile ? "p-2" : "p-4"
                )}>
                  <Gift className={cn(
                    "text-white relative z-10",
                    isMobile ? "h-5 w-5" : "h-7 w-7"
                  )} />
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-purple-500 rounded-xl blur-xl opacity-50 -z-10" />
                </div>
              </div>

              {/* Main Title */}
              <h1 className={cn(
                "font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 tracking-tight",
                isMobile ? "text-xl mb-2" : "text-4xl mb-4"
              )}>
              {t('ourPartners')}
            </h1>
              
              {/* Enhanced Description */}
              <p className={cn(
                "text-slate-600 mx-auto leading-relaxed",
                isMobile ? "text-xs mb-3 px-2" : "text-base mb-6 max-w-2xl"
              )}>
              {t('partnersDescription')}
            </p>
            
              {/* Key Benefits Section */}
              <div className={cn(
                "grid max-w-3xl mx-auto",
                isMobile ? "grid-cols-1 gap-2 mb-3" : "grid-cols-3 gap-3 mb-8"
              )}>
                {[
                  {
                    icon: CheckCircle2,
                    text: t('exclusiveDiscounts', { defaultValue: 'Exclusive Discounts' }),
                    color: 'text-green-600'
                  },
                  {
                    icon: Sparkles,
                    text: t('ecoFriendlyPartners', { defaultValue: 'Eco-Friendly Partners' }),
                    color: 'text-blue-600'
                  },
                  {
                    icon: Coins,
                    text: t('earnAndRedeem', { defaultValue: 'Earn & Redeem Coins' }),
                    color: 'text-purple-600'
                  }
                ].map((benefit, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center gap-1.5 bg-white/90 rounded-lg border border-slate-200/50",
                      isMobile ? "px-2.5 py-1.5 justify-start" : "px-4 py-2.5 justify-center"
                    )}
                  >
                    <benefit.icon className={cn("flex-shrink-0", benefit.color, isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                    <span className={cn(
                      "font-medium text-slate-700",
                      isMobile ? "text-[10px]" : "text-sm"
                    )}>
                      {benefit.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Compact Stats */}
              <div className={cn(
                "flex justify-center flex-wrap",
                isMobile ? "gap-2" : "gap-4"
              )}>
                {[
                  {
                    icon: Users,
                    value: "6",
                    label: t('activePartners'),
                    gradient: "from-green-500 to-emerald-500"
                  },
                  {
                    icon: TrendingUp,
                    value: "25%",
                    label: t('maxDiscount'),
                    gradient: "from-blue-500 to-cyan-500"
                  },
                  {
                    icon: Coins,
                    value: "15",
                    label: t('minCoinsRequired'),
                    gradient: "from-purple-500 to-indigo-500"
                  }
                ].map((stat, index) => (
                  <div
                    key={index}
                    className={cn(
                      "bg-white/90 rounded-lg border border-slate-200/60 shadow-sm",
                      isMobile ? "px-2 py-1.5 min-w-[75px] flex-1 max-w-[100px]" : "px-4 py-3 min-w-[110px]"
                    )}
                  >
                    <div className={cn(
                      `inline-flex items-center justify-center rounded-lg mb-1 bg-gradient-to-br ${stat.gradient}`,
                      isMobile ? "p-1" : "p-2 mb-2"
                    )}>
                      <stat.icon className={cn("text-white", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                    </div>
                    <div className={cn(
                      "font-bold text-slate-800",
                      isMobile ? "text-base mb-0.5" : "text-xl mb-0.5"
                    )}>
                      {stat.value}
                    </div>
                    <div className={cn(
                      "text-slate-600 font-medium",
                      isMobile ? "text-[9px] leading-tight" : "text-xs leading-tight"
                    )}>
                      {stat.label}
                    </div>
              </div>
                ))}
              </div>
            </div>
          </div>
                    </div>

        {/* Main Content */}
        <div className={cn(
          "relative",
          isMobile ? "px-3 py-4" : "px-4 py-8"
        )}>
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className={cn(
              "mb-4",
              isMobile ? "mb-3" : "mb-6"
            )}>
              <h2 className={cn(
                "font-semibold text-slate-800",
                isMobile ? "text-base" : "text-xl"
              )}>
                {t('availableOffers', { defaultValue: 'Available Offers' })}
              </h2>
              <p className={cn(
                "text-slate-600 mt-0.5",
                isMobile ? "text-[10px]" : "text-sm"
              )}>
                {t('selectPartnerOffer', { defaultValue: 'Select a partner offer below to redeem your eco-coins' })}
              </p>
                      </div>
                      
            {/* Partners Grid */}
            <div className={cn(
              "grid",
              isMobile ? "grid-cols-1 gap-3 mb-6" : "md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10"
            )}>
              {partners.map((partner) => (
                <PartnerCard key={partner.id} partner={partner} isMobile={isMobile} />
              ))}
          </div>

            <Separator className={cn(
              "bg-gradient-to-r from-transparent via-slate-200 to-transparent",
              isMobile ? "my-4" : "my-10"
            )} />

          {/* How to Use Section */}
            <div className={cn(isMobile ? "mb-5" : "mb-10")}>
              <div className={cn(
                "text-center",
                isMobile ? "mb-3" : "mb-6"
              )}>
                <h2 className={cn(
                  "font-bold text-slate-800",
                  isMobile ? "text-sm mb-1" : "text-xl mb-2"
                )}>
                  {t('howToUseOffers')}
                </h2>
                <p className={cn(
                  "text-slate-600",
                  isMobile ? "text-[10px]" : "text-sm"
                )}>
                  {t('followTheseSteps', { defaultValue: 'Follow these simple steps to start saving' })}
                </p>
              </div>
              
              <div className={cn(
                "grid",
                isMobile ? "grid-cols-2 gap-2" : "grid-cols-4 gap-4"
              )}>
              {[
                {
                  step: "1",
                  title: t('earnCoinsStep'),
                    icon: Coins,
                    color: "from-green-500 to-emerald-500",
                },
                {
                  step: "2", 
                  title: t('checkOffersStep'),
                    icon: Gift,
                    color: "from-blue-500 to-cyan-500",
                },
                {
                  step: "3",
                  title: t('redeemStep'),
                    icon: TrendingUp,
                    color: "from-purple-500 to-indigo-500",
                },
                {
                  step: "4",
                  title: t('enjoyStep'),
                    icon: Users,
                    color: "from-orange-500 to-red-500",
                }
              ].map((item) => (
                  <div
                    key={item.step}
                    className={cn(
                      "text-center bg-white/90 rounded-lg border border-slate-200/60 shadow-sm flex flex-col items-center",
                      isMobile ? "p-2" : "p-4"
                    )}
                  >
                    <div className={cn(
                      `bg-gradient-to-br ${item.color} rounded-full text-white font-bold shadow-sm mx-auto flex items-center justify-center flex-shrink-0`,
                      isMobile ? "w-6 h-6 text-[10px] mb-1" : "w-10 h-10 text-sm mb-2.5"
                    )}>
                    {item.step}
                  </div>
                    
                    <div className={cn(
                      `inline-flex items-center justify-center rounded-lg bg-gradient-to-br ${item.color} flex-shrink-0`,
                      isMobile ? "p-1 mb-1" : "p-1.5 mb-2"
                    )}>
                      <item.icon className={cn("text-white", isMobile ? "h-3 w-3" : "h-5 w-5")} />
                    </div>
                    
                    <p className={cn(
                      "text-slate-700 font-medium leading-tight text-center flex-1",
                      isMobile ? "text-[9px]" : "text-xs"
                    )}>
                      {item.title}
                    </p>
                </div>
              ))}
            </div>
          </div>

            {/* Enhanced Call to Action */}
            <div className={cn(
              "relative bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 rounded-xl text-center text-white overflow-hidden shadow-lg",
              isMobile ? "p-4 mb-12" : "p-8 mb-20"
            )}>
              {/* Subtle Pattern Overlay */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: '20px 20px'
                }} />
              </div>

              <div className="relative z-10">
                <div className={cn(
                  "inline-flex items-center justify-center bg-white/30 rounded-full",
                  isMobile ? "p-2 mb-2" : "p-3 mb-4"
                )}>
                  <Gift className={cn("text-white", isMobile ? "h-4 w-4" : "h-6 w-6")} />
                </div>
                
                <h3 className={cn(
                  "font-bold",
                  isMobile ? "text-sm mb-1.5" : "text-xl mb-3"
                )}>
                  {t('startEarningToday')}
                </h3>
                
                <p className={cn(
                  "opacity-95 leading-relaxed mx-auto",
                  isMobile ? "text-[10px] mb-3 max-w-xs" : "text-sm mb-5 max-w-xl"
                )}>
              {t('startEarningDescription')}
            </p>
                
                <Button 
                  size={isMobile ? "default" : "lg"} 
                  variant="secondary" 
                  className={cn(
                    "bg-white text-green-600 hover:bg-gray-50 font-semibold shadow-md hover:shadow-lg transition-all duration-200 group/cta",
                    isMobile ? "h-8 text-[10px] px-4" : "h-11 text-sm px-6"
                  )}
                  style={{ touchAction: 'manipulation' }}
                  onClick={() => {
                    // Navigate to actions page to start collecting eco coins
                    navigate('/actions');
                  }}
                >
                  <Coins className={cn("mr-1", isMobile ? "h-3 w-3" : "h-4 w-4")} />
              {t('startCollecting')}
                  <ArrowRight className={cn("ml-1 group-hover/cta:translate-x-0.5 transition-transform", isMobile ? "h-3 w-3" : "h-4 w-4")} />
            </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Partners;
