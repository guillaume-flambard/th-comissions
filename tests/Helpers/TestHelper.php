<?php

namespace Tests\Helpers;

use App\Models\Partner;
use App\Models\Referral;
use App\Models\TrackingLink;
use App\Models\User;

/**
 * Test helper class for common test operations
 */
class TestHelper
{
    /**
     * Create a complete user with partners and referrals
     */
    public static function createUserWithData(array $userData = [], int $partnerCount = 2, int $referralCount = 5): array
    {
        $user = User::factory()->create($userData);

        $partners = Partner::factory()
            ->count($partnerCount)
            ->create(['user_id' => $user->id]);

        $referrals = [];
        foreach ($partners as $partner) {
            $referrals = array_merge(
                $referrals,
                Referral::factory()
                    ->count($referralCount)
                    ->create([
                        'user_id' => $user->id,
                        'referring_partner_id' => $partner->id,
                        'receiving_partner_id' => $partners->random()->id,
                    ])
                    ->all()
            );
        }

        return [
            'user' => $user,
            'partners' => $partners,
            'referrals' => collect($referrals),
        ];
    }

    /**
     * Create a partner with tracking links
     */
    public static function createPartnerWithTracking(User $user, int $trackingLinkCount = 3): array
    {
        $partner = Partner::factory()->create(['user_id' => $user->id]);

        $trackingLinks = TrackingLink::factory()
            ->count($trackingLinkCount)
            ->create([
                'partner_id' => $partner->id,
                'user_id' => $user->id,
            ]);

        return [
            'partner' => $partner,
            'trackingLinks' => $trackingLinks,
        ];
    }

    /**
     * Create referrals with specific statuses
     */
    public static function createReferralsWithStatuses(User $user, Partner $referring, Partner $receiving, array $statuses): array
    {
        $referrals = [];

        foreach ($statuses as $status) {
            $data = [
                'user_id' => $user->id,
                'referring_partner_id' => $referring->id,
                'receiving_partner_id' => $receiving->id,
                'status' => $status,
            ];

            // Add paid_at for paid referrals
            if ($status === 'paid') {
                $data['paid_at'] = now();
            }

            $referrals[] = Referral::factory()->create($data);
        }

        return $referrals;
    }

    /**
     * Calculate expected commission amount
     */
    public static function calculateCommission(float $amount, float $rate): float
    {
        return round($amount * ($rate / 100), 2);
    }

    /**
     * Generate test referral data
     */
    public static function referralData(array $overrides = []): array
    {
        return array_merge([
            'customer_name' => 'Test Customer',
            'customer_email' => 'test@example.com',
            'customer_phone' => '+66 98 765 4321',
            'service_type' => 'diving',
            'service_amount' => 10000,
            'commission_rate' => 15,
            'booking_date' => now()->format('Y-m-d'),
            'notes' => 'Test referral',
        ], $overrides);
    }

    /**
     * Generate test partner data
     */
    public static function partnerData(array $overrides = []): array
    {
        return array_merge([
            'business_name' => 'Test Partner',
            'business_type' => 'dive_shop',
            'contact_person' => 'Test Contact',
            'email' => 'partner@example.com',
            'phone' => '+66 98 765 4321',
            'default_commission_rate' => 15,
            'is_active' => true,
        ], $overrides);
    }

    /**
     * Assert referral has correct commission calculation
     */
    public static function assertReferralCommission(Referral $referral): void
    {
        $expected = self::calculateCommission(
            $referral->service_amount,
            $referral->commission_rate
        );

        \PHPUnit\Framework\Assert::assertEquals(
            $expected,
            $referral->commission_amount,
            "Commission calculation mismatch. Expected: {$expected}, Got: {$referral->commission_amount}"
        );
    }

    /**
     * Create tracking link with clicks
     */
    public static function createTrackingLinkWithClicks(Partner $partner, User $user, int $clicks = 10): TrackingLink
    {
        $trackingLink = TrackingLink::factory()->create([
            'partner_id' => $partner->id,
            'user_id' => $user->id,
            'clicks' => 0,
        ]);

        // Simulate clicks
        for ($i = 0; $i < $clicks; $i++) {
            $trackingLink->recordClick();
        }

        return $trackingLink->fresh();
    }

    /**
     * Get all available referral statuses
     */
    public static function getReferralStatuses(): array
    {
        return ['pending', 'validated', 'paid', 'disputed', 'cancelled'];
    }

    /**
     * Get all available business types
     */
    public static function getBusinessTypes(): array
    {
        return ['dive_shop', 'hotel', 'hostel', 'tour_operator', 'restaurant', 'other'];
    }

    /**
     * Get all available service types
     */
    public static function getServiceTypes(): array
    {
        return ['diving', 'accommodation', 'tour', 'rental', 'other'];
    }

    /**
     * Create referrals with revenue for PLV calculation
     */
    public static function createReferralsForPLV(Partner $partner, User $user, float $totalRevenue): void
    {
        $referralCount = 5;
        $amountPerReferral = $totalRevenue / $referralCount;

        for ($i = 0; $i < $referralCount; $i++) {
            Referral::factory()->create([
                'user_id' => $user->id,
                'referring_partner_id' => $partner->id,
                'receiving_partner_id' => $partner->id,
                'service_amount' => $amountPerReferral,
                'commission_rate' => 15,
                'status' => 'paid',
                'paid_at' => now(),
            ]);
        }

        // Update partner PLV
        $partner->update([
            'calculated_plv' => $totalRevenue,
        ]);
    }

    /**
     * Seed partner tiers if not exists
     */
    public static function seedPartnerTiers(): void
    {
        if (\App\Models\PartnerTier::count() === 0) {
            (new \Database\Seeders\PartnerTierSeeder())->run();
        }
    }

    /**
     * Create monthly referrals for trend analysis
     */
    public static function createMonthlyReferrals(User $user, Partner $partner, int $months = 6): void
    {
        for ($i = $months; $i > 0; $i--) {
            $date = now()->subMonths($i);
            $count = rand(5, 15);

            for ($j = 0; $j < $count; $j++) {
                Referral::factory()->create([
                    'user_id' => $user->id,
                    'referring_partner_id' => $partner->id,
                    'receiving_partner_id' => $partner->id,
                    'status' => 'paid',
                    'paid_at' => $date,
                    'created_at' => $date,
                ]);
            }
        }
    }

    /**
     * Assert database has referral with commission
     */
    public static function assertDatabaseHasReferralWithCommission(
        string $customerName,
        float $serviceAmount,
        float $commissionRate
    ): void {
        $expectedCommission = self::calculateCommission($serviceAmount, $commissionRate);

        \Illuminate\Support\Facades\DB::table('referrals')
            ->where('customer_name', $customerName)
            ->where('service_amount', $serviceAmount)
            ->where('commission_rate', $commissionRate)
            ->where('commission_amount', $expectedCommission)
            ->exists();
    }

    /**
     * Clear all test data
     */
    public static function clearTestData(): void
    {
        Referral::query()->delete();
        TrackingLink::query()->delete();
        Partner::query()->delete();
        User::where('email', 'like', '%@example.com')->delete();
    }
}
