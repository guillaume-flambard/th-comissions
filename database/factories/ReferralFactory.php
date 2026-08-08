<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Referral>
 */
class ReferralFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $serviceTypes = ['diving', 'kite_lesson', 'transfer', 'tour', 'accommodation'];
        $serviceType = $this->faker->randomElement($serviceTypes);

        $serviceAmount = match ($serviceType) {
            'diving' => $this->faker->numberBetween(3000, 12000),
            'kite_lesson' => $this->faker->numberBetween(5000, 15000),
            'accommodation' => $this->faker->numberBetween(800, 3500),
            'transfer' => $this->faker->numberBetween(400, 1500),
            'tour' => $this->faker->numberBetween(1500, 8000),
        };

        $commissionRate = $this->faker->randomFloat(2, 5, 25);
        $commissionAmount = ($serviceAmount * $commissionRate) / 100;

        return [
            'referring_partner_id' => \App\Models\Partner::factory(),
            'receiving_partner_id' => \App\Models\Partner::factory(),
            'user_id' => \App\Models\User::factory(),
            'customer_name' => $this->faker->name(),
            'customer_email' => $this->faker->safeEmail(),
            'customer_phone' => $this->faker->phoneNumber(),
            'service_type' => $serviceType,
            'service_description' => $this->faker->sentence(),
            'booking_date' => $this->faker->dateTimeBetween('-3 months', 'now'),
            'service_date' => $this->faker->dateTimeBetween('now', '+1 month'),
            'service_amount' => $serviceAmount,
            'commission_rate' => $commissionRate,
            'commission_amount' => round($commissionAmount, 2),
            'commission_type' => 'percentage',
            'status' => 'pending',
            'pms_booking_id' => $this->faker->optional()->regexify('BK[0-9]{5}'),
            'notes' => $this->faker->optional()->sentence(),
            'metadata' => null,
            'validated_at' => null,
            'paid_at' => null,
            'payment_reference' => null,
        ];
    }

    /**
     * Indicate that the referral is paid
     */
    public function paid()
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'paid',
            'validated_at' => now()->subDays(rand(3, 10)),
            'paid_at' => now()->subDays(rand(1, 7)),
            'payment_reference' => 'PAY-' . strtoupper($this->faker->bothify('??######')),
        ]);
    }

    /**
     * Indicate that the referral is validated
     */
    public function validated()
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'validated',
            'validated_at' => now()->subDays(rand(1, 5)),
        ]);
    }

    /**
     * Indicate that the referral is pending
     */
    public function pending()
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }

    /**
     * Indicate that the referral is disputed
     */
    public function disputed()
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'disputed',
            'notes' => 'Customer requested refund',
        ]);
    }

    /**
     * Indicate that the referral is cancelled
     */
    public function cancelled()
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
            'notes' => 'Customer no-show',
        ]);
    }
}
