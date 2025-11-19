import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Settings, Calculator, Code, Users, Mail, Phone, Star, Award, ExternalLink, Linkedin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import '../styles/mobile-responsive.css';

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
      duration: 0.6
    }
  }
};

// Team member interface
interface TeamMember {
  id: number;
  name: string;
  role: string;
  emoji: string;
  color: string;
  roleIcon: React.ComponentType<{ className?: string }>;
  specialty: string;
  description: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  skills: string[];
  achievements: string[];
}

// Interface for member data from translations
interface MemberData {
  name?: string;
  position?: string;
  role?: string;
  description?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  skills?: string[];
  achievements?: string[];
}

// Team member card component
const TeamMemberCard = ({ member }: { member: TeamMember }) => {
  const { t } = useTranslation('team');
  const isMobile = useIsMobile();
  const RoleIcon = member.roleIcon;
  
  const handleContactClick = () => {
    if (member.email) {
      window.open(`mailto:${member.email}`, '_blank');
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={isMobile ? {} : { scale: 1.02, y: -5 }}
      className="h-full"
    >
      <Card className={cn(
        "h-full transition-all duration-500 group border-2 bg-gradient-to-br from-white to-gray-50 overflow-hidden",
        isMobile ? "" : `hover:shadow-2xl hover:border-${member.color}-200`
      )}>
        <CardHeader className={cn("relative", isMobile ? "pb-2 p-3" : "pb-4")}>
          {/* Background decoration */}
          <div className={cn(
            `absolute top-0 right-0 bg-gradient-to-br from-${member.color}-100 to-${member.color}-50 rounded-full opacity-50`,
            isMobile ? "w-16 h-16 -translate-y-8 translate-x-8" : "w-32 h-32 -translate-y-16 translate-x-16"
          )} />
          
          <div className="relative z-10">
            {/* Role icon and badge */}
            <div className={cn("flex items-center justify-between", isMobile ? "mb-2" : "mb-4")}>
              <motion.div
                whileHover={isMobile ? {} : { scale: 1.1, rotate: 5 }}
                className={cn(
                  `rounded-full bg-${member.color}-100 text-${member.color}-600 transition-all duration-300`,
                  isMobile ? "p-2" : "p-4"
                )}
              >
                <RoleIcon className={cn(isMobile ? "h-4 w-4" : "h-8 w-8")} />
              </motion.div>
              <Badge className={cn(
                `bg-gradient-to-r from-${member.color}-500 to-${member.color}-600 text-white font-semibold`,
                isMobile ? "text-[10px] px-2 py-0.5" : "px-3 py-1"
              )}>
                {member.role}
              </Badge>
            </div>

            {/* Member info */}
            <div className={cn("text-center", isMobile ? "mb-2" : "mb-4")}>
              <img 
                src="/images/meet-the-team_15916616.png" 
                alt={member.name} 
                className={cn(
                  "mx-auto object-contain",
                  isMobile ? "w-12 h-12 mb-2" : "w-16 h-16 sm:w-20 sm:h-20 mb-3"
                )} 
                loading="lazy" 
              />
              <CardTitle className={cn(
                "font-bold text-gray-900 transition-colors",
                isMobile ? "text-sm mb-1" : `text-xl group-hover:text-${member.color}-700`
              )}>
                {member.name}
              </CardTitle>
              <p className={cn(
                `font-medium text-${member.color}-600`,
                isMobile ? "text-xs mb-1" : "text-sm mb-2"
              )}>
                {member.specialty}
              </p>
              <p className={cn(
                "text-gray-600 leading-relaxed",
                isMobile ? "text-xs" : "text-sm"
              )}>
                {member.description}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className={cn(isMobile ? "p-3 space-y-2" : "space-y-4")}>
          {/* Contact information - ONLY show if provided */}
          {(member.email || member.phone || member.linkedin) && (
            <div className={cn(isMobile ? "space-y-1" : "space-y-2")}>
              {member.email && (
                <div className={cn(
                  "flex items-center text-gray-600",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  <Mail className={cn("text-green-600", isMobile ? "h-3 w-3 mr-1.5" : "h-4 w-4 mr-2")} />
                  <span className="truncate">{member.email}</span>
                </div>
              )}
              {member.phone && (
                <div className={cn(
                  "flex items-center text-gray-600",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  <Phone className={cn("text-green-600", isMobile ? "h-3 w-3 mr-1.5" : "h-4 w-4 mr-2")} />
                  <span>{member.phone}</span>
                </div>
              )}
              {member.linkedin && (
                <div className={cn(
                  "flex items-center text-gray-600",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  <Linkedin className={cn("text-blue-600", isMobile ? "h-3 w-3 mr-1.5" : "h-4 w-4 mr-2")} />
                  <a 
                    href={member.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline"
                    style={{ touchAction: 'manipulation' }}
                  >
                    {t('team.labels.linkedinProfile', 'LinkedIn Profile')}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Skills */}
          <div>
            <h4 className={cn(
              "font-semibold text-gray-800 flex items-center",
              isMobile ? "text-xs mb-1" : "text-sm mb-2"
            )}>
              <Star className={cn("text-yellow-500", isMobile ? "h-3 w-3 mr-1" : "h-4 w-4 mr-1")} />
              {t('team.labels.coreSkills', 'Core Skills')}
            </h4>
            <div className={cn("flex flex-wrap", isMobile ? "gap-0.5" : "gap-1")}>
              {member.skills.map((skill, index) => (
                <Badge key={index} variant="outline" className={cn(isMobile ? "text-[10px] px-1 py-0" : "text-xs")}>
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div>
            <h4 className={cn(
              "font-semibold text-gray-800 flex items-center",
              isMobile ? "text-xs mb-1" : "text-sm mb-2"
            )}>
              <Award className={cn("text-green-600", isMobile ? "h-3 w-3 mr-1" : "h-4 w-4 mr-1")} />
              {t('team.labels.keyAchievements', 'Key Achievements')}
            </h4>
            <ul className={cn(
              "text-gray-600",
              isMobile ? "text-[10px] space-y-0.5" : "text-xs space-y-1"
            )}>
              {member.achievements.map((achievement, index) => (
                <li key={index} className="flex items-start">
                  <span className={cn(
                    `bg-${member.color}-500 rounded-full flex-shrink-0`,
                    isMobile ? "w-1.5 h-1.5 mt-1 mr-1.5" : "w-2 h-2 mt-1.5 mr-2"
                  )} />
                  {achievement}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact button - ONLY show if email is available */}
          {member.email && (
            <motion.div whileHover={isMobile ? {} : { scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleContactClick}
                className={cn(
                  `w-full bg-gradient-to-r from-${member.color}-500 to-${member.color}-600 text-white font-semibold transition-all duration-300`,
                  isMobile ? "h-9 text-xs py-2" : "hover:from-${member.color}-600 hover:to-${member.color}-700 shadow-lg hover:shadow-xl"
                )}
                style={{ touchAction: 'manipulation' }}
              >
                <Mail className={cn(isMobile ? "h-3 w-3 mr-1.5" : "h-4 w-4 mr-2")} />
                Contact {member.name.split(' ')[0]}
                <ExternalLink className={cn(isMobile ? "h-3 w-3 ml-1.5" : "h-4 w-4 ml-2")} />
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function Team() {
  const { t } = useTranslation('team');
  const isMobile = useIsMobile();

  // Get team members from translations with proper structure
  const getTeamMembers = (): TeamMember[] => {
    const members = ['sukhrobjon', 'azamat', 'khondamir', 'islombek'];
    const icons = [Crown, Settings, Calculator, Code];
    const colors = ['blue', 'green', 'purple', 'orange'];
    const emojis = ['👨‍💼', '👨‍⚙️', '👨‍💻', '👨‍💻'];

    return members.map((memberKey, index) => {
      const memberData = t(`team.members.${memberKey}`, { returnObjects: true }) as MemberData;
      
      return {
        id: index + 1,
        name: memberData?.name || `Member ${index + 1}`,
        role: memberData?.position || 'Team Member',
        emoji: emojis[index],
        color: colors[index],
        roleIcon: icons[index],
        specialty: memberData?.role || 'Specialist',
        description: memberData?.description || 'Team member description',
        email: memberData?.email,
        phone: memberData?.phone,
        linkedin: memberData?.linkedin,
        skills: memberData?.skills || [],
        achievements: memberData?.achievements || []
      };
    });
  };

  const teamMembers = getTeamMembers();

  return (
    <Layout title={t('team.title', 'Our Team')}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className={cn("w-full", isMobile ? "px-2 py-4" : "px-4 md:px-6 lg:px-8 py-8")}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={cn(isMobile ? "space-y-4" : "space-y-8")}
          >
            {/* Header section */}
            <motion.div variants={itemVariants} className={cn("text-center", isMobile ? "space-y-2" : "space-y-4")}>
              <h1 className={cn(
                "font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent",
                isMobile ? "text-xl" : "text-3xl md:text-4xl lg:text-5xl"
              )}>
                {t('team.title', 'Meet Our Team')}
              </h1>
              <p className={cn(
                "text-gray-600 max-w-3xl mx-auto leading-relaxed",
                isMobile ? "text-xs px-2" : "text-lg"
              )}>
                {t('team.subtitle', 'The passionate individuals behind ZAMINAT.eco, working together to create a sustainable future for Uzbekistan through innovation and community engagement.')}
              </p>

              {/* Team stats */}
              <div className={cn(
                "grid grid-cols-2 max-w-2xl mx-auto",
                isMobile ? "gap-2 mt-4" : "md:grid-cols-4 gap-4 mt-8"
              )}>
                <div className={cn("text-center bg-white rounded-lg shadow-sm", isMobile ? "p-2" : "p-4")}>
                  <div className={cn("font-bold text-blue-600", isMobile ? "text-base" : "text-2xl")}>
                    {t('team.stats.members.value', '4')}
                  </div>
                  <div className={cn("text-gray-600", isMobile ? "text-[10px]" : "text-sm")}>
                    {t('team.stats.members.label', 'Team Members')}
                  </div>
                </div>
                <div className={cn("text-center bg-white rounded-lg shadow-sm", isMobile ? "p-2" : "p-4")}>
                  <div className={cn("font-bold text-green-600", isMobile ? "text-base" : "text-2xl")}>
                    {t('team.stats.founded.value', '2025')}
                  </div>
                  <div className={cn("text-gray-600", isMobile ? "text-[10px]" : "text-sm")}>
                    {t('team.stats.founded.label', 'Founded')}
                  </div>
                </div>
                <div className={cn("text-center bg-white rounded-lg shadow-sm", isMobile ? "p-2" : "p-4")}>
                  <div className={cn("font-bold text-purple-600", isMobile ? "text-base" : "text-2xl")}>
                    {t('team.stats.mission.value', '1')}
                  </div>
                  <div className={cn("text-gray-600", isMobile ? "text-[10px]" : "text-sm")}>
                    {t('team.stats.mission.label', 'Mission')}
                  </div>
                </div>
                <div className={cn("text-center bg-white rounded-lg shadow-sm", isMobile ? "p-2" : "p-4")}>
                  <div className={cn("font-bold text-orange-600", isMobile ? "text-base" : "text-2xl")}>
                    {t('team.stats.impact.value', '∞')}
                  </div>
                  <div className={cn("text-gray-600", isMobile ? "text-[10px]" : "text-sm")}>
                    {t('team.stats.impact.label', 'Impact')}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Team members grid */}
            <motion.div variants={itemVariants}>
              <div className={cn(
                "grid grid-cols-1",
                isMobile ? "gap-3" : "md:grid-cols-2 gap-8"
              )}>
                {teamMembers.map((member) => (
                  <TeamMemberCard key={member.id} member={member} />
                ))}
              </div>
            </motion.div>

            {/* Call to action */}
            <motion.div variants={itemVariants} className={cn("text-center", isMobile ? "space-y-3 py-6" : "space-y-6 py-12")}>
              <Card className={cn(
                "mx-auto bg-gradient-to-r from-blue-500 to-green-500 text-white border-0",
                isMobile ? "max-w-full" : "max-w-2xl"
              )}>
                <CardContent className={cn(isMobile ? "p-4" : "p-8")}>
                  <h2 className={cn(
                    "font-bold",
                    isMobile ? "text-base mb-2" : "text-2xl mb-4"
                  )}>
                    {t('team.cta.title', 'Join Our Mission')}
                  </h2>
                  <p className={cn(
                    "text-blue-100",
                    isMobile ? "text-xs mb-3" : "mb-6"
                  )}>
                    {t('team.cta.description', "We're always looking for passionate individuals who share our vision of creating a sustainable future. Join our team and make a real impact.")}
                  </p>
                  <Button
                    size={isMobile ? "default" : "lg"}
                    className={cn(
                      "bg-white text-blue-600 hover:bg-gray-100 font-semibold",
                      isMobile ? "h-9 text-xs py-2 px-4" : ""
                    )}
                    onClick={() => window.open('mailto:sukhrobjonrikhsiboev@gmail.com?subject=Join ZAMINAT.eco Team', '_blank')}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <Users className={cn(isMobile ? "h-3 w-3 mr-1.5" : "h-5 w-5 mr-2")} />
                    {t('team.cta.button', 'Join Our Team')}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}