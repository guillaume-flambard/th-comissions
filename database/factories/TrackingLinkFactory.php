<?php

namespace Database\Factories;

use App\Models\Partner;
use App\Models\TrackingLink;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TrackingLink>
 */
class TrackingLinkFactory extends Factory
{
    protected $model = TrackingLink::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $linkTypes = ['qr_code', 'short_link', 'email', 'social_media', 'website'];
        $utmMediums = ['qr', 'email', 'social', 'referral', 'partner'];
        $utmCampaigns = ['summer_2025', 'q1_promo', 'partnership', 'grand_opening', 'flash_sale'];

        return [
            'partner_id' => Partner::factory(),
            'unique_code' => strtoupper(Str::random(6)),
            'utm_source' => null, // Will be auto-populated from partner
            'utm_medium' => fake()->randomElement($utmMediums),
            'utm_campaign' => fake()->optional()->randomElement($utmCampaigns),
            'utm_content' => fake()->optional()->word(),
            'link_type' => fake()->randomElement($linkTypes),
            'target_url' => fake()->optional()->url(),
            'description' => fake()->optional()->sentence(),
            'qr_code_path' => null,
            'clicks' => 0,
            'conversions' => 0,
            'conversion_rate' => 0,
            'total_revenue' => 0,
            'last_clicked_at' => null,
            'is_active' => true,
            'expires_at' => null,
        ];
    }

    /**
     * Indicate that the link is a QR code.
     */
    public function qrCode(): static
    {
        return $this->state(fn (array $attributes) => [
            'link_type' => 'qr_code',
            'utm_medium' => 'qr',
            'qr_code_path' => 'qr-codes/' . strtoupper(Str::random(6)) . '.png',
        ]);
    }

    /**
     * Indicate that the link has tracking data.
     */
    public function withTracking(): static
    {
        $clicks = fake()->numberBetween(10, 1000);
        $conversions = fake()->numberBetween(1, (int)($clicks * 0.3));

        return $this->state(fn (array $attributes) => [
            'clicks' => $clicks,
            'conversions' => $conversions,
            'conversion_rate' => ($conversions / $clicks) * 100,
            'total_revenue' => fake()->randomFloat(2, 1000, 100000),
            'last_clicked_at' => fake()->dateTimeBetween('-30 days', 'now'),
        ]);
    }

    /**
     * Indicate that the link is expired.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'expires_at' => fake()->dateTimeBetween('-30 days', '-1 day'),
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the link has an expiration date in the future.
     */
    public function withExpiration(): static
    {
        return $this->state(fn (array $attributes) => [
            'expires_at' => fake()->dateTimeBetween('now', '+90 days'),
        ]);
    }

    /**
     * Indicate that the link is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Short link for social media sharing
     */
    public function socialMedia(): static
    {
        return $this->state(fn (array $attributes) => [
            'link_type' => 'social_media',
            'utm_medium' => 'social',
            'utm_campaign' => 'social_campaign',
        ]);
    }

    /**
     * Email campaign link
     */
    public function email(): static
    {
        return $this->state(fn (array $attributes) => [
            'link_type' => 'email',
            'utm_medium' => 'email',
            'utm_campaign' => 'newsletter',
        ]);
    }
}
