import BottomNav from '@/components/mobile/BottomNav';

export default function MobileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <main className="max-w-md mx-auto min-h-screen bg-white shadow-xl overflow-hidden relative">
                {children}
            </main>
            <BottomNav />
        </div>
    );
}
