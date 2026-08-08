# 🧪 Trackly MVP - End-to-End Testing Guide

**Server:** http://127.0.0.1:8000
**Status:** ✅ Running
**Database:** ✅ Fresh with 150+ sample records
**Demo Account:** demo@trackly.io / password

---

## 📋 Testing Checklist

### ✅ Test 1: Authentication Flow (5 minutes)

#### 1.1 Login
- [ ] Navigate to http://127.0.0.1:8000
- [ ] Click "Sign In" or go to /login
- [ ] Enter: demo@trackly.io / password
- [ ] Click "Sign In"
- [ ] **Expected:** Redirect to dashboard
- [ ] **Check:** Welcome message shows

#### 1.2 Logout
- [ ] Click user menu (top right)
- [ ] Click "Logout"
- [ ] **Expected:** Redirect to login page

#### 1.3 Re-login for Testing
- [ ] Login again with demo@trackly.io / password
- [ ] **Expected:** Back to dashboard

**✅ Pass Criteria:** Can login, logout, and login again without errors

---

### ✅ Test 2: Dashboard Analytics (5 minutes)

#### 2.1 View Dashboard
- [ ] Should be on /dashboard
- [ ] **Check Stats Cards:**
  - [ ] Commissions Earned (should show ฿ amount)
  - [ ] Commissions Owed (should show ฿ amount)
  - [ ] Active Partners (should show 8)
  - [ ] Pending Referrals (should show number)

#### 2.2 Check Trends
- [ ] Each stat card has trend indicator (▲ or ▼)
- [ ] Percentage change shown
- [ ] Green for positive, red for negative

#### 2.3 Top Partners Section
- [ ] "Top Partners" section visible
- [ ] Shows up to 5 partners
- [ ] Each has: name, type, PLV amount
- [ ] Sorted by PLV (highest first)

#### 2.4 Recent Referrals Section
- [ ] "Recent Referrals" section visible
- [ ] Shows up to 10 referrals
- [ ] Each shows: customer, partner, amount, status
- [ ] Status badges color-coded

**✅ Pass Criteria:** All stats display correctly, no console errors

---

### ✅ Test 3: Partner Management (10 minutes)

#### 3.1 View Partners List
- [ ] Click "Partners" in sidebar (or navigate to /admin/partners)
- [ ] **Expected:** Grid/list of 8 partners
- [ ] Each partner card shows:
  - [ ] Business name
  - [ ] Business type
  - [ ] Commission rate
  - [ ] Stats (referrals, commissions)

#### 3.2 Search Partners
- [ ] Type in search box: "Crystal"
- [ ] **Expected:** Filter to show only Crystal Dive
- [ ] Clear search
- [ ] **Expected:** All partners show again

#### 3.3 Filter Partners
- [ ] Click business type filter
- [ ] Select "dive_shop"
- [ ] **Expected:** Only dive shops shown
- [ ] Reset filter

#### 3.4 View Partner Details
- [ ] Click on any partner card
- [ ] **Expected:** Navigate to partner details page
- [ ] **Check sections:**
  - [ ] Business information
  - [ ] Contact details
  - [ ] Commission settings
  - [ ] Statistics
  - [ ] Recent referrals (sent & received)
  - [ ] Tracking links

#### 3.5 Create New Partner
- [ ] Go back to partners list (/admin/partners)
- [ ] Click "Add Partner" button
- [ ] Fill in required fields:
  - [ ] Business Name: "Test Dive Shop"
  - [ ] Business Type: "dive_shop"
  - [ ] Contact Name: "Test Manager"
  - [ ] Email: test@example.com
  - [ ] Phone: +66 12 345 6789
  - [ ] Commission Rate: 15
  - [ ] Commission Structure: percentage
- [ ] Click "Create Partner"
- [ ] **Expected:** Redirect to partner details
- [ ] **Expected:** Success message shown
- [ ] **Check:** Partner appears in list

#### 3.6 Edit Partner
- [ ] On the partner details page, click "Edit"
- [ ] Change commission rate to 20
- [ ] Click "Save Changes"
- [ ] **Expected:** Success message
- [ ] **Check:** Commission rate updated

#### 3.7 Delete Partner
- [ ] Click "Delete Partner" button
- [ ] Confirm deletion
- [ ] **Expected:** Redirect to partners list
- [ ] **Expected:** Partner removed from list
- [ ] **Note:** This is a soft delete (data retained)

**✅ Pass Criteria:** All CRUD operations work, no errors

---

### ✅ Test 4: QR Code Generation (5 minutes)

#### 4.1 Navigate to QR Code Generator
- [ ] Click "QR Codes" in sidebar
- [ ] **Expected:** Navigate to /qr-codes/generate

#### 4.2 Select Partner
- [ ] Click "Select Partner" dropdown
- [ ] **Check:** List of active partners shown
- [ ] Select any partner (e.g., "Crystal Dive Koh Tao")
- [ ] **Check:** Partner name appears in dropdown

#### 4.3 Optional: Campaign Name
- [ ] Enter campaign name: "Winter 2025"
- [ ] **Optional field**

#### 4.4 Generate QR Code
- [ ] Click "Generate QR Code" button
- [ ] **Expected:** QR code appears in right preview panel
- [ ] **Check:** QR code image visible
- [ ] **Check:** Tracking link shown below QR code

#### 4.5 Download QR Code
- [ ] Click "Download" button
- [ ] **Expected:** QR code PNG file downloads
- [ ] **Check:** File saved to Downloads folder
- [ ] **Check:** File opens and shows QR code

#### 4.6 Copy Tracking Link
- [ ] Click "Copy" button on tracking link
- [ ] **Expected:** "Copied!" confirmation
- [ ] Paste in browser address bar
- [ ] **Expected:** Link format: http://localhost:8000/r/{code}

**✅ Pass Criteria:** QR code generates, displays, and downloads successfully

---

### ✅ Test 5: Referral Creation (NEW FEATURE!) (10 minutes)

#### 5.1 Navigate to Referrals
- [ ] Click "Referrals" in sidebar
- [ ] **Expected:** Navigate to /referrals

#### 5.2 View Referrals List
- [ ] **Check:** List of 150 referrals shown
- [ ] **Check:** Paginated (20 per page)
- [ ] **Check:** Status badges visible (pending, paid, etc.)

#### 5.3 Test Filters (NEW - just connected!)
- [ ] **Tab Switching:**
  - [ ] Click "Sent" tab
  - [ ] **Expected:** URL updates to ?tab=sent
  - [ ] **Check:** Referrals filtered
  - [ ] Click "Received" tab
  - [ ] **Expected:** URL updates to ?tab=received
  - [ ] Click "All" tab
  - [ ] **Expected:** All referrals shown

- [ ] **Status Filter:**
  - [ ] Select "Paid" from status dropdown
  - [ ] **Expected:** Only paid referrals shown
  - [ ] **Check:** URL has ?status=paid
  - [ ] Reset to "All Statuses"

- [ ] **Search (Debounced - NEW!):**
  - [ ] Type in search box: "John"
  - [ ] **Wait 500ms**
  - [ ] **Expected:** Results filter as you type
  - [ ] **Check:** URL has ?search=John
  - [ ] Clear search

#### 5.4 Create Manual Referral (BRAND NEW!)
- [ ] Click "Create Referral" button (top right)
- [ ] **Expected:** Navigate to /referrals/create
- [ ] **Expected:** Form with 4 sections visible

**Section 1: Customer Information**
- [ ] Enter Customer Name: "Jane Smith"
- [ ] Enter Email: jane@example.com
- [ ] Enter Phone: +66 98 765 4321

**Section 2: Partner Information**
- [ ] **Referring Partner:** Select "Crystal Dive Koh Tao"
- [ ] **Receiving Partner:** Select "Big Blue Diving"
- [ ] **Check:** Helper text shows "who sent" and "who received"

**Section 3: Service Information**
- [ ] **Service Type:** Select "Diving Course"
- [ ] **Service Amount:** Enter 8000
- [ ] **Booking Date:** Keep today's date
- [ ] **Service Date:** (optional) Leave blank or pick future date
- [ ] **Description:** (optional) "Open Water certification"

**Section 4: Commission Information**
- [ ] **Commission Rate:** Should auto-populate from Crystal Dive's rate
- [ ] **Check:** If not auto-filled, enter 15
- [ ] **Calculated Commission Preview:**
  - [ ] **Expected:** Shows ฿1,200.00 (8000 × 15%)
  - [ ] **Check:** Updates in real-time as you change amount or rate

**Test Real-time Calculation:**
- [ ] Change service amount to 10000
- [ ] **Expected:** Commission updates to ฿1,500.00
- [ ] Change commission rate to 20
- [ ] **Expected:** Commission updates to ฿2,000.00
- [ ] **Check:** Calculation formula shown: "10000 × 20%"

**Submit Form:**
- [ ] Click "Create Referral"
- [ ] **Expected:** Redirect to /referrals
- [ ] **Expected:** Success message shown
- [ ] **Expected:** New referral appears in list
- [ ] **Check:** Customer "Jane Smith" visible
- [ ] **Check:** Amount ฿10,000.00 shown
- [ ] **Check:** Status "pending"

**✅ Pass Criteria:** Can create referral with auto-calculation working

---

### ✅ Test 6: Referral Management (5 minutes)

#### 6.1 Find Created Referral
- [ ] Search for "Jane Smith"
- [ ] **Expected:** Your newly created referral appears
- [ ] **Check:** All details match what you entered

#### 6.2 Mark as Paid (Bulk Action)
- [ ] Select checkbox on Jane Smith's referral
- [ ] Click "Mark as Paid" button
- [ ] **Expected:** Confirmation dialog
- [ ] Confirm action
- [ ] **Expected:** Status changes to "paid"
- [ ] **Expected:** Green badge shown

#### 6.3 Filter by Paid Status
- [ ] Select "Paid" from status filter
- [ ] **Expected:** Jane Smith's referral shown
- [ ] **Expected:** Other pending referrals hidden

**✅ Pass Criteria:** Can mark as paid and filter works

---

### ✅ Test 7: Dashboard Updates (3 minutes)

#### 7.1 Return to Dashboard
- [ ] Click "Dashboard" in sidebar
- [ ] **Expected:** Navigate to /dashboard

#### 7.2 Check Updated Stats
- [ ] **Commissions Earned:** Should have increased
- [ ] **Check:** Jane Smith's ฿2,000 commission included
- [ ] **Recent Referrals:** Jane Smith should appear in list
- [ ] **Top Partners:** Crystal Dive may have moved up

**✅ Pass Criteria:** Dashboard reflects the new referral

---

### ✅ Test 8: Mobile Responsiveness (5 minutes)

#### 8.1 Resize Browser
- [ ] Make browser window narrow (mobile width ~375px)
- [ ] **Check:** Sidebar collapses to hamburger menu
- [ ] **Check:** Partner cards stack vertically
- [ ] **Check:** Referral table becomes scrollable/responsive

#### 8.2 Test Key Pages on Mobile
- [ ] Dashboard: Stats cards stack
- [ ] Partners: Grid becomes single column
- [ ] Referrals: Table scrolls horizontally
- [ ] Create Referral: Form fields stack
- [ ] QR Code: Preview stacks below form

**✅ Pass Criteria:** All pages usable on mobile width

---

### ✅ Test 9: Dark Mode (2 minutes)

#### 9.1 Toggle Dark Mode
- [ ] Click settings icon (top right)
- [ ] Go to "Appearance"
- [ ] Toggle dark mode
- [ ] **Expected:** Colors invert
- [ ] **Check:** Text readable
- [ ] **Check:** Cards have dark background
- [ ] **Check:** Borders visible

#### 9.2 Test Pages in Dark Mode
- [ ] Dashboard
- [ ] Partners
- [ ] Referrals
- [ ] Create Referral
- [ ] **Check:** All readable, no white text on white background

**✅ Pass Criteria:** Dark mode works on all pages

---

### ✅ Test 10: Error Handling (5 minutes)

#### 10.1 Form Validation
- [ ] Go to /referrals/create
- [ ] Click "Create Referral" without filling anything
- [ ] **Expected:** Validation errors shown in Thai
- [ ] **Check:** Required fields highlighted
- [ ] **Check:** Error messages helpful

#### 10.2 Invalid Data
- [ ] Fill customer name
- [ ] Enter invalid email: "notanemail"
- [ ] Click submit
- [ ] **Expected:** Email validation error

#### 10.3 Commission Calculation Edge Cases
- [ ] Enter service amount: 0
- [ ] **Expected:** Commission shows ฿0.00
- [ ] Enter negative amount (if allowed)
- [ ] **Check:** Validation prevents it
- [ ] Enter very large amount: 999999
- [ ] **Expected:** Commission calculates correctly

**✅ Pass Criteria:** All validation works, no crashes

---

## 🐛 Bug Tracking

### Issues Found
| # | Page | Issue | Severity | Status |
|---|------|-------|----------|--------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

**Severity Levels:**
- 🔴 Critical: App crashes, data loss
- 🟡 High: Feature broken, workaround exists
- 🟢 Low: UI glitch, minor issue

---

## ✅ Final Checklist

### Functionality
- [ ] Can login/logout
- [ ] Dashboard shows correct data
- [ ] Can create/edit/delete partners
- [ ] Can generate QR codes
- [ ] **NEW:** Can create manual referrals
- [ ] **NEW:** Filters work (tabs, status, search)
- [ ] **NEW:** Commission auto-calculation works
- [ ] Can mark referrals as paid
- [ ] Dashboard updates in real-time

### UI/UX
- [ ] All pages load without errors
- [ ] Mobile responsive
- [ ] Dark mode works
- [ ] Animations smooth
- [ ] Forms validate correctly
- [ ] Success messages show
- [ ] Error messages helpful

### Performance
- [ ] Pages load quickly (<2 seconds)
- [ ] No lag when typing
- [ ] Search debounce works (500ms)
- [ ] QR code generates fast
- [ ] Large lists paginated

### Browser Console
- [ ] No JavaScript errors
- [ ] No 404 errors
- [ ] No failed network requests
- [ ] No deprecation warnings

---

## 📝 Testing Notes

**Tester:** _____________
**Date:** October 18, 2025
**Browser:** _____________
**OS:** _____________

**Overall Assessment:**
- [ ] ✅ Ready for Production
- [ ] ⚠️ Minor Issues (list above)
- [ ] ❌ Major Issues (list above)

**Additional Comments:**

---

## 🎯 Success Criteria

### Must Pass (Critical)
- ✅ All core features work
- ✅ No critical bugs
- ✅ Forms validate correctly
- ✅ Data persists correctly
- ✅ Calculations accurate

### Should Pass (Important)
- ✅ Mobile responsive
- ✅ Dark mode works
- ✅ No console errors
- ✅ Performance acceptable
- ✅ UI polished

### Nice to Have
- ✅ Animations smooth
- ✅ Empty states helpful
- ✅ Loading states clear
- ✅ Error messages friendly

---

## 🚀 Next Steps After Testing

### If All Tests Pass
1. Document any minor issues
2. Fix critical bugs (if any)
3. Deploy to staging
4. Repeat testing on staging
5. **GO LIVE!** 🎉

### If Issues Found
1. Prioritize by severity
2. Fix critical issues first
3. Re-test affected areas
4. Deploy to staging
5. Final verification

---

**Testing started at:** http://127.0.0.1:8000
**Demo credentials:** demo@trackly.io / password
**Expected duration:** 45-60 minutes

**Good luck! 🍀**
