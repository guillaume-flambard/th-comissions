<?php

use App\Models\Partner;
use App\Models\PartnerTier;
use App\Models\Referral;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed partner tiers once per test
    $this->seed(\Database\Seeders\PartnerTierSeeder::class);

    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

test('dashboard loads successfully for authenticated user', function () {
    $response = $this->get(route('dashboard'));

    $response->assertStatus(200);
});

test('dashboard redirects unauthenticated users to login', function () {
    auth()->logout();

    $response = $this->get(route('dashboard'));

    $response->assertRedirect(route('login'));
});

test('dashboard shows correct commission statistics', function () {
    // Create partners for this user
    $partner1 = Partner::factory()->create(['user_id' => $this->user->id]);
    $partner2 = Partner::factory()->create(['user_id' => $this->user->id]);

    // Create paid referrals from this month (commissions earned)
    Referral::factory()->create([
        'referring_partner_id' => $partner1->id,
        'receiving_partner_id' => $partner2->id,
        'user_id' => $this->user->id,
        'status' => 'paid',
        'service_amount' => 10000,
        'commission_rate' => 10,
        'commission_amount' => 1000,
        'paid_at' => now(),
    ]);

    Referral::factory()->create([
        'referring_partner_id' => $partner1->id,
        'receiving_partner_id' => $partner2->id,
        'user_id' => $this->user->id,
        'status' => 'paid',
        'service_amount' => 5000,
        'commission_rate' => 10,
        'commission_amount' => 500,
        'paid_at' => now(),
    ]);

    $response = $this->get(route('dashboard'));

    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->has('stats')
        ->where('stats.commissionsEarned.value', 1500)
    );
});

test('dashboard shows active partners count', function () {
    // Create 3 active partners and 1 inactive
    Partner::factory()->count(3)->create([
        'user_id' => $this->user->id,
        'is_active' => true,
    ]);

    Partner::factory()->create([
        'user_id' => $this->user->id,
        'is_active' => false,
    ]);

    $response = $this->get(route('dashboard'));

    $response->assertInertia(fn ($page) => $page
        ->where('stats.activePartners.value', 3)
    );
});

test('dashboard shows pending referrals count', function () {
    $partner = Partner::factory()->create(['user_id' => $this->user->id]);

    // Create 5 pending referrals
    Referral::factory()->count(5)->create([
        'referring_partner_id' => $partner->id,
        'receiving_partner_id' => $partner->id,
        'user_id' => $this->user->id,
        'status' => 'pending',
    ]);

    // Create 3 paid referrals (shouldn't be counted)
    Referral::factory()->count(3)->create([
        'referring_partner_id' => $partner->id,
        'receiving_partner_id' => $partner->id,
        'user_id' => $this->user->id,
        'status' => 'paid',
        'paid_at' => now(),
    ]);

    $response = $this->get(route('dashboard'));

    $response->assertInertia(fn ($page) => $page
        ->where('stats.pendingReferrals.value', 5)
    );
});

test('dashboard shows top 5 partners by PLV', function () {
    // Create 7 partners with different PLV values
    Partner::factory()->create([
        'user_id' => $this->user->id,
        'business_name' => 'Top Partner',
        'calculated_plv' => 100000,
        'is_active' => true,
    ]);

    Partner::factory()->count(6)->create([
        'user_id' => $this->user->id,
        'is_active' => true,
    ]);

    $response = $this->get(route('dashboard'));

    $response->assertInertia(fn ($page) => $page
        ->has('topPartners', 5) // Should only show top 5
        ->where('topPartners.0.business_name', 'Top Partner') // Highest PLV first
    );
});

test('dashboard shows recent referrals', function () {
    $partner = Partner::factory()->create(['user_id' => $this->user->id]);

    // Create 15 referrals
    Referral::factory()->count(15)->create([
        'referring_partner_id' => $partner->id,
        'receiving_partner_id' => $partner->id,
        'user_id' => $this->user->id,
    ]);

    $response = $this->get(route('dashboard'));

    $response->assertInertia(fn ($page) => $page
        ->has('recentReferrals', 10) // Should only show 10 most recent
    );
});

test('dashboard only shows data for authenticated user', function () {
    // Create another user with their own data
    $otherUser = User::factory()->create();
    $otherPartner = Partner::factory()->create(['user_id' => $otherUser->id]);
    Referral::factory()->count(5)->create([
        'referring_partner_id' => $otherPartner->id,
        'receiving_partner_id' => $otherPartner->id,
        'user_id' => $otherUser->id,
    ]);

    // Current user has no data
    $response = $this->get(route('dashboard'));

    $response->assertInertia(fn ($page) => $page
        ->where('stats.commissionsEarned.value', 0)
        ->where('stats.commissionsOwed.value', 0)
        ->where('stats.activePartners.value', 0)
        ->where('stats.pendingReferrals.value', 0)
        ->has('topPartners', 0)
        ->has('recentReferrals', 0)
    );
});

test('dashboard calculates month-over-month trend correctly', function () {
    $partner = Partner::factory()->create(['user_id' => $this->user->id]);

    // Last month: 1000 THB
    Referral::factory()->create([
        'referring_partner_id' => $partner->id,
        'receiving_partner_id' => $partner->id,
        'user_id' => $this->user->id,
        'status' => 'paid',
        'commission_amount' => 1000,
        'paid_at' => now()->subMonth(),
    ]);

    // This month: 1500 THB (50% increase)
    Referral::factory()->create([
        'referring_partner_id' => $partner->id,
        'receiving_partner_id' => $partner->id,
        'user_id' => $this->user->id,
        'status' => 'paid',
        'commission_amount' => 1500,
        'paid_at' => now(),
    ]);

    $response = $this->get(route('dashboard'));

    $response->assertInertia(fn ($page) => $page
        ->where('stats.commissionsEarned.value', 1500)
        ->where('stats.commissionsEarned.trend', 50)
        ->where('stats.commissionsEarned.isPositive', true)
    );
});

test('dashboard stats API returns JSON', function () {
    $partner = Partner::factory()->create(['user_id' => $this->user->id]);

    Referral::factory()->create([
        'referring_partner_id' => $partner->id,
        'receiving_partner_id' => $partner->id,
        'user_id' => $this->user->id,
        'status' => 'paid',
        'commission_amount' => 2500,
        'paid_at' => now(),
    ]);

    $response = $this->get(route('dashboard.stats'));

    $response->assertStatus(200)
        ->assertJson([
            'commissionsEarned' => 2500.0,
            'activePartners' => 1,
            'pendingReferrals' => 0,
        ]);
});
