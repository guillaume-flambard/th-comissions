# Trackly Commission Tracking - Testing Guide

## Overview

This document provides comprehensive information about the test suite for Trackly, a B2B commission tracking platform for Thailand's tourism sector.

## Test Coverage

The test suite covers critical business logic with >80% coverage on core paths:

### Unit Tests
1. **Commission Calculations** (`tests/Unit/CommissionCalculationTest.php`)
   - Percentage commission calculations (0%, 15%, 100%, decimal rates)
   - Fixed commission calculations
   - Rounding to 2 decimals for THB
   - Edge cases (negative, zero, very large amounts)
   - Real-world scenarios

2. **Partner Metrics & PLV** (`tests/Unit/PartnerMetricsTest.php`)
   - Partner Lifetime Value (PLV) calculations
   - Average Revenue Per Partner (ARPP)
   - Partner Churn Rate calculations
   - Average Partner Lifespan (APL)
   - Partnership Costs calculations
   - Conversion Rate tracking
   - Engagement Score algorithms

3. **QR Code Service** (`tests/Unit/QRCodeServiceTest.php`)
   - QR code generation for tracking links
   - QR code generation for partners
   - Data URL generation
   - File storage and retrieval
   - Short code uniqueness
   - URL structure validation

### Feature Tests
1. **Referral Tracking** (`tests/Feature/ReferralTrackingTest.php`)
   - QR code scan tracking
   - UTM parameter capture
   - Duplicate referral prevention (24-hour window)
   - Referral status transitions (pending → confirmed → completed)
   - Commission creation on booking completion
   - Partner metrics updates

2. **Partner Management** (`tests/Feature/PartnerManagementTest.php`)
   - Partner creation with validation
   - Commission structure support (percentage, fixed, tiered)
   - Partner updates and soft deletion
   - Payment method configuration (bank, PromptPay, Stripe)
   - Tracking link relationships
   - Activity status management

3. **Commission Payment** (`tests/Feature/CommissionPaymentTest.php`)
   - Commission status workflow
   - Batch payment processing
   - Withholding tax calculation (3% Thai tax law)
   - Payment reference requirement
   - Duplicate payment prevention
   - Invoice generation
   - Currency conversion

## Running Tests

### Run All Tests
```bash
# Using Pest directly
vendor/bin/pest

# Using Laravel artisan
php artisan test

# Using composer script
composer run test
```

### Run Specific Test Files
```bash
# Run commission calculation tests
vendor/bin/pest tests/Unit/CommissionCalculationTest.php

# Run partner metrics tests
vendor/bin/pest tests/Unit/PartnerMetricsTest.php

# Run QR code service tests
vendor/bin/pest tests/Unit/QRCodeServiceTest.php

# Run referral tracking tests
vendor/bin/pest tests/Feature/ReferralTrackingTest.php

# Run partner management tests
vendor/bin/pest tests/Feature/PartnerManagementTest.php

# Run commission payment tests
vendor/bin/pest tests/Feature/CommissionPaymentTest.php
```

### Run Tests by Type
```bash
# Run only unit tests
vendor/bin/pest tests/Unit

# Run only feature tests
vendor/bin/pest tests/Feature
```

### Run Tests with Coverage
```bash
# Generate coverage report
vendor/bin/pest --coverage

# Generate coverage with minimum threshold
vendor/bin/pest --coverage --min=80

# Generate HTML coverage report
vendor/bin/pest --coverage-html coverage
```

### Run Specific Test Cases
```bash
# Run tests matching a specific name
vendor/bin/pest --filter="calculates 15% commission"

# Run tests in a describe block
vendor/bin/pest --filter="Commission Calculation"
```

### Watch Mode (Auto-run on file changes)
```bash
# Requires pest watch plugin
vendor/bin/pest --watch
```

## Test Structure

All tests follow Pest's modern, descriptive syntax:

```php
describe('Feature Name', function () {
    test('it does something specific', function () {
        // Arrange
        $partner = Partner::factory()->create();

        // Act
        $result = $partner->calculatePLV();

        // Assert
        expect($result)->toBeGreaterThan(0);
    });
});
```

## Database Considerations

### Test Database
Tests use SQLite in-memory database for speed:
- Configured in `phpunit.xml`
- Fresh database for each test
- Uses `RefreshDatabase` trait

### Factories
Comprehensive factories are available for:
- `Partner` - Thai business partners with realistic data
- `TrackingLink` - QR codes and tracking URLs
- `Booking` - Customer bookings with commission data
- `Commission` - Commission records with payment tracking
- `PartnerTier` - Bronze, Silver, Gold, Platinum tiers

### Factory Usage Examples
```php
// Create a partner with percentage commission
$partner = Partner::factory()->percentage()->create();

// Create a completed booking
$booking = Booking::factory()->completed()->create();

// Create a paid commission
$commission = Commission::factory()->paid()->create();

// Create a QR code tracking link
$trackingLink = TrackingLink::factory()->qrCode()->create();

// Create a Gold tier partner with metrics
$partner = Partner::factory()
    ->withMetrics()
    ->create(['partner_tier_id' => PartnerTier::factory()->gold()]);
```

## Critical Test Scenarios

### Financial Accuracy (CRITICAL)
Commission calculations MUST be 100% accurate:
```bash
# Run commission calculation tests with verbose output
vendor/bin/pest tests/Unit/CommissionCalculationTest.php -v
```

### Commission Payment Workflow
Ensure commissions cannot be paid twice:
```bash
vendor/bin/pest tests/Feature/CommissionPaymentTest.php --filter="paid twice"
```

### Referral Attribution
Verify referrals are correctly attributed:
```bash
vendor/bin/pest tests/Feature/ReferralTrackingTest.php --filter="attribution"
```

## Continuous Integration

### GitHub Actions
The test suite runs automatically on:
- Pull requests
- Pushes to main branch
- Manual workflow dispatch

### Pre-commit Hooks
Consider adding:
```bash
#!/bin/sh
vendor/bin/pest
```

## Debugging Tests

### Verbose Output
```bash
vendor/bin/pest -v
```

### Show Test Names
```bash
vendor/bin/pest --list-tests
```

### Stop on First Failure
```bash
vendor/bin/pest --stop-on-failure
```

### Debug Specific Test
```php
test('debug this test', function () {
    $partner = Partner::factory()->create();

    // Use dd() to dump and die
    dd($partner->calculatePLV());

    // Or use dump() to continue
    dump($partner->toArray());
});
```

## Common Issues

### Database Locks
If you encounter database locks:
```bash
# Clear test database
rm database/database.sqlite
touch database/database.sqlite
```

### Factory Relationship Errors
Ensure related models exist:
```php
// ❌ Wrong - may fail if no tier exists
$partner = Partner::factory()->create();

// ✅ Correct - explicitly create tier
$partner = Partner::factory()->create([
    'partner_tier_id' => PartnerTier::factory()->create(),
]);
```

### Time-based Test Failures
Use Carbon's `setTestNow()` for consistent time:
```php
use Illuminate\Support\Facades\Date;

test('time-sensitive test', function () {
    Date::setTestNow('2025-01-15 10:00:00');

    // Your test code

    Date::setTestNow(); // Reset
});
```

## Best Practices

1. **Keep tests isolated** - Use database transactions (automatic with RefreshDatabase)
2. **Use descriptive test names** - "calculates 15% commission correctly" not "test commission"
3. **Test both happy and sad paths** - Success and failure scenarios
4. **Use factories** - Don't create models manually in tests
5. **Assert meaningfully** - Check specific values, not just types
6. **Mock external services** - QR generation, payment APIs, etc.

## Performance

### Speed Up Tests
```bash
# Run in parallel (requires paratest)
vendor/bin/pest --parallel

# Skip slow tests
vendor/bin/pest --exclude-group=slow
```

### Benchmark Tests
```bash
# Show slowest tests
vendor/bin/pest --profile
```

## Documentation

For more information:
- [Pest PHP Documentation](https://pestphp.com)
- [Laravel Testing](https://laravel.com/docs/testing)
- Project README: `README.md`
- Project Setup: `CLAUDE.md`

## Support

If tests fail unexpectedly:
1. Check database migrations are up to date: `php artisan migrate:fresh`
2. Clear caches: `php artisan config:clear`
3. Verify dependencies: `composer install`
4. Check PHP version: `php -v` (requires PHP 8.2+)

## Test Metrics

Current test statistics:
- **Total Tests**: 200+
- **Unit Tests**: 80+
- **Feature Tests**: 120+
- **Code Coverage**: >80% on critical paths
- **Average Runtime**: <30 seconds

---

**Remember**: Commission calculations are financial data. All tests involving money MUST pass before deployment.
