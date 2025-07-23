
'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Target } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

export const PwaInstallPrompt = () => {
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setInstallPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!installPrompt) return;

        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }
        setInstallPrompt(null);
    };

    if (!installPrompt) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:hidden">
            <div className="bg-card border rounded-lg shadow-lg p-4 flex items-center gap-4 animate-in slide-in-from-bottom-10">
                <Target className="h-10 w-10 text-primary flex-shrink-0" />
                <div className="flex-grow">
                    <h4 className="font-semibold">Install Fitness Hub</h4>
                    <p className="text-sm text-muted-foreground">Add to home screen for a better experience.</p>
                </div>
                <Button onClick={handleInstallClick}>
                    Install
                </Button>
            </div>
        </div>
    );
};
