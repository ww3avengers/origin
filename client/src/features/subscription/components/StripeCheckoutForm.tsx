import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Fallback Button-Komponente, falls die eigentliche nicht verfügbar ist
const Button = ({
  children,
  disabled,
  onClick,
  className = '',
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`rounded-md px-4 py-2 ${disabled ? 'bg-gray-300' : 'bg-blue-500 text-white'} ${className}`}
  >
    {children}
  </button>
);

// Fallback Toast-Hook
const useToast = () => ({
  toast: (options: { title: string; description?: string; variant?: string }) => {
    console.log('Toast:', options.title, options.description);
  },
});

const StripeCheckoutForm = ({ plan }: { plan: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/billing/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        if (error.type === 'card_error' || error.type === 'validation_error') {
          toast({
            title: 'Zahlungsfehler',
            description: error.message || 'Ihre Karte wurde abgelehnt.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Fehler',
            description:
              'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
            variant: 'destructive',
          });
        }
      } else if (paymentIntent.status === 'succeeded') {
        navigate('/dashboard/billing/success');
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast({
        title: 'Fehler',
        description: 'Bei der Verarbeitung Ihrer Zahlung ist ein Fehler aufgetreten.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <PaymentElement
          options={{
            layout: 'tabs',
            fields: {
              billingDetails: {
                address: {
                  country: 'never',
                },
              },
            },
          }}
        />
      </div>

      <Button
        disabled={!stripe || isLoading}
        className="w-full"
        onClick={(e) => {
          e?.preventDefault();
          if (stripe) {
            handleSubmit(e as React.FormEvent);
          }
        }}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Wird verarbeitet...
          </>
        ) : (
          `Jetzt ${plan === 'pro' ? '19,00 €/Monat' : 'bezahlen'}`
        )}
      </Button>
    </form>
  );
};

export default StripeCheckoutForm;
