<?php

namespace Tests\Feature;

use App\Models\Partner;
use App\Models\TrackingLink;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrackingControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Partner $partner;
    protected TrackingLink $trackingLink;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\PartnerTierSeeder::class);
        $this->user = User::factory()->create();
        $this->partner = Partner::factory()->create([
            'user_id' => $this->user->id,
        ]);
        $this->trackingLink = TrackingLink::factory()->create([
            'partner_id' => $this->partner->id,
            'user_id' => $this->user->id,
            'is_active' => true,
        ]);
    }

    public function test_short_url_redirects_to_full_url(): void
    {
        $response = $this->get("/r/{$this->trackingLink->short_code}");

        $response->assertRedirect($this->trackingLink->full_url);
    }

    public function test_redirect_records_click(): void
    {
        $initialClicks = $this->trackingLink->clicks;

        $this->get("/r/{$this->trackingLink->short_code}");

        $this->trackingLink->refresh();
        $this->assertEquals($initialClicks + 1, $this->trackingLink->clicks);
    }

    public function test_redirect_updates_last_clicked_at(): void
    {
        $this->trackingLink->update(['last_clicked_at' => null]);

        $this->get("/r/{$this->trackingLink->short_code}");

        $this->trackingLink->refresh();
        $this->assertNotNull($this->trackingLink->last_clicked_at);
    }

    public function test_inactive_tracking_link_returns_404(): void
    {
        $this->trackingLink->update(['is_active' => false]);

        $response = $this->get("/r/{$this->trackingLink->short_code}");

        $response->assertStatus(404);
    }

    public function test_invalid_tracking_code_returns_404(): void
    {
        $response = $this->get('/r/invalid-code-xyz');

        $response->assertStatus(404);
    }

    public function test_can_track_click_via_api(): void
    {
        $response = $this->postJson('/api/track/click', [
            'ref' => $this->trackingLink->short_code,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'tracking_link_id' => $this->trackingLink->id,
            ]);
    }

    public function test_api_track_click_increments_counter(): void
    {
        $initialClicks = $this->trackingLink->clicks;

        $this->postJson('/api/track/click', [
            'ref' => $this->trackingLink->short_code,
        ]);

        $this->trackingLink->refresh();
        $this->assertEquals($initialClicks + 1, $this->trackingLink->clicks);
    }

    public function test_api_track_click_validates_ref_parameter(): void
    {
        $response = $this->postJson('/api/track/click', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['ref']);
    }

    public function test_api_track_click_returns_error_for_invalid_code(): void
    {
        $response = $this->postJson('/api/track/click', [
            'ref' => 'invalid-code',
        ]);

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid tracking code',
            ]);
    }

    public function test_api_track_click_accepts_optional_referrer(): void
    {
        $response = $this->postJson('/api/track/click', [
            'ref' => $this->trackingLink->short_code,
            'referrer' => 'https://example.com',
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_api_track_click_validates_referrer_url(): void
    {
        $response = $this->postJson('/api/track/click', [
            'ref' => $this->trackingLink->short_code,
            'referrer' => 'not-a-valid-url',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['referrer']);
    }

    public function test_can_get_tracking_link_stats(): void
    {
        $this->trackingLink->update([
            'clicks' => 100,
            'conversions' => 25,
        ]);

        $response = $this->getJson("/api/track/stats/{$this->trackingLink->short_code}");

        $response->assertStatus(200)
            ->assertJson([
                'code' => $this->trackingLink->short_code,
                'clicks' => 100,
                'conversions' => 25,
                'is_active' => true,
            ]);
    }

    public function test_stats_calculates_conversion_rate(): void
    {
        $this->trackingLink->update([
            'clicks' => 100,
            'conversions' => 25,
        ]);
        $this->trackingLink->updateConversionRate();

        $response = $this->getJson("/api/track/stats/{$this->trackingLink->short_code}");

        $response->assertStatus(200)
            ->assertJsonPath('conversion_rate', '25.00'); // String due to decimal cast
    }

    public function test_stats_returns_404_for_invalid_code(): void
    {
        $response = $this->getJson('/api/track/stats/invalid-code');

        $response->assertStatus(404);
    }

    public function test_multiple_clicks_increment_counter_correctly(): void
    {
        $initialClicks = $this->trackingLink->clicks;
        $clickCount = 5;

        for ($i = 0; $i < $clickCount; $i++) {
            $this->get("/r/{$this->trackingLink->short_code}");
        }

        $this->trackingLink->refresh();
        $this->assertEquals($initialClicks + $clickCount, $this->trackingLink->clicks);
    }

    public function test_tracking_link_with_campaign_redirects_correctly(): void
    {
        $trackingLink = TrackingLink::factory()->create([
            'partner_id' => $this->partner->id,
            'user_id' => $this->user->id,
            'utm_campaign' => 'summer-2025',
            'is_active' => true,
        ]);

        $response = $this->get("/r/{$trackingLink->short_code}");

        $response->assertRedirect($trackingLink->full_url);
    }

    public function test_tracking_preserves_utm_parameters(): void
    {
        $response = $this->get("/r/{$this->trackingLink->short_code}");

        $redirectUrl = $response->headers->get('Location');
        $this->assertStringContainsString('utm_', $redirectUrl);
    }

    public function test_concurrent_clicks_recorded_correctly(): void
    {
        $initialClicks = $this->trackingLink->clicks;

        // Simulate concurrent requests
        $responses = [];
        for ($i = 0; $i < 3; $i++) {
            $responses[] = $this->get("/r/{$this->trackingLink->short_code}");
        }

        foreach ($responses as $response) {
            $response->assertRedirect();
        }

        $this->trackingLink->refresh();
        $this->assertEquals($initialClicks + 3, $this->trackingLink->clicks);
    }

    public function test_api_inactive_link_returns_404(): void
    {
        $this->trackingLink->update(['is_active' => false]);

        $response = $this->postJson('/api/track/click', [
            'ref' => $this->trackingLink->short_code,
        ]);

        $response->assertStatus(404);
    }

    public function test_stats_shows_zero_conversion_rate_with_no_clicks(): void
    {
        $this->trackingLink->update([
            'clicks' => 0,
            'conversions' => 0,
        ]);

        $response = $this->getJson("/api/track/stats/{$this->trackingLink->short_code}");

        $response->assertStatus(200)
            ->assertJsonPath('conversion_rate', '0.00');
    }

    public function test_tracking_link_shows_total_revenue(): void
    {
        $this->trackingLink->update([
            'total_revenue' => 50000,
        ]);

        $response = $this->getJson("/api/track/stats/{$this->trackingLink->short_code}");

        $response->assertStatus(200)
            ->assertJsonPath('total_revenue', '50000.00');
    }

    public function test_stats_includes_last_clicked_timestamp(): void
    {
        $lastClicked = now()->subDays(2);
        $this->trackingLink->update([
            'last_clicked_at' => $lastClicked,
        ]);

        $response = $this->getJson("/api/track/stats/{$this->trackingLink->short_code}");

        $response->assertStatus(200)
            ->assertJsonPath('last_clicked_at', $lastClicked->format('Y-m-d\TH:i:s.000000\Z'));
    }

    public function test_different_tracking_codes_track_independently(): void
    {
        $link1 = TrackingLink::factory()->create([
            'partner_id' => $this->partner->id,
            'user_id' => $this->user->id,
            'is_active' => true,
        ]);

        $link2 = TrackingLink::factory()->create([
            'partner_id' => $this->partner->id,
            'user_id' => $this->user->id,
            'is_active' => true,
        ]);

        $this->get("/r/{$link1->short_code}");
        $this->get("/r/{$link1->short_code}");
        $this->get("/r/{$link2->short_code}");

        $link1->refresh();
        $link2->refresh();

        $this->assertEquals(2, $link1->clicks);
        $this->assertEquals(1, $link2->clicks);
    }
}
