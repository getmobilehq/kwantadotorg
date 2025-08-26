import { z } from 'zod';

// Validation schemas for backend API
export const createMatchSchema = z.object({
  title: z.string().min(1, 'Title is required').max(80, 'Title must be 80 characters or less'),
  dateISO: z.string().min(1, 'Date is required').refine((date) => {
    const parsed = new Date(date);
    const now = new Date();
    // Set time to start of day for date comparison
    now.setHours(0, 0, 0, 0);
    parsed.setHours(0, 0, 0, 0);
    return parsed >= now;
  }, 'Match date must be today or in the future'),
  timeISO: z.string().min(1, 'Time is required'),
  location: z.string().min(1, 'Location is required').max(120, 'Location must be 120 characters or less'),
  teamSize: z.union([
    z.literal(5), z.literal(7), z.literal(11),
    z.literal('5'), z.literal('7'), z.literal('11')
  ]).transform((val) => typeof val === 'string' ? parseInt(val) : val),
  teamAName: z.string().min(1, 'Team A name is required').max(40, 'Team name must be 40 characters or less'),
  teamBName: z.string().min(1, 'Team B name is required').max(40, 'Team name must be 40 characters or less'),
  organizerContact: z.string().email('Invalid email').optional(),
});

export const claimSlotSchema = z.object({
  matchId: z.string().min(1, 'Match ID is required'),
  teamId: z.string().min(1, 'Team ID is required'),
  slotNumber: z.number().int().min(1, 'Slot number must be at least 1'),
  name: z.string().min(1, 'Name is required').max(80, 'Name must be 80 characters or less'),
  emailOrPhone: z.string().min(1, 'Email or phone is required').refine((value) => {
    // Check if it's a valid email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Check if it's a valid phone (basic check for digits and common phone characters)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    
    return emailRegex.test(value) || phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
  }, 'Must be a valid email or phone number'),
});

export const leaveSlotSchema = z.object({
  matchId: z.string().min(1, 'Match ID is required'),
  teamId: z.string().min(1, 'Team ID is required'),
  slotNumber: z.number().int().min(1, 'Slot number must be at least 1'),
  emailOrPhone: z.string().min(1, 'Email or phone is required'),
});

// Helper function to validate slot number against team size
export function validateSlotNumber(slotNumber: number, teamSize: number): boolean {
  return slotNumber >= 1 && slotNumber <= teamSize;
}

// Helper function to determine if contact is email or phone
export function parseContactInfo(emailOrPhone: string): { email?: string; phone?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (emailRegex.test(emailOrPhone)) {
    return { email: emailOrPhone };
  } else {
    return { phone: emailOrPhone };
  }
}

export type CreateMatchRequest = z.infer<typeof createMatchSchema>;
export type ClaimSlotRequest = z.infer<typeof claimSlotSchema>;
export type LeaveSlotRequest = z.infer<typeof leaveSlotSchema>;