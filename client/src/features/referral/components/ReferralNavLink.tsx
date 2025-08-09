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
      className={`flex py-3 px-3 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm mb-2 flex-shrink-0 ${
        isActive ? 'bg-gray-800' : ''
      }`}
      onClick={handleClick}
    >
      <UsersIcon className="h-4 w-4" />
      <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">Empfehlungen</span>
      {isActive && (
        <span className="w-2 h-2 rounded-full bg-indigo-500 ml-auto mr-1 flex-shrink-0" />
      )}
    </a>
  );
};

export default ReferralNavLink;
