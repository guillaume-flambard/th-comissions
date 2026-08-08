<?php

namespace Database\Seeders;

use App\Models\Partner;
use App\Models\Referral;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ReferralSeeder extends Seeder
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

        if ($partners->count() < 2) {
            $this->command->error('Not enough partners found. Please run PartnerSeeder first.');
            return;
        }

        // Realistic customer names (mix of Thai and Western)
        $customerNames = [
            'John Smith', 'Sarah Johnson', 'Mike Davis', 'Emma Wilson',
            'ศุภชัย นาคทอง', 'นิภา สุขสวัสดิ์', 'อนุชา มั่นคง', 'วราภรณ์ แสงสว่าง',
            'David Chen', 'Lisa Wang', 'Alex Brown', 'Maria Garcia',
            'สมชาย วงศ์ใหญ่', 'สมหญิง บุญมี', 'ธนพล เจริญสุข', 'พิมพ์ชนก ดีงาม',
            'Tom Anderson', 'Kate Miller', 'James Taylor', 'Sophie Martin'
        ];

        $serviceTypes = ['diving', 'kite_lesson', 'transfer', 'tour', 'accommodation'];

        $statuses = [
            ['status' => 'paid', 'weight' => 40],      // 40% paid
            ['status' => 'validated', 'weight' => 25], // 25% validated
            ['status' => 'pending', 'weight' => 30],   // 30% pending
            ['status' => 'disputed', 'weight' => 3],   // 3% disputed
            ['status' => 'cancelled', 'weight' => 2],  // 2% cancelled
        ];

        $referrals = [];
        $totalReferrals = 150; // Create 150 referrals

        for ($i = 0; $i < $totalReferrals; $i++) {
            // Pick two different partners
            $referring = $partners->random();
            $receiving = $partners->where('id', '!=', $referring->id)->random();

            // Weighted random status
            $rand = rand(1, 100);
            $currentWeight = 0;
            $selectedStatus = 'pending';

            foreach ($statuses as $statusData) {
                $currentWeight += $statusData['weight'];
                if ($rand <= $currentWeight) {
                    $selectedStatus = $statusData['status'];
                    break;
                }
            }

            $serviceType = $serviceTypes[array_rand($serviceTypes)];

            // Service amount based on type
            $serviceAmount = match ($serviceType) {
                'diving' => rand(3000, 12000),
                'kite_lesson' => rand(5000, 15000),
                'accommodation' => rand(800, 3500),
                'transfer' => rand(400, 1500),
                'tour' => rand(1500, 8000),
            };

            // Commission rate from referring partner
            $commissionRate = $referring->default_commission_rate;
            $commissionType = $referring->commission_structure === 'fixed' ? 'fixed' : 'percentage';

            $commissionAmount = $commissionType === 'fixed'
                ? $referring->fixed_commission_amount
                : ($serviceAmount * $commissionRate) / 100;

            // Date spread over last 3 months
            $daysAgo = rand(1, 90);
            $bookingDate = now()->subDays($daysAgo);

            // Service date is usually a few days after booking
            $serviceDate = $bookingDate->copy()->addDays(rand(1, 14));

            // Paid referrals have paid_at timestamp
            $paidAt = null;
            $validatedAt = null;
            $paymentReference = null;

            if ($selectedStatus === 'paid') {
                $validatedAt = $bookingDate->copy()->addDays(rand(1, 3));
                $paidAt = $validatedAt->copy()->addDays(rand(1, 7));
                $paymentReference = 'PAY-' . strtoupper(Str::random(8));
            } elseif ($selectedStatus === 'validated') {
                $validatedAt = $bookingDate->copy()->addDays(rand(1, 5));
            }

            $referrals[] = [
                'id' => (string) Str::uuid(),
                'tracking_link_id' => null, // Will be added when we create tracking links
                'referring_partner_id' => $referring->id,
                'receiving_partner_id' => $receiving->id,
                'user_id' => $user->id,
                'customer_name' => $customerNames[array_rand($customerNames)],
                'customer_email' => Str::slug($customerNames[array_rand($customerNames)]) . '@example.com',
                'customer_phone' => '+66 ' . rand(80, 99) . ' ' . rand(100, 999) . ' ' . rand(1000, 9999),
                'service_type' => $serviceType,
                'service_description' => $this->getServiceDescription($serviceType),
                'booking_date' => $bookingDate,
                'service_date' => $serviceDate,
                'service_amount' => $serviceAmount,
                'commission_rate' => $commissionRate,
                'commission_amount' => round($commissionAmount, 2),
                'commission_type' => $commissionType,
                'status' => $selectedStatus,
                'pms_booking_id' => rand(0, 1) ? 'BK' . rand(10000, 99999) : null,
                'notes' => rand(0, 1) ? $this->getNotes($selectedStatus) : null,
                'validated_at' => $validatedAt,
                'paid_at' => $paidAt,
                'payment_reference' => $paymentReference,
                'created_at' => $bookingDate,
                'updated_at' => $paidAt ?? $validatedAt ?? $bookingDate,
            ];
        }

        // Insert all referrals
        foreach (array_chunk($referrals, 50) as $chunk) {
            Referral::insert($chunk);
        }

        $this->command->info('Created ' . count($referrals) . ' referrals with realistic data!');
        $this->command->info('Status breakdown:');
        $this->command->info('  - Paid: ~40%');
        $this->command->info('  - Validated: ~25%');
        $this->command->info('  - Pending: ~30%');
        $this->command->info('  - Disputed: ~3%');
        $this->command->info('  - Cancelled: ~2%');
    }

    private function getServiceDescription(string $serviceType): string
    {
        return match ($serviceType) {
            'diving' => 'PADI Open Water Diver Course + Fun Dives',
            'kite_lesson' => 'Beginner Kitesurfing Course (3 days)',
            'accommodation' => 'Deluxe Sea View Room (3 nights)',
            'transfer' => 'Airport to Hotel Transfer (Private Van)',
            'tour' => 'Koh Nang Yuan Snorkeling Day Trip',
        };
    }

    private function getNotes(string $status): ?string
    {
        return match ($status) {
            'paid' => 'Commission paid via PromptPay',
            'validated' => 'Service completed, pending payment',
            'pending' => 'Awaiting service completion',
            'disputed' => 'Customer requested refund',
            'cancelled' => 'Customer no-show',
            default => null,
        };
    }
}
