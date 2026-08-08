<?php

namespace Tests\Browser;

use App\Models\Partner;
use App\Models\TrackingLink;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class QRCodeGenerationTest extends DuskTestCase
{
    use DatabaseMigrations;

    /**
     * Test QR code generation page loads
     */
    public function test_qr_code_page_loads_successfully(): void
    {
        $this->seed(\Database\Seeders\PartnerTierSeeder::class);

        $user = User::factory()->create();
        Partner::factory()->count(3)->create(['user_id' => $user->id]);

        $this->browse(function (Browser $browser) use ($user) {
            $browser->loginAs($user)
                    ->visit('/qr-codes/generate')
                    ->assertSee('Generate QR Code')
                    ->assertSee('Partner')
                    ->assertPresent('select[name="partner_id"]');
        });
    }

    /**
     * Test can generate QR code
     */
    public function test_can_generate_qr_code(): void
    {
        $this->seed(\Database\Seeders\PartnerTierSeeder::class);

        $user = User::factory()->create();
        $partner = Partner::factory()->create([
            'user_id' => $user->id,
            'business_name' => 'Crystal Dive',
        ]);

        $this->browse(function (Browser $browser) use ($user, $partner) {
            $browser->loginAs($user)
                    ->visit('/qr-codes/generate')

                    // Select partner
                    ->select('partner_id', $partner->id)

                    // Fill optional fields
                    ->type('campaign', 'summer-2025')
                    ->select('size', 'medium')

                    // Submit form
                    ->press('Generate QR Code')
                    ->pause(1000)

                    // Should see QR code image
                    ->assertPresent('img[alt*="QR"]')

                    // Should see download button
                    ->assertSee('Download QR Code');
        });

        // Verify tracking link was created
        $this->assertDatabaseHas('tracking_links', [
            'partner_id' => $partner->id,
            'campaign' => 'summer-2025',
            'user_id' => $user->id,
        ]);
    }

    /**
     * Test QR code validates required fields
     */
    public function test_qr_code_validates_partner_selection(): void
    {
        $user = User::factory()->create();

        $this->browse(function (Browser $browser) use ($user) {
            $browser->loginAs($user)
                    ->visit('/qr-codes/generate')

                    // Try to submit without selecting partner
                    ->press('Generate QR Code')

                    // Should stay on same page
                    ->assertPathIs('/qr-codes/generate')

                    // Should see validation error
                    ->assertPresent('.text-destructive');
        });
    }

    /**
     * Test can generate QR code in different sizes
     */
    public function test_can_generate_different_qr_code_sizes(): void
    {
        $this->seed(\Database\Seeders\PartnerTierSeeder::class);

        $user = User::factory()->create();
        $partner = Partner::factory()->create(['user_id' => $user->id]);

        $sizes = ['small', 'medium', 'large'];

        $this->browse(function (Browser $browser) use ($user, $partner, $sizes) {
            foreach ($sizes as $size) {
                $browser->loginAs($user)
                        ->visit('/qr-codes/generate')
                        ->select('partner_id', $partner->id)
                        ->type('campaign', "test-{$size}")
                        ->select('size', $size)
                        ->press('Generate QR Code')
                        ->pause(1000)
                        ->assertPresent('img[alt*="QR"]');
            }
        });
    }

    /**
     * Test QR code page pre-selects partner from URL
     */
    public function test_qr_code_preselects_partner_from_url(): void
    {
        $this->seed(\Database\Seeders\PartnerTierSeeder::class);

        $user = User::factory()->create();
        $partner = Partner::factory()->create([
            'user_id' => $user->id,
            'business_name' => 'Test Partner',
        ]);

        $this->browse(function (Browser $browser) use ($user, $partner) {
            $browser->loginAs($user)
                    ->visit("/qr-codes/generate?partner_id={$partner->id}")

                    // Partner should be pre-selected
                    ->assertSelected('partner_id', $partner->id);
        });
    }

    /**
     * Test QR code displays short URL
     */
    public function test_qr_code_displays_short_url(): void
    {
        $this->seed(\Database\Seeders\PartnerTierSeeder::class);

        $user = User::factory()->create();
        $partner = Partner::factory()->create(['user_id' => $user->id]);

        $this->browse(function (Browser $browser) use ($user, $partner) {
            $browser->loginAs($user)
                    ->visit('/qr-codes/generate')
                    ->select('partner_id', $partner->id)
                    ->press('Generate QR Code')
                    ->pause(1000)

                    // Should display short URL
                    ->assertSee('/r/');
        });
    }

    /**
     * Test can download QR code
     */
    public function test_can_download_qr_code(): void
    {
        $this->seed(\Database\Seeders\PartnerTierSeeder::class);

        $user = User::factory()->create();
        $partner = Partner::factory()->create(['user_id' => $user->id]);

        $this->browse(function (Browser $browser) use ($user, $partner) {
            $browser->loginAs($user)
                    ->visit('/qr-codes/generate')
                    ->select('partner_id', $partner->id)
                    ->press('Generate QR Code')
                    ->pause(1000)

                    // Download button should be present
                    ->assertSee('Download QR Code')
                    ->assertPresent('a[download]');
        });
    }

    /**
     * Test campaign field is optional
     */
    public function test_campaign_field_is_optional(): void
    {
        $this->seed(\Database\Seeders\PartnerTierSeeder::class);

        $user = User::factory()->create();
        $partner = Partner::factory()->create(['user_id' => $user->id]);

        $this->browse(function (Browser $browser) use ($user, $partner) {
            $browser->loginAs($user)
                    ->visit('/qr-codes/generate')
                    ->select('partner_id', $partner->id)
                    ->select('size', 'medium')

                    // Don't fill campaign
                    ->press('Generate QR Code')
                    ->pause(1000)

                    // Should still generate successfully
                    ->assertPresent('img[alt*="QR"]');
        });
    }

    /**
     * Test multiple QR codes can be generated for same partner
     */
    public function test_can_generate_multiple_qr_codes_for_partner(): void
    {
        $this->seed(\Database\Seeders\PartnerTierSeeder::class);

        $user = User::factory()->create();
        $partner = Partner::factory()->create(['user_id' => $user->id]);

        $this->browse(function (Browser $browser) use ($user, $partner) {
            // Generate first QR code
            $browser->loginAs($user)
                    ->visit('/qr-codes/generate')
                    ->select('partner_id', $partner->id)
                    ->type('campaign', 'campaign-1')
                    ->press('Generate QR Code')
                    ->pause(1000)
                    ->assertPresent('img[alt*="QR"]')

                    // Generate second QR code
                    ->visit('/qr-codes/generate')
                    ->select('partner_id', $partner->id)
                    ->type('campaign', 'campaign-2')
                    ->press('Generate QR Code')
                    ->pause(1000)
                    ->assertPresent('img[alt*="QR"]');
        });

        // Should have 2 tracking links
        $this->assertEquals(2, TrackingLink::where('partner_id', $partner->id)->count());
    }

    /**
     * Test QR code generation with inactive partner
     */
    public function test_can_generate_qr_code_for_inactive_partner(): void
    {
        $this->seed(\Database\Seeders\PartnerTierSeeder::class);

        $user = User::factory()->create();
        $partner = Partner::factory()->create([
            'user_id' => $user->id,
            'is_active' => false,
        ]);

        $this->browse(function (Browser $browser) use ($user, $partner) {
            $browser->loginAs($user)
                    ->visit('/qr-codes/generate')
                    ->select('partner_id', $partner->id)
                    ->press('Generate QR Code')
                    ->pause(1000)

                    // Should still work for inactive partners
                    ->assertPresent('img[alt*="QR"]');
        });
    }

    /**
     * Test QR code page navigation
     */
    public function test_can_navigate_to_qr_code_page_from_sidebar(): void
    {
        $user = User::factory()->create();

        $this->browse(function (Browser $browser) use ($user) {
            $browser->loginAs($user)
                    ->visit('/dashboard')
                    ->clickLink('QR Codes')
                    ->assertPathIs('/qr-codes/generate')
                    ->assertSee('Generate QR Code');
        });
    }
}
