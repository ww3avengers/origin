import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { PlusIcon, ChartBarIcon, ClipboardIcon, ShareIcon } from '@heroicons/react/24/outline';
import { Card, CardHeader, CardContent, CardTitle } from '~/components/ui/Card';
import { Button } from '~/components/ui/Button';
import {
  getUserReferrals,
  getReferralStats,
  getReferralCode,
  formatCurrency,
  generateReferralUrl,
  ReferralData,
  ReferralStats,
} from '../services/referralService';
import ReferralStatCard from '../components/ReferralStatCard';
import ReferralsList from '../components/ReferralsList';
import ShareModal from '../components/ShareModal';

const ReferralDashboard: React.FC = () => {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralUrl, setReferralUrl] = useState<string>('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const { data: referrals, isLoading: isLoadingReferrals } = useQuery({
    queryKey: ['referrals'],
    queryFn: getUserReferrals,
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['referralStats'],
    queryFn: getReferralStats,
  });

  useEffect(() => {
    const fetchReferralCode = async () => {
      try {
        const data = await getReferralCode();
        setReferralCode(data.code);
        setReferralUrl(generateReferralUrl(data.code));
      } catch (error) {
        console.error('Fehler beim Abrufen des Referral-Codes:', error);
        toast.error('Fehler beim Abrufen des Referral-Codes');
      }
    };

    fetchReferralCode();
  }, []);

  const copyToClipboard = () => {
    if (referralUrl) {
      navigator.clipboard
        .writeText(referralUrl)
        .then(() => toast.success('Link in die Zwischenablage kopiert!'))
        .catch(() => toast.error('Fehler beim Kopieren des Links'));
    }
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  if (isLoadingReferrals || isLoadingStats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-pulse text-gray-600">Lade Referral-Daten...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="mb-1 text-2xl font-bold">Empfehlungs-Programm</h1>
          <p className="text-gray-600">Erhalte 20% Provision für jeden geworbenen Nutzer</p>
        </div>
        <Button onClick={handleShare} className="bg-sky-600 hover:bg-sky-700">
          <ShareIcon className="mr-2 h-4 w-4" />
          Teilen
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Dein persönlicher Referral-Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1 truncate rounded-md border border-gray-200 bg-gray-50 p-3 font-mono text-sm">
              {referralUrl}
            </div>
            <Button onClick={copyToClipboard} variant="outline" className="flex-shrink-0">
              <ClipboardIcon className="mr-2 h-4 w-4" />
              Kopieren
            </Button>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Teile diesen Link und erhalte 20% des Umsatzes für jeden neuen Nutzer, der sich über
            deinen Link registriert.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats && (
          <>
            <ReferralStatCard
              title="Provisionen insgesamt"
              value={formatCurrency(stats.totalCommission)}
              icon={<PlusIcon className="h-5 w-5 text-green-600" />}
            />
            <ReferralStatCard
              title="Erfolgreiche Referrals"
              value={stats.totalReferrals.toString()}
              icon={<ChartBarIcon className="h-5 w-5 text-blue-600" />}
            />
            <ReferralStatCard
              title="Konversionsrate"
              value={`${(stats.conversionRate * 100).toFixed(1)}%`}
              icon={<ChartBarIcon className="h-5 w-5 text-sky-600" />}
            />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Deine Empfehlungen</CardTitle>
        </CardHeader>
        <CardContent>
          {referrals && referrals.length > 0 ? (
            <ReferralsList referrals={referrals} />
          ) : (
            <div className="py-12 text-center text-gray-500">
              <p>Du hast noch keine erfolgreichen Empfehlungen.</p>
              <p className="mt-2 text-sm">Teile deinen Link und erhalte 20% Provision!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {isShareModalOpen && referralCode && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          referralUrl={referralUrl}
          referralCode={referralCode}
        />
      )}
    </div>
  );
};

export default ReferralDashboard;
