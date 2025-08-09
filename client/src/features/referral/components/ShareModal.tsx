import React, { useState } from 'react';
import { XMarkIcon, EnvelopeIcon, LinkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { OGDialog, OGDialogTemplate } from '@librechat/client';
import { Button } from '~/components/ui/button';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralUrl: string;
  referralCode: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  referralUrl,
  referralCode
}) => {
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailMessage, setEmailMessage] = useState(`Hey! 
  
Ich nutze LibreChat und kann es nur empfehlen. Du bekommst einen 10% Rabatt auf dein erstes Abo, wenn du dich über meinen Link registrierst:

${referralUrl}

Viele Grüße`);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl)
      .then(() => toast.success('Link in die Zwischenablage kopiert!'))
      .catch(() => toast.error('Fehler beim Kopieren des Links'));
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailRecipient) {
      toast.error('Bitte gib eine E-Mail-Adresse ein');
      return;
    }
    
    const subject = encodeURIComponent('Empfehlung für LibreChat');
    const body = encodeURIComponent(emailMessage);
    window.open(`mailto:${emailRecipient}?subject=${subject}&body=${body}`, '_blank');
    toast.success('E-Mail-Client geöffnet');
  };

  const shareOptions = [
    {
      name: 'Twitter',
      icon: '/assets/twitter-icon.svg',
      action: () => {
        const text = encodeURIComponent('Ich habe LibreChat entdeckt! Nutze meinen Referral-Link für einen 10% Rabatt:');
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(referralUrl)}`, '_blank');
      }
    },
    {
      name: 'Facebook',
      icon: '/assets/facebook-icon.svg',
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`, '_blank');
      }
    },
    {
      name: 'LinkedIn',
      icon: '/assets/linkedin-icon.svg',
      action: () => {
        const title = encodeURIComponent('LibreChat - KI-Chat-Plattform');
        const summary = encodeURIComponent('Nutze meinen Referral-Link für 10% Rabatt auf dein erstes Abo!');
        window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(referralUrl)}&title=${title}&summary=${summary}`, '_blank');
      }
    },
    {
      name: 'WhatsApp',
      icon: '/assets/whatsapp-icon.svg',
      action: () => {
        const text = encodeURIComponent(`Ich nutze LibreChat und kann es dir empfehlen! Registriere dich mit meinem Link und erhalte 10% Rabatt: ${referralUrl}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
      }
    }
  ];

  const [activeTab, setActiveTab] = useState<'link' | 'email'>('link');

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <OGDialog open={isOpen} onOpenChange={handleOpenChange}>
      <OGDialogTemplate
        title="Teile deinen Referral-Link"
        className="sm:max-w-md"
        main={
          <div className="p-4 pt-0">
            <div className="grid w-full grid-cols-2 mb-4 gap-2">
              <Button
                variant={activeTab === 'link' ? 'default' : 'ghost'}
                className="flex items-center justify-center"
                onClick={() => setActiveTab('link')}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Link teilen
              </Button>
              <Button
                variant={activeTab === 'email' ? 'default' : 'ghost'}
                className="flex items-center justify-center"
                onClick={() => setActiveTab('email')}
              >
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                Per E-Mail teilen
              </Button>
            </div>

            {activeTab === 'link' && (
              <div className="space-y-4">
                <div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      value={referralUrl}
                      readOnly
                      className="flex-1 font-mono text-sm rounded-md border border-gray-300 px-3 py-2"
                    />
                    <Button onClick={handleCopyLink}>Kopieren</Button>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Dein Code: <span className="font-semibold">{referralCode}</span>
                  </p>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">Teilen über</h4>
                  <div className="grid grid-cols-4 gap-4">
                    {shareOptions.map((option) => (
                      <button
                        key={option.name}
                        onClick={option.action}
                        className="flex flex-col items-center gap-2 p-3 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-8 h-8 flex items-center justify-center">
                          <img src={option.icon} alt={option.name} className="w-5 h-5" />
                        </div>
                        <span className="text-xs">{option.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'email' && (
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <label htmlFor="email" className="text-sm font-medium">
                    E-Mail-Adresse
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="freund@example.com"
                    value={emailRecipient}
                    onChange={(e) => setEmailRecipient(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="text-sm font-medium">
                    Nachricht
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
                <Button type="submit" className="w-full">
                  E-Mail senden
                </Button>
              </form>
            )}
          </div>
        }
        buttons={
          <div className="flex w-full justify-end">
            <Button variant="ghost" onClick={onClose} className="inline-flex items-center">
              <XMarkIcon className="h-4 w-4 mr-2" />
              Schließen
            </Button>
          </div>
        }
        showCancelButton={false}
      />
    </OGDialog>
  );
};

export default ShareModal;
