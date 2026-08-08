<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('Starting database seeding...');

        // 1. Create partner tiers (Bronze, Silver, Gold)
        $this->command->info('Seeding partner tiers...');
        $this->call(PartnerTierSeeder::class);

        // 2. Create demo user and partners
        $this->command->info('Seeding partners...');
        $this->call(PartnerSeeder::class);

        // 3. Create tracking links for partners
        $this->command->info('Seeding tracking links...');
        $this->call(TrackingLinkSeeder::class);

        // 4. Create referrals with various statuses
        $this->command->info('Seeding referrals...');
        $this->call(ReferralSeeder::class);

        $this->command->info('');
        $this->command->info('✅ Database seeding completed successfully!');
        $this->command->info('');
        $this->command->info('Demo Account:');
        $this->command->info('  Email: demo@trackly.io');
        $this->command->info('  Password: password');
        $this->command->info('');
        $this->command->info('Data Created:');
        $this->command->info('  - 8 Thai tourism partners');
        $this->command->info('  - ~20 tracking links with QR codes');
        $this->command->info('  - 150 referrals (various statuses)');
        $this->command->info('  - Realistic commission data');
        $this->command->info('');
    }
}
