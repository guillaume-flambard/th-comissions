import '../css/app.css';

import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@capacitor/status-bar';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { isMobileDevice } from './hooks/use-device';
import { PushNotificationManager } from './lib/push-notifications';

const appName = import.meta.env.VITE_APP_NAME || 'Trackly';

// Initialize Capacitor features
async function initializeCapacitor() {
    if (!Capacitor.isNativePlatform()) return;

    try {
        // Set status bar style
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#2563EB' });

        // Initialize push notifications
        await PushNotificationManager.initialize();

        // Hide splash screen after app is ready
        await SplashScreen.hide();
    } catch (error) {
        console.error('Error initializing Capacitor:', error);
    }
}

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: async (name) => {
        // Check if we should load mobile version
        const useMobile = isMobileDevice() && Capacitor.isNativePlatform();

        // Try to load mobile version first if on mobile
        if (useMobile) {
            try {
                const mobilePage = await resolvePageComponent(
                    `./pages/${name}.mobile.tsx`,
                    import.meta.glob('./pages/**/*.mobile.tsx'),
                );
                return mobilePage;
            } catch {
                // Fallback to regular version if mobile version doesn't exist
            }
        }

        // Load regular version
        return resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        );
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#2563EB',
    },
});

// Initialize theme
initializeTheme();

// Initialize Capacitor
initializeCapacitor();
