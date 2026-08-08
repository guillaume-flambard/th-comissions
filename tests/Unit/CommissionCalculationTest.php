<?php

use App\Models\Booking;

/**
 * Commission Calculation Tests
 *
 * These tests ensure that commission calculations are 100% accurate.
 * This is critical financial data that partners rely on for their business.
 */

describe('Basic Percentage Commission Calculations', function () {
    test('calculates 15% commission correctly on 10,000 THB', function () {
        $amount = 10000.00;
        $rate = 15.00;

        $commission = Booking::calculateCommissionAmount($amount, $rate, 'percentage');

        expect($commission)->toBe(1500.00);
    });

    test('calculates 10% commission correctly', function () {
        $amount = 5000.00;
        $rate = 10.00;

        $commission = Booking::calculateCommissionAmount($amount, $rate, 'percentage');

        expect($commission)->toBe(500.00);
    });

    test('calculates 20% commission correctly', function () {
        $amount = 25000.00;
        $rate = 20.00;

        $commission = Booking::calculateCommissionAmount($amount, $rate, 'percentage');

        expect($commission)->toBe(5000.00);
    });

    test('calculates 0% commission correctly', function () {
        $amount = 10000.00;
        $rate = 0.00;

        $commission = Booking::calculateCommissionAmount($amount, $rate, 'percentage');

        expect($commission)->toBe(0.00);
    });

    test('calculates 100% commission correctly', function () {
        $amount = 10000.00;
        $rate = 100.00;

        $commission = Booking::calculateCommissionAmount($amount, $rate, 'percentage');

        expect($commission)->toBe(10000.00);
    });
});

describe('Decimal Rate Commission Calculations', function () {
    test('calculates 15.5% commission correctly', function () {
        $amount = 10000.00;
        $rate = 15.5;

        $commission = Booking::calculateCommissionAmount($amount, $rate, 'percentage');

        expect($commission)->toBe(1550.00);
    });

    test('calculates 12.75% commission correctly', function () {
        $amount = 8000.00;
        $rate = 12.75;

        $commission = Booking::calculateCommissionAmount($amount, $rate, 'percentage');

        expect($commission)->toBe(1020.00);
    });

    test('calculates 18.33% commission with proper rounding', function () {
        $amount = 10000.00;
        $rate = 18.33;

        $commission = Booking::calculateCommissionAmount($amount, $rate, 'percentage');

        // 10000 * 18.33 / 100 = 1833
        expect($commission)->toBe(1833.00);
    });
});

describe('Commission Rounding', function () {
    test('rounds commission to 2 decimal places correctly', function () {
        $amount = 1234.56;
        $rate = 15.00;

        $commission = Booking::calculateCommissionAmount($amount, $rate, 'percentage');

        // 1234.56 * 15 / 100 = 185.184, should round to 185.18
        expect($commission)->toBe(185.18);
    });

    test('handles rounding up correctly', function () {
        $amount = 1000.00;
        $rate = 15.556;

        $commission = Booking::calculateCommissionAmount($amount, $rate, 'percentage');

        // 1000 * 15.556 / 100 = 155.56
        expect($commission)->toBe(155.56);
    });

    test('handles rounding down correctly', function () {
        $amount = 1000.00;
        $rate = 15.554;

        $commission = Booking::calculateCommissionAmount($amount, $rate, 'percentage');

        // 1000 * 15.554 / 100 = 155.54
        expect($commission)->toBe(155.54);
    });
});

describe('Large Amount Calculations', function () {
    test('calculates commission on very large amount correctly', function () {
        $amount = 999999.99;
        $rate = 15.00;

        $commission = Booking::calculateCommissionAmount($amount, $rate, 'percentage');

        // 999999.99 * 15 / 100 = 149999.9985, rounds to 150000.00
        expect($commission)->toBe(150000.00);
    });

    test('handles maximum realistic booking amount', function () {
        $amount = 500000.00;
        $rate = 18.00;

        $commission = Booking::calculateCommissionAmount($amount, $rate, 'percentage');

        expect($commission)->toBe(90000.00);
    });
});

describe('Small Amount Calculations', function () {
    test('calculates commission on small amount correctly', function () {
        $amount = 100.00;
        $rate = 15.00;

        $commission = Booking::calculateCommissionAmount($amount, $rate, 'percentage');

        expect($commission)->toBe(15.00);
    });

    test('handles minimum booking amount', function () {
        $amount = 1.00;
        $rate = 15.00;

        $commission = Booking::calculateCommissionAmount($amount, $rate, 'percentage');

        expect($commission)->toBe(0.15);
    });
});

describe('Fixed Commission Calculations', function () {
    test('returns fixed commission amount regardless of booking amount', function () {
        $amount = 10000.00;
        $fixedCommission = 500.00;

        $commission = Booking::calculateCommissionAmount($amount, $fixedCommission, 'fixed');

        expect($commission)->toBe(500.00);
    });

    test('returns same fixed commission for different amounts', function () {
        $fixedCommission = 250.00;

        $commission1 = Booking::calculateCommissionAmount(5000.00, $fixedCommission, 'fixed');
        $commission2 = Booking::calculateCommissionAmount(50000.00, $fixedCommission, 'fixed');

        expect($commission1)->toBe(250.00);
        expect($commission2)->toBe(250.00);
        expect($commission1)->toBe($commission2);
    });
});

describe('Booking Model Commission Calculation Integration', function () {
    test('automatically calculates commission on booking creation with percentage structure', function () {
        $booking = Booking::factory()->create([
            'amount' => 10000.00,
            'commission_rate' => 15.00,
            'commission_structure' => 'percentage',
        ]);

        expect($booking->commission_amount)->toBe('1500.00');
    });

    test('automatically calculates commission on booking creation with fixed structure', function () {
        $booking = Booking::factory()->create([
            'amount' => 10000.00,
            'commission_rate' => 500.00,
            'commission_structure' => 'fixed',
        ]);

        expect($booking->commission_amount)->toBe('500.00');
    });

    test('preserves manually set commission amount', function () {
        $booking = Booking::factory()->create([
            'amount' => 10000.00,
            'commission_rate' => 15.00,
            'commission_structure' => 'percentage',
            'commission_amount' => 2000.00, // Override
        ]);

        expect($booking->commission_amount)->toBe('2000.00');
    });
});

describe('Commission Calculation with Different Currencies', function () {
    test('calculates commission in THB correctly', function () {
        $booking = Booking::factory()->create([
            'amount' => 35500.00,
            'commission_rate' => 15.00,
            'commission_structure' => 'percentage',
            'currency' => 'THB',
        ]);

        expect($booking->commission_amount)->toBe('5325.00');
        expect($booking->currency)->toBe('THB');
    });

    test('calculates commission in USD correctly', function () {
        $booking = Booking::factory()->create([
            'amount' => 1000.00,
            'commission_rate' => 15.00,
            'commission_structure' => 'percentage',
            'currency' => 'USD',
        ]);

        expect($booking->commission_amount)->toBe('150.00');
        expect($booking->currency)->toBe('USD');
    });
});

describe('Edge Cases and Validation', function () {
    test('handles zero amount correctly', function () {
        $amount = 0.00;
        $rate = 15.00;

        $commission = Booking::calculateCommissionAmount($amount, $rate, 'percentage');

        expect($commission)->toBe(0.00);
    });

    test('handles amounts with many decimal places', function () {
        $amount = 1234.5678;
        $rate = 15.00;

        $commission = Booking::calculateCommissionAmount($amount, $rate, 'percentage');

        // 1234.5678 * 15 / 100 = 185.185170, rounds to 185.19
        expect($commission)->toBe(185.19);
    });

    test('commission calculation is consistent across multiple calls', function () {
        $amount = 12345.67;
        $rate = 15.50;

        $commission1 = Booking::calculateCommissionAmount($amount, $rate, 'percentage');
        $commission2 = Booking::calculateCommissionAmount($amount, $rate, 'percentage');
        $commission3 = Booking::calculateCommissionAmount($amount, $rate, 'percentage');

        expect($commission1)->toBe($commission2);
        expect($commission2)->toBe($commission3);
    });
});

describe('Real-world Scenarios', function () {
    test('calculates commission for typical day tour booking', function () {
        // Typical day tour in Thailand: 3,500 THB, 15% commission
        $booking = Booking::factory()->create([
            'amount' => 3500.00,
            'commission_rate' => 15.00,
            'commission_structure' => 'percentage',
            'currency' => 'THB',
        ]);

        expect($booking->commission_amount)->toBe('525.00');
    });

    test('calculates commission for luxury package booking', function () {
        // Luxury 7-day package: 125,000 THB, 18% commission
        $booking = Booking::factory()->create([
            'amount' => 125000.00,
            'commission_rate' => 18.00,
            'commission_structure' => 'percentage',
            'currency' => 'THB',
        ]);

        expect($booking->commission_amount)->toBe('22500.00');
    });

    test('calculates commission for activity booking with odd pricing', function () {
        // Activity booking: 1,299 THB, 12.5% commission
        $booking = Booking::factory()->create([
            'amount' => 1299.00,
            'commission_rate' => 12.5,
            'commission_structure' => 'percentage',
            'currency' => 'THB',
        ]);

        expect($booking->commission_amount)->toBe('162.38');
    });
});
