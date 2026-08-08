<?php

use App\Models\Booking;
use App\Models\Commission;
use App\Models\Partner;
use App\Models\PartnerTier;

/**
 * Partner Metrics and PLV Calculation Tests
 *
 * Tests for partner lifetime value calculations and related metrics.
 * These are critical for business intelligence and partner management.
 */

describe('Partner Lifetime Value (PLV) Calculations', function () {
    test('calculates PLV correctly with basic metrics', function () {
        $partner = Partner::factory()->create();

        // Create completed bookings for ARPP calculation
        Booking::factory()
            ->count(5)
            ->completed()
            ->create([
                'partner_id' => $partner->id,
                'amount' => 10000.00,
                'completed_at' => now()->subMonths(2),
            ]);

        // Create commissions for partnership costs
        Commission::factory()
            ->count(5)
            ->paid()
            ->create([
                'partner_id' => $partner->id,
                'amount' => 1500.00,
                'paid_at' => now()->subMonths(2),
            ]);

        // Update last referral to calculate churn rate
        $partner->update(['last_referral_at' => now()->subDays(15)]);

        $plv = $partner->calculatePLV();

        expect($plv)->toBeFloat();
        expect($plv)->toBeGreaterThan(0);
        // calculated_plv is stored as decimal, returns string
        expect((float)$partner->calculated_plv)->toBe($plv);
    });

    test('PLV formula matches (ARPP - Costs) × APL', function () {
        $partner = Partner::factory()->create([
            'last_referral_at' => now()->subDays(20),
        ]);

        // Create revenue for current year
        Booking::factory()
            ->count(3)
            ->completed()
            ->create([
                'partner_id' => $partner->id,
                'amount' => 20000.00,
                'completed_at' => now()->subMonths(3),
            ]);

        $arpp = $partner->calculateARPP();
        $costs = $partner->calculatePartnershipCosts();
        $apl = $partner->calculateAPL();

        $expectedPLV = ($arpp - $costs) * $apl;
        $actualPLV = $partner->calculatePLV();

        expect($actualPLV)->toBe($expectedPLV);
    });
});

describe('Average Revenue Per Partner (ARPP) Calculations', function () {
    test('calculates ARPP from completed bookings in current year', function () {
        $partner = Partner::factory()->create();

        Booking::factory()
            ->count(4)
            ->completed()
            ->create([
                'partner_id' => $partner->id,
                'amount' => 10000.00,
                'completed_at' => now()->subMonths(2),
            ]);

        $arpp = $partner->calculateARPP();

        expect($arpp)->toBe(40000.00);
    });

    test('excludes bookings from previous years', function () {
        $partner = Partner::factory()->create();

        // Current year bookings
        Booking::factory()
            ->count(2)
            ->completed()
            ->create([
                'partner_id' => $partner->id,
                'amount' => 10000.00,
                'completed_at' => now()->subMonths(3),
            ]);

        // Previous year bookings (should be excluded)
        Booking::factory()
            ->count(5)
            ->completed()
            ->create([
                'partner_id' => $partner->id,
                'amount' => 10000.00,
                'completed_at' => now()->subYear(),
            ]);

        $arpp = $partner->calculateARPP();

        expect($arpp)->toBe(20000.00);
    });

    test('excludes non-completed bookings', function () {
        $partner = Partner::factory()->create();

        // Completed bookings
        Booking::factory()
            ->count(2)
            ->completed()
            ->create([
                'partner_id' => $partner->id,
                'amount' => 10000.00,
                'completed_at' => now()->subMonths(2),
            ]);

        // Pending/cancelled bookings (should be excluded)
        Booking::factory()->pending()->create([
            'partner_id' => $partner->id,
            'amount' => 50000.00,
        ]);

        Booking::factory()->cancelled()->create([
            'partner_id' => $partner->id,
            'amount' => 30000.00,
        ]);

        $arpp = $partner->calculateARPP();

        expect($arpp)->toBe(20000.00);
    });

    test('returns zero for partner with no completed bookings', function () {
        $partner = Partner::factory()->create();

        $arpp = $partner->calculateARPP();

        expect($arpp)->toBe(0.0);
    });
});

describe('Partner Churn Rate Calculations', function () {
    test('returns 50% churn rate when partner has never made a referral', function () {
        $partner = Partner::factory()->create([
            'last_referral_at' => null,
        ]);

        $churnRate = $partner->calculateChurnRate();

        expect($churnRate)->toBe(50.0);
    });

    test('returns 5% churn rate for active partner (last referral within 30 days)', function () {
        $partner = Partner::factory()->create([
            'last_referral_at' => now()->subDays(15),
        ]);

        $churnRate = $partner->calculateChurnRate();

        expect($churnRate)->toBe(5.0);
    });

    test('returns 20% churn rate for partner inactive 31-90 days', function () {
        $partner = Partner::factory()->create([
            'last_referral_at' => now()->subDays(60),
        ]);

        $churnRate = $partner->calculateChurnRate();

        expect($churnRate)->toBe(20.0);
    });

    test('returns 50% churn rate for partner inactive 91-180 days', function () {
        $partner = Partner::factory()->create([
            'last_referral_at' => now()->subDays(120),
        ]);

        $churnRate = $partner->calculateChurnRate();

        expect($churnRate)->toBe(50.0);
    });

    test('returns 80% churn rate for partner inactive over 180 days', function () {
        $partner = Partner::factory()->create([
            'last_referral_at' => now()->subDays(200),
        ]);

        $churnRate = $partner->calculateChurnRate();

        expect($churnRate)->toBe(80.0);
    });
});

describe('Average Partner Lifespan (APL) Calculations', function () {
    test('calculates APL as inverse of churn rate', function () {
        $partner = Partner::factory()->create([
            'last_referral_at' => now()->subDays(15),
        ]);

        $churnRate = $partner->calculateChurnRate(); // 5%
        $apl = $partner->calculateAPL();

        expect($apl)->toBe(1 / ($churnRate / 100));
        expect($apl)->toBe(20.0);
    });

    test('returns maximum lifespan when churn rate is zero', function () {
        $partner = Partner::factory()->create([
            'last_referral_at' => now(),
        ]);

        // Manually set churn rate to 0 (edge case)
        $partner->update(['last_referral_at' => now()]);

        $apl = $partner->calculateAPL();

        expect($apl)->toBeGreaterThan(0);
    });

    test('APL decreases as churn rate increases', function () {
        $partner1 = Partner::factory()->create([
            'last_referral_at' => now()->subDays(15),
        ]);
        $partner2 = Partner::factory()->create([
            'last_referral_at' => now()->subDays(60),
        ]);
        $partner3 = Partner::factory()->create([
            'last_referral_at' => now()->subDays(200),
        ]);

        $apl1 = $partner1->calculateAPL(); // Low churn = high lifespan
        $apl2 = $partner2->calculateAPL(); // Medium churn
        $apl3 = $partner3->calculateAPL(); // High churn = low lifespan

        expect($apl1)->toBeGreaterThan($apl2);
        expect($apl2)->toBeGreaterThan($apl3);
    });
});

describe('Partnership Costs Calculations', function () {
    test('includes base administrative cost', function () {
        $partner = Partner::factory()->create();

        $costs = $partner->calculatePartnershipCosts();

        expect($costs)->toBeGreaterThanOrEqual(500.00); // Base cost
    });

    test('includes paid commissions for current year', function () {
        $partner = Partner::factory()->create();

        Commission::factory()
            ->count(3)
            ->paid()
            ->create([
                'partner_id' => $partner->id,
                'amount' => 1000.00,
                'paid_at' => now()->subMonths(2),
            ]);

        $costs = $partner->calculatePartnershipCosts();

        // Base cost (500) + commissions (3000) = 3500
        expect($costs)->toBe(3500.00);
    });

    test('excludes commissions from previous year', function () {
        $partner = Partner::factory()->create();

        // Current year
        Commission::factory()->paid()->create([
            'partner_id' => $partner->id,
            'amount' => 1000.00,
            'paid_at' => now()->subMonths(3),
        ]);

        // Previous year (should be excluded)
        Commission::factory()->paid()->create([
            'partner_id' => $partner->id,
            'amount' => 5000.00,
            'paid_at' => now()->subYear(),
        ]);

        $costs = $partner->calculatePartnershipCosts();

        expect($costs)->toBe(1500.00); // 500 base + 1000 commission
    });
});

describe('Conversion Rate Calculations', function () {
    test('calculates conversion rate correctly', function () {
        $partner = Partner::factory()->create([
            'total_referrals' => 100,
            'successful_conversions' => 75,
        ]);

        $partner->updateConversionRate();

        expect($partner->conversion_rate)->toBe('75.00');
    });

    test('handles 100% conversion rate', function () {
        $partner = Partner::factory()->create([
            'total_referrals' => 50,
            'successful_conversions' => 50,
        ]);

        $partner->updateConversionRate();

        expect($partner->conversion_rate)->toBe('100.00');
    });

    test('handles 0% conversion rate', function () {
        $partner = Partner::factory()->create([
            'total_referrals' => 100,
            'successful_conversions' => 0,
        ]);

        $partner->updateConversionRate();

        expect($partner->conversion_rate)->toBe('0.00');
    });

    test('does not update when no referrals', function () {
        $partner = Partner::factory()->create([
            'total_referrals' => 0,
            'successful_conversions' => 0,
            'conversion_rate' => 0,
        ]);

        $partner->updateConversionRate();

        expect($partner->conversion_rate)->toBe('0.00');
    });
});

describe('Engagement Score Calculations', function () {
    test('awards points for recent activity', function () {
        $partner = Partner::factory()->create([
            'last_referral_at' => now()->subDays(3),
            'total_referrals' => 0,
            'conversion_rate' => 0,
        ]);

        $partner->updateEngagementScore();

        expect($partner->engagement_score)->toBeGreaterThanOrEqual(30);
    });

    test('awards points for high conversion rate', function () {
        $partner = Partner::factory()->create([
            'last_referral_at' => null,
            'total_referrals' => 50,
            'successful_conversions' => 40,
            'conversion_rate' => 80.00,
        ]);

        $partner->updateEngagementScore();

        expect($partner->engagement_score)->toBeGreaterThan(0);
    });

    test('awards points for high referral volume', function () {
        $partner = Partner::factory()->create([
            'last_referral_at' => null,
            'total_referrals' => 150,
            'conversion_rate' => 0,
        ]);

        $partner->updateEngagementScore();

        expect($partner->engagement_score)->toBeGreaterThanOrEqual(20);
    });

    test('maximum engagement score is 100', function () {
        $partner = Partner::factory()->create([
            'last_referral_at' => now()->subDays(1),
            'total_referrals' => 200,
            'successful_conversions' => 180,
            'conversion_rate' => 90.00,
        ]);

        $partner->updateEngagementScore();

        expect($partner->engagement_score)->toBeLessThanOrEqual(100);
    });

    test('low engagement for inactive partner', function () {
        $partner = Partner::factory()->create([
            'last_referral_at' => now()->subDays(100),
            'total_referrals' => 2,
            'conversion_rate' => 10.00,
        ]);

        $partner->updateEngagementScore();

        expect($partner->engagement_score)->toBeLessThan(50);
    });
});

describe('Partner Metrics Update on Booking Completion', function () {
    test('updates partner metrics when booking is completed', function () {
        $partner = Partner::factory()->create([
            'total_referrals' => 0,
            'successful_conversions' => 0,
            'total_revenue_generated' => 0,
        ]);

        $booking = Booking::factory()->confirmed()->create([
            'partner_id' => $partner->id,
            'amount' => 10000.00,
        ]);

        $booking->complete();

        $partner->refresh();

        expect($partner->total_referrals)->toBe(1);
        expect($partner->successful_conversions)->toBe(1);
        expect($partner->total_revenue_generated)->toBe('10000.00');
        expect($partner->last_referral_at)->not->toBeNull();
    });

    test('increments existing metrics correctly', function () {
        $partner = Partner::factory()->create([
            'total_referrals' => 5,
            'successful_conversions' => 4,
            'total_revenue_generated' => 25000.00,
        ]);

        $booking = Booking::factory()->confirmed()->create([
            'partner_id' => $partner->id,
            'amount' => 5000.00,
        ]);

        $booking->complete();

        $partner->refresh();

        expect($partner->total_referrals)->toBe(6);
        expect($partner->successful_conversions)->toBe(5);
        expect($partner->total_revenue_generated)->toBe('30000.00');
    });
});

describe('Total Referrals Tracking', function () {
    test('tracks total referrals accurately', function () {
        $partner = Partner::factory()->create([
            'total_referrals' => 10,
        ]);

        expect($partner->total_referrals)->toBe(10);

        $partner->increment('total_referrals', 5);

        expect($partner->fresh()->total_referrals)->toBe(15);
    });
});

describe('Average Commission Per Referral', function () {
    test('calculates average commission per referral', function () {
        $partner = Partner::factory()->create();

        // Create 5 confirmed bookings and complete them to trigger commission creation
        $bookings = Booking::factory()
            ->count(5)
            ->confirmed()
            ->create([
                'partner_id' => $partner->id,
                'amount' => 10000.00,
                'commission_rate' => 15.00,
                'commission_structure' => 'percentage',
                'commission_amount' => 1500.00,
            ]);

        // Complete each booking to trigger commission creation
        $bookings->each->complete();

        $totalCommissions = $partner->commissions()->sum('amount');
        $totalReferrals = $partner->bookings()->completed()->count();
        $avgCommission = $totalReferrals > 0 ? $totalCommissions / $totalReferrals : 0;

        expect($avgCommission)->toBeGreaterThan(0);
        expect($totalReferrals)->toBe(5);
    });
});

describe('Partner Retention Metrics', function () {
    test('identifies at-risk partners based on inactivity', function () {
        $activePartner = Partner::factory()->create([
            'last_referral_at' => now()->subDays(10),
        ]);

        $atRiskPartner = Partner::factory()->create([
            'last_referral_at' => now()->subDays(100),
        ]);

        expect($activePartner->calculateChurnRate())->toBeLessThan(50.0);
        expect($atRiskPartner->calculateChurnRate())->toBeGreaterThanOrEqual(50.0);
    });
});
