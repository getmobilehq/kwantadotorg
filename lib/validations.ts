import { z } from 'zod';

export const matchSchema = z.object({
  title: z.string().min(1, 'Title is required').max(80, 'Title must be 80 characters or less'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  location: z.string().min(1, 'Location is required').max(120, 'Location must be 120 characters or less'),
  teamSize: z.enum(['5', '7', '11'], {
    message: 'Team size is required'
  }),
});

export const teamSchema = z.object({
  teamA: z.string().min(1, 'Team A name is required').max(40, 'Team name must be 40 characters or less'),
  teamB: z.string().min(1, 'Team B name is required').max(40, 'Team name must be 40 characters or less'),
});

export const registrationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(80, 'Name must be 80 characters or less'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
}).refine((data) => data.email || data.phone, {
  message: 'Either email or phone is required',
  path: ['email'],
});

export type MatchForm = z.infer<typeof matchSchema>;
export type TeamForm = z.infer<typeof teamSchema>;
export type RegistrationForm = z.infer<typeof registrationSchema>;