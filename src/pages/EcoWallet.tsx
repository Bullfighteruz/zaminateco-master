import { Wallet, Coins, Gift, Star, TrendingUp, ShoppingBag, CircleDollarSign, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { currentUser, rewards, partners } from '@/lib/mockData';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export default function EcoWallet() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const transactions = [
    { id: '1', type: 'earn', amount: 50, description: 'Plastic collection at Central Park', time: '2 hours ago' },
    { id: '2', type: 'spend', amount: -75, description: 'Children\'s Souvenirs purchase', time: '1 day ago' },
    { id: '3', type: 'earn', amount: 100, description: 'Tree planting event participation', time: '3 days ago' },
    { id: '4', type: 'earn', amount: 25, description: 'Community cleanup volunteer', time: '5 days ago' },
  ];

  return (
    <Layout title={t('wallet')}>
      <div className="p-4 space-y-6">
        {/* Wallet Balance - Fixed Layout */}
        <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <img 
                  src="/images/eco coins.png" 
                  alt="Eco Coins" 
                  className="h-8 w-8 object-contain"
                  loading="lazy"
                />
                <div>
                  <div className="text-3xl font-bold">{currentUser.ecoCoins}</div>
                  <div className="text-sm opacity-90">{t('ecoCoins')}</div>
                </div>
              </div>
              <p className="text-sm opacity-90">
                {t('environmentalRewards')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Eco Points Display - Fixed Layout */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <img 
                  src="/images/eco-points.png" 
                  alt="Eco Points" 
                  className="h-6 w-6 object-contain"
                  loading="lazy"
                />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{currentUser.ecoPoints}</div>
                  <div className="text-sm text-gray-600">{t('ecoPoints')}</div>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                {t('pointsEarned')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Eco Rewards Store */}
        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Gift className="h-5 w-5 mr-2 text-green-600" />
            {t('ecoRewardsStore')}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {rewards.map((reward) => (
              <Card key={reward.id} className="eco-card-hover">
                <CardContent className="p-4 text-center space-y-3">
                  <span className="text-3xl">{reward.icon}</span>
                  <div>
                    <h4 className="font-medium text-sm">{reward.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{reward.description}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-lg font-bold text-green-600">
                      {reward.cost} {t('ecoCoins').toLowerCase()}
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full"
                      disabled={currentUser.ecoCoins < reward.cost}
                      onClick={() => {
                        if (currentUser.ecoCoins >= reward.cost) {
                          toast.success(t('rewardRedeemed', { defaultValue: 'Reward redeemed successfully!' }));
                          // In a real app, this would update the user's coins and add the reward
                        } else {
                          toast.error(t('notEnoughCoins', { defaultValue: 'Not enough eco coins' }));
                        }
                      }}
                    >
                      {currentUser.ecoCoins >= reward.cost ? t('redeem') : t('notEnoughCoins')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Partner Discounts */}
        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <ShoppingBag className="h-5 w-5 mr-2 text-blue-600" />
            {t('partnerDiscounts')}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {partners.map((partner, index) => (
              <Card key={index} className="eco-card-hover">
                <CardContent className="p-4 text-center space-y-3">
                  <span className="text-3xl">{partner.icon}</span>
                  <div>
                    <h4 className="font-medium text-sm">{partner.name}</h4>
                    <div className="text-lg font-bold text-blue-600">
                      {partner.discount} {t('off')}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      navigate('/partners');
                    }}
                  >
                    {t('viewOffers')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Recent Transactions */}
        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
            {t('recentTransactions')}
          </h3>
          <Card>
            <CardContent className="p-0">
              <div className="space-y-0">
                {transactions.map((transaction, index) => (
                  <div 
                    key={transaction.id} 
                    className={`p-4 flex items-center justify-between ${
                      index !== transactions.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'earn' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'earn' ? '+' : '-'}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{transaction.description}</p>
                        <p className="text-xs text-gray-500">{transaction.time}</p>
                      </div>
                    </div>
                    <div className={`font-semibold ${
                      transaction.type === 'earn' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'earn' ? '+' : ''}{transaction.amount}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* How to Earn More */}
        <Card className="bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">{t('howToEarnMore')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-green-700">
            <p>• {t('collectWaste')}</p>
            <p>• {t('joinEvents')}</p>
            <p>• {t('voteOnProjectsEarn')}</p>
            <p>• {t('shareStories')}</p>
            <p>• {t('referFriends')}</p>
          </CardContent>
        </Card>

        {/* Wallet Stats */}
        <Card>
          <CardHeader>
            <CardTitle>{t('yourImpactSummary')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">
                  {currentUser.wasteCollected}{t('kg')}
                </div>
                <div className="text-xs text-gray-600">{t('wasteCollected')}</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-600">
                  {currentUser.badges.length}
                </div>
                <div className="text-xs text-gray-600">{t('badgesEarned')}</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-purple-600">
                  {currentUser.level}
                </div>
                <div className="text-xs text-gray-600">{t('currentLevel')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}