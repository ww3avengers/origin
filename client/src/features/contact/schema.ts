import { z } from 'zod';

// Zod-Schema für die Kontaktanfrage
export const contactSchema = z.object({
  name: z.string().min(2, 'contact.errors.name_min').max(120, 'contact.errors.name_max'),
  email: z.string().email('contact.errors.email_invalid').max(180, 'contact.errors.email_max'),
  company: z.string().max(180, 'contact.errors.company_max').optional().or(z.literal('')),
  subject: z.string().min(3, 'contact.errors.subject_min').max(160, 'contact.errors.subject_max'),
  message: z.string().min(10, 'contact.errors.message_min').max(4000, 'contact.errors.message_max'),
  source: z.string().max(200, 'contact.errors.source_max').optional().or(z.literal('')),
  // Honeypot: soll leer bleiben
  website: z.string().max(0).optional().or(z.literal('')),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
