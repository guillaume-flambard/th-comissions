import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Network } from '@capacitor/network';
import { Share } from '@capacitor/share';
import { StatusBar, Style } from '@capacitor/status-bar';

export class CapacitorUtils {
    static isNative(): boolean {
        return Capacitor.isNativePlatform();
    }

    /**
     * Take a photo using the device camera
     */
    static async takePhoto(): Promise<string | null> {
        if (!this.isNative()) {
            console.warn('Camera not available in web mode');
            return null;
        }

        try {
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Camera,
            });

            return image.dataUrl || null;
        } catch (error) {
            console.error('Error taking photo:', error);
            return null;
        }
    }

    /**
     * Pick an image from the gallery
     */
    static async pickImage(): Promise<string | null> {
        if (!this.isNative()) {
            console.warn('Gallery not available in web mode');
            return null;
        }

        try {
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Photos,
            });

            return image.dataUrl || null;
        } catch (error) {
            console.error('Error picking image:', error);
            return null;
        }
    }

    /**
     * Share content using native share sheet
     */
    static async share(options: {
        title?: string;
        text?: string;
        url?: string;
    }): Promise<boolean> {
        if (!this.isNative()) {
            // Fallback to Web Share API if available
            if (navigator.share) {
                try {
                    await navigator.share(options);
                    return true;
                } catch (error) {
                    console.error('Error sharing:', error);
                    return false;
                }
            }
            console.warn('Share not available');
            return false;
        }

        try {
            await Share.share(options);
            return true;
        } catch (error) {
            console.error('Error sharing:', error);
            return false;
        }
    }

    /**
     * Trigger haptic feedback
     */
    static async hapticImpact(
        style: 'light' | 'medium' | 'heavy' = 'medium',
    ): Promise<void> {
        if (!this.isNative()) return;

        try {
            const impactStyle =
                style === 'light'
                    ? ImpactStyle.Light
                    : style === 'heavy'
                      ? ImpactStyle.Heavy
                      : ImpactStyle.Medium;

            await Haptics.impact({ style: impactStyle });
        } catch (error) {
            console.error('Error triggering haptic:', error);
        }
    }

    /**
     * Check network connectivity
     */
    static async checkNetwork(): Promise<{
        connected: boolean;
        connectionType: string;
    }> {
        try {
            const status = await Network.getStatus();
            return {
                connected: status.connected,
                connectionType: status.connectionType,
            };
        } catch (error) {
            console.error('Error checking network:', error);
            return { connected: true, connectionType: 'unknown' };
        }
    }

    /**
     * Listen to network changes
     */
    static addNetworkListener(callback: (connected: boolean) => void) {
        Network.addListener('networkStatusChange', (status) => {
            callback(status.connected);
        });
    }

    /**
     * Set status bar style
     */
    static async setStatusBarStyle(style: 'light' | 'dark'): Promise<void> {
        if (!this.isNative()) return;

        try {
            await StatusBar.setStyle({
                style: style === 'light' ? Style.Light : Style.Dark,
            });
        } catch (error) {
            console.error('Error setting status bar style:', error);
        }
    }

    /**
     * Set status bar background color
     */
    static async setStatusBarColor(color: string): Promise<void> {
        if (!this.isNative()) return;

        try {
            await StatusBar.setBackgroundColor({ color });
        } catch (error) {
            console.error('Error setting status bar color:', error);
        }
    }

    /**
     * Hide status bar
     */
    static async hideStatusBar(): Promise<void> {
        if (!this.isNative()) return;

        try {
            await StatusBar.hide();
        } catch (error) {
            console.error('Error hiding status bar:', error);
        }
    }

    /**
     * Show status bar
     */
    static async showStatusBar(): Promise<void> {
        if (!this.isNative()) return;

        try {
            await StatusBar.show();
        } catch (error) {
            console.error('Error showing status bar:', error);
        }
    }
}
