# Trackly Mobile App - Quick Start

Fast guide to get the mobile app running on your device.

## Prerequisites

- Node.js 18+ installed
- Laravel dev server running (`php artisan serve`)
- **For iOS**: macOS with Xcode 14+
- **For Android**: Android Studio with SDK

## Quick Setup (5 minutes)

### 1. Build Web Assets
```bash
npm run build
```

### 2. Add Your Platform

**iOS (macOS only):**
```bash
npm run cap:add:ios
```

**Android:**
```bash
npm run cap:add:android
```

### 3. Sync Assets
```bash
npm run cap:sync
```

### 4. Open Native IDE

**iOS:**
```bash
npm run cap:open:ios
```
- In Xcode, select a simulator
- Click Play button (Cmd+R)

**Android:**
```bash
npm run cap:open:android
```
- In Android Studio, select an emulator
- Click Run button (green play)

## Development Workflow

### Option A: Hot Reload (Recommended)

Connect your native app to your local Laravel server:

```bash
# Terminal 1: Start Laravel
php artisan serve

# Terminal 2: Run mobile app with hot reload
npm run mobile:dev:ios        # For iOS
npm run mobile:dev:android    # For Android
```

Now changes to React components will reload automatically!

### Option B: Manual Build

If you make changes without hot reload:

```bash
npm run build              # Build web assets
npm run cap:sync           # Sync to native
# Then rebuild in Xcode/Android Studio
```

## Test Key Features

### 1. QR Code Scanner
- Navigate to "Log" tab (bottom nav)
- Tap "Scan Partner QR Code"
- Allow camera permission
- Test with manual code entry

### 2. Dashboard
- See commission stats
- Try quick actions
- Test haptic feedback on buttons

### 3. Partners List
- Swipe/scroll through partners
- Tap to view details
- Test search functionality

### 4. Native Share
- Go to QR Code tab
- Generate your QR code
- Tap "Share" button
- Share via WhatsApp/Line/Email

## Common Issues

### White Screen
**Fix:** Check console in Safari Web Inspector (iOS) or Chrome DevTools (Android)
```bash
# iOS: Safari > Develop > Simulator > [Your App]
# Android: chrome://inspect in Chrome browser
```

### Changes Not Showing
**Fix:** Always sync after building
```bash
npm run build && npm run cap:sync
```

### Camera Not Working
**Fix:** Run on physical device (camera not available in simulator/emulator)

### Network Errors
**Fix:** Check Laravel server is running at `http://localhost:8000`
```bash
php artisan serve
```

## Production Build

When ready to deploy to App Store/Play Store:

### iOS
```bash
npm run build
npm run cap:sync
npm run cap:open:ios
# In Xcode: Product > Archive > Upload to App Store
```

### Android
```bash
npm run build
npm run cap:sync
cd android && ./gradlew bundleRelease
# Upload android/app/build/outputs/bundle/release/app-release.aab to Play Store
```

## File Structure

```
resources/js/
├── components/mobile/      # Mobile-specific components
│   ├── qr-scanner.tsx      # QR code scanner
│   ├── qr-display.tsx      # QR code generator
│   └── bottom-nav.tsx      # Bottom tab navigation
├── layouts/
│   └── mobile-layout.tsx   # Mobile page wrapper
├── pages/
│   ├── dashboard.mobile.tsx        # Mobile dashboard
│   ├── admin/partners/index.mobile.tsx  # Mobile partners list
│   └── booking/create.mobile.tsx   # Mobile quick booking
├── hooks/
│   └── use-device.ts       # Device detection
└── lib/
    ├── capacitor-utils.ts  # Native features wrapper
    └── push-notifications.ts  # Push notification manager
```

## Mobile View Convention

- Desktop view: `dashboard.tsx`
- Mobile view: `dashboard.mobile.tsx`

The app automatically loads mobile versions on native platforms.

## Key npm Scripts

```bash
npm run dev                # Vite dev server
npm run build              # Build for production
npm run mobile:build       # Build + sync to native

npm run cap:sync           # Sync assets to native
npm run cap:open:ios       # Open Xcode
npm run cap:open:android   # Open Android Studio

npm run mobile:dev:ios     # iOS with hot reload
npm run mobile:dev:android # Android with hot reload
```

## Next Steps

1. **Customize App Icons**: Replace placeholder icons with Trackly branding
2. **Configure Push Notifications**: Set up Firebase (Android) and APNS (iOS)
3. **Test on Real Devices**: Camera, GPS, push notifications only work on physical devices
4. **Add Thai Translations**: Localize all text for Thai users
5. **Deploy**: Submit to App Store and Google Play Store

For detailed instructions, see `MOBILE_APP_GUIDE.md`

## Need Help?

- Full guide: `MOBILE_APP_GUIDE.md`
- Capacitor docs: https://capacitorjs.com/docs
- Project CLAUDE.md for architecture details

---

**You're ready to build native iOS and Android apps with Laravel + React!**
