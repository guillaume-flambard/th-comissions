import { BottomNav } from '@/components/mobile/bottom-nav';
import { useDevice } from '@/hooks/use-device';
import { CapacitorUtils } from '@/lib/capacitor-utils';
import { PropsWithChildren, useEffect } from 'react';

interface MobileLayoutProps extends PropsWithChildren {
    title?: string;
    showBottomNav?: boolean;
}

export default function MobileLayout({
    children,
    title,
    showBottomNav = true,
}: MobileLayoutProps) {
    const { isNative } = useDevice();

    useEffect(() => {
        // Set status bar style for native apps
        if (isNative) {
            CapacitorUtils.setStatusBarStyle('dark');
            CapacitorUtils.setStatusBarColor('#2563EB');
        }

        // Set page title
        if (title) {
            document.title = `${title} - Trackly`;
        }
    }, [isNative, title]);

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
            {/* Safe area top padding for iOS */}
            <div className="pt-safe" />

            {/* Main content area */}
            <main
                className={cn(
                    'flex-1 overflow-y-auto',
                    showBottomNav && 'pb-20',
                )}
            >
                {children}
            </main>

            {/* Bottom navigation */}
            {showBottomNav && <BottomNav />}
        </div>
    );
}

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}
