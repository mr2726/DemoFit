import { XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function OrderCancelPage() {
    return (
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-4 py-8">
                    <XCircle className="h-12 w-12 text-red-500 mx-auto" />
                    <CardTitle>Payment Canceled</CardTitle>
                    <CardDescription>
                        Your order was canceled. You have not been charged. You can return to the marketplace to continue browsing.
                    </CardDescription>
                    <div className="mt-6">
                         <Button asChild>
                            <Link href="/dashboard/marketplace">Back to Marketplace</Link>
                        </Button>
                    </div>
                </CardHeader>
            </Card>
        </div>
    );
}
