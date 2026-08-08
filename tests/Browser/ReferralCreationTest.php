<?php

namespace Tests\Browser;

use App\Models\Partner;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class ReferralCreationTest extends DuskTestCase
{
    use DatabaseMigrations;

    /**
     * Test that the referral creation page loads successfully
     */
    public function test_referral_creation_page_loads(): void
    {
        $user = User::factory()->create();
        Partner::factory()->count(3)->create(['user_id' => $user->id]);

        $this->browse(function (Browser $browser) use ($user) {
            $browser->loginAs($user)
                    ->visit('/referrals/create')
                    ->assertSee('Create Referral')
                    ->assertSee('Customer Information')
                    ->assertSee('Partner Information')
                    ->assertSee('Service Information')
                    ->assertSee('Commission Information');
        });
    }

    /**
     * Test creating a new referral
     */
    public function test_can_create_referral(): void
    {
        $this->seed(\Database\Seeders\PartnerTierSeeder::class);

        $user = User::factory()->create();
        $partner1 = Partner::factory()->create([
            'user_id' => $user->id,
            'business_name' => 'Crystal Dive',
            'default_commission_rate' => 15,
        ]);
        $partner2 = Partner::factory()->create([
            'user_id' => $user->id,
            'business_name' => 'Big Blue Diving',
        ]);

        $this->browse(function (Browser $browser) use ($user, $partner1, $partner2) {
            $browser->loginAs($user)
                    ->visit('/referrals/create')

                    // Fill customer information
                    ->type('customer_name', 'Jane Smith')
                    ->type('customer_email', 'jane@example.com')
                    ->type('customer_phone', '+66 98 765 4321')

                    // Select partners
                    ->select('referring_partner_id', $partner1->id)
                    ->select('receiving_partner_id', $partner2->id)

                    // Fill service information
                    ->select('service_type', 'diving')
                    ->type('service_amount', '8000')
                    ->type('booking_date', now()->format('Y-m-d'))

                    // Commission should auto-populate from partner
                    ->assertInputValue('commission_rate', '15')

                    // Submit form
                    ->press('Create Referral')

                    // Should redirect to referrals index
                    ->assertPathIs('/referrals')

                    // Should see success message
                    ->assertSee('Jane Smith');
        });

        // Verify referral was created in database
        $this->assertDatabaseHas('referrals', [
            'customer_name' => 'Jane Smith',
            'customer_email' => 'jane@example.com',
            'service_amount' => 8000,
            'commission_rate' => 15,
            'status' => 'pending',
        ]);
    }

    /**
     * Test real-time commission calculation
     */
    public function test_commission_preview_updates_in_realtime(): void
    {
        $this->seed(\Database\Seeders\PartnerTierSeeder::class);

        $user = User::factory()->create();
        Partner::factory()->count(2)->create(['user_id' => $user->id]);

        $this->browse(function (Browser $browser) use ($user) {
            $browser->loginAs($user)
                    ->visit('/referrals/create')

                    // Type service amount
                    ->type('service_amount', '10000')
                    ->type('commission_rate', '15')

                    // Wait for calculation to update
                    ->pause(500)

                    // Check calculated commission preview
                    ->assertSee('฿1,500.00')

                    // Change amount
                    ->clear('service_amount')
                    ->type('service_amount', '20000')
                    ->pause(500)

                    // Should update to new amount
                    ->assertSee('฿3,000.00')

                    // Change rate
                    ->clear('commission_rate')
                    ->type('commission_rate', '20')
                    ->pause(500)

                    // Should update
                    ->assertSee('฿4,000.00');
        });
    }

    /**
     * Test form validation
     */
    public function test_form_validates_required_fields(): void
    {
        $user = User::factory()->create();

        $this->browse(function (Browser $browser) use ($user) {
            $browser->loginAs($user)
                    ->visit('/referrals/create')

                    // Try to submit without filling anything
                    ->press('Create Referral')

                    // Should stay on same page
                    ->assertPathIs('/referrals/create')

                    // Should see validation errors (Thai messages)
                    ->assertPresent('.text-destructive');
        });
    }

    /**
     * Test partner selection auto-populates commission rate
     */
    public function test_selecting_partner_auto_populates_commission_rate(): void
    {
        $this->seed(\Database\Seeders\PartnerTierSeeder::class);

        $user = User::factory()->create();
        $partner = Partner::factory()->create([
            'user_id' => $user->id,
            'business_name' => 'Test Partner',
            'default_commission_rate' => 22.5,
        ]);

        $this->browse(function (Browser $browser) use ($user, $partner) {
            $browser->loginAs($user)
                    ->visit('/referrals/create')

                    // Commission rate should be empty initially
                    ->assertInputValue('commission_rate', '')

                    // Select referring partner
                    ->select('referring_partner_id', $partner->id)
                    ->pause(500)

                    // Commission rate should auto-populate
                    ->assertInputValue('commission_rate', '22.5');
        });
    }
}
