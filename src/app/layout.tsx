import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { QueryProvider } from '@/lib/query/provider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileTabBar } from '@/components/layout/MobileTabBar';
import { Toaster } from '@/components/ui/sonner';
import { HydrationBoundary } from '@/components/providers/HydrationBoundary';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin']
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin']
});

export const metadata: Metadata = {
	title: 'EasyVille Estates - Student Accommodation Platform',
	description:
		'Find quality housing and roommates near campus. Connect with verified agents and fellow students for affordable student accommodation.',
	keywords: [
		'EasyVille Estates',
		'student housing',
		'accommodation',
		'roommates',
		'Warri',
		'Delta State',
		'FUPRE',
		'student apartments',
		'campus housing'
	],
	authors: [{ name: 'EasyVille Estates' }],
	openGraph: {
		title: 'EasyVille Estates - Student Accommodation Platform',
		description:
			'Find quality housing and roommates near campus. Your trusted platform for student accommodation.',
		type: 'website',
		locale: 'en_NG'
	}
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en' suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<ThemeProvider
					attribute='class'
					defaultTheme='system'
					enableSystem
					disableTransitionOnChange>
					<QueryProvider>
						<HydrationBoundary>
							<AuthProvider>
								<div className='min-h-screen flex flex-col'>
									<Navbar />
									<EmailVerificationBanner />
									<main className='flex-1 pb-16 md:pb-0'>{children}</main>
									<Footer />
									<MobileTabBar />
								</div>
								<Toaster />
							</AuthProvider>
						</HydrationBoundary>
					</QueryProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
