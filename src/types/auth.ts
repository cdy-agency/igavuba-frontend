export interface LoginDto {
  email: string;
  password: string;
}

export interface SignupDto {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface VerifyEmailDto {
  email: string;
  otp: string;
}

export interface ResendVerificationDto {
  email: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface VerifyResetOtpDto {
  email: string;
  otp: string;
}

export interface ResetPasswordDto {
  resetToken: string;
  newPassword: string;
}

export interface AuthInstitution {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  status: string;
  role?: string;
  institutionId?: string | null;
  profileImage?: string | null;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  institution?: AuthInstitution | null;
}

export interface MeResponse {
  success: boolean;
  message: string;
  user: AuthUser;
}

export interface AuthSuccessResponse {
  success: true;
  message: string;
}

export interface LoginResponse extends AuthSuccessResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface SignupResponse extends AuthSuccessResponse {
  userId: string;
}

export interface VerifyEmailResponse extends AuthSuccessResponse {}

export interface ResendVerificationResponse extends AuthSuccessResponse {}

export interface ForgotPasswordResponse extends AuthSuccessResponse {}

export interface VerifyResetOtpResponse extends AuthSuccessResponse {
  resetToken: string;
}

export interface ResetPasswordResponse extends AuthSuccessResponse {}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  user?: AuthUser;
}

export interface ApiErrorResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

export interface PendingVerificationState {
  email: string;
  userId?: string;
}
