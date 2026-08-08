<?php

namespace Tests\Browser;

use App\Models\Partner;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class PartnerManagementTest extends DuskTestCase
{
    use DatabaseMigrations;

    /**
     * Test partner management page loads
     */
    public function test_partner_management_page_loads(): void
    {
        $this->seed(\Database\Seeders\PartnerTierSeeder::class);

        $user = User::factory()->create();

        $this->browse(function (Browser $browser) use ($user) {
            $browser->loginAs($user)
                    ->visit('/admin/partners')
                    ->assertSee('Partner Management')
                    ->assertSee('Add Partner');
        });
    }

    /**
     * Test can create new partner
     */
    public function test_can_create_new_partner(): void
    {
        $this->seed(\Database\Seeders\PartnerTierSeeder::class);

        $user = User::factory()->create();

        $this->browse(function (Browser $browser) use ($user) {
            $browser->loginAs($user)
                    ->visit('/admin/partners/create')

                    // Fill business information
                    ->type('business_name', 'Crystal Dive Shop')
                    ->select('business_type', 'dive_shop')
                    ->type('contact_person', 'John Doe')
                    ->type('email', 'john@crystaldive.com')
                    ->type('phone', '+66 98 765 4321')

                    // Fill commission information
                    ->type('default_commission_rate', '15')

                    // Submit form
                    ->press('Create Partner')

                    // Should redirect to partners list
                    ->assertPathIs('/admin/partners')

                    // Should see new partner
                    ->assertSee('Crystal Dive Shop');
        });

        // Verify partner was created in database
        $this->assertDatabaseHas('partners', [
            'business_name' => 'Crystal Dive Shop',
            'business_type' => 'dive_shop',
            'email' => 'john@crystaldive.com',
            'default_commission_rate' => 15,
        ]);
    }

    /**
     * Test partner creation validates required fields
     */
    public function test_partner_creation_validates_required_fields(): void
    {
        $user = User::factory()->create();

        $this->browse(function (Browser $browser) use ($user) {
            $browser->loginAs($user)
                    ->visit('/admin/partners/create')

                    // Try to submit without filling anything
                    ->press('Create Partner')

                    // Should stay on same page
                    ->assertPathIs('/admin/partners/create')

                    // Should see validation errors
                    ->assertPresent('.text-destructive');
        });
    }

    /**
     * Test can search partners
     */
    public function test_can_search_partners(): void
    {
        $this->seed(\Database\Seeders\PartnerTierSeeder::class);

        $user = User::factory()->create();
        Partner::factory()->create([
            'user_id' => $user->id,
            'business_name' => 'Crystal Dive',
        ]);
        Partner::factory()->create([
            'user_id' => $user->id,
            'business_name' => 'Big Blue Diving',
        ]);

        $this->browse(function (Browser $browser) use ($user) {
            $browser->loginAs($user)
                    ->visit('/admin/partners')

                    // Both should be visible initially
                    ->assertSee('Crystal Dive')
                    ->assertSee('Big Blue Diving')

                    // Search for specific partner
                    ->type('[type="search"]', 'Crystal')
                    ->pause(600) // Wait for debounce

                    // Should see only matching partner
                    ->assertSee('Crystal Dive')
                    ->assertDontSee('Big Blue Diving');
        });
    }

    /**
     * Test can view partner details
     */
    public function test_can_view_partner_details(): void
    {
        $this->seed(\Database\Seeders\PartnerTierSeeder::class);

        $user = User::factory()->create();
        $partner = Partner::factory()->create([
            'user_id' => $user->id,
            'business_name' => 'Crystal Dive',
            'contact_person' => 'John Doe',
            'email' => 'john@crystaldive.com',
            'default_commission_rate' => 15,
        ]);

        $this->browse(function (Browser $browser) use ($user, $partner) {
            $browser->loginAs($user)
                    ->visit('/admin/partners')

                    // Click on partner to view details
                    ->clickLink('Crystal Dive')

                    // Should be on detail page
                    ->assertPathIs("/admin/partners/{$partner->id}")

                    // Should see all partner information
                    ->assertSee('Crystal Dive')
                    ->assertSee('John Doe')
                    ->assertSee('john@crystaldive.com')
                    ->assertSee('15');
        });
    }

    /**
     * Test can edit partner
     */
    public function test_can_edit_partner(): void
    {
        $this->seed(\Database\Seeders\PartnerTierSeeder::class);

        $user = User::factory()->create();
        $partner = Partner::factory()->create([
            'user_id' => $user->id,
            'business_name' => 'Crystal Dive',
            'default_commission_rate' => 15,
        ]);

        $this->browse(function (Browser $browser) use ($user, $partner) {
            $browser->loginAs($user)
                    ->visit("/admin/partners/{$partner->id}/edit")

                    // Update business name
                    ->clear('business_name')
                    ->type('business_name', 'Crystal Dive Resort')

                    // Update commission rate
                    ->clear('default_commission_rate')
                    ->type('default_commission_rate', '20')

                    // Submit form
                    ->press('Update Partner')

                    // Should redirect to detail page
                    ->assertPathIs("/admin/partners/{$partner->id}")

                    // Should see updated information
                    ->assertSee('Crystal Dive Resort')
                    ->assertSee('20');
        });

        // Verify changes in database
        $this->assertDatabaseHas('partners', [
            'id' => $partner->id,
            'business_name' => 'Crystal Dive Resort',
            'default_commission_rate' => 20,
        ]);
    }

    /**
     * Test can delete partner
     */
    public function test_can_delete_partner(): void
    {
        $this->seed(\Database\Seeders\PartnerTierSeeder::class);

        $user = User::factory()->create();
        $partner = Partner::factory()->create([
            'user_id' => $user->id,
            'business_name' => 'Test Partner',
        ]);

        $this->browse(function (Browser $browser) use ($user, $partner) {
            $browser->loginAs($user)
                    ->visit("/admin/partners/{$partner->id}")

                    // Click delete button
                    ->press('Delete')

                    // Confirm deletion (if there's a confirmation dialog)
                    ->pause(500)

                    // Should redirect to partners list
                    ->assertPathIs('/admin/partners')

                    // Should not see deleted partner
                    ->assertDontSee('Test Partner');
        });

        // Verify partner was deleted
        $this->assertDatabaseMissing('partners', [
            'id' => $partner->id,
        ]);
    }

    /**
     * Test partner list shows statistics
     */
    public function test_partner_list_shows_statistics(): void
    {
        $this->seed(\Database\Seeders\PartnerTierSeeder::class);

        $user = User::factory()->create();
        $partner = Partner::factory()->create([
            'user_id' => $user->id,
            'business_name' => 'Crystal Dive',
            'calculated_plv' => 100000,
        ]);

        $this->browse(function (Browser $browser) use ($user) {
            $browser->loginAs($user)
                    ->visit('/admin/partners')

                    // Should see partner statistics
                    ->assertSee('Crystal Dive')
                    ->assertSee('฿100,000'); // PLV
        });
    }

    /**
     * Test can toggle partner active status
     */
    public function test_can_toggle_partner_active_status(): void
    {
        $this->seed(\Database\Seeders\PartnerTierSeeder::class);

        $user = User::factory()->create();
        $partner = Partner::factory()->create([
            'user_id' => $user->id,
            'business_name' => 'Crystal Dive',
            'is_active' => true,
        ]);

        $this->browse(function (Browser $browser) use ($user, $partner) {
            $browser->loginAs($user)
                    ->visit("/admin/partners/{$partner->id}/edit")

                    // Uncheck active status
                    ->uncheck('is_active')

                    // Submit form
                    ->press('Update Partner')

                    // Should redirect to detail page
                    ->assertPathIs("/admin/partners/{$partner->id}");
        });

        // Verify status was changed
        $this->assertDatabaseHas('partners', [
            'id' => $partner->id,
            'is_active' => false,
        ]);
    }

    /**
     * Test partner validation for email format
     */
    public function test_partner_validates_email_format(): void
    {
        $user = User::factory()->create();

        $this->browse(function (Browser $browser) use ($user) {
            $browser->loginAs($user)
                    ->visit('/admin/partners/create')

                    ->type('business_name', 'Test Partner')
                    ->type('email', 'invalid-email') // Invalid email
                    ->type('default_commission_rate', '15')

                    ->press('Create Partner')

                    // Should stay on create page
                    ->assertPathIs('/admin/partners/create')

                    // Should see validation error
                    ->assertPresent('.text-destructive');
        });
    }

    /**
     * Test partner validation for commission rate range
     */
    public function test_partner_validates_commission_rate_range(): void
    {
        $user = User::factory()->create();

        $this->browse(function (Browser $browser) use ($user) {
            $browser->loginAs($user)
                    ->visit('/admin/partners/create')

                    ->type('business_name', 'Test Partner')
                    ->type('email', 'test@example.com')
                    ->type('default_commission_rate', '150') // Over 100%

                    ->press('Create Partner')

                    // Should stay on create page with error
                    ->assertPathIs('/admin/partners/create')
                    ->assertPresent('.text-destructive');
        });
    }

    /**
     * Test can navigate between partner pages
     */
    public function test_can_navigate_between_partner_pages(): void
    {
        $this->seed(\Database\Seeders\PartnerTierSeeder::class);

        $user = User::factory()->create();
        $partner = Partner::factory()->create(['user_id' => $user->id]);

        $this->browse(function (Browser $browser) use ($user, $partner) {
            $browser->loginAs($user)
                    ->visit('/dashboard')

                    // Go to partners list
                    ->clickLink('Partners')
                    ->assertPathIs('/admin/partners')

                    // Go to create partner
                    ->clickLink('Add Partner')
                    ->assertPathIs('/admin/partners/create')

                    // Back to list
                    ->visit('/admin/partners')

                    // View partner details
                    ->visit("/admin/partners/{$partner->id}")
                    ->assertPathIs("/admin/partners/{$partner->id}")

                    // Go to edit
                    ->press('Edit')
                    ->assertPathIs("/admin/partners/{$partner->id}/edit");
        });
    }

    /**
     * Test partner pagination
     */
    public function test_partner_list_is_paginated(): void
    {
        $this->seed(\Database\Seeders\PartnerTierSeeder::class);

        $user = User::factory()->create();

        // Create 15 partners
        Partner::factory()->count(15)->create(['user_id' => $user->id]);

        $this->browse(function (Browser $browser) use ($user) {
            $browser->loginAs($user)
                    ->visit('/admin/partners')

                    // Should see pagination if more than 10 partners
                    ->assertPresent('.pagination, [role="navigation"]');
        });
    }
}
