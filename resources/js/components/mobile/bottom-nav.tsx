import { cn } from '@/lib/utils';
import { CapacitorUtils } from '@/lib/capacitor-utils';
import { router, usePage } from '@inertiajs/react';
import { Home, Users, QrCode, Settings, Plus } from 'lucide-react';

// Import route helper - note: this may need adjustment based on your Wayfinder setup
declare global {
    function route(name: string, params?: any): string;
}

interface NavItem {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    route: string;
    badge?: number;
}

const navItems: NavItem[] = [
    {
        label: 'Home',
        icon: Home,
        route: 'dashboard',
    },
    {
        label: 'Partners',
        icon: Users,
        route: 'admin.partners.index',
    },
    {
        label: 'Log',
        icon: Plus,
        route: 'booking.create',
    },
    {
        label: 'QR Code',
        icon: QrCode,
        route: 'admin.partners.qr',
    },
    {
        label: 'Settings',
        icon: Settings,
        route: 'settings.profile.edit',
    },
];

export function BottomNav() {
    const page = usePage();
    const currentRoute = page.component;

    const handleNavigation = async (routeName: string) => {
        await CapacitorUtils.hapticImpact('light');
        router.visit(route(routeName));
    };

    // Determine if a nav item is active
    const isActive = (routeName: string) => {
        return currentRoute.startsWith(routeName.replace('.', '/'));
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            {/* Safe area padding for iOS */}
            <div className="pb-safe">
                <div className="grid grid-cols-5 gap-0">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.route);

                        return (
                            <button
                                key={item.route}
                                onClick={() => handleNavigation(item.route)}
                                className={cn(
                                    'relative flex flex-col items-center justify-center gap-1 px-2 py-3 transition-colors',
                                    active
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
                                )}
                            >
                                <div className="relative">
                                    <Icon className={cn('h-6 w-6', active && 'scale-110')} />
                                    {item.badge && item.badge > 0 && (
                                        <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                            {item.badge > 9 ? '9+' : item.badge}
                                        </span>
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        'text-[10px] font-medium transition-all',
                                        active ? 'scale-105 font-semibold' : '',
                                    )}
                                >
                                    {item.label}
                                </span>
                                {active && (
                                    <div className="absolute bottom-0 left-1/2 h-0.5 w-12 -translate-x-1/2 rounded-full bg-blue-600 dark:bg-blue-400" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
