import React from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { ReferralData } from '../services/referralService';
import Badge from './Badge';
import { formatCurrency } from '../services/referralService';

interface ReferralsListProps {
  referrals: ReferralData[];
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  expired: 'bg-gray-100 text-gray-800'
};

const statusLabels: Record<string, string> = {
  pending: 'Ausstehend',
  active: 'Aktiv',
  completed: 'Abgeschlossen',
  expired: 'Abgelaufen'
};

const ReferralsList: React.FC<ReferralsListProps> = ({ referrals }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nutzer
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Datum
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Provision
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {referrals.map((referral) => (
            <tr key={referral.id}>
              <td className="px-6 py-4 whitespace-nowrap">
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
              <td className="px-6 py-4 whitespace-nowrap">
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
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge className={`${statusColors[referral.status]}`}>
                  {statusLabels[referral.status]}
                </Badge>
                <div className="text-xs text-gray-500 mt-1">
                  {referral.clickCount} Klicks
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-semibold text-gray-900">
                  {formatCurrency(referral.commissionsEarned)}
                </div>
                <div className="text-xs text-gray-500">
                  {referral.status === 'completed' 
                    ? `Letzte Zahlung: ${referral.lastCommissionDate 
                        ? format(new Date(referral.lastCommissionDate), 'dd.MM.yyyy', { locale: de })
                        : '–'}`
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
