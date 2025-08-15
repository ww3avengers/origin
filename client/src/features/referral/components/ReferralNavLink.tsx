import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UsersIcon } from '@heroicons/react/24/outline';

interface ReferralNavLinkProps {
  onClose?: () => void;
}

const ReferralNavLink: React.FC<ReferralNavLinkProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActive = pathname === '/referral';

  const handleClick = () => {
    navigate('/referral');
    if (onClose) {
      onClose();
    }
  };

  return (
    <a
      className={`mb-2 flex flex-shrink-0 cursor-pointer items-center gap-3 rounded-md px-3 py-3 text-sm text-white transition-colors duration-200 hover:bg-gray-500/10 ${
        isActive ? 'bg-gray-800' : ''
      }`}
      onClick={handleClick}
    >
      <UsersIcon className="h-4 w-4" />
      <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">Empfehlungen</span>
      {isActive && (
        <span className="ml-auto mr-1 h-2 w-2 flex-shrink-0 rounded-full bg-indigo-500" />
      )}
    </a>
  );
};

export default ReferralNavLink;
