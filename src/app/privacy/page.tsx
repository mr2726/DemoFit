
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

export default function PrivacyPolicyPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <LandingHeader />
            <main className="flex-1">
                <div className="container mx-auto max-w-4xl py-12 px-4">
                    <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
                    <div className="space-y-6 text-muted-foreground">
                        <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                        <h2 className="text-2xl font-semibold text-foreground">1. Introduction</h2>
                        <p>Welcome to Fitness Hub. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.</p>

                        <h2 className="text-2xl font-semibold text-foreground">2. Information We Collect</h2>
                        <p>We may collect information about you in a variety of ways. The information we may collect on the Service includes:</p>
                        <ul className="list-disc list-inside space-y-2">
                            <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and demographic information, that you voluntarily give to us when you register with the application.</li>
                            <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Service, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Service.</li>
                            <li><strong>Financial Data:</strong> Financial information, such as data related to your payment method (e.g. valid credit card number, card brand, expiration date) that we may collect when you purchase, order, return, exchange, or request information about our services from the Service. We store only very limited, if any, financial information that we collect. Otherwise, all financial information is stored by our payment processor, Stripe, and you are encouraged to review their privacy policy and contact them directly for responses to your questions.</li>
                        </ul>

                        <h2 className="text-2xl font-semibold text-foreground">3. Use of Your Information</h2>
                        <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Service to:</p>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Create and manage your account.</li>
                            <li>Process your transactions.</li>
                            <li>Email you regarding your account or order.</li>
                            <li>Monitor and analyze usage and trends to improve your experience with the Service.</li>
                        </ul>

                        <h2 className="text-2xl font-semibold text-foreground">4. Disclosure of Your Information</h2>
                        <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
                        <ul className="list-disc list-inside space-y-2">
                            <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
                            <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.</li>
                        </ul>

                        <h2 className="text-2xl font-semibold text-foreground">5. Contact Us</h2>
                        <p>If you have questions or comments about this Privacy Policy, please contact us at: contact@fitnesshub.com</p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
