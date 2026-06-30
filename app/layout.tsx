import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'FlowMind — AI Productivity Companion',
  description: 'FlowMind proactively assists you in planning, prioritizing, and completing tasks before deadlines are missed. AI-powered scheduling, habit tracking, and goal planning.',
  keywords: ['productivity', 'AI', 'task management', 'scheduling', 'habit tracker'],
  authors: [{ name: 'FlowMind' }],
  openGraph: {
    title: 'FlowMind — AI Productivity Companion',
    description: 'Proactive AI that schedules your day before you even ask.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
