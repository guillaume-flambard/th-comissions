# Trackly

> B2B commission tracking platform for Thailand's tourism sector

**Track smarter, earn more** - Trackly helps tourism businesses in Thailand manage referral commissions effortlessly through QR codes, automated calculations, and PromptPay integration.

## 🎯 Problem We Solve

Thailand's tourism sector (9th highest globally, $42.7B revenue in 2024) operates through fragmented SME networks relying on informal B2B referral commissions ("pourcent"). Current reality:

- **Manual tracking**: Handwritten notebooks, WhatsApp messages, scattered spreadsheets
- **Attribution chaos**: "Did that customer actually mention us or find us on Google?"
- **Payment friction**: End-of-month reconciliation nightmares across dozens of partners
- **No optimization**: Businesses can't identify which partnerships drive value
- **Lost revenue**: Administrative leakage, disputes, unpaid commissions

## ✨ Features

### MVP (Phase 1)
- ✅ **QR Code & Link Generation**: Unique tracking for each partner
- ✅ **Referral Attribution**: Know exactly who sent each customer
- ✅ **Commission Calculation**: Automated with customizable rates
- ✅ **Partner Dashboard**: Real-time earnings and payment tracking
- ✅ **Manual Payment Tracking**: Mark commissions as paid with proof

### Phase 2 (Coming Soon)
- 🔄 **PMS Integration**: Auto-validate bookings (STAAH, Cloudbeds)
- 💸 **PromptPay Automation**: One-click commission payouts
- 📊 **Partner Lifetime Value (PLV)**: Analytics to identify top partners
- 📱 **Smart Alerts**: Payment reminders, performance insights

### Phase 3 (Roadmap)
- 🔗 **Multi-tier Referrals**: Track referral chains (A→B→C)
- 🎁 **Promotional Campaigns**: Bonus incentives, leaderboards
- 📱 **Native Mobile Apps**: iOS & Android
- 🔌 **Public API**: Custom integrations

## 🚀 Tech Stack

- **Backend**: Laravel 12 with Inertia.js
- **Frontend**: React 19, TypeScript, Tailwind CSS 4
- **Auth**: Laravel Fortify
- **Routing**: Laravel Wayfinder (auto-generated TypeScript routes)
- **UI Components**: Radix UI
- **Build**: Vite 7
- **Database**: SQLite (dev), PostgreSQL (production)
- **QR Generation**: endroid/qr-code

## 📦 Installation

### Prerequisites
- PHP 8.2+
- Node.js 18+
- Composer 2+

### Quick Start

```bash
# Clone repository
git clone <your-repo-url>
cd th-comissions

# Install dependencies and set up
composer run setup

# Start development server (all processes)
composer run dev
```

This runs:
- PHP dev server (localhost:8000)
- Queue worker
- Laravel Pail (log viewer)
- Vite dev server (hot reload)

### Individual Commands

```bash
# Frontend only
npm run dev          # Vite dev server
npm run build        # Production build
npm run lint         # ESLint
npm run format       # Prettier

# Backend only
php artisan serve              # Dev server
php artisan migrate           # Run migrations
php artisan test              # Run tests
```

## 🗄️ Database Schema

Key tables:
- `partners` - Business accounts (dive shops, hostels, etc.)
- `tracking_links` - QR codes and referral links
- `referrals` - Attribution records
- `commission_payments` - Payout tracking
- `partner_metrics` - PLV analytics

See `/database/migrations` for full schema.

## 🌐 Localization

Trackly is built for Thailand first:
- **Primary language**: Thai (ภาษาไทย)
- **Secondary language**: English
- **Timezone**: Asia/Bangkok (UTC+7)
- **Currency**: Thai Baht (THB)
- **Payment**: PromptPay integration

## 📊 Target Market

### Primary Segments
1. **Dive Shops** (Koh Tao, Koh Samui, Phuket)
2. **Kite Surf Schools** (Hua Hin, Pranburi)
3. **Hostels & Budget Hotels**
4. **Tour Operators**
5. **Transfer Services**

### Industry Stats
- 32.4M tourists in 2024 (projected 36-40M in 2025)
- Average tourist spend: $160/day over 9 days
- Commission rates: 10-25% of transaction value
- 20,000+ accommodation properties in Thailand

## 💰 Pricing

- **Free Tier**: QR tracking, up to 20 referrals/month
- **Starter**: 299 THB/month (~$9) - Unlimited referrals, PromptPay
- **Pro**: 999 THB/month (~$30) - PMS integration, PLV analytics
- **Enterprise**: Custom pricing - API access, white-label

## 🛣️ Roadmap

### Q4 2025 - MVP Launch
- ✅ Core commission tracking
- ✅ QR code generation
- ✅ Basic dashboard
- 🎯 Launch in Koh Tao (10 beta users)

### Q1 2026 - Automation
- PMS integrations (STAAH, Cloudbeds)
- PromptPay automation
- Expand to Koh Samui, Phuket (50+ users)

### Q2 2026 - Scale
- Multi-tier referrals
- Mobile apps
- Bangkok, Chiang Mai expansion (200+ users)

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

This is currently a private project. If you're interested in contributing, please contact hello@trackly.io

## 📞 Contact

- **Website**: trackly.io (coming soon)
- **Email**: hello@trackly.io
- **Location**: Thailand

---

**Built with ❤️ for Thailand's tourism community**
