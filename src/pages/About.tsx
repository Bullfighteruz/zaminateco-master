import React from 'react';
import { Leaf, Users, Target, Globe, Award, Heart, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TreeIcon, RecyclingIcon, UzbekPattern } from '@/components/EcoIcons';
import { globalStats, goals2026 } from '@/lib/mockData';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export default function About() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const roadmap = [
    { 
      year: '2025', 
      event: t('pilotLaunch'), 
      description: t('pilotLaunchDesc')
    },
    { 
      year: '2026', 
      event: t('regionalExpansion'), 
      description: t('regionalExpansionDesc')
    },
    { 
      year: '2027', 
      event: t('industrialScale'), 
      description: t('industrialScaleDesc')
    },
    { 
      year: '2028-2029', 
      event: t('nationalImpact'), 
      description: t('nationalImpactDesc')
    },
  ];

  const values = [
    {
      icon: <RecyclingIcon className="h-8 w-8" />,
      title: t('circularEconomy'),
      description: t('circularEconomyDesc')
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: t('communityUnity'),
      description: t('communityUnityDesc')
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: t('transparency'),
      description: t('transparencyDesc')
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: t('socialImpact'),
      description: t('socialImpactDesc')
    }
  ];

  return (
    <Layout title={t('aboutProject')}>
      <div className={cn("w-full", isMobile ? "p-2 space-y-3" : "p-4 space-y-6")}>
        {/* Hero Section */}
        <section className={cn(
          "zaminat-gradient rounded-xl text-white relative overflow-hidden",
          isMobile ? "p-3" : "p-6"
        )}>
          <div className={cn(
            "absolute top-0 right-0 opacity-20",
            isMobile ? "h-16 w-16" : "h-32 w-32"
          )}>
            <TreeIcon className={cn(isMobile ? "h-16 w-16" : "h-32 w-32")} animated />
          </div>
          <div className="relative z-10">
            <h1 className={cn(
              "font-bold mb-3",
              isMobile ? "text-lg" : "text-3xl"
            )}>
              {t('aboutZaminatEco')}
            </h1>
            <p className={cn(
              "opacity-90 mb-3 leading-relaxed",
              isMobile ? "text-xs" : "text-lg"
            )}>
              <strong>ZAMINAT.eco</strong> {t('aboutZaminatDesc')}
            </p>
            <div className={cn(
              "flex flex-wrap",
              isMobile ? "gap-1" : "gap-2"
            )}>
              <Badge className={cn(
                "bg-white/20 text-white border-white/30",
                isMobile ? "text-[9px] px-1.5 py-0.5" : "text-xs px-2 py-1"
              )}>
                {t('plasticRubberRecyclingBadge')}
              </Badge>
              <Badge className={cn(
                "bg-white/20 text-white border-white/30",
                isMobile ? "text-[9px] px-1.5 py-0.5" : "text-xs px-2 py-1"
              )}>
                {t('ecoAppPlatformBadge')}
              </Badge>
              <Badge className={cn(
                "bg-white/20 text-white border-white/30",
                isMobile ? "text-[9px] px-1.5 py-0.5" : "text-xs px-2 py-1"
              )}>
                {t('ecoProductsBadge')}
              </Badge>
            </div>
          </div>
          <UzbekPattern className={cn(
            "w-full text-white opacity-50",
            isMobile ? "h-1 mt-2" : "h-2 mt-4"
          )} />
        </section>

        {/* Mission Statement */}
        <section>
          <Card>
            <CardHeader className={cn(isMobile ? "p-3 pb-2" : "p-6")}>
              <CardTitle className={cn(
                "flex items-center",
                isMobile ? "text-sm" : "text-lg"
              )}>
                <Target className={cn("text-green-600", isMobile ? "h-4 w-4 mr-1.5" : "h-6 w-6 mr-2")} />
                {t('ourMission')}
              </CardTitle>
            </CardHeader>
            <CardContent className={cn(isMobile ? "space-y-3 p-3" : "space-y-4 p-6")}>
              <p className={cn(
                "text-gray-700 leading-relaxed",
                isMobile ? "text-xs" : "text-base"
              )}>
                <strong>{t('missionStatement')}</strong>
              </p>
              
              <div className={cn(
                "grid",
                isMobile ? "grid-cols-1 gap-2" : "md:grid-cols-2 gap-4"
              )}>
                <div className={cn(
                  "bg-green-50 rounded-lg",
                  isMobile ? "p-2.5" : "p-4"
                )}>
                  <h3 className={cn(
                    "font-semibold text-green-800 mb-2",
                    isMobile ? "text-xs" : "text-sm"
                  )}>
                    {t('whatWeDo')}
                  </h3>
                  <ul className={cn(
                    "text-green-700",
                    isMobile ? "text-[10px] space-y-0.5" : "text-sm space-y-1"
                  )}>
                    <li>• <strong>{t('plastic')}</strong> {t('plasticRecyclingIntoTiles')}</li>
                    <li>• <strong>{t('tires')}</strong> {t('rubberRecyclingIntoPlayground')}</li>
                    <li>• {t('communityInfrastructureProjects')}</li>
                    <li>• {t('educationalProgramsAndVolunteers')}</li>
                  </ul>
                </div>
                
                <div className={cn(
                  "bg-blue-50 rounded-lg",
                  isMobile ? "p-2.5" : "p-4"
                )}>
                  <h3 className={cn(
                    "font-semibold text-blue-800 mb-2",
                    isMobile ? "text-xs" : "text-sm"
                  )}>
                    {t('ourImpactGoals')}
                  </h3>
                  <ul className={cn(
                    "text-blue-700",
                    isMobile ? "text-[10px] space-y-0.5" : "text-sm space-y-1"
                  )}>
                    <li>• {t('schoolsAndPlaygrounds')}</li>
                    <li>• {t('parksAndPublicSpaces')}</li>
                    <li>• {t('transparentWasteTracking')}</li>
                    <li>• {t('gamifiedEnvironmentalEngagement')}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Core Values */}
        <section>
          <h2 className={cn(
            "font-bold mb-3 flex items-center",
            isMobile ? "text-base" : "text-2xl mb-4"
          )}>
            <Award className={cn(
              "text-yellow-600",
              isMobile ? "h-4 w-4 mr-1.5" : "h-6 w-6 mr-2"
            )} />
            {t('ourValues')}
          </h2>
          <div className={cn(
            "grid",
            isMobile ? "gap-2" : "gap-4"
          )}>
            {values.map((value, index) => (
              <Card key={index} className="eco-card-hover">
                <CardContent className={cn(isMobile ? "p-3" : "p-4")}>
                  <div className={cn(
                    "flex items-start",
                    isMobile ? "space-x-2" : "space-x-4"
                  )}>
                    <div className={cn(
                      "text-green-600 flex-shrink-0",
                      isMobile ? "mt-0.5" : ""
                    )}>
                      {isMobile ? (
                        <div className="h-6 w-6">
                          {React.cloneElement(value.icon, { className: "h-6 w-6" })}
                        </div>
                      ) : (
                        value.icon
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className={cn(
                        "font-semibold mb-1.5",
                        isMobile ? "text-xs" : "text-lg mb-2"
                      )}>
                        {value.title}
                      </h3>
                      <p className={cn(
                        "text-gray-600 leading-relaxed",
                        isMobile ? "text-[10px]" : "text-sm"
                      )}>
                        {value.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Roadmap */}
        <section>
          <h2 className={cn(
            "font-bold mb-3",
            isMobile ? "text-base" : "text-2xl mb-4"
          )}>
            {t('ourRoadmap')}
          </h2>
          <div className={cn(isMobile ? "space-y-2" : "space-y-4")}>
            {roadmap.map((milestone, index) => (
              <Card key={index} className="eco-card-hover">
                <CardContent className={cn(isMobile ? "p-3" : "p-4")}>
                  <div className={cn(
                    "flex items-start",
                    isMobile ? "space-x-2" : "space-x-4"
                  )}>
                    <div className={cn(
                      "bg-green-100 text-green-800 rounded-full font-semibold flex-shrink-0",
                      isMobile ? "px-2 py-0.5 text-[9px]" : "px-3 py-1 text-sm"
                    )}>
                      {milestone.year}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className={cn(
                        "font-semibold mb-1",
                        isMobile ? "text-xs" : "text-lg"
                      )}>
                        {milestone.event}
                      </h3>
                      <p className={cn(
                        "text-gray-600",
                        isMobile ? "text-[10px] leading-relaxed" : "text-sm"
                      )}>
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Current Progress vs Goals */}
        <section>
          <Card>
            <CardHeader className={cn(isMobile ? "p-3 pb-2" : "p-6")}>
              <CardTitle className={cn(
                "flex items-center",
                isMobile ? "text-sm" : "text-lg"
              )}>
                <Globe className={cn("text-blue-600", isMobile ? "h-4 w-4 mr-1.5" : "h-6 w-6 mr-2")} />
                {t('currentProgressAnd2026Goals')}
              </CardTitle>
            </CardHeader>
            <CardContent className={cn(isMobile ? "space-y-3 p-3" : "space-y-4 p-6")}>
              <p className={cn(
                "text-gray-700 leading-relaxed",
                isMobile ? "text-xs" : "text-base"
              )}>
                <strong>ZAMINAT.eco</strong> {t('currentProgressDesc')}
              </p>
              
              <div className={cn(
                "grid",
                isMobile ? "grid-cols-1 gap-2" : "md:grid-cols-2 gap-4"
              )}>
                <div className={cn(
                  "bg-gray-50 rounded-lg",
                  isMobile ? "p-2.5" : "p-4"
                )}>
                  <h3 className={cn(
                    "font-semibold text-gray-800 mb-2",
                    isMobile ? "text-xs" : "text-sm mb-3"
                  )}>
                    {t('currentStatus2025')}
                  </h3>
                  <div className={cn(isMobile ? "space-y-1.5" : "space-y-2")}>
                    <div className="flex justify-between items-center">
                      <span className={cn(isMobile ? "text-[10px]" : "text-sm")}>
                        {t('plasticRubberRecycledLabel')}
                      </span>
                      <span className={cn(
                        "font-semibold",
                        isMobile ? "text-[10px]" : "text-sm"
                      )}>
                        {globalStats.totalWasteCollected} {t('kg')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={cn(isMobile ? "text-[10px]" : "text-sm")}>
                        {t('activeUsersLabel')}
                      </span>
                      <span className={cn(
                        "font-semibold",
                        isMobile ? "text-[10px]" : "text-sm"
                      )}>
                        {globalStats.totalUsers}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={cn(isMobile ? "text-[10px]" : "text-sm")}>
                        {t('pilotProjectsLabel')}
                      </span>
                      <span className={cn(
                        "font-semibold",
                        isMobile ? "text-[10px]" : "text-sm"
                      )}>
                        {globalStats.totalProjects}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={cn(isMobile ? "text-[10px]" : "text-sm")}>
                        {t('treesPlantedLabel')}
                      </span>
                      <span className={cn(
                        "font-semibold",
                        isMobile ? "text-[10px]" : "text-sm"
                      )}>
                        {globalStats.treesPlanted}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className={cn(
                  "bg-green-50 rounded-lg",
                  isMobile ? "p-2.5" : "p-4"
                )}>
                  <h3 className={cn(
                    "font-semibold text-green-800 mb-2",
                    isMobile ? "text-xs" : "text-sm mb-3"
                  )}>
                    {t('2026Goals')}
                  </h3>
                  <div className={cn(isMobile ? "space-y-1.5" : "space-y-2")}>
                    <div className="flex justify-between items-center">
                      <span className={cn(isMobile ? "text-[10px]" : "text-sm")}>
                        {t('wasteTargetLabel')}
                      </span>
                      <span className={cn(
                        "font-semibold",
                        isMobile ? "text-[10px]" : "text-sm"
                      )}>
                        {(goals2026.wasteTarget / 1000).toLocaleString()} {t('tons')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={cn(isMobile ? "text-[10px]" : "text-sm")}>
                        {t('userTargetLabel')}
                      </span>
                      <span className={cn(
                        "font-semibold",
                        isMobile ? "text-[10px]" : "text-sm"
                      )}>
                        {goals2026.usersTarget.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={cn(isMobile ? "text-[10px]" : "text-sm")}>
                        {t('projectTargetLabel')}
                      </span>
                      <span className={cn(
                        "font-semibold",
                        isMobile ? "text-[10px]" : "text-sm"
                      )}>
                        {goals2026.projectsTarget}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={cn(isMobile ? "text-[10px]" : "text-sm")}>
                        {t('treeTargetLabel')}
                      </span>
                      <span className={cn(
                        "font-semibold",
                        isMobile ? "text-[10px]" : "text-sm"
                      )}>
                        {goals2026.treesTarget.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Technology & Innovation */}
        <section>
          <Card>
            <CardHeader className={cn(isMobile ? "p-3 pb-2" : "p-6")}>
              <CardTitle className={cn(
                "flex items-center",
                isMobile ? "text-sm" : "text-lg"
              )}>
                <Globe className={cn("text-blue-600", isMobile ? "h-4 w-4 mr-1.5" : "h-6 w-6 mr-2")} />
                {t('technologyAndInnovation')}
              </CardTitle>
            </CardHeader>
            <CardContent className={cn(isMobile ? "space-y-3 p-3" : "space-y-4 p-6")}>
              <p className={cn(
                "text-gray-700 leading-relaxed",
                isMobile ? "text-xs" : "text-base"
              )}>
                <strong>ZAMINAT.eco</strong> {t('technologyDesc')}
              </p>
              
              <div className={cn(
                "grid",
                isMobile ? "grid-cols-1 gap-3" : "md:grid-cols-2 gap-4"
              )}>
                <div>
                  <h3 className={cn(
                    "font-semibold mb-2",
                    isMobile ? "text-xs" : "text-sm"
                  )}>
                    {t('ecoAppPlatform')}
                  </h3>
                  <ul className={cn(
                    "text-gray-600",
                    isMobile ? "text-[10px] space-y-0.5" : "text-sm space-y-1"
                  )}>
                    <li>• {t('gamificationWith50Levels')}</li>
                    <li>• {t('democraticVotingOnProjects')}</li>
                    <li>• {t('realTimeWasteTracking')}</li>
                    <li>• {t('socialMissionMarketplace')}</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className={cn(
                    "font-semibold mb-2",
                    isMobile ? "text-xs" : "text-sm"
                  )}>
                    {t('plannedFeatures')}
                  </h3>
                  <ul className={cn(
                    "text-gray-600",
                    isMobile ? "text-[10px] space-y-0.5" : "text-sm space-y-1"
                  )}>
                    <li>• {t('blockchainTransparency2027')}</li>
                    <li>• {t('arEducationalModules')}</li>
                    <li>• {t('communityImpactDashboards')}</li>
                    <li>• {t('integrationWithEcoKids')}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact Section */}
        <section>
          <Card className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardHeader className={cn(isMobile ? "p-3 pb-2" : "p-6")}>
              <CardTitle className={cn(
                "flex items-center",
                isMobile ? "text-sm" : "text-lg"
              )}>
                <Mail className={cn("text-green-600", isMobile ? "h-4 w-4 mr-1.5" : "h-6 w-6 mr-2")} />
                {t('getInTouch')}
              </CardTitle>
            </CardHeader>
            <CardContent className={cn(isMobile ? "space-y-3 p-3" : "space-y-4 p-6")}>
              <p className={cn(
                "text-gray-700 leading-relaxed",
                isMobile ? "text-xs" : "text-base"
              )}>
                {t('joinZaminatMovement')}
              </p>
              
              <div className={cn(
                "flex",
                isMobile ? "flex-col gap-2" : "flex-col sm:flex-row gap-3"
              )}>
                <Button 
                  asChild
                  className={cn(
                    "bg-green-600 hover:bg-green-700",
                    isMobile ? "h-9 text-xs" : "h-auto"
                  )}
                  style={{ touchAction: 'manipulation' }}
                >
                  <a href="mailto:sukhrobjonrikhsiboev@gmail.com">
                    <Mail className={cn(isMobile ? "h-3 w-3 mr-1.5" : "h-4 w-4 mr-2")} />
                    {t('contactUs')}
                  </a>
                </Button>
                <Button 
                  asChild
                  variant="outline"
                  className={cn(isMobile ? "h-9 text-xs" : "h-auto")}
                  style={{ touchAction: 'manipulation' }}
                >
                  <a 
                    href="https://t.me/zaminat_eco" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {t('joinTelegramCommunity')}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        <section className={cn(
          "text-center",
          isMobile ? "py-3" : "py-6"
        )}>
          <div className={cn(isMobile ? "space-y-2" : "space-y-4")}>
            <TreeIcon className={cn(
              "mx-auto text-green-600",
              isMobile ? "h-10 w-10" : "h-16 w-16"
            )} animated />
            <h2 className={cn(
              "font-bold text-gray-900",
              isMobile ? "text-base" : "text-2xl"
            )}>
              {t('joinTheZaminatMovement')}
            </h2>
            <p className={cn(
              "text-gray-600 leading-relaxed",
              isMobile ? "text-xs px-2" : "text-base"
            )}>
              {t('bePartOfTransformation')}
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}