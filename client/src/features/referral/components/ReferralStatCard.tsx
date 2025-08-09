import React, { ReactNode } from 'react';
import { Card, CardContent } from '~/components/ui/Card';

interface ReferralStatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
}

const ReferralStatCard: React.FC<ReferralStatCardProps> = ({ title, value, icon }) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="mt-1 text-xl font-semibold text-gray-900">{value}</h3>
          </div>
          <div className="rounded-full bg-gray-50 p-3">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralStatCard;
