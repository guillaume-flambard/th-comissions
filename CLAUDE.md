# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Trackly** is a B2B commission tracking platform designed for Thailand's tourism sector. It helps SME tourism businesses (dive shops, kite schools, hostels, tour operators) manage referral commissions through QR codes, automated calculations, and PromptPay integration.

### Key Business Context
- **Target Market**: Thai tourism SMEs (20,000+ properties, $42.7B industry)
- **Problem Solved**: Manual commission tracking (spreadsheets, WhatsApp) breaks at scale
- **Core Value**: Digital attribution (QR codes) + automated calculations + PromptPay payouts
- **Pricing**: Freemium (Free → 299 THB → 999 THB/month)
- **Launch Market**: Koh Tao dive shops, then island-wide expansion

### Domain-Specific Terms
- **Pourcent**: Thai slang for commission/referral fee
- **PLV (Partner Lifetime Value)**: Analytics metric to rank partner quality
- **PMS**: Property Management System (STAAH, Cloudbeds) - to be integrated Phase 2
- **PromptPay**: Thai instant payment system (800M transactions/month)

## Tech Stack

This is a Laravel 12 + React 19 application using:
- **Backend**: Laravel 12 with Inertia.js, Laravel Fortify (authentication), Laravel Wayfinder (route generation)
- **Frontend**: React 19, TypeScript, Tailwind CSS 4, Radix UI components
- **Build Tools**: Vite 7, Laravel Vite Plugin
- **Testing**: Pest (PHP), PHPUnit
- **Database**: SQLite (default)

## Development Commands

### Initial Setup
```bash
composer run setup
```
This installs dependencies, generates app key, runs migrations, and builds assets.

### Development Server
```bash
composer run dev
```
Starts all development processes concurrently:
- PHP development server (localhost:8000)
- Queue worker
- Laravel Pail (log viewer)
- Vite dev server (hot reload)

### Development with SSR
```bash
composer run dev:ssr
```
Starts development with Server-Side Rendering enabled.

### Frontend Commands
```bash
npm run dev          # Start Vite dev server only
npm run build        # Build production assets
npm run build:ssr    # Build with SSR support
npm run lint         # Run ESLint with auto-fix
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run types        # Type-check TypeScript
```

### Backend Commands
```bash
php artisan serve              # Start development server
php artisan migrate           # Run database migrations
php artisan test              # Run all tests
php artisan test --filter=TestName  # Run specific test
composer run test             # Run tests with config:clear
vendor/bin/pest               # Run Pest tests directly
vendor/bin/pest --filter=TestName  # Run specific Pest test
```

## Architecture

### Route System with Wayfinder
This project uses Laravel Wayfinder, which auto-generates TypeScript route helpers from Laravel routes. Routes are defined in:
- `routes/web.php` - Main application routes
- `routes/auth.php` - Authentication routes (Fortify)
- `routes/settings.php` - Settings/profile routes

Generated route helpers are in `resources/js/routes/index.ts` and organized into subfolders (login, register, profile, etc.). These provide type-safe route definitions and form actions for use with Inertia.js.

### Inertia.js Architecture
The app uses Inertia.js for SPA-like behavior without a separate API:
- Pages are React components in `resources/js/pages/`
- Controllers render Inertia responses: `Inertia::render('page-name', $props)`
- Page resolution configured in `resources/js/app.tsx`
- Forms submit to Laravel routes using Inertia's router or Wayfinder form actions

### Frontend Structure
- `resources/js/pages/` - Inertia page components (maps to route names)
- `resources/js/components/` - Reusable React components (includes custom UI and Radix UI wrappers)
- `resources/js/layouts/` - Page layout components
- `resources/js/hooks/` - Custom React hooks
- `resources/js/lib/` - Utility functions
- `resources/js/types/` - TypeScript type definitions
- `resources/js/actions/` - Backend action type definitions (auto-generated)
- `resources/js/routes/` - Wayfinder route helpers (auto-generated)
- `resources/js/wayfinder/` - Wayfinder utilities (auto-generated)

### Backend Structure
- `app/Http/Controllers/Auth/` - Authentication controllers
- `app/Http/Controllers/Settings/` - User settings controllers (Profile, Password, 2FA)
- `app/Models/` - Eloquent models
- `routes/` - Route definitions (web, auth, settings, console)
- `database/migrations/` - Database schema migrations
- `database/factories/` - Model factories for testing
- `database/seeders/` - Database seeders

### Authentication
Uses Laravel Fortify for authentication features:
- Login/logout
- Registration
- Password reset
- Email verification
- Two-factor authentication (TOTP)

Authentication views are Inertia React components in `resources/js/pages/auth/`.

### Component Library
The project uses a custom component library built on Radix UI primitives located in `resources/js/components/ui/`. These are pre-styled with Tailwind CSS and use class-variance-authority (cva) for variants.

### Type Generation
TypeScript types for Laravel routes and backend actions are auto-generated. After changing routes or form requests, run the dev server to regenerate types.

## Key Configuration Files
- `vite.config.ts` - Vite build configuration with Laravel plugin, React, Tailwind, and Wayfinder
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint configuration
- `composer.json` - PHP dependencies and scripts
- `package.json` - Node dependencies and scripts
- `phpunit.xml` - PHP testing configuration
- `components.json` - UI components configuration

## Database
Default database is SQLite located at `database/database.sqlite`. Change `DB_CONNECTION` in `.env` to use MySQL, PostgreSQL, etc.

## Trackly-Specific Implementation Guidelines

### Core Features (MVP - Phase 1)
1. **Partner Management**: CRUD for tourism businesses (dive shops, hostels, etc.)
2. **QR Code Generation**: Using `endroid/qr-code` package (already installed)
3. **Referral Tracking**: Attribution via QR scans or unique links
4. **Commission Calculation**: Configurable rates (10-25% typical), auto-calculate
5. **Payment Tracking**: Manual marking as paid (Phase 1), PromptPay later

### Key Models (to be created)
- `Partner`: Business accounts (has many tracking links, referrals)
- `TrackingLink`: QR codes/URLs with UTM parameters
- `Referral`: Commission records (belongs to referring + receiving partner)
- `CommissionPayment`: Payout batch records
- `PartnerMetric`: Monthly PLV analytics

### Database Schema Design Principles
- Use UUIDs for primary keys (better for distributed systems, no sequential leakage)
- Store monetary values as DECIMAL(10,2) in Thai Baht
- Use ENUMs for status fields (pending, validated, paid, disputed, cancelled)
- Include `created_at` and `updated_at` on all tables
- Foreign keys with proper constraints and indexes

### Localization Strategy
- **Primary locale**: `th` (Thai) - set in `.env` as `APP_LOCALE=th`
- **Fallback locale**: `en` (English)
- Translation files: `lang/th/` and `lang/en/`
- Frontend: Use Thai language in UI text, with English tooltips for technical terms
- Date/time: Use Thai Buddhist calendar where appropriate (2568 vs 2025)
- Numbers: Thai format (comma separators) but international numerals

### QR Code Implementation
- Package: `endroid/qr-code` (v6.0) already in `composer.json`
- Storage: `/storage/app/public/qr-codes/{partner_id}/{short_code}.png`
- URL structure: `https://trackly.io/r/{short_code}?utm_source={partner_id}&utm_medium=referral`
- Download formats: PNG (for digital), PDF (for print)

### Payment Integration (Phase 2)
- **PromptPay**: Integrate via Thai bank APIs (SCB, Kasikorn, Bangkok Bank)
- **Alternative wallets**: TrueMoney, Rabbit LINE Pay
- **Fallback**: Manual bank transfer with reference tracking
- **Tax compliance**: Auto-calculate 3% withholding tax for service payments

### Security & Privacy
- **PDPA Compliance**: Thailand's data protection law (similar to GDPR)
- Explicit consent for data collection at signup
- Data retention policy (auto-delete old records after X years)
- Encryption: TLS in transit, AES-256 at rest for sensitive data
- Authentication: Phone OTP primary (Thai users familiar), password secondary

### Performance Considerations
- **Target audience**: Mobile-first (86% of Thai SMEs use mobile)
- **Network**: Optimize for 3G/4G (minimize payload, lazy loading)
- **Hosting**: Asia-Pacific region (Singapore) for low latency
- **Caching**: Aggressive caching for dashboard metrics (update hourly, not real-time)

### Testing Strategy
- **Unit tests**: Commission calculations (critical for trust)
- **Feature tests**: Referral attribution flow (QR scan → booking → payment)
- **Browser tests**: Mobile responsiveness (primary use case)
- **Load tests**: Handle seasonal peaks (November-February high season)

### Brand Guidelines
See `BRAND.md` for detailed brand guidelines including:
- Color palette: Primary Blue (#2563EB), Orange accents (#F59E0B)
- Logo files: `/public/images/brand/logo.svg`, `logo-icon.svg`
- Typography: System fonts, Sarabun for Thai
- Voice: Simple, helpful, trustworthy, friendly

### Development Workflow
1. **Always run migrations** after pulling (database schema evolves rapidly in Phase 1)
2. **Check Wayfinder routes** after adding new routes (auto-generated types)
3. **Test in Thai locale** (primary user experience)
4. **Mobile-first CSS** (use Tailwind's `sm:`, `md:` breakpoints upward)
5. **Use Pest for new tests** (preferred over PHPUnit in this project)

### API Design (Phase 3)
- RESTful conventions
- JSON responses
- Authentication via Laravel Sanctum (API tokens)
- Rate limiting: 60 requests/minute (free tier), 300 (paid)
- Versioning: `/api/v1/` prefix

### Deployment Notes
- **Staging**: DigitalOcean droplet ($40/month)
- **Production**: AWS Asia-Pacific (Singapore) when scaling
- **CI/CD**: GitHub Actions (run tests, deploy on merge to main)
- **Monitoring**: Laravel Telescope (dev), Sentry (production errors)
- **Backups**: Daily database backups, 30-day retention
