import { Plus_Jakarta_Sans } from 'next/font/google';

export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-plus-jakarta',
});

export const oazisDisplayFontClass = plusJakartaSans.className;
