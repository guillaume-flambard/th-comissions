<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PartnerTierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tiers = [
            [
                'name' => 'Gold',
                'slug' => 'gold',
                'description' => 'Top-performing partners with highest PLV, exceptional conversion rates, and consistent high-quality referrals.',
                'min_plv' => 50000.00,
                'commission_rate' => 15.00,
                'benefits' => [
                    'Premium 15% commission rate',
                    'Priority support',
                    'Dedicated account manager',
                    'Custom marketing materials',
                    'Early access to new features',
                    'Quarterly performance bonuses',
                ],
                'color' => '#FFD700',
                'priority' => 3,
            ],
            [
                'name' => 'Silver',
                'slug' => 'silver',
                'description' => 'Solid performers with good PLV and consistent referral activity.',
                'min_plv' => 15000.00,
                'commission_rate' => 12.00,
                'benefits' => [
                    'Enhanced 12% commission rate',
                    'Priority email support',
                    'Access to marketing templates',
                    'Monthly performance reports',
                    'Featured in partner directory',
                ],
                'color' => '#C0C0C0',
                'priority' => 2,
            ],
            [
                'name' => 'Bronze',
                'slug' => 'bronze',
                'description' => 'New or developing partners building their referral network.',
                'min_plv' => 0.00,
                'commission_rate' => 10.00,
                'benefits' => [
                    'Standard 10% commission rate',
                    'Email support',
                    'Access to basic marketing materials',
                    'Getting started guides',
                    'Partner community access',
                ],
                'color' => '#CD7F32',
                'priority' => 1,
            ],
        ];

        foreach ($tiers as $tier) {
            \App\Models\PartnerTier::create($tier);
        }
    }
}
