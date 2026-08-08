<?php

namespace Database\Factories;

use App\Models\Partner;
use App\Models\PartnerTier;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Partner>
 */
class PartnerFactory extends Factory
{
    protected $model = Partner::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Realistic Thai business names
        $thaiBusinessNames = [
            'Siam Travel Agency',
            'Amazing Thailand Tours',
            'Bangkok Explorer Co., Ltd.',
            'Chiang Mai Adventures',
            'Phuket Paradise Travel',
            'Krabi Beach Tours',
            'Ayutthaya Heritage Co.',
            'Pattaya Fun Tours',
            'Koh Samui Travel Hub',
            'Hua Hin Getaways',
            'Thai Culture Experiences',
            'Isaan Discovery Tours',
            'Golden Triangle Travel',
            'Sukhothai Historical Tours',
            'Railay Rock Climbing Adventures',
        ];

        $businessTypes = ['travel_agency', 'tour_operator', 'hotel', 'activity_provider', 'transportation'];
        $commissionStructure = fake()->randomElement(['percentage', 'fixed', 'tiered']);
        $paymentMethods = ['bank_transfer', 'promptpay', 'stripe'];
        $currencies = ['THB', 'USD'];

        // Set commission fields based on structure
        $commissionData = match($commissionStructure) {
            'percentage' => [
                'default_commission_rate' => fake()->randomFloat(2, 10, 20),
                'fixed_commission_amount' => null,
                'tiered_commission_rules' => null,
            ],
            'fixed' => [
                'default_commission_rate' => 0, // Set to 0 instead of null for NOT NULL constraint
                'fixed_commission_amount' => 500.00,
                'tiered_commission_rules' => null,
            ],
            'tiered' => [
                'default_commission_rate' => 0, // Set to 0 instead of null for NOT NULL constraint
                'fixed_commission_amount' => null,
                'tiered_commission_rules' => [
                    ['min_amount' => 0, 'max_amount' => 10000, 'rate' => 10.00],
                    ['min_amount' => 10001, 'max_amount' => 50000, 'rate' => 15.00],
                    ['min_amount' => 50001, 'max_amount' => null, 'rate' => 20.00],
                ],
            ],
        };

        return [
            'user_id' => User::factory(),
            'partner_tier_id' => PartnerTier::inRandomOrder()->first()?->id ?? null,
            'business_name' => fake()->randomElement($thaiBusinessNames),
            'business_type' => fake()->randomElement($businessTypes),
            'contact_name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => '+66' . fake()->numerify('##########'),
            'address' => fake()->streetAddress(),
            'city' => fake()->randomElement(['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya', 'Krabi', 'Koh Samui']),
            'country' => 'Thailand',
            'website' => fake()->optional()->url(),
            'commission_structure' => $commissionStructure,
            ...$commissionData,
            'payment_method' => fake()->randomElement($paymentMethods),
            'payment_currency' => fake()->randomElement($currencies),
            'stripe_account_id' => null,
            'promptpay_id' => null,
            'bank_name' => fake()->randomElement(['Bangkok Bank', 'Kasikorn Bank', 'Siam Commercial Bank', 'Krungsri Bank']),
            'bank_account_number' => fake()->numerify('##########'),
            'bank_account_name' => fake()->company(),
            'total_revenue_generated' => 0,
            'total_commissions_paid' => 0,
            'calculated_plv' => 0,
            'engagement_score' => 0,
            'total_referrals' => 0,
            'successful_conversions' => 0,
            'conversion_rate' => 0,
            'last_referral_at' => null,
            'joined_at' => fake()->dateTimeBetween('-2 years', 'now'),
            'is_active' => true,
            'notes' => fake()->optional()->sentence(),
            'metadata' => [],
        ];
    }

    /**
     * Indicate that the partner uses percentage commission structure.
     */
    public function percentage(): static
    {
        return $this->state(fn (array $attributes) => [
            'commission_structure' => 'percentage',
            'default_commission_rate' => 15.00,
            'fixed_commission_amount' => null,
            'tiered_commission_rules' => null,
        ]);
    }

    /**
     * Indicate that the partner uses fixed commission structure.
     */
    public function fixed(): static
    {
        return $this->state(fn (array $attributes) => [
            'commission_structure' => 'fixed',
            'default_commission_rate' => 0, // Set to 0 for NOT NULL constraint
            'fixed_commission_amount' => 500.00,
            'tiered_commission_rules' => null,
        ]);
    }

    /**
     * Indicate that the partner uses tiered commission structure.
     */
    public function tiered(): static
    {
        return $this->state(fn (array $attributes) => [
            'commission_structure' => 'tiered',
            'default_commission_rate' => 0, // Set to 0 for NOT NULL constraint
            'fixed_commission_amount' => null,
            'tiered_commission_rules' => [
                ['min_amount' => 0, 'max_amount' => 10000, 'rate' => 10.00],
                ['min_amount' => 10001, 'max_amount' => 50000, 'rate' => 15.00],
                ['min_amount' => 50001, 'max_amount' => null, 'rate' => 20.00],
            ],
        ]);
    }

    /**
     * Indicate that the partner is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the partner uses PromptPay.
     */
    public function withPromptPay(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_method' => 'promptpay',
            'promptpay_id' => fake()->numerify('##########'),
        ]);
    }

    /**
     * Indicate that the partner uses Stripe.
     */
    public function withStripe(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_method' => 'stripe',
            'stripe_account_id' => 'acct_' . fake()->uuid(),
        ]);
    }

    /**
     * Partner with active referrals and metrics
     */
    public function withMetrics(): static
    {
        return $this->state(fn (array $attributes) => [
            'total_revenue_generated' => fake()->randomFloat(2, 10000, 500000),
            'total_commissions_paid' => fake()->randomFloat(2, 1000, 50000),
            'calculated_plv' => fake()->randomFloat(2, 50000, 1000000),
            'engagement_score' => fake()->randomFloat(2, 30, 100),
            'total_referrals' => fake()->numberBetween(10, 500),
            'successful_conversions' => fake()->numberBetween(5, 400),
            'conversion_rate' => fake()->randomFloat(2, 20, 95),
            'last_referral_at' => fake()->dateTimeBetween('-30 days', 'now'),
        ]);
    }

    /**
     * Partner at risk of churning
     */
    public function atRisk(): static
    {
        return $this->state(fn (array $attributes) => [
            'last_referral_at' => fake()->dateTimeBetween('-180 days', '-91 days'),
            'engagement_score' => fake()->randomFloat(2, 0, 25),
        ]);
    }
}
