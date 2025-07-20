
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { auth, db } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48" {...props}>
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.222 0-9.618-3.518-11.181-8.224l-6.573 4.818C9.231 39.752 16.082 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 7.581l6.19 5.238C43.021 36.233 44 30.552 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase initialization can be asynchronous, wait for auth to be ready
    const unsubscribe = auth.onAuthStateChanged(user => {
        if (!user) {
            setLoading(false);
        } else {
            router.push('/dashboard');
        }
    });
    return () => unsubscribe();
  }, [router]);


  const handleGoogleLogin = async () => {
    if (!auth) {
        toast({
            title: "Error",
            description: "Firebase is not initialized. Please try again in a moment.",
            variant: "destructive"
        });
        return;
    }
    setIsSigningIn(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore, if not create a document
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'user', // default role
        });
      }

      router.push('/dashboard');
    } catch (error) {
      console.error("Error during Google login:", error);
      toast({
        title: "Login Failed",
        description: "Could not log in with Google. Please try again.",
        variant: "destructive"
      });
    } finally {
        setIsSigningIn(false);
    }
  };
  
  if (loading) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
       <Image 
        src="https://placehold.co/1920x1080" 
        alt="Man working out" 
        fill={true}
        objectFit="cover"
        className="opacity-20"
        data-ai-hint="gym background"
      />
      <div className="absolute inset-0 bg-background/80" />
      <Card className="relative z-10 w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Welcome to Fitness Hub</CardTitle>
          <CardDescription>Sign in to continue your fitness journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button variant="outline" onClick={handleGoogleLogin} disabled={isSigningIn}>
              {isSigningIn ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <GoogleIcon className="mr-2 h-5 w-5" />
              )}
              Login with Google
            </Button>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue as guest</span>
                </div>
            </div>
            <Button variant="secondary" asChild><Link href="/dashboard">Continue as Guest</Link></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
