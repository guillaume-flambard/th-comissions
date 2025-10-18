import { PushNotifications, Token, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export class PushNotificationManager {
    private static initialized = false;

    /**
     * Initialize push notifications
     */
    static async initialize(): Promise<void> {
        if (!Capacitor.isNativePlatform()) {
            console.log('Push notifications only available on native platforms');
            return;
        }

        if (this.initialized) {
            console.log('Push notifications already initialized');
            return;
        }

        try {
            // Request permission
            const permResult = await PushNotifications.requestPermissions();

            if (permResult.receive === 'granted') {
                await PushNotifications.register();
                this.setupListeners();
                this.initialized = true;
            } else {
                console.log('Push notification permission denied');
            }
        } catch (error) {
            console.error('Error initializing push notifications:', error);
        }
    }

    /**
     * Set up notification listeners
     */
    private static setupListeners(): void {
        // Called when push notification registration succeeds
        PushNotifications.addListener('registration', (token: Token) => {
            console.log('Push registration success, token: ' + token.value);
            // Send token to your backend
            this.sendTokenToBackend(token.value);
        });

        // Called when push notification registration fails
        PushNotifications.addListener('registrationError', (error: any) => {
            console.error('Push registration error:', error);
        });

        // Called when a push notification is received
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('Push notification received:', notification);

            // You can show an in-app notification here
            // Or update the app state based on the notification
        });

        // Called when user taps on a push notification
        PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
            console.log('Push notification action performed:', notification);

            // Handle notification tap - navigate to relevant screen
            this.handleNotificationTap(notification);
        });
    }

    /**
     * Send FCM/APNS token to backend
     */
    private static async sendTokenToBackend(token: string): Promise<void> {
        try {
            // Send the token to your Laravel backend
            // You'll need to create an API endpoint for this
            await fetch('/api/device-tokens', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    token,
                    platform: Capacitor.getPlatform(),
                }),
            });
        } catch (error) {
            console.error('Error sending token to backend:', error);
        }
    }

    /**
     * Handle notification tap
     */
    private static handleNotificationTap(notification: ActionPerformed): void {
        const data = notification.notification.data;

        // Navigate based on notification type
        if (data.type === 'new_referral') {
            // Navigate to dashboard
            window.location.href = '/dashboard';
        } else if (data.type === 'payment_reminder') {
            // Navigate to payments
            window.location.href = '/payments';
        } else if (data.type === 'partner_alert') {
            // Navigate to partners
            window.location.href = '/admin/partners';
        }
    }

    /**
     * Get notification count (badges)
     */
    static async getBadgeCount(): Promise<number> {
        if (!Capacitor.isNativePlatform()) return 0;

        try {
            const result = await PushNotifications.getDeliveredNotifications();
            return result.notifications.length;
        } catch (error) {
            console.error('Error getting badge count:', error);
            return 0;
        }
    }

    /**
     * Clear all notifications
     */
    static async clearNotifications(): Promise<void> {
        if (!Capacitor.isNativePlatform()) return;

        try {
            await PushNotifications.removeAllDeliveredNotifications();
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    }

    /**
     * Check if notifications are enabled
     */
    static async areNotificationsEnabled(): Promise<boolean> {
        if (!Capacitor.isNativePlatform()) return false;

        try {
            const result = await PushNotifications.checkPermissions();
            return result.receive === 'granted';
        } catch (error) {
            console.error('Error checking notification permissions:', error);
            return false;
        }
    }
}
