'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusSquare, CheckSquare, User, MessageCircle } from 'lucide-react';

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { label: 'Home', href: '/mobile', icon: Home },
        { label: 'Wells', href: '/mobile/wells', icon: Search },
        { label: 'Chat', href: '/mobile/chat', icon: MessageCircle },
        { label: 'Report', href: '/mobile/hazards/new', icon: PlusSquare },
        { label: 'Tasks', href: '/mobile/tasks', icon: CheckSquare },
        { label: 'Profile', href: '/mobile/profile', icon: User },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe-area-inset-bottom z-50">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== '/mobile' && pathname?.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1
                ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
