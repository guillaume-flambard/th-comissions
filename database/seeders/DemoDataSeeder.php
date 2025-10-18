<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get tiers
        $goldTier = \App\Models\PartnerTier::where('slug', 'gold')->first();
        $silverTier = \App\Models\PartnerTier::where('slug', 'silver')->first();
        $bronzeTier = \App\Models\PartnerTier::where('slug', 'bronze')->first();

        // Create realistic partners
        $partners = [
            [
                'business_name' => 'Phuket Beach Hostel',
                'business_type' => 'hostel',
                'contact_name' => 'Somchai Tanaka',
                'email' => 'info@phuketbeachhostel.com',
                'phone' => '+66 76 123 4567',
                'city' => 'Phuket',
                'default_commission_rate' => 12.00,
                'payment_currency' => 'THB',
                'is_active' => true,
                'joined_at' => now()->subMonths(6),
                'partner_tier_id' => $goldTier->id,
            ],
            [
                'business_name' => 'Dive Paradise Koh Tao',
                'business_type' => 'diving_shop',
                'contact_name' => 'Maria Santos',
                'email' => 'dive@paradisekotao.com',
                'phone' => '+66 77 456 7890',
                'city' => 'Koh Tao',
                'default_commission_rate' => 15.00,
                'payment_currency' => 'THB',
                'is_active' => true,
                'joined_at' => now()->subMonths(8),
                'partner_tier_id' => $goldTier->id,
            ],
            [
                'business_name' => 'Bangkok City Tours',
                'business_type' => 'tour_operator',
                'contact_name' => 'John Anderson',
                'email' => 'tours@bangkokcity.com',
                'phone' => '+66 2 123 4567',
                'city' => 'Bangkok',
                'default_commission_rate' => 10.00,
                'payment_currency' => 'THB',
                'is_active' => true,
                'joined_at' => now()->subMonths(4),
                'partner_tier_id' => $silverTier->id,
            ],
            [
                'business_name' => 'Chiang Mai Trekking Adventures',
                'business_type' => 'tour_operator',
                'contact_name' => 'Niran Patel',
                'email' => 'info@chiangmaitrek.com',
                'phone' => '+66 53 987 6543',
                'city' => 'Chiang Mai',
                'default_commission_rate' => 12.00,
                'payment_currency' => 'THB',
                'is_active' => true,
                'joined_at' => now()->subMonths(3),
                'partner_tier_id' => $silverTier->id,
            ],
            [
                'business_name' => 'Krabi Sunset Resort',
                'business_type' => 'hotel',
                'contact_name' => 'Anong Wijaya',
                'email' => 'reservations@krabisunset.com',
                'phone' => '+66 75 654 3210',
                'city' => 'Krabi',
                'default_commission_rate' => 10.00,
                'payment_currency' => 'THB',
                'is_active' => true,
                'joined_at' => now()->subMonths(2),
                'partner_tier_id' => $bronzeTier->id,
            ],
        ];

        foreach ($partners as $partnerData) {
            $partner = \App\Models\Partner::create($partnerData);

            // Create tracking links for each partner
            $trackingLink = \App\Models\TrackingLink::create([
                'partner_id' => $partner->id,
                'link_type' => 'general',
                'utm_medium' => 'qr_code',
                'target_url' => config('app.url'),
                'description' => 'Default QR code for ' . $partner->business_name,
            ]);

            // Generate QR code
            $qrService = app(\App\Services\QRCodeService::class);
            $qrPath = $qrService->generateForTrackingLink($trackingLink);
            $trackingLink->update(['qr_code_path' => $qrPath]);

            // Create bookings for partners (more for gold tier)
            $bookingCount = match($partner->partner_tier_id) {
                $goldTier->id => rand(30, 50),
                $silverTier->id => rand(15, 25),
                default => rand(5, 10),
            };

            for ($i = 0; $i < $bookingCount; $i++) {
                $daysAgo = rand(1, 180);
                $bookingDate = now()->subDays($daysAgo);

                $serviceTypes = ['diving', 'tour', 'accommodation', 'transport'];
                $serviceType = $serviceTypes[array_rand($serviceTypes)];

                $services = [
                    'diving' => ['Open Water Course', '2-Day Dive Package', 'Wreck Diving', 'Night Dive'],
                    'tour' => ['City Tour', 'Temple Tour', 'Food Tour', 'Island Hopping'],
                    'accommodation' => ['Standard Room', 'Deluxe Room', 'Dormitory Bed', 'Private Villa'],
                    'transport' => ['Airport Transfer', 'Private Car', 'Minivan', 'Boat Transfer'],
                ];

                $serviceName = $services[$serviceType][array_rand($services[$serviceType])];
                $amount = rand(500, 10000);
                $status = rand(1, 100) > 20 ? 'completed' : (rand(1, 100) > 50 ? 'confirmed' : 'pending');

                // Create booking with pending status first
                $booking = \App\Models\Booking::create([
                    'partner_id' => $partner->id,
                    'tracking_link_id' => $trackingLink->id,
                    'utm_source' => $partner->business_name,
                    'utm_medium' => 'qr_code',
                    'customer_name' => $this->generateCustomerName(),
                    'customer_email' => strtolower(str_replace(' ', '.', $this->generateCustomerName())) . '@example.com',
                    'customer_country' => $this->getRandomCountry(),
                    'booking_reference' => 'BK' . $bookingDate->format('Ymd') . strtoupper(\Illuminate\Support\Str::random(6)),
                    'service_type' => $serviceType,
                    'service_name' => $serviceName,
                    'booking_date' => $bookingDate,
                    'service_date' => $bookingDate->copy()->addDays(rand(1, 7)),
                    'quantity' => rand(1, 4),
                    'currency' => 'THB',
                    'amount' => $amount,
                    'commission_rate' => $partner->default_commission_rate,
                    'commission_structure' => 'percentage',
                    'status' => 'pending', // Start as pending
                ]);

                // Update status to trigger commission creation
                if ($status === 'completed') {
                    $booking->update([
                        'status' => 'completed',
                        'completed_at' => $bookingDate->copy()->addDays(rand(1, 7))
                    ]);
                } elseif ($status === 'confirmed') {
                    $booking->update(['status' => 'confirmed']);
                }
            }

            // Update partner metrics
            $completedBookings = $partner->bookings()->completed()->get();
            $totalReferrals = $partner->bookings()->count();
            $successfulConversions = $completedBookings->count();

            $partner->update([
                'total_referrals' => $totalReferrals,
                'successful_conversions' => $successfulConversions,
                'conversion_rate' => $totalReferrals > 0 ? ($successfulConversions / $totalReferrals) * 100 : 0,
                'total_revenue_generated' => $completedBookings->sum('amount'),
                'last_referral_at' => $partner->bookings()->latest()->first()->created_at ?? now(),
            ]);

            // Calculate PLV
            $partner->calculatePLV();
            $partner->updateEngagementScore();

            // Simulate some clicks on tracking link
            $trackingLink->update([
                'clicks' => rand(100, 500),
                'conversions' => $successfulConversions,
                'last_clicked_at' => now()->subDays(rand(1, 30)),
            ]);
            $trackingLink->updateConversionRate();
        }

        $this->command->info('Created ' . count($partners) . ' partners with bookings and commissions!');
    }

    private function generateCustomerName(): string
    {
        $firstNames = ['John', 'Maria', 'David', 'Sarah', 'Michael', 'Emma', 'James', 'Sophie', 'Daniel', 'Lisa'];
        $lastNames = ['Smith', 'Johnson', 'Brown', 'Taylor', 'Anderson', 'White', 'Martin', 'Garcia', 'Lee', 'Wang'];

        return $firstNames[array_rand($firstNames)] . ' ' . $lastNames[array_rand($lastNames)];
    }

    private function getRandomCountry(): string
    {
        $countries = ['US', 'GB', 'AU', 'DE', 'FR', 'CN', 'JP', 'KR', 'SG', 'MY'];
        return $countries[array_rand($countries)];
    }
}
