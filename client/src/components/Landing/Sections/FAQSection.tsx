import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

// Utility function to combine class names
const cn = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Define valid translation keys for FAQ section
type FAQTranslationKey = 
  | 'landing.faq.q1' | 'landing.faq.a1'
  | 'landing.faq.q2' | 'landing.faq.a2'
  | 'landing.faq.q3' | 'landing.faq.a3'
  | 'landing.faq.q4' | 'landing.faq.a4'
  | 'landing.faq.q5' | 'landing.faq.a5'
  | 'landing.faq.title' | 'landing.faq.subtitle'
  | 'landing.faq.description' | 'landing.faq.more_questions'
  | 'landing.faq.contact_us';

// Interface for FAQ item data structure
interface FAQItemData {
  question: string;
  answer: string;
}

/**
 * FAQItem component that renders a single FAQ question and answer
 */
const FAQItem: FC<{
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}> = ({ question, answer, isOpen, onToggle, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="border-b border-gray-700 last:border-0"
    >
      <button
        className="w-full py-5 px-4 flex justify-between items-center hover:bg-gray-800/30 transition-colors duration-200 rounded-lg"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${index}`}
      >
        <span className="text-left font-medium text-lg text-white">{question}</span>
        <span className="flex-shrink-0 ml-4">
          <motion.svg
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="w-5 h-5 text-indigo-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </motion.svg>
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`faq-answer-${index}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
            role="region"
            aria-live="polite"
          >
            <div 
              className="px-4 pb-5 text-gray-300" 
              dangerouslySetInnerHTML={{ __html: answer }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * FAQSection component that displays a list of frequently asked questions
 */
// Get FAQ items with translations
const getFAQItems = (t: (key: string) => string): FAQItemData[] => [
  {
    question: t('landing.faq.q1') || 'What is SIGMACODE AI?',
    answer: t('landing.faq.a1') || 'SIGMACODE AI is an advanced AI platform that combines powerful language models with enterprise-specific customization to deliver real business results.'
  },
  {
    question: t('landing.faq.q2') || 'How is SIGMACODE AI different?',
    answer: t('landing.faq.a2') || 'SIGMACODE AI offers enterprise-grade security, local processing options, and customizable models tailored to specific business needs.'
  },
  {
    question: t('landing.faq.q3') || 'Is my data secure with SIGMACODE AI?',
    answer: t('landing.faq.a3') || 'Yes, your data security is our top priority. We implement industry-standard encryption and security measures to protect your information.'
  },
  {
    question: t('landing.faq.q4') || 'Can I customize the AI models?',
    answer: t('landing.faq.a4') || 'Yes! SIGMACODE AI is built with customization in mind. You can fine-tune models, add custom knowledge bases, and integrate with your existing systems.'
  },
  {
    question: t('landing.faq.q5') || 'What kind of support do you offer?',
    answer: t('landing.faq.a5') || 'We offer comprehensive support including documentation, community forums, and premium support plans.'
  }
];

// Get section texts with translations
const getSectionTexts = (t: (key: string) => string) => ({
  title: t('landing.faq.title') || 'Frequently Asked Questions',
  subtitle: t('landing.faq.subtitle') || 'Everything You Need to Know',
  description: t('landing.faq.description') || 'Got questions? We\'ve got answers. If you can\'t find what you\'re looking for, please contact our support team.',
  moreQuestions: t('landing.faq.more_questions') || 'Still have questions?',
  contactUs: t('landing.faq.contact_us') || 'Contact Us'
});

const FAQSection: FC = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  // Get translated content
  const faqItems = getFAQItems(t);
  const sectionTexts = getSectionTexts(t);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 md:py-24 bg-gray-900" id="faq">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {sectionTexts.title}
            </h2>
            <p className="text-xl text-gray-300 mb-6">
              {sectionTexts.subtitle}
            </p>
            <p className="text-gray-400 mb-8">
              {sectionTexts.description}
            </p>
          </div>
        </motion.div>

        <motion.div 
          className="max-w-3xl mx-auto space-y-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {faqItems.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => toggleFAQ(index)}
              index={index}
            />
          ))}
        </motion.div>

        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-lg font-medium text-gray-300 mb-4">
            {sectionTexts.moreQuestions}
          </p>
          <a
            href="#contact"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
          >
            {sectionTexts.contactUs}
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
