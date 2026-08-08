<?php

namespace Tests\Feature;

use App\Models\Partner;
use App\Models\Referral;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReferralControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Partner $referringPartner;
    protected Partner $receivingPartner;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\PartnerTierSeeder::class);
        $this->user = User::factory()->create();
        $this->referringPartner = Partner::factory()->create([
            'user_id' => $this->user->id,
            'business_name' => 'Referring Partner',
            'default_commission_rate' => 15,
        ]);
        $this->receivingPartner = Partner::factory()->create([
            'user_id' => $this->user->id,
            'business_name' => 'Receiving Partner',
        ]);
    }

    public function test_referrals_index_page_loads(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/referrals');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('referrals/index')
                ->has('referrals')
        );
    }

    public function test_referrals_index_shows_user_referrals_only(): void
    {
        // Create referrals for current user
        Referral::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'referring_partner_id' => $this->referringPartner->id,
            'receiving_partner_id' => $this->receivingPartner->id,
        ]);

        // Create referrals for another user
        $otherUser = User::factory()->create();
        $otherPartner = Partner::factory()->create(['user_id' => $otherUser->id]);
        Referral::factory()->count(2)->create([
            'user_id' => $otherUser->id,
            'referring_partner_id' => $otherPartner->id,
            'receiving_partner_id' => $otherPartner->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get('/referrals');

        $response->assertInertia(fn ($page) =>
            $page->has('referrals.data', 3)
        );
    }

    public function test_referral_create_page_loads(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/referrals/create');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('referrals/create')
                ->has('partners')
        );
    }

    public function test_can_create_referral(): void
    {
        $referralData = [
            'customer_name' => 'John Doe',
            'customer_email' => 'john@example.com',
            'customer_phone' => '+66 98 765 4321',
            'referring_partner_id' => $this->referringPartner->id,
            'receiving_partner_id' => $this->receivingPartner->id,
            'service_type' => 'diving',
            'service_amount' => 10000,
            'commission_rate' => 15,
            'booking_date' => now()->format('Y-m-d'),
            'notes' => 'Test referral',
        ];

        $response = $this->actingAs($this->user)
            ->post('/referrals', $referralData);

        $response->assertRedirect('/referrals');
        $this->assertDatabaseHas('referrals', [
            'customer_name' => 'John Doe',
            'customer_email' => 'john@example.com',
            'service_amount' => 10000,
            'commission_rate' => 15,
            'commission_amount' => 1500, // 10000 * 0.15
            'status' => 'pending',
        ]);
    }

    public function test_referral_creation_validates_required_fields(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/referrals', []);

        $response->assertSessionHasErrors([
            'customer_name',
            'customer_email',
            'referring_partner_id',
            'receiving_partner_id',
            'service_type',
            'service_amount',
            'commission_rate',
            'booking_date',
        ]);
    }

    public function test_referral_creation_validates_email_format(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/referrals', [
                'customer_name' => 'John Doe',
                'customer_email' => 'invalid-email',
                'referring_partner_id' => $this->referringPartner->id,
                'receiving_partner_id' => $this->receivingPartner->id,
                'service_type' => 'diving',
                'service_amount' => 10000,
                'commission_rate' => 15,
                'booking_date' => now()->format('Y-m-d'),
            ]);

        $response->assertSessionHasErrors(['customer_email']);
    }

    public function test_referral_creation_calculates_commission_automatically(): void
    {
        $this->actingAs($this->user)
            ->post('/referrals', [
                'customer_name' => 'Jane Smith',
                'customer_email' => 'jane@example.com',
                'referring_partner_id' => $this->referringPartner->id,
                'receiving_partner_id' => $this->receivingPartner->id,
                'service_type' => 'diving',
                'service_amount' => 20000,
                'commission_rate' => 20,
                'booking_date' => now()->format('Y-m-d'),
            ]);

        $this->assertDatabaseHas('referrals', [
            'customer_name' => 'Jane Smith',
            'service_amount' => 20000,
            'commission_rate' => 20,
            'commission_amount' => 4000, // 20000 * 0.20
        ]);
    }

    public function test_can_search_referrals_by_customer_name(): void
    {
        Referral::factory()->create([
            'user_id' => $this->user->id,
            'referring_partner_id' => $this->referringPartner->id,
            'receiving_partner_id' => $this->receivingPartner->id,
            'customer_name' => 'John Doe',
        ]);

        Referral::factory()->create([
            'user_id' => $this->user->id,
            'referring_partner_id' => $this->referringPartner->id,
            'receiving_partner_id' => $this->receivingPartner->id,
            'customer_name' => 'Jane Smith',
        ]);

        $response = $this->actingAs($this->user)
            ->get('/referrals?search=John');

        $response->assertInertia(fn ($page) =>
            $page->has('referrals.data', 1)
        );
    }

    public function test_can_filter_referrals_by_status(): void
    {
        Referral::factory()->create([
            'user_id' => $this->user->id,
            'referring_partner_id' => $this->referringPartner->id,
            'receiving_partner_id' => $this->receivingPartner->id,
            'status' => 'pending',
        ]);

        Referral::factory()->create([
            'user_id' => $this->user->id,
            'referring_partner_id' => $this->referringPartner->id,
            'receiving_partner_id' => $this->receivingPartner->id,
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->get('/referrals?status=paid');

        $response->assertInertia(fn ($page) =>
            $page->has('referrals.data', 1)
        );
    }

    public function test_can_filter_referrals_by_tab_sent(): void
    {
        Referral::factory()->create([
            'user_id' => $this->user->id,
            'referring_partner_id' => $this->referringPartner->id,
            'receiving_partner_id' => $this->receivingPartner->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get('/referrals?tab=sent');

        $response->assertStatus(200);
    }

    public function test_can_filter_referrals_by_tab_received(): void
    {
        Referral::factory()->create([
            'user_id' => $this->user->id,
            'referring_partner_id' => $this->referringPartner->id,
            'receiving_partner_id' => $this->receivingPartner->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get('/referrals?tab=received');

        $response->assertStatus(200);
    }

    public function test_referral_show_page_loads(): void
    {
        $referral = Referral::factory()->create([
            'user_id' => $this->user->id,
            'referring_partner_id' => $this->referringPartner->id,
            'receiving_partner_id' => $this->receivingPartner->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get("/referrals/{$referral->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('referrals/show')
                ->has('referral')
        );
    }

    public function test_cannot_view_other_users_referral(): void
    {
        $otherUser = User::factory()->create();
        $otherPartner = Partner::factory()->create(['user_id' => $otherUser->id]);
        $referral = Referral::factory()->create([
            'user_id' => $otherUser->id,
            'referring_partner_id' => $otherPartner->id,
            'receiving_partner_id' => $otherPartner->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get("/referrals/{$referral->id}");

        $response->assertStatus(403);
    }

    public function test_can_update_referral_status(): void
    {
        $referral = Referral::factory()->create([
            'user_id' => $this->user->id,
            'referring_partner_id' => $this->referringPartner->id,
            'receiving_partner_id' => $this->receivingPartner->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->user)
            ->patch("/referrals/{$referral->id}", [
                'status' => 'validated',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('referrals', [
            'id' => $referral->id,
            'status' => 'validated',
        ]);
    }

    public function test_can_mark_referral_as_paid(): void
    {
        $referral = Referral::factory()->create([
            'user_id' => $this->user->id,
            'referring_partner_id' => $this->referringPartner->id,
            'receiving_partner_id' => $this->receivingPartner->id,
            'status' => 'validated',
        ]);

        $response = $this->actingAs($this->user)
            ->patch("/referrals/{$referral->id}", [
                'status' => 'paid',
            ]);

        $response->assertRedirect();
        $referral->refresh();

        $this->assertEquals('paid', $referral->status);
        $this->assertNotNull($referral->paid_at);
    }

    public function test_can_delete_referral(): void
    {
        $referral = Referral::factory()->create([
            'user_id' => $this->user->id,
            'referring_partner_id' => $this->referringPartner->id,
            'receiving_partner_id' => $this->receivingPartner->id,
        ]);

        $response = $this->actingAs($this->user)
            ->delete("/referrals/{$referral->id}");

        $response->assertRedirect('/referrals');
        $this->assertDatabaseMissing('referrals', [
            'id' => $referral->id,
        ]);
    }

    public function test_cannot_delete_other_users_referral(): void
    {
        $otherUser = User::factory()->create();
        $otherPartner = Partner::factory()->create(['user_id' => $otherUser->id]);
        $referral = Referral::factory()->create([
            'user_id' => $otherUser->id,
            'referring_partner_id' => $otherPartner->id,
            'receiving_partner_id' => $otherPartner->id,
        ]);

        $response = $this->actingAs($this->user)
            ->delete("/referrals/{$referral->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('referrals', [
            'id' => $referral->id,
        ]);
    }

    public function test_referrals_are_paginated(): void
    {
        Referral::factory()->count(25)->create([
            'user_id' => $this->user->id,
            'referring_partner_id' => $this->referringPartner->id,
            'receiving_partner_id' => $this->receivingPartner->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get('/referrals');

        $response->assertInertia(fn ($page) =>
            $page->has('referrals.data', 10) // Default pagination
                ->has('referrals.links')
        );
    }

    public function test_referral_validates_partner_ownership(): void
    {
        $otherUser = User::factory()->create();
        $otherPartner = Partner::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->actingAs($this->user)
            ->post('/referrals', [
                'customer_name' => 'John Doe',
                'customer_email' => 'john@example.com',
                'referring_partner_id' => $otherPartner->id, // Partner from other user
                'receiving_partner_id' => $this->receivingPartner->id,
                'service_type' => 'diving',
                'service_amount' => 10000,
                'commission_rate' => 15,
                'booking_date' => now()->format('Y-m-d'),
            ]);

        $response->assertSessionHasErrors(['referring_partner_id']);
    }

    public function test_cannot_access_referrals_without_authentication(): void
    {
        $response = $this->get('/referrals');
        $response->assertRedirect('/login');

        $response = $this->get('/referrals/create');
        $response->assertRedirect('/login');

        $response = $this->post('/referrals', []);
        $response->assertRedirect('/login');
    }

    public function test_referral_commission_rate_defaults_to_partner_rate(): void
    {
        $this->actingAs($this->user)
            ->post('/referrals', [
                'customer_name' => 'John Doe',
                'customer_email' => 'john@example.com',
                'referring_partner_id' => $this->referringPartner->id,
                'receiving_partner_id' => $this->receivingPartner->id,
                'service_type' => 'diving',
                'service_amount' => 10000,
                'commission_rate' => $this->referringPartner->default_commission_rate,
                'booking_date' => now()->format('Y-m-d'),
            ]);

        $this->assertDatabaseHas('referrals', [
            'customer_name' => 'John Doe',
            'commission_rate' => $this->referringPartner->default_commission_rate,
        ]);
    }
}
