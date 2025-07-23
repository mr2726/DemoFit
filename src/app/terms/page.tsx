
import Link from 'next/link';
import { Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LandingHeader = () => (
  <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="container flex h-14 max-w-screen-2xl items-center">
      <Link href="/" className="flex items-center gap-2 font-bold">
        <Target className="h-6 w-6 text-primary" />
        <span className="text-lg">Fitness Hub</span>
      </Link>
      <nav className="ml-auto flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/login">Log In</Link>
        </Button>
        <Button asChild>
          <Link href="/login">Get Started</Link>
        </Button>
      </nav>
    </div>
  </header>
);

const Footer = () => (
    <footer className="border-t">
        <div className="container mx-auto flex items-center justify-between px-4 py-6">
            <p className="text-sm text-muted-foreground">&copy; 2024 Fitness Hub. All rights reserved.</p>
            <div className="flex gap-4">
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                    Privacy Policy
                </Link>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                    Terms of Service
                </Link>
            </div>
        </div>
    </footer>
);

export default function TermsOfServicePage() {
    return (
        <div className="flex min-h-screen flex-col">
            <LandingHeader />
            <main className="flex-1">
                <div className="container mx-auto max-w-4xl py-12 px-4">
                    <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
                    <div className="space-y-6 text-muted-foreground">
                        <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                        <h2 className="text-2xl font-semibold text-foreground">1. Agreement to Terms</h2>
                        <p>By using our application, you agree to be bound by these Terms of Service. If you do not agree to these Terms, do not use the application. We may modify the Terms at any time, and such modifications shall be effective immediately upon posting.</p>

                        <h2 className="text-2xl font-semibold text-foreground">2. Use of the Application</h2>
                        <p>You agree to use the application only for lawful purposes. You are prohibited from any use of the application that would constitute a violation of any applicable law, regulation, rule or ordinance of any nationality, state, or locality or of any international law or treaty, or that could give rise to any civil or criminal liability.</p>

                        <h2 className="text-2xl font-semibold text-foreground">3. User Accounts</h2>
                        <p>You may be required to create an account to use some of the features of the application. You must provide accurate and complete information and keep your account information updated. You are responsible for the security of your account and for all activities that occur under your account.</p>

                        <h2 className="text-2xl font-semibold text-foreground">4. Intellectual Property</h2>
                        <p>The application and its original content, features, and functionality are and will remain the exclusive property of Fitness Hub and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Fitness Hub.</p>
                        
                        <h2 className="text-2xl font-semibold text-foreground">5. Disclaimer</h2>
                        <p>The service is provided on an "AS IS" and "AS AVAILABLE" basis. The service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.</p>

                        <h2 className="text-2xl font-semibold text-foreground">6. Governing Law</h2>
                        <p>These Terms shall be governed and construed in accordance with the laws of the jurisdiction, without regard to its conflict of law provisions.</p>

                        <h2 className="text-2xl font-semibold text-foreground">7. Contact Us</h2>
                        <p>If you have any questions about these Terms, please contact us at: contact@fitnesshub.com</p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
