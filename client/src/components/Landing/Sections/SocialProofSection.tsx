import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { TFunction } from 'i18next';

// Hilfsfunktion für typsichere Übersetzungen mit Fallback
const safeT = (t: TFunction, key: string, fallback: string): string => {
  const translation = t(key as any);
  return typeof translation === 'string' ? translation : fallback;
};

const SocialProofSection: FC = () => {
  const { t } = useTranslation();
  const prefersReduced = useReducedMotion() ?? false;
  const baseDuration = prefersReduced ? 0 : 0.5;

  const testimonials = [
    {
      quote: safeT(t, 'landing.testimonials.1.quote', 'Die KI hat unsere Arbeitsprozesse revolutioniert. Wir sparen jetzt täglich mehrere Stunden!'),
      author: safeT(t, 'landing.testimonials.1.author', 'Max Mustermann'),
      role: safeT(t, 'landing.testimonials.1.role', 'CTO, TechStartup GmbH'),
      avatar: '/assets/testimonials/user1.jpg'
    },
    // Weitere Testimonials...
  ];

  const companies = [
    { name: 'Company 1', logo: '/assets/logos/company1.svg' },
    { name: 'Company 2', logo: '/assets/logos/company2.svg' },
    { name: 'Company 3', logo: '/assets/logos/company3.svg' },
    { name: 'Company 4', logo: '/assets/logos/company4.svg' },
  ];

  const stats = [
    { value: '10.000+', label: safeT(t, 'landing.stats.users', 'Aktive Nutzer') },
    { value: '98%', label: safeT(t, 'landing.stats.satisfaction', 'Zufriedenheit') },
    { value: '24/7', label: safeT(t, 'landing.stats.support', 'Support') },
    { value: '50+', label: safeT(t, 'landing.stats.integrations', 'Integrationen') },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
      <div className="container mx-auto px-4">
        {/* Kundenlogos */}
        <div className="mb-20">
          <p className="text-center text-gray-400 mb-8">
            {safeT(t, 'landing.hero.trustedBy', 'Vertrauen von führenden Unternehmen weltweit')}
          </p>
          <div className={`flex flex-wrap justify-center items-center gap-12 opacity-70 ${prefersReduced ? '' : 'hover:opacity-100'} transition-opacity`} aria-label="Partner Logos">
            {companies.map((company, index) => (
              <motion.div
                key={company.name}
                initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
                whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: baseDuration, delay: prefersReduced ? 0 : index * 0.1 }}
                className={`h-12 w-auto grayscale ${prefersReduced ? '' : 'hover:grayscale-0'} transition-all`}
              >
                <img
                  src={company.logo}
                  alt={company.name}
                  className="h-full w-auto max-h-12 object-contain"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  width={160}
                  height={48}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
              whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: baseDuration, delay: prefersReduced ? 0 : index * 0.2 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50"
            >
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-xl">
                  {testimonial.avatar ? (
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      className="h-full w-full rounded-full object-cover"
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      width={48}
                      height={48}
                    />
                  ) : (
                    <span>👤</span>
                  )}
                </div>
                <div className="ml-4">
                  <p className="font-medium text-white">{testimonial.author}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-300 italic">"{testimonial.quote}"</p>
            </motion.div>
          ))}
        </div>

        {/* Statistik-Banner */}
        <motion.div 
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
          whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: baseDuration }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-indigo-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProofSection;
