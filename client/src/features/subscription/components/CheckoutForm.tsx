import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createSubscription, getCheckoutSession } from '../services/subscriptionService';
import StripeCheckoutForm from './StripeCheckoutForm';

// Fallback Toast-Hook, falls der eigentliche Hook nicht verfügbar ist
const useToast = () => ({
  toast: (options: { title: string; description?: string; variant?: string }) => {
    console.log('Toast:', options.title, options.description);
  },
});

// Stripe-Elemente initialisieren
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface CheckoutFormProps {
  defaultPlan?: string;
}

export default function CheckoutForm({ defaultPlan = 'pro' }: CheckoutFormProps) {
  const [searchParams] = useSearchParams();
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const plan = searchParams.get('plan') || defaultPlan;

  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        setLoading(true);
        const { clientSecret } = await getCheckoutSession(plan);
        setClientSecret(clientSecret);
      } catch (err) {
        console.error('Error initializing checkout:', err);
        setError('Fehler beim Initialisieren der Zahlung. Bitte versuchen Sie es später erneut.');
        toast({
          title: 'Fehler',
          description: 'Die Zahlung konnte nicht initialisiert werden.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    initializeCheckout();
  }, [plan, toast]);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center">
        <h3 className="text-lg font-medium text-destructive">Fehler</h3>
        <p className="mt-2 text-muted-foreground">{error}</p>
      </div>
    );
  }

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#2563eb',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#dc2626',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="mx-auto max-w-md">
      <h2 className="mb-6 text-center text-2xl font-bold">
        Upgrade auf {plan.charAt(0).toUpperCase() + plan.slice(1)}-Plan
      </h2>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        {clientSecret && (
          <Elements options={options} stripe={stripePromise}>
            <StripeCheckoutForm plan={plan} />
          </Elements>
        )}

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Ihre Zahlung wird sicher über Stripe verarbeitet. Wir speichern keine
          Kreditkarteninformationen.
        </p>
      </div>
    </div>
  );
}
