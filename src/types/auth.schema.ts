import { z } from "zod";

const ITU_E164_PHONE_REGEX = /^\+[1-9]\d{6,14}$/;
const NATIONAL_PHONE_REGEX = /^\d{7,15}$/;

const isValidSignupPhoneNumber = (value: string) =>
  ITU_E164_PHONE_REGEX.test(value) || NATIONAL_PHONE_REGEX.test(value);

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long")
    .refine((val) => /[a-zA-Z]/.test(val), {
      message: "Name must contain at least one letter",
    })
    .refine((val) => /^[a-zA-Z\s'-]+$/.test(val), {
      message:
        "Name can only contain letters, spaces, hyphens, and apostrophes",
    }),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .refine((val) => isValidSignupPhoneNumber(val), {
      message:
        "Please enter a valid phone number (e.g. +250788888888 or 0788888888)",
    }),
});

export const verifyEmailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  otp: z
    .string()
    .trim()
    .length(6, "OTP code must be 6 digits")
    .regex(/^\d{6}$/, "OTP code must contain only digits"),
});

export const resendVerificationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const verifyResetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  otp: z
    .string()
    .trim()
    .length(6, "OTP code must be 6 digits")
    .regex(/^\d{6}$/, "OTP code must contain only digits"),
});

export const resetPasswordSchema = z
  .object({
    resetToken: z.string().min(1, "Reset token is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const confirmPasswordSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export type ConfirmPasswordFormData = z.infer<typeof confirmPasswordSchema>;

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationFormData = z.infer<typeof resendVerificationSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type VerifyResetPasswordFormData = z.infer<typeof verifyResetPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
