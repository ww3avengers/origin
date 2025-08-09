import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useAuthContext } from '~/hooks/AuthContext';
import { useToast } from '~/hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { getSubscription, getBillingPortalUrl } from '../services/subscriptionService';

export default function SubscriptionDashboard() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: subscription, isLoading, error } = useQuery({
    queryKey: ['subscription'],
    queryFn: getSubscription,
    enabled: !!user,
  });

  const handleManageBilling = async () => {
    try {
      const { url } = await getBillingPortalUrl();
      window.location.href = url;
    } catch (err) {
      toast({
        title: 'Fehler',
        description: 'Zahlungsverwaltung konnte nicht geöffnet werden. Bitte versuchen Sie es später erneut.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">Fehler beim Laden der Abonnement-Daten</h3>
        <p className="text-muted-foreground mt-2">Bitte versuchen Sie es später erneut.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mein Abonnement</h1>
          <p className="text-muted-foreground">Verwalten Sie Ihr Abonnement und Zahlungsinformationen</p>
        </div>
        <Button onClick={handleManageBilling} variant="outline">
          Zahlungsverwaltung
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Aktueller Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-2xl font-bold capitalize">{subscription?.plan || 'Free'}</p>
                <p className="text-sm text-muted-foreground">
                  {subscription?.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                </p>
              </div>
              {subscription?.currentPeriodEnd && (
                <p className="text-sm">
                  Läuft ab am: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nutzungsübersicht</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Verbrauchte Tokens</span>
                  <span>
                    {subscription?.monthlyUsage?.tokens?.toLocaleString() || '0'} /{' '}
                    {subscription?.limits?.monthlyTokens?.toLocaleString() || 'Unbegrenzt'}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${Math.min(
                        ((subscription?.monthlyUsage?.tokens || 0) / (subscription?.limits?.monthlyTokens || 1)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Anfragen</span>
                  <span>{subscription?.monthlyUsage?.requests?.toLocaleString() || '0'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan-Details</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                {subscription?.limits?.monthlyTokens?.toLocaleString() || 'Unbegrenzt'} Tokens/Monat
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                {subscription?.limits?.maxRequestsPerMinute || '10'} Anfragen/Minute
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                Zugriff auf {subscription?.limits?.modelAccess?.join(', ') || 'alle Modelle'}
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Verfügbare Pläne</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              name: 'Free',
              price: '0',
              period: 'pro Monat',
              features: [
                '10.000 Tokens/Monat',
                '10 Anfragen/Minute',
                'Zugriff auf Basis-Modelle',
                'E-Mail-Support',
              ],
              buttonText: 'Aktueller Plan',
              buttonVariant: 'outline' as const,
            },
            {
              name: 'Pro',
              price: '19',
              period: 'pro Monat',
              popular: true,
              features: [
                '1.000.000 Tokens/Monat',
                '60 Anfragen/Minute',
                'Zugriff auf erweiterte Modelle',
                'Priorisierter Support',
                'API-Zugriff',
              ],
              buttonText: 'Upgrade',
              buttonVariant: 'default' as const,
            },
            {
              name: 'Enterprise',
              price: 'Individuell',
              period: 'Kontaktieren Sie uns',
              features: [
                'Unbegrenzte Tokens',
                '200+ Anfragen/Minute',
                'Zugriff auf alle Modelle',
                '24/7 Premium-Support',
                'Dedizierte Instanz',
                'Individuelle Anpassungen',
              ],
              buttonText: 'Kontakt aufnehmen',
              buttonVariant: 'outline' as const,
            },
          ].map((plan) => (
            <Card key={plan.name} className={plan.popular ? 'border-2 border-primary' : ''}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.popular && (
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      Beliebt
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-bold">
                    {plan.price === '0' ? 'Kostenlos' : `$${plan.price}`}
                  </span>{' '}
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.buttonVariant}
                  className="w-full"
                  disabled={subscription?.plan?.toLowerCase() === plan.name.toLowerCase()}
                  onClick={() => {
                    if (plan.name === 'Enterprise') {
                      window.location.href = 'mailto:sales@ihre-domain.de';
                    } else {
                      navigate(`/upgrade?plan=${plan.name.toLowerCase()}`);
                    }
                  }}
                >
                  {subscription?.plan?.toLowerCase() === plan.name.toLowerCase()
                    ? 'Aktueller Plan'
                    : plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
