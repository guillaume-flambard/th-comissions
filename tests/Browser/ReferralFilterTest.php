<?php

namespace Tests\Browser;

use App\Models\Partner;
use App\Models\Referral;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class ReferralFilterTest extends DuskTestCase
{
    use DatabaseMigrations;

    /**
     * Test debounced search functionality
     */
    public function test_search_debounces_correctly(): void
    {
        $this->seed(\Database\Seeders\PartnerTierSeeder::class);

        $user = User::factory()->create();
        $partner = Partner::factory()->create(['user_id' => $user->id]);

        // Create referrals with different customer names
        Referral::factory()->create([
            'user_id' => $user->id,
            'referring_partner_id' => $partner->id,
            'receiving_partner_id' => $partner->id,
            'customer_name' => 'John Doe',
            'status' => 'pending',
        ]);

        Referral::factory()->create([
            'user_id' => $user->id,
            'referring_partner_id' => $partner->id,
            'receiving_partner_id' => $partner->id,
            'customer_name' => 'Jane Smith',
            'status' => 'paid',
        ]);

        $this->browse(function (Browser $browser) use ($user) {
            $browser->loginAs($user)
                    ->visit('/referrals')

                    // Type in search (should debounce)
                    ->type('[type="search"]', 'John')

                    // Wait for debounce (500ms)
                    ->pause(600)

                    // Should see John Doe
                    ->assertSee('John Doe')

                    // Should not see Jane Smith
                    ->assertDontSee('Jane Smith')

                    // Clear search
                    ->clear('[type="search"]')
                    ->pause(600)

                    // Both should appear again
                    ->assertSee('John Doe')
                    ->assertSee('Jane Smith');
        });
    }

    /**
     * Test tab filtering (All/Sent/Received)
     */
    public function test_tab_filtering_works(): void
    {
        $this->seed(\Database\Seeders\PartnerTierSeeder::class);

        $user = User::factory()->create();
        $myPartner = Partner::factory()->create(['user_id' => $user->id, 'business_name' => 'My Business']);
        $otherPartner = Partner::factory()->create(['user_id' => $user->id, 'business_name' => 'Other Business']);

        // Referral sent by my partner
        $sent = Referral::factory()->create([
            'user_id' => $user->id,
            'referring_partner_id' => $myPartner->id,
            'receiving_partner_id' => $otherPartner->id,
            'customer_name' => 'Sent Customer',
        ]);

        // Referral received by my partner
        $received = Referral::factory()->create([
            'user_id' => $user->id,
            'referring_partner_id' => $otherPartner->id,
            'receiving_partner_id' => $myPartner->id,
            'customer_name' => 'Received Customer',
        ]);

        $this->browse(function (Browser $browser) use ($user) {
            $browser->loginAs($user)
                    ->visit('/referrals')

                    // Both should be visible on "All" tab
                    ->assertSee('Sent Customer')
                    ->assertSee('Received Customer')

                    // Click "Sent" tab
                    ->clickLink('Sent')
                    ->pause(300)

                    // URL should update
                    ->assertQueryStringHas('tab', 'sent')

                    // Should see sent, not received
                    ->assertSee('Sent Customer')
                    ->assertDontSee('Received Customer')

                    // Click "Received" tab
                    ->clickLink('Received')
                    ->pause(300)

                    // URL should update
                    ->assertQueryStringHas('tab', 'received')

                    // Should see received, not sent
                    ->assertDontSee('Sent Customer')
                    ->assertSee('Received Customer');
        });
    }

    /**
     * Test status filtering
     */
    public function test_status_filter_works(): void
    {
        $this->seed(\Database\Seeders\PartnerTierSeeder::class);

        $user = User::factory()->create();
        $partner = Partner::factory()->create(['user_id' => $user->id]);

        Referral::factory()->create([
            'user_id' => $user->id,
            'referring_partner_id' => $partner->id,
            'receiving_partner_id' => $partner->id,
            'customer_name' => 'Pending Customer',
            'status' => 'pending',
        ]);

        Referral::factory()->create([
            'user_id' => $user->id,
            'referring_partner_id' => $partner->id,
            'receiving_partner_id' => $partner->id,
            'customer_name' => 'Paid Customer',
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        $this->browse(function (Browser $browser) use ($user) {
            $browser->loginAs($user)
                    ->visit('/referrals')

                    // Both should be visible initially
                    ->assertSee('Pending Customer')
                    ->assertSee('Paid Customer')

                    // Select "Paid" from status filter
                    ->select('status_filter', 'Paid')
                    ->pause(300)

                    // URL should update
                    ->assertQueryStringHas('status', 'paid')

                    // Should only see paid
                    ->assertDontSee('Pending Customer')
                    ->assertSee('Paid Customer');
        });
    }

    /**
     * Test URL parameters are preserved
     */
    public function test_url_parameters_preserved_across_filters(): void
    {
        $this->seed(\Database\Seeders\PartnerTierSeeder::class);

        $user = User::factory()->create();
        $partner = Partner::factory()->create(['user_id' => $user->id]);

        Referral::factory()->count(5)->create([
            'user_id' => $user->id,
            'referring_partner_id' => $partner->id,
            'receiving_partner_id' => $partner->id,
        ]);

        $this->browse(function (Browser $browser) use ($user) {
            $browser->loginAs($user)
                    ->visit('/referrals')

                    // Apply search
                    ->type('[type="search"]', 'test')
                    ->pause(600)
                    ->assertQueryStringHas('search', 'test')

                    // Change tab - search should persist
                    ->clickLink('Sent')
                    ->pause(300)
                    ->assertQueryStringHas('tab', 'sent')
                    ->assertQueryStringHas('search', 'test')

                    // Add status filter - both should persist
                    ->select('status_filter', 'Paid')
                    ->pause(300)
                    ->assertQueryStringHas('tab', 'sent')
                    ->assertQueryStringHas('search', 'test')
                    ->assertQueryStringHas('status', 'paid');
        });
    }

    /**
     * Test filters preserve state on page refresh
     */
    public function test_filters_preserve_state_on_refresh(): void
    {
        $this->seed(\Database\Seeders\PartnerTierSeeder::class);

        $user = User::factory()->create();
        $partner = Partner::factory()->create(['user_id' => $user->id]);

        Referral::factory()->create([
            'user_id' => $user->id,
            'referring_partner_id' => $partner->id,
            'receiving_partner_id' => $partner->id,
            'customer_name' => 'John Doe',
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        $this->browse(function (Browser $browser) use ($user) {
            $browser->loginAs($user)
                    ->visit('/referrals')

                    // Apply filters
                    ->type('[type="search"]', 'John')
                    ->pause(600)
                    ->select('status_filter', 'Paid')
                    ->pause(300)

                    // Verify URL has parameters
                    ->assertQueryStringHas('search', 'John')
                    ->assertQueryStringHas('status', 'paid')

                    // Refresh page
                    ->refresh()

                    // Filters should still be applied
                    ->assertQueryStringHas('search', 'John')
                    ->assertQueryStringHas('status', 'paid')

                    // Results should still be filtered
                    ->assertSee('John Doe');
        });
    }
}
