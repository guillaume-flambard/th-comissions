import { Capacitor } from '@capacitor/core';
import { useEffect, useState } from 'react';

export interface DeviceInfo {
    isMobile: boolean;
    isNative: boolean;
    isIOS: boolean;
    isAndroid: boolean;
    isWeb: boolean;
    platform: 'ios' | 'android' | 'web';
    screenWidth: number;
    screenHeight: number;
}

export function useDevice(): DeviceInfo {
    const [screenWidth, setScreenWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 0,
    );
    const [screenHeight, setScreenHeight] = useState(
        typeof window !== 'undefined' ? window.innerHeight : 0,
    );

    const isNative = Capacitor.isNativePlatform();
    const platform = Capacitor.getPlatform() as 'ios' | 'android' | 'web';
    const isIOS = platform === 'ios';
    const isAndroid = platform === 'android';
    const isWeb = platform === 'web';

    // Consider mobile if native OR screen width is mobile-sized
    const isMobile = isNative || screenWidth < 768;

    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
            setScreenHeight(window.innerHeight);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return {
        isMobile,
        isNative,
        isIOS,
        isAndroid,
        isWeb,
        platform,
        screenWidth,
        screenHeight,
    };
}

export function isMobileDevice(): boolean {
    if (typeof window === 'undefined') return false;
    return Capacitor.isNativePlatform() || window.innerWidth < 768;
}

export function isNativeApp(): boolean {
    return Capacitor.isNativePlatform();
}

export function getPlatform(): 'ios' | 'android' | 'web' {
    return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
}
