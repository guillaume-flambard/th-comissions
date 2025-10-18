import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.trackly.app',
    appName: 'Trackly',
    webDir: 'public/build',
    server: {
        // For development, allows connecting to local Laravel server
        // Update this URL to match your local development environment
        url: process.env.CAPACITOR_SERVER_URL || undefined,
        cleartext: true,
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 2000,
            launchAutoHide: true,
            launchFadeOutDuration: 300,
            backgroundColor: '#2563EB',
            androidSplashResourceName: 'splash',
            androidScaleType: 'CENTER_CROP',
            showSpinner: false,
            androidSpinnerStyle: 'large',
            iosSpinnerStyle: 'small',
            spinnerColor: '#FFFFFF',
        },
        StatusBar: {
            style: 'dark',
            backgroundColor: '#2563EB',
        },
        Keyboard: {
            resize: 'body',
            style: 'dark',
            resizeOnFullScreen: true,
        },
        PushNotifications: {
            presentationOptions: ['badge', 'sound', 'alert'],
        },
    },
    ios: {
        contentInset: 'always',
    },
    android: {
        allowMixedContent: false,
        captureInput: true,
        webContentsDebuggingEnabled: process.env.NODE_ENV === 'development',
    },
};

export default config;
