<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Partner;
use App\Models\TrackingLink;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Booking>
 */
class BookingFactory extends Factory
{
    protected $model = Booking::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $serviceTypes = ['tour', 'hotel', 'activity', 'transportation', 'package'];
        $serviceNames = [
            'Bangkok City Tour',
            'Phi Phi Island Day Trip',
            'Elephant Sanctuary Visit',
            'Thai Cooking Class',
            'Night Market Food Tour',
            'Chiang Mai Temple Tour',
            'Krabi Rock Climbing',
            'Ayutthaya Historical Tour',
            'Floating Market Experience',
            'Full Moon Party Package',
        ];
        $statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        $countries = ['United States', 'United Kingdom', 'Australia', 'Germany', 'France', 'Japan', 'China', 'Singapore'];
        $currencies = ['THB', 'USD'];
        $commissionStructures = ['percentage', 'fixed'];

        $amount = fake()->randomFloat(2, 1000, 100000);
        $commissionRate = fake()->randomFloat(2, 10, 20);
        $currency = fake()->randomElement($currencies);
        $structure = fake()->randomElement($commissionStructures);

        return [
            'partner_id' => Partner::factory(),
            'tracking_link_id' => TrackingLink::factory(),
            'utm_source' => fake()->optional()->slug(),
            'utm_medium' => fake()->optional()->randomElement(['qr', 'email', 'social', 'referral']),
            'utm_campaign' => fake()->optional()->slug(),
            'utm_content' => fake()->optional()->word(),
            'utm_term' => fake()->optional()->word(),
            'referrer_url' => fake()->optional()->url(),
            'customer_name' => fake()->name(),
            'customer_email' => fake()->safeEmail(),
            'customer_phone' => fake()->phoneNumber(),
            'customer_country' => fake()->randomElement($countries),
            'booking_reference' => 'BK' . now()->format('Ymd') . strtoupper(Str::random(6)),
            'service_type' => fake()->randomElement($serviceTypes),
            'service_name' => fake()->randomElement($serviceNames),
            'service_description' => fake()->optional()->sentence(),
            'booking_date' => now(),
            'service_date' => fake()->dateTimeBetween('now', '+60 days'),
            'service_end_date' => fake()->optional()->dateTimeBetween('+1 day', '+65 days'),
            'quantity' => fake()->numberBetween(1, 10),
            'currency' => $currency,
            'amount' => $amount,
            'commission_rate' => $commissionRate,
            'commission_amount' => null, // Let model calculate
            'commission_structure' => $structure,
            'status' => 'pending', // Default to pending, use state methods for other statuses
            'confirmed_at' => null,
            'completed_at' => null,
            'cancelled_at' => null,
            'cancellation_reason' => null,
            'is_repeat_customer' => fake()->boolean(20),
            'customer_satisfaction_score' => null,
            'customer_lifetime_value' => fake()->randomFloat(2, 0, 50000),
            'metadata' => [],
            'notes' => fake()->optional()->sentence(),
        ];
    }

    /**
     * Indicate that the booking is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'confirmed_at' => null,
            'completed_at' => null,
            'cancelled_at' => null,
        ]);
    }

    /**
     * Indicate that the booking is confirmed.
     */
    public function confirmed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'confirmed',
            'confirmed_at' => now(),
            'completed_at' => null,
            'cancelled_at' => null,
        ]);
    }

    /**
     * Indicate that the booking is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'confirmed_at' => fake()->dateTimeBetween('-30 days', '-15 days'),
            'completed_at' => fake()->dateTimeBetween('-14 days', 'now'),
            'cancelled_at' => null,
            'customer_satisfaction_score' => fake()->numberBetween(1, 5),
        ]);
    }

    /**
     * Indicate that the booking is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
            'cancelled_at' => fake()->dateTimeBetween('-7 days', 'now'),
            'cancellation_reason' => fake()->sentence(),
            'confirmed_at' => null,
            'completed_at' => null,
        ]);
    }

    /**
     * Booking with percentage commission structure
     */
    public function withPercentageCommission(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'commission_structure' => 'percentage',
                'commission_amount' => null, // Let model calculate
            ];
        });
    }

    /**
     * Booking with fixed commission
     */
    public function withFixedCommission(): static
    {
        return $this->state(function (array $attributes) {
            $fixedAmount = 500.00;

            return [
                'commission_structure' => 'fixed',
                'commission_rate' => $fixedAmount,
                'commission_amount' => null, // Let model calculate
            ];
        });
    }

    /**
     * Booking in THB currency
     */
    public function thb(): static
    {
        return $this->state(fn (array $attributes) => [
            'currency' => 'THB',
        ]);
    }

    /**
     * Booking in USD currency
     */
    public function usd(): static
    {
        return $this->state(fn (array $attributes) => [
            'currency' => 'USD',
        ]);
    }

    /**
     * High-value booking
     */
    public function highValue(): static
    {
        return $this->state(function (array $attributes) {
            $amount = fake()->randomFloat(2, 50000, 200000);

            return [
                'amount' => $amount,
                'commission_amount' => null, // Let model calculate
            ];
        });
    }
}
