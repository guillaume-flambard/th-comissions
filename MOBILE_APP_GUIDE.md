# Trackly Mobile App Setup Guide

Complete guide for setting up and deploying the Trackly mobile application using Capacitor.js with Laravel + React + Inertia.js.

## Overview

Trackly is now a full-featured mobile application optimized for Thai tourism SME owners. The app provides:

- Native iOS and Android apps built with Capacitor.js
- Mobile-optimized views for key features
- QR code scanning for partner referrals
- Push notifications for payment reminders
- Offline-capable dashboard
- Native share functionality
- Haptic feedback for better UX

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Development Workflow](#development-workflow)
3. [Building for iOS](#building-for-ios)
4. [Building for Android](#building-for-android)
5. [Mobile Features](#mobile-features)
6. [App Store Deployment](#app-store-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Initial Setup

### Prerequisites

**For iOS Development:**
- macOS with Xcode 14+ installed
- iOS Simulator or physical iOS device
- Apple Developer account (for deployment)

**For Android Development:**
- Android Studio installed
- Android SDK and build tools
- Java 17+
- Physical device or Android emulator

**For Both:**
- Node.js 18+ and npm
- Laravel 12 development environment running

### Step 1: Build the Web Assets

First, build your Laravel + React application:

```bash
npm run build
```

This creates optimized production assets in `public/build/`.

### Step 2: Add Native Platforms

Add iOS and Android platforms:

```bash
# Add iOS (macOS only)
npm run cap:add:ios

# Add Android
npm run cap:add:android
```

This creates native project folders:
- `ios/` - Xcode project
- `android/` - Android Studio project

### Step 3: Sync Web Assets to Native Projects

Sync your built web assets with native projects:

```bash
npm run cap:sync
```

Run this command whenever you:
- Change Capacitor configuration
- Install/remove Capacitor plugins
- Build new web assets

---

## Development Workflow

### Local Development with Hot Reload

For the best development experience, connect your native app to your local Laravel server:

#### iOS Development

1. Start your Laravel dev server:
```bash
php artisan serve
```

2. In another terminal, run the mobile dev script:
```bash
npm run mobile:dev:ios
```

This sets `CAPACITOR_SERVER_URL=http://localhost:8000` so your iOS app loads from your local server with hot reload.

#### Android Development

Same process for Android:

```bash
npm run mobile:dev:android
```

**Important:** For Android, you may need to use `10.0.2.2:8000` instead of `localhost:8000` in the emulator.

### Making Changes

1. **Update React Components**: Edit files in `resources/js/`
2. **Build Assets**: Run `npm run build`
3. **Sync to Native**: Run `npm run cap:sync`
4. **Test on Device**: Open in Xcode/Android Studio

For faster iteration during development, use the dev scripts above to skip manual syncing.

---

## Building for iOS

### Step 1: Open Xcode

```bash
npm run cap:open:ios
```

This opens the Xcode project.

### Step 2: Configure Project

In Xcode:

1. **Select your team** (Apple Developer account)
2. **Update Bundle Identifier**: `com.trackly.app` (or your custom ID)
3. **Set Deployment Target**: iOS 14.0+
4. **Configure Signing**: Automatic signing (development) or Manual (production)

### Step 3: Configure App Icons

1. Create app icons in various sizes (required):
   - 1024x1024 (App Store)
   - 180x180 (iPhone)
   - 167x167 (iPad Pro)
   - 152x152 (iPad)
   - 120x120 (iPhone)
   - etc.

2. Add icons to `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

**Quick Icon Generation:**
Use a tool like [AppIcon.co](https://appicon.co/) to generate all required sizes from a single 1024x1024 PNG with Trackly branding (blue #2563EB).

### Step 4: Configure Splash Screen

Edit `ios/App/App/Assets.xcassets/Splash.imageset/` to add your splash screen image.

The splash screen background color is already set to Trackly blue (#2563EB) in `capacitor.config.ts`.

### Step 5: Configure Permissions

The app requires these permissions (already configured in Info.plist):

- **Camera**: "Trackly needs camera access to scan QR codes"
- **Push Notifications**: "Receive payment reminders and commission alerts"

To customize messages, edit `ios/App/App/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>Trackly needs camera access to scan partner QR codes</string>
```

### Step 6: Run on Simulator

In Xcode:
1. Select a simulator (e.g., iPhone 15 Pro)
2. Click the Play button or press Cmd+R

### Step 7: Run on Physical Device

1. Connect your iPhone via USB
2. Trust the computer on your device
3. Select your device in Xcode
4. Click Play

For the first time, you may need to trust the developer certificate on your iPhone:
Settings > General > VPN & Device Management > Trust

### Step 8: Build for TestFlight/App Store

1. In Xcode: Product > Archive
2. Wait for archive to complete
3. Upload to App Store Connect
4. Submit for TestFlight or App Store review

---

## Building for Android

### Step 1: Open Android Studio

```bash
npm run cap:open:android
```

This opens the Android Studio project.

### Step 2: Configure Project

In Android Studio:

1. **Update Package Name**: `com.trackly.app` in `android/app/build.gradle`
2. **Set Minimum SDK**: API 22 (Android 5.1)
3. **Set Target SDK**: API 34 (Android 14)

### Step 3: Configure App Icons

1. Right-click `android/app/src/main/res`
2. New > Image Asset
3. Upload your 512x512 icon
4. Generate all sizes automatically

### Step 4: Configure Splash Screen

Edit `android/app/src/main/res/values/styles.xml` to customize splash screen (already set to Trackly blue).

Add splash image to `android/app/src/main/res/drawable/splash.png`

### Step 5: Configure Permissions

Required permissions (already configured in `AndroidManifest.xml`):

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.VIBRATE" />
```

For push notifications, Firebase Cloud Messaging (FCM) setup is required (see Push Notifications section).

### Step 6: Run on Emulator

1. Create an emulator in Android Studio (Tools > Device Manager)
2. Start the emulator
3. Click Run (green play button)

### Step 7: Run on Physical Device

1. Enable Developer Options on your Android device:
   - Settings > About Phone
   - Tap "Build Number" 7 times
2. Enable USB Debugging:
   - Settings > Developer Options > USB Debugging
3. Connect device via USB
4. Click Run in Android Studio

### Step 8: Build APK for Testing

```bash
cd android
./gradlew assembleDebug
```

Find APK at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Step 9: Build for Google Play Store

```bash
cd android
./gradlew bundleRelease
```

Find AAB at: `android/app/build/outputs/bundle/release/app-release.aab`

Upload this to Google Play Console.

---

## Mobile Features

### 1. Device Detection & Responsive Views

The app automatically detects mobile devices and loads optimized views:

**Hook Usage:**
```typescript
import { useDevice } from '@/hooks/use-device';

const { isMobile, isNative, isIOS, isAndroid } = useDevice();
```

**Mobile View Naming:**
- Desktop: `dashboard.tsx`
- Mobile: `dashboard.mobile.tsx`

The app resolver automatically loads `.mobile.tsx` versions when on native platforms.

### 2. QR Code Scanning

**Component:** `QRScanner` in `resources/js/components/mobile/qr-scanner.tsx`

**Usage:**
```typescript
import { QRScanner } from '@/components/mobile/qr-scanner';

<QRScanner
  onScan={(code) => console.log('Scanned:', code)}
  onClose={() => setShowScanner(false)}
/>
```

**Features:**
- Camera-based scanning using jsQR library
- Manual code entry fallback
- Haptic feedback on successful scan
- Permission handling

### 3. QR Code Display

**Component:** `QRDisplay` in `resources/js/components/mobile/qr-display.tsx`

**Usage:**
```typescript
import { QRDisplay } from '@/components/mobile/qr-display';

<QRDisplay
  value="partner-12345"
  title="Your Partner QR"
  showShare={true}
  showDownload={true}
/>
```

**Features:**
- High-quality QR code generation
- Native share functionality
- Download as PNG
- Responsive sizing

### 4. Bottom Navigation

**Component:** `BottomNav` in `resources/js/components/mobile/bottom-nav.tsx`

Mobile-optimized bottom tab navigation with:
- 5 main tabs: Home, Partners, Log, QR Code, Settings
- Active state indicators
- Haptic feedback
- Badge support for notifications

### 5. Mobile Layouts

**Layout:** `MobileLayout` in `resources/js/layouts/mobile-layout.tsx`

Handles:
- Status bar configuration
- Safe area insets (iOS notch)
- Bottom navigation spacing
- Page titles

### 6. Push Notifications

**Manager:** `PushNotificationManager` in `resources/js/lib/push-notifications.ts`

**Initialization:**
```typescript
import { PushNotificationManager } from '@/lib/push-notifications';

await PushNotificationManager.initialize();
```

**Features:**
- Permission requests
- FCM/APNS token management
- Notification listeners
- Deep linking support

**Notification Types:**
- `new_referral`: New customer booking
- `payment_reminder`: Commission payment due
- `partner_alert`: Partner status changes

**Backend Integration Required:**
You need to create an API endpoint to receive device tokens:

```php
// routes/api.php
Route::post('/device-tokens', [DeviceTokenController::class, 'store']);
```

### 7. Native Features

**Haptic Feedback:**
```typescript
import { CapacitorUtils } from '@/lib/capacitor-utils';

await CapacitorUtils.hapticImpact('medium'); // light, medium, heavy
```

**Native Share:**
```typescript
await CapacitorUtils.share({
  title: 'Trackly',
  text: 'Check out my QR code',
  url: 'https://trackly.app/qr/12345'
});
```

**Camera:**
```typescript
const photo = await CapacitorUtils.takePhoto();
```

**Network Status:**
```typescript
const { connected } = await CapacitorUtils.checkNetwork();
```

---

## App Store Deployment

### iOS App Store

#### Prerequisites
- Apple Developer Account ($99/year)
- App Store Connect access
- Provisioning profile and certificates

#### Steps

1. **Create App in App Store Connect:**
   - Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
   - Create new app
   - Bundle ID: `com.trackly.app`
   - Name: Trackly
   - Category: Business

2. **Prepare App Metadata:**
   - App description (Thai + English)
   - Screenshots (6.5", 5.5" required)
   - Privacy policy URL
   - Support URL
   - Keywords: "commission tracking, tourism, referral, Thailand"

3. **Archive and Upload:**
   - In Xcode: Product > Archive
   - Window > Organizer
   - Select archive > Distribute App
   - App Store Connect > Upload

4. **Submit for Review:**
   - In App Store Connect, select your build
   - Fill in app review information
   - Submit for review (usually 1-3 days)

5. **TestFlight (Optional):**
   - Internal testing: Add up to 100 testers
   - External testing: Public beta link

### Android Play Store

#### Prerequisites
- Google Play Developer Account ($25 one-time)
- Signing key generated

#### Steps

1. **Generate Signing Key:**
```bash
cd android/app
keytool -genkey -v -keystore trackly-release.keystore \
  -alias trackly -keyalg RSA -keysize 2048 -validity 10000
```

2. **Configure Signing in gradle:**
Edit `android/app/build.gradle`:
```gradle
signingConfigs {
    release {
        storeFile file('trackly-release.keystore')
        storePassword 'YOUR_PASSWORD'
        keyAlias 'trackly'
        keyPassword 'YOUR_PASSWORD'
    }
}
```

3. **Create App in Play Console:**
   - Go to [play.google.com/console](https://play.google.com/console)
   - Create app
   - Package name: `com.trackly.app`
   - Name: Trackly

4. **Prepare Store Listing:**
   - App description (Thai + English)
   - Screenshots (phone, tablet, 7-inch tablet)
   - Feature graphic (1024x500)
   - App icon (512x512)
   - Privacy policy URL
   - Category: Business

5. **Build and Upload AAB:**
```bash
cd android
./gradlew bundleRelease
```

Upload `app-release.aab` to Play Console > Production > Create new release

6. **Content Rating:**
   - Complete questionnaire
   - Trackly is rated for Everyone

7. **Submit for Review:**
   - Internal testing: Available immediately
   - Production: Review takes 1-7 days

---

## Troubleshooting

### iOS Issues

**Problem: White screen on launch**
- Solution: Check browser console in Safari Web Inspector
- Enable: Safari > Preferences > Advanced > Show Develop menu
- Develop > Simulator > [Your App]

**Problem: Camera permission denied**
- Solution: Add `NSCameraUsageDescription` to Info.plist
- Reinstall app on device

**Problem: Build fails with signing error**
- Solution: Xcode > Preferences > Accounts > Download Manual Profiles
- Select correct team in project settings

### Android Issues

**Problem: App not installing on device**
- Solution: Enable "Install from Unknown Sources"
- Check minimum SDK version matches device

**Problem: Gradle build fails**
- Solution: Update Android Studio and SDK tools
- Clean project: Build > Clean Project

**Problem: Camera not working**
- Solution: Add camera permission to AndroidManifest.xml
- Request permission at runtime

### General Issues

**Problem: Changes not appearing in app**
- Solution:
  1. Run `npm run build`
  2. Run `npm run cap:sync`
  3. Rebuild in Xcode/Android Studio

**Problem: Network requests failing**
- Solution:
  - Check CORS settings in Laravel
  - For development, use `CAPACITOR_SERVER_URL`
  - For production, ensure SSL certificate is valid

**Problem: Push notifications not working**
- Solution:
  - iOS: Check provisioning profile has push capability
  - Android: Configure Firebase Cloud Messaging
  - Test on physical device (not simulator/emulator)

---

## Asset Requirements

### App Icons

**iOS:**
- 1024x1024 (App Store)
- 180x180, 120x120, 87x87, 80x80, 60x60 (iPhone)
- 167x167, 152x152, 76x76 (iPad)

**Android:**
- 512x512 (Play Store)
- Auto-generated: xxxhdpi, xxhdpi, xhdpi, hdpi, mdpi

**Design Guidelines:**
- Use Trackly blue (#2563EB) as primary color
- Icon should be recognizable at small sizes
- No transparency (solid background)
- Follow platform guidelines (iOS/Android)

### Splash Screens

**iOS:**
- 2732x2732 (iPad Pro 12.9")
- 2048x2732 (iPad Pro 10.5")
- 1242x2688 (iPhone 11 Pro Max)
- etc.

**Android:**
- Single drawable with background color
- Logo centered
- Supports all screen densities

---

## Performance Optimization

### Bundle Size

Current optimizations in `vite.config.ts`:
- Code splitting for React, Inertia, Radix UI
- Tree shaking enabled
- Minification with Terser
- Console logs removed in production

### Network Performance

- Assets cached via service worker
- API responses cached when offline
- Images lazy loaded
- Bundle size < 1MB gzipped

### Mobile-Specific

- Touch targets minimum 44x44px (iOS) / 48x48dp (Android)
- Haptic feedback for better UX
- Native navigation (no web back button)
- Optimized for 3G/4G networks (Thailand)

---

## Next Steps

1. **Create App Icons**: Use Figma/Sketch to design 1024x1024 icon with Trackly branding
2. **Configure Firebase**: Set up FCM for Android push notifications
3. **Set up APNS**: Configure Apple Push Notification Service for iOS
4. **Backend API**: Create endpoints for device tokens and notifications
5. **Analytics**: Integrate Firebase Analytics or Mixpanel
6. **Error Tracking**: Add Sentry for crash reporting
7. **Testing**: QA on multiple devices (iPhone 12+, Android 10+)
8. **Store Listings**: Write compelling descriptions in Thai and English
9. **Beta Testing**: Recruit 10-20 Thai tourism SME owners for feedback
10. **Launch**: Submit to both app stores

---

## Useful Commands Reference

```bash
# Development
npm run dev                      # Start Vite dev server
npm run build                    # Build production assets
npm run mobile:build             # Build and sync to native

# Capacitor
npm run cap:sync                 # Sync web assets to native
npm run cap:add:ios              # Add iOS platform
npm run cap:add:android          # Add Android platform
npm run cap:open:ios             # Open Xcode
npm run cap:open:android         # Open Android Studio

# Mobile Development
npm run mobile:dev:ios           # Run iOS with hot reload
npm run mobile:dev:android       # Run Android with hot reload

# Testing
npm run types                    # Type check TypeScript
npm run lint                     # Lint code
```

---

## Support

For issues or questions:
- Check [Capacitor Docs](https://capacitorjs.com/docs)
- Ionic Community Forum
- Stack Overflow (tag: capacitor)
- This project's GitHub issues

---

**Built with Capacitor.js + Laravel 12 + React 19 + Inertia.js**

Happy mobile development!
