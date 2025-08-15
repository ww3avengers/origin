import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Fallback Button-Komponente
const Button = ({
  children,
  disabled,
  onClick,
  className = '',
  variant = 'default',
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'outline';
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`rounded-md px-4 py-2 ${
      variant === 'outline'
        ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        : 'bg-blue-500 text-white hover:bg-blue-600'
    } ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`}
  >
    {children}
  </button>
);

export default function SubscriptionSuccess() {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-12 text-center sm:px-6 lg:px-8">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <CheckCircle2 className="h-10 w-10 text-green-600" aria-hidden="true" />
      </div>
      <h2 className="mt-6 text-2xl font-bold text-foreground">Vielen Dank für Ihr Abonnement!</h2>
      <p className="mt-2 text-muted-foreground">
        Ihr Konto wurde erfolgreich aktualisiert. Sie können jetzt alle Funktionen nutzen.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Button onClick={() => navigate('/dashboard')} variant="outline">
          Zum Dashboard
        </Button>
        <Button onClick={() => navigate('/dashboard/billing')}>Abonnement verwalten</Button>
      </div>
    </div>
  );
}
