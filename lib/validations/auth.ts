import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid college email'),
});

export const otpSchema = z.object({
  email: z.string().email(),
  token: z.string().length(6, 'Enter the 6-digit code'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type OTPFormValues = z.infer<typeof otpSchema>;
