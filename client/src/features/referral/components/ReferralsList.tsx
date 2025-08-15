import React from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { ReferralData } from '../services/referralService';
import Badge from './Badge';
import { formatCurrency } from '../services/referralService';

interface ReferralsListProps {
  referrals: ReferralData[];
}

const statusLabels: Record<string, string> = {
  pending: 'Ausstehend',
  active: 'Aktiv',
  completed: 'Abgeschlossen',
  expired: 'Abgelaufen',
};

const ReferralsList: React.FC<ReferralsListProps> = ({ referrals }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Nutzer
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Datum
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Provision
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {referrals.map((referral) => (
            <tr key={referral.id}>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex items-center">
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {referral.referred ? referral.referred.name : '–'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {referral.referred ? referral.referred.email : '–'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm text-gray-900">
                  {referral.conversionDate
                    ? format(new Date(referral.conversionDate), 'dd. MMMM yyyy', { locale: de })
                    : format(new Date(referral.createdAt), 'dd. MMMM yyyy', { locale: de })}
                </div>
                <div className="text-xs text-gray-500">
                  {referral.conversionDate
                    ? format(new Date(referral.conversionDate), 'HH:mm', { locale: de }) + ' Uhr'
                    : format(new Date(referral.createdAt), 'HH:mm', { locale: de }) + ' Uhr'}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="badge--brand inline-block">
                  <Badge>{statusLabels[referral.status]}</Badge>
                </div>
                <div className="mt-1 text-xs text-gray-500">{referral.clickCount} Klicks</div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm font-semibold text-gray-900">
                  {formatCurrency(referral.commissionsEarned)}
                </div>
                <div className="text-xs text-gray-500">
                  {referral.status === 'completed'
                    ? `Letzte Zahlung: ${
                        referral.lastCommissionDate
                          ? format(new Date(referral.lastCommissionDate), 'dd.MM.yyyy', {
                              locale: de,
                            })
                          : '–'
                      }`
                    : `${Math.round(referral.commissionRate * 100)}% Rate`}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReferralsList;
