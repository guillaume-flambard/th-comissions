# Quick Test Reference

## Run All Tests
```bash
vendor/bin/pest
```

## Run Specific Test Files

### Unit Tests
```bash
# Commission calculations (CRITICAL - financial accuracy)
vendor/bin/pest tests/Unit/CommissionCalculationTest.php

# Partner metrics and PLV
vendor/bin/pest tests/Unit/PartnerMetricsTest.php

# QR code service
vendor/bin/pest tests/Unit/QRCodeServiceTest.php
```

### Feature Tests
```bash
# Referral tracking
vendor/bin/pest tests/Feature/ReferralTrackingTest.php

# Partner management
vendor/bin/pest tests/Feature/PartnerManagementTest.php

# Commission payment tracking
vendor/bin/pest tests/Feature/CommissionPaymentTest.php
```

## Run by Type
```bash
# All unit tests
vendor/bin/pest tests/Unit

# All feature tests
vendor/bin/pest tests/Feature
```

## Run Specific Tests
```bash
# By test name
vendor/bin/pest --filter="calculates 15% commission"

# By describe block
vendor/bin/pest --filter="Commission Calculation"

# Multiple filters
vendor/bin/pest --filter="commission|payment"
```

## Useful Options
```bash
# Stop on first failure
vendor/bin/pest --stop-on-failure

# Verbose output
vendor/bin/pest -v

# List all tests
vendor/bin/pest --list-tests

# Show slowest tests
vendor/bin/pest --profile

# With coverage
vendor/bin/pest --coverage

# Minimum coverage threshold
vendor/bin/pest --coverage --min=80
```

## Before Deployment
Run these critical tests:
```bash
# 1. Commission calculations MUST be accurate
vendor/bin/pest tests/Unit/CommissionCalculationTest.php

# 2. Payment workflow MUST prevent duplicates
vendor/bin/pest tests/Feature/CommissionPaymentTest.php --filter="paid twice"

# 3. Referrals MUST be attributed correctly
vendor/bin/pest tests/Feature/ReferralTrackingTest.php --filter="attribution"
```

## Database Setup
If tests fail with database errors:
```bash
# Reset test database
rm database/database.sqlite
touch database/database.sqlite

# Run migrations
php artisan migrate:fresh

# Then run tests again
vendor/bin/pest
```

## Common Issues

### "Class not found" errors
```bash
composer dump-autoload
```

### "Factory not found" errors
Check that models have `use HasFactory;` trait

### Decimal comparison failures
Laravel casts decimals as strings - adjust assertions as needed

## CI/CD Integration
```yaml
# GitHub Actions example
- name: Run Tests
  run: vendor/bin/pest --coverage --min=80
```

---

See `TESTING.md` for comprehensive testing documentation.
