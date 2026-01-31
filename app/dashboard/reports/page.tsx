'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReportsPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the new daily reports page
        router.replace('/dashboard/daily-reports');
    }, [router]);

    return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Redirecting to Daily Reports...</p>
            </div>
        </div>
    );
}
