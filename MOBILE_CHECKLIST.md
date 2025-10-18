# Trackly Mobile App - Launch Checklist

Quick checklist to get your mobile app from development to App Store deployment.

## Pre-Launch Checklist

### 1. Initial Setup ✅ COMPLETE

- [x] Install Capacitor packages
- [x] Configure capacitor.config.ts
- [x] Update vite.config.ts
- [x] Create mobile components
- [x] Create mobile views
- [x] Add build scripts to package.json
- [x] Create documentation

### 2. Add Native Platforms 🔲 TODO

```bash
# Add iOS (macOS only - requires Xcode)
npm run cap:add:ios

# Add Android (requires Android Studio)
npm run cap:add:android
```

- [ ] iOS platform added (`/ios` directory created)
- [ ] Android platform added (`/android` directory created)
- [ ] First sync completed (`npm run cap:sync`)

### 3. App Icons & Branding 🔲 TODO

**Create Master Icon:**
- [ ] Design 1024x1024 icon with Trackly branding
- [ ] Use Trackly blue (#2563EB) as primary color
- [ ] Keep design simple and recognizable
- [ ] No text (too small to read at app icon size)

**Generate All Sizes:**
- [ ] Go to [AppIcon.co](https://appicon.co/)
- [ ] Upload 1024x1024 PNG
- [ ] Download iOS and Android sets

**Add to iOS:**
- [ ] Place icons in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- [ ] Verify all sizes present in Xcode

**Add to Android:**
- [ ] Open Android Studio
- [ ] Right-click `res` > New > Image Asset
- [ ] Upload 512x512 icon
- [ ] Generate all densities

### 4. Splash Screens 🔲 TODO

**Design:**
- [ ] Create splash screen with Trackly logo
- [ ] Blue background (#2563EB)
- [ ] Logo centered
- [ ] Keep it simple (shows for 2 seconds)

**iOS:**
- [ ] Add to `ios/App/App/Assets.xcassets/Splash.imageset/`
- [ ] Verify in Xcode

**Android:**
- [ ] Add `splash.png` to `android/app/src/main/res/drawable/`
- [ ] Verify background color in `styles.xml`

### 5. App Configuration 🔲 TODO

**iOS (in Xcode):**
- [ ] Set Bundle Identifier: `com.trackly.app` (or your domain)
- [ ] Set Display Name: "Trackly"
- [ ] Select your Apple Developer team
- [ ] Set Deployment Target: iOS 14.0+
- [ ] Configure signing (Automatic for dev, Manual for production)

**Android (in Android Studio):**
- [ ] Update package name in `build.gradle`: `com.trackly.app`
- [ ] Set app name in `strings.xml`: "Trackly"
- [ ] Set minSdkVersion: 22 (Android 5.1)
- [ ] Set targetSdkVersion: 34 (Android 14)

### 6. Permissions 🔲 TODO

**iOS (Info.plist):**
- [ ] Camera: "Trackly needs camera access to scan QR codes"
- [ ] Push Notifications: "Receive payment reminders and alerts"
- [ ] Verify in `ios/App/App/Info.plist`

**Android (AndroidManifest.xml):**
- [x] Camera permission (already added)
- [x] Internet permission (already added)
- [x] Network state permission (already added)
- [ ] Verify in `android/app/src/main/AndroidManifest.xml`

### 7. Push Notifications Setup 🔲 TODO

**iOS (APNS):**
- [ ] Create Apple Push Notification certificate
- [ ] Download .p12 file
- [ ] Enable push capability in Xcode
- [ ] Configure in Laravel backend

**Android (FCM):**
- [ ] Create Firebase project
- [ ] Add Android app to Firebase
- [ ] Download `google-services.json`
- [ ] Place in `android/app/`
- [ ] Add Firebase dependencies to `build.gradle`

**Backend API:**
- [ ] Create `/api/device-tokens` endpoint
- [ ] Create device tokens database table
- [ ] Implement notification sending queue job

### 8. Testing 🔲 TODO

**Simulator/Emulator Testing:**
- [ ] Run on iOS Simulator (iPhone 12+)
- [ ] Run on Android Emulator (Pixel 5+)
- [ ] Test all navigation tabs
- [ ] Test form submissions
- [ ] Test routing and deep linking

**Physical Device Testing (REQUIRED for some features):**
- [ ] Test on iPhone (iOS 14+)
- [ ] Test on Android phone (Android 10+)
- [ ] Test QR code scanner with camera
- [ ] Test haptic feedback
- [ ] Test push notifications
- [ ] Test native share
- [ ] Test in various lighting conditions
- [ ] Test on 3G/4G network
- [ ] Test offline mode

**User Flow Testing:**
- [ ] User can log in
- [ ] Dashboard loads and shows data
- [ ] Can navigate between tabs
- [ ] Can log a new referral
- [ ] Can scan QR code
- [ ] Can share QR code
- [ ] Can view partners list
- [ ] Can search partners
- [ ] Forms validate correctly
- [ ] Success messages appear
- [ ] Error handling works

### 9. Performance Audit 🔲 TODO

- [ ] Run Lighthouse audit (mobile mode)
- [ ] Score > 90 on performance
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Bundle size < 1MB gzipped
- [ ] Test on slow 3G network
- [ ] No console errors
- [ ] No TypeScript errors (`npm run types`)

### 10. Localization (Optional) 🔲 TODO

- [ ] Create `resources/lang/th.json`
- [ ] Translate all UI strings to Thai
- [ ] Test with Thai language
- [ ] Add language switcher to settings

### 11. Analytics & Monitoring 🔲 TODO

- [ ] Integrate Firebase Analytics
- [ ] Integrate Sentry for error tracking
- [ ] Add event tracking for key actions
- [ ] Set up crash reporting

### 12. Security Checklist 🔲 TODO

- [ ] HTTPS enforced in production
- [ ] CORS configured in Laravel
- [ ] CSP headers set
- [ ] API keys in .env (not in code)
- [ ] Keystore backed up securely
- [ ] SSL certificate valid
- [ ] No sensitive data in logs

### 13. App Store Preparation 🔲 TODO

**iOS App Store:**
- [ ] Create app in App Store Connect
- [ ] Write app description (Thai + English)
- [ ] Take screenshots (6.5" and 5.5" required)
- [ ] Create privacy policy page
- [ ] Create support page
- [ ] Add keywords: "commission, tracking, tourism, referral, Thailand"
- [ ] Set category: Business
- [ ] Set age rating

**Google Play Store:**
- [ ] Create app in Play Console
- [ ] Write app description (Thai + English)
- [ ] Take screenshots (phone + tablet)
- [ ] Create feature graphic (1024x500)
- [ ] Create privacy policy page
- [ ] Create support page
- [ ] Set category: Business
- [ ] Complete content rating questionnaire

### 14. Build for Production 🔲 TODO

**iOS:**
```bash
npm run mobile:build
npm run cap:open:ios
# In Xcode: Product > Archive > Upload to App Store Connect
```

- [ ] Build succeeds without errors
- [ ] Archive created
- [ ] Uploaded to App Store Connect
- [ ] Build processed successfully

**Android:**
```bash
npm run mobile:build
cd android
./gradlew bundleRelease
# Upload: android/app/build/outputs/bundle/release/app-release.aab
```

- [ ] Build succeeds without errors
- [ ] AAB file created
- [ ] File size < 50MB
- [ ] Uploaded to Play Console

### 15. Beta Testing (Recommended) 🔲 TODO

**iOS TestFlight:**
- [ ] Add 5-10 beta testers
- [ ] Send TestFlight invites
- [ ] Collect feedback
- [ ] Fix critical bugs

**Android Internal Testing:**
- [ ] Add 5-10 beta testers
- [ ] Send testing invites
- [ ] Collect feedback
- [ ] Fix critical bugs

### 16. App Store Submission 🔲 TODO

**iOS:**
- [ ] Submit for review
- [ ] Wait 1-3 days for review
- [ ] Respond to any reviewer questions
- [ ] App approved!

**Android:**
- [ ] Submit for review
- [ ] Wait 1-7 days for review
- [ ] Respond to any reviewer questions
- [ ] App approved!

### 17. Launch! 🔲 TODO

- [ ] Publish app on iOS App Store
- [ ] Publish app on Google Play Store
- [ ] Announce on social media
- [ ] Email existing users
- [ ] Update website with download links
- [ ] Monitor reviews and ratings
- [ ] Monitor crash reports
- [ ] Respond to user feedback

### 18. Post-Launch 🔲 TODO

**Week 1:**
- [ ] Monitor crash reports daily
- [ ] Respond to all reviews
- [ ] Track download numbers
- [ ] Monitor server load

**Week 2:**
- [ ] Collect user feedback
- [ ] Plan first update
- [ ] Fix high-priority bugs

**Week 3:**
- [ ] Release first update
- [ ] Add requested features
- [ ] Improve performance

**Week 4:**
- [ ] Analyze analytics data
- [ ] Plan next version
- [ ] Celebrate success! 🎉

---

## Quick Commands Reference

```bash
# Development
php artisan serve                    # Start Laravel server
npm run mobile:dev:ios               # Run iOS with hot reload
npm run mobile:dev:android           # Run Android with hot reload

# Build
npm run build                        # Build web assets
npm run mobile:build                 # Build + sync to native

# Capacitor
npm run cap:sync                     # Sync assets to native
npm run cap:open:ios                 # Open Xcode
npm run cap:open:android             # Open Android Studio

# Testing
npm run types                        # Type check
npm run lint                         # Lint code
npm run format                       # Format code
```

## Time Estimates

- [ ] **Add platforms**: 5 minutes
- [ ] **Create icons**: 1-2 hours
- [ ] **Configure apps**: 1 hour
- [ ] **Set up push notifications**: 2-3 hours
- [ ] **Test on devices**: 4-6 hours
- [ ] **Create store listings**: 2-3 hours
- [ ] **Build and submit**: 1 hour
- [ ] **Wait for review**: 1-7 days

**Total active time: 1-2 days**
**Total calendar time: 3-10 days** (including review)

## Priority Order

1. Add native platforms
2. Create and add app icons
3. Test on physical devices
4. Create store listings
5. Submit to stores
6. Set up push notifications (can do after approval)
7. Add analytics and monitoring

## Need Help?

- See `/MOBILE_APP_GUIDE.md` for detailed instructions
- See `/MOBILE_QUICK_START.md` for quick commands
- See `/MOBILE_IMPLEMENTATION_COMPLETE.md` for what's been built

---

**Status: Ready to deploy!** 🚀

All code is written. Just follow this checklist to get to the App Store.
