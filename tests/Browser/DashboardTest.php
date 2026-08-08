<?php

namespace Tests\Browser;

use App\Models\Partner;
use App\Models\Referral;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class DashboardTest extends DuskTestCase
{
    use DatabaseMigrations;

    /**
     * Test dashboard loads and shows stats
     */
    public function test_dashboard_displays_statistics(): void
    {
        $this->seed(\Database\Seeders\PartnerTierSeeder::class);

        $user = User::factory()->create();
        $partner = Partner::factory()->create([
            'user_id' => $user->id,
            'is_active' => true,
        ]);

        // Create paid referral
        Referral::factory()->create([
            'user_id' => $user->id,
            'referring_partner_id' => $partner->id,
            'receiving_partner_id' => $partner->id,
            'commission_amount' => 1500,
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        $this->browse(function (Browser $browser) use ($user) {
            $browser->loginAs($user)
                    ->visit('/dashboard')
                    ->assertSee('Dashboard')
                    ->assertSee('Commissions Earned')
                    ->assertSee('Commissions Owed')
                    ->assertSee('Active Partners')
                    ->assertSee('Pending Referrals')

                    // Should show the commission amount
                    ->assertSee('฿1,500');
        });
    }

    /**
     * Test dashboard shows top partners
     */
    public function test_dashboard_shows_top_partners(): void
    {
        $this->seed(\Database\Seeders\PartnerTierSeeder::class);

        $user = User::factory()->create();

        // Create partners with different PLV
        $partner1 = Partner::factory()->create([
            'user_id' => $user->id,
            'business_name' => 'Top Partner',
            'calculated_plv' => 100000,
            'is_active' => true,
        ]);

        $partner2 = Partner::factory()->create([
            'user_id' => $user->id,
            'business_name' => 'Second Partner',
            'calculated_plv' => 50000,
            'is_active' => true,
        ]);

        $this->browse(function (Browser $browser) use ($user) {
            $browser->loginAs($user)
                    ->visit('/dashboard')
                    ->assertSee('Top Partners')
                    ->assertSee('Top Partner')
                    ->assertSee('Second Partner')
                    ->assertSee('฿100,000');
        });
    }

    /**
     * Test dashboard shows recent referrals
     */
    public function test_dashboard_shows_recent_referrals(): void
    {
        $this->seed(\Database\Seeders\PartnerTierSeeder::class);

        $user = User::factory()->create();
        $partner = Partner::factory()->create(['user_id' => $user->id]);

        Referral::factory()->create([
            'user_id' => $user->id,
            'referring_partner_id' => $partner->id,
            'receiving_partner_id' => $partner->id,
            'customer_name' => 'Recent Customer',
            'service_amount' => 5000,
            'commission_amount' => 750,
            'status' => 'pending',
        ]);

        $this->browse(function (Browser $browser) use ($user) {
            $browser->loginAs($user)
                    ->visit('/dashboard')
                    ->assertSee('Recent Referrals')
                    ->assertSee('Recent Customer')
                    ->assertSee('฿5,000')
                    ->assertSee('฿750');
        });
    }

    /**
     * Test dashboard navigation
     */
    public function test_can_navigate_from_dashboard(): void
    {
        $user = User::factory()->create();

        $this->browse(function (Browser $browser) use ($user) {
            $browser->loginAs($user)
                    ->visit('/dashboard')

                    // Test sidebar navigation
                    ->clickLink('Partners')
                    ->assertPathIs('/admin/partners')

                    ->visit('/dashboard')
                    ->clickLink('Referrals')
                    ->assertPathIs('/referrals')

                    ->visit('/dashboard')
                    ->clickLink('QR Codes')
                    ->assertPathIs('/qr-codes/generate');
        });
    }

    /**
     * Test dashboard updates after creating referral
     */
    public function test_dashboard_reflects_new_data(): void
    {
        $this->seed(\Database\Seeders\PartnerTierSeeder::class);

        $user = User::factory()->create();
        $partner = Partner::factory()->create([
            'user_id' => $user->id,
            'default_commission_rate' => 15,
        ]);

        $this->browse(function (Browser $browser) use ($user, $partner) {
            $browser->loginAs($user)

                    // Check initial dashboard state
                    ->visit('/dashboard')
                    ->assertSee('Pending Referrals')

                    // Create a new referral
                    ->visit('/referrals/create')
                    ->type('customer_name', 'New Customer')
                    ->type('customer_email', 'new@example.com')
                    ->select('referring_partner_id', $partner->id)
                    ->select('receiving_partner_id', $partner->id)
                    ->select('service_type', 'diving')
                    ->type('service_amount', '10000')
                    ->type('booking_date', now()->format('Y-m-d'))
                    ->press('Create Referral')

                    // Go back to dashboard
                    ->visit('/dashboard')

                    // Should see the new referral in recent list
                    ->assertSee('New Customer');
        });
    }
}
