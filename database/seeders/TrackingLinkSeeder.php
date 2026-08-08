<?php

namespace Database\Seeders;

use App\Models\Partner;
use App\Models\TrackingLink;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TrackingLinkSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::where('email', 'demo@trackly.io')->first();

        if (!$user) {
            $this->command->error('Demo user not found. Please run PartnerSeeder first.');
            return;
        }

        $partners = Partner::where('user_id', $user->id)->get();

        if ($partners->isEmpty()) {
            $this->command->error('No partners found. Please run PartnerSeeder first.');
            return;
        }

        $campaigns = [
            'summer-2025',
            'koh-tao-diving',
            'kite-school-promo',
            'accommodation-deals',
            'island-tours',
            'transfer-service',
            'group-bookings',
            'social-media',
            'email-campaign',
            'website-banner',
        ];

        $trackingLinks = [];

        foreach ($partners as $partner) {
            // Create 2-3 tracking links per partner
            $numberOfLinks = rand(2, 3);

            for ($i = 0; $i < $numberOfLinks; $i++) {
                $campaign = $campaigns[array_rand($campaigns)];
                $uniqueCode = Str::slug($partner->business_name) . '-' . $campaign . '-' . Str::random(4);

                // Generate clicks (random between 0 and 100)
                $clicks = rand(0, 100);
                $conversions = $clicks > 0 ? rand(0, (int)($clicks * 0.3)) : 0;
                $conversionRate = $clicks > 0 ? ($conversions / $clicks) * 100 : 0;
                $totalRevenue = $conversions * rand(1000, 5000);
                $lastClickedAt = $clicks > 0 ? now()->subDays(rand(1, 30)) : null;

                $trackingLinks[] = [
                    'partner_id' => $partner->id,
                    'user_id' => $user->id,
                    'unique_code' => Str::lower($uniqueCode),
                    'utm_source' => $partner->business_name,
                    'utm_medium' => 'referral',
                    'utm_campaign' => $campaign,
                    'utm_content' => null,
                    'link_type' => 'general',
                    'target_url' => env('APP_URL', 'http://localhost:8000'),
                    'description' => ucfirst(str_replace('-', ' ', $campaign)) . ' campaign for ' . $partner->business_name,
                    'qr_code_path' => null, // QR codes will be generated when needed
                    'clicks' => $clicks,
                    'conversions' => $conversions,
                    'conversion_rate' => round($conversionRate, 2),
                    'total_revenue' => $totalRevenue,
                    'last_clicked_at' => $lastClickedAt,
                    'is_active' => true,
                    'expires_at' => null,
                    'created_at' => now()->subDays(rand(10, 60)),
                    'updated_at' => now(),
                ];
            }
        }

        // Insert all tracking links
        foreach (array_chunk($trackingLinks, 50) as $chunk) {
            TrackingLink::insert($chunk);
        }

        $this->command->info('Created ' . count($trackingLinks) . ' tracking links!');
        $this->command->info('Average: ' . round(count($trackingLinks) / $partners->count(), 1) . ' links per partner');
    }
}
