<?php

namespace Tests\Feature;

use App\Models\Partner;
use App\Models\TrackingLink;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QRCodeControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Partner $partner;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\PartnerTierSeeder::class);
        $this->user = User::factory()->create();
        $this->partner = Partner::factory()->create([
            'user_id' => $this->user->id,
            'business_name' => 'Test Partner',
            'is_active' => true,
        ]);
    }

    public function test_qr_code_generation_page_loads(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/qr-codes/generate');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('qr-codes/generate')
                ->has('partners')
        );
    }

    public function test_can_generate_qr_code_for_partner(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/qr-codes/generate', [
                'partner_id' => $this->partner->id,
                'campaign' => 'summer-2025',
                'size' => 'medium',
            ]);

        $response->assertStatus(200);

        // Verify tracking link was created
        $this->assertDatabaseHas('tracking_links', [
            'partner_id' => $this->partner->id,
            'campaign' => 'summer-2025',
            'user_id' => $this->user->id,
        ]);

        // Verify response contains QR code data
        $response->assertInertia(fn ($page) =>
            $page->has('qr_code')
                ->has('qr_link')
                ->where('partner_id', $this->partner->id)
        );
    }

    public function test_qr_code_generation_validates_partner_id(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/qr-codes/generate', [
                'partner_id' => '', // Empty partner_id
                'campaign' => 'test',
                'size' => 'medium',
            ]);

        $response->assertSessionHasErrors(['partner_id']);
    }

    public function test_qr_code_generation_validates_partner_ownership(): void
    {
        $otherUser = User::factory()->create();
        $otherPartner = Partner::factory()->create([
            'user_id' => $otherUser->id,
        ]);

        $response = $this->actingAs($this->user)
            ->post('/qr-codes/generate', [
                'partner_id' => $otherPartner->id,
                'campaign' => 'test',
                'size' => 'medium',
            ]);

        $response->assertSessionHasErrors(['partner_id']);
    }

    public function test_can_generate_qr_code_in_different_sizes(): void
    {
        $sizes = ['small', 'medium', 'large'];

        foreach ($sizes as $size) {
            $response = $this->actingAs($this->user)
                ->post('/qr-codes/generate', [
                    'partner_id' => $this->partner->id,
                    'campaign' => "test-{$size}",
                    'size' => $size,
                ]);

            $response->assertStatus(200);
            $response->assertInertia(fn ($page) => $page->has('qr_code'));
        }
    }

    public function test_qr_code_generation_creates_unique_short_code(): void
    {
        // Generate multiple QR codes
        $shortCodes = [];

        for ($i = 0; $i < 5; $i++) {
            $this->actingAs($this->user)
                ->post('/qr-codes/generate', [
                    'partner_id' => $this->partner->id,
                    'campaign' => "campaign-{$i}",
                    'size' => 'medium',
                ]);

            $link = TrackingLink::latest()->first();
            $shortCodes[] = $link->short_code;
        }

        // All short codes should be unique
        $this->assertEquals(count($shortCodes), count(array_unique($shortCodes)));
    }

    public function test_qr_code_stores_campaign_information(): void
    {
        $campaign = 'summer-sale-2025';

        $this->actingAs($this->user)
            ->post('/qr-codes/generate', [
                'partner_id' => $this->partner->id,
                'campaign' => $campaign,
                'size' => 'medium',
            ]);

        $this->assertDatabaseHas('tracking_links', [
            'partner_id' => $this->partner->id,
            'campaign' => $campaign,
        ]);
    }

    public function test_qr_code_file_is_created_in_storage(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/qr-codes/generate', [
                'partner_id' => $this->partner->id,
                'campaign' => 'test',
                'size' => 'medium',
            ]);

        $link = TrackingLink::latest()->first();

        // QR code file should exist in storage
        $qrPath = "qr-codes/{$this->partner->id}/{$link->short_code}.png";
        $this->assertTrue(\Storage::disk('public')->exists($qrPath));
    }

    public function test_cannot_generate_qr_code_without_authentication(): void
    {
        $response = $this->get('/qr-codes/generate');
        $response->assertRedirect('/login');

        $response = $this->post('/qr-codes/generate', [
            'partner_id' => $this->partner->id,
            'campaign' => 'test',
            'size' => 'medium',
        ]);
        $response->assertRedirect('/login');
    }

    public function test_qr_code_page_loads_with_existing_partner(): void
    {
        $response = $this->actingAs($this->user)
            ->get("/qr-codes/generate?partner_id={$this->partner->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('qr-codes/generate')
                ->where('partner_id', $this->partner->id)
        );
    }

    public function test_can_generate_qr_code_without_campaign(): void
    {
        $response = $this->actingAs($this->user)
            ->post('/qr-codes/generate', [
                'partner_id' => $this->partner->id,
                'size' => 'medium',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('tracking_links', [
            'partner_id' => $this->partner->id,
            'campaign' => null,
        ]);
    }

    public function test_qr_code_short_url_is_properly_formatted(): void
    {
        $this->actingAs($this->user)
            ->post('/qr-codes/generate', [
                'partner_id' => $this->partner->id,
                'campaign' => 'test',
                'size' => 'medium',
            ]);

        $link = TrackingLink::latest()->first();

        // Short URL should contain the short code
        $this->assertStringContainsString($link->short_code, $link->short_url);

        // Should be a valid URL format
        $this->assertMatchesRegularExpression('/^https?:\/\//', $link->short_url);
    }

    public function test_multiple_qr_codes_for_same_partner_different_campaigns(): void
    {
        $campaigns = ['summer', 'winter', 'spring'];

        foreach ($campaigns as $campaign) {
            $this->actingAs($this->user)
                ->post('/qr-codes/generate', [
                    'partner_id' => $this->partner->id,
                    'campaign' => $campaign,
                    'size' => 'medium',
                ]);
        }

        // Should have 3 tracking links for the same partner
        $this->assertDatabaseCount('tracking_links', 3);
        $this->assertEquals(
            3,
            TrackingLink::where('partner_id', $this->partner->id)->count()
        );
    }

    public function test_qr_code_generation_tracks_user_id(): void
    {
        $this->actingAs($this->user)
            ->post('/qr-codes/generate', [
                'partner_id' => $this->partner->id,
                'campaign' => 'test',
                'size' => 'medium',
            ]);

        $this->assertDatabaseHas('tracking_links', [
            'partner_id' => $this->partner->id,
            'user_id' => $this->user->id,
        ]);
    }

    public function test_inactive_partner_can_still_generate_qr_codes(): void
    {
        $this->partner->update(['is_active' => false]);

        $response = $this->actingAs($this->user)
            ->post('/qr-codes/generate', [
                'partner_id' => $this->partner->id,
                'campaign' => 'test',
                'size' => 'medium',
            ]);

        // QR codes can be generated even for inactive partners
        $response->assertStatus(200);
        $this->assertDatabaseHas('tracking_links', [
            'partner_id' => $this->partner->id,
        ]);
    }
}
