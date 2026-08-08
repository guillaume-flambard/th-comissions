<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Commission;
use App\Models\Partner;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Commission>
 */
class CommissionFactory extends Factory
{
    protected $model = Commission::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $commissionTypes = ['booking', 'recurring', 'bonus', 'referral'];
        $statuses = ['pending', 'approved', 'paid', 'rejected', 'on_hold'];
        $calculationMethods = ['percentage', 'fixed', 'tiered'];
        $currencies = ['THB', 'USD'];
        $paymentMethods = ['bank_transfer', 'promptpay', 'stripe'];

        $currency = fake()->randomElement($currencies);
        $amount = fake()->randomFloat(2, 100, 10000);
        $exchangeRate = $currency === 'USD' ? 1.00 : 35.50;
        $amountUsd = $currency === 'USD' ? $amount : round($amount / $exchangeRate, 2);

        return [
            'partner_id' => Partner::factory(),
            'booking_id' => Booking::factory(),
            'commission_type' => fake()->randomElement($commissionTypes),
            'amount' => $amount,
            'currency' => $currency,
            'amount_usd' => $amountUsd,
            'exchange_rate' => $exchangeRate,
            'base_amount' => fake()->randomFloat(2, 1000, 100000),
            'commission_rate' => fake()->randomFloat(2, 10, 20),
            'calculation_method' => fake()->randomElement($calculationMethods),
            'status' => 'pending', // Default to pending, use state methods for other statuses
            'approved_at' => null,
            'approved_by' => null,
            'paid_at' => null,
            'paid_by' => null,
            'payment_method' => null,
            'payment_reference' => null,
            'payment_notes' => null,
            'invoice_number' => 'INV-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6)),
            'period_start' => fake()->dateTimeBetween('-60 days', '-30 days'),
            'period_end' => fake()->dateTimeBetween('-29 days', 'now'),
            'batch_id' => null,
            'notes' => fake()->optional()->sentence(),
            'metadata' => [],
        ];
    }

    /**
     * Indicate that the commission is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'approved_at' => null,
            'approved_by' => null,
            'paid_at' => null,
            'paid_by' => null,
            'payment_method' => null,
            'payment_reference' => null,
        ]);
    }

    /**
     * Indicate that the commission is approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
            'approved_at' => fake()->dateTimeBetween('-14 days', 'now'),
            'approved_by' => User::factory(),
            'paid_at' => null,
            'paid_by' => null,
        ]);
    }

    /**
     * Indicate that the commission is paid.
     */
    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'paid',
            'approved_at' => fake()->dateTimeBetween('-30 days', '-15 days'),
            'approved_by' => User::factory(),
            'paid_at' => fake()->dateTimeBetween('-14 days', 'now'),
            'paid_by' => User::factory(),
            'payment_method' => fake()->randomElement(['bank_transfer', 'promptpay', 'stripe']),
            'payment_reference' => 'PAY-' . strtoupper(Str::random(10)),
            'payment_notes' => fake()->optional()->sentence(),
        ]);
    }

    /**
     * Indicate that the commission is rejected.
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected',
            'notes' => 'Commission rejected: ' . fake()->sentence(),
        ]);
    }

    /**
     * Indicate that the commission is on hold.
     */
    public function onHold(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'on_hold',
            'notes' => 'Commission on hold: ' . fake()->sentence(),
        ]);
    }

    /**
     * Commission in THB currency
     */
    public function thb(): static
    {
        return $this->state(function (array $attributes) {
            $amount = $attributes['amount'] ?? 1500.00;
            $exchangeRate = 35.50;

            return [
                'currency' => 'THB',
                'exchange_rate' => $exchangeRate,
                'amount_usd' => round($amount / $exchangeRate, 2),
            ];
        });
    }

    /**
     * Commission in USD currency
     */
    public function usd(): static
    {
        return $this->state(function (array $attributes) {
            $amount = $attributes['amount'] ?? 100.00;

            return [
                'currency' => 'USD',
                'exchange_rate' => 1.00, // USD to USD conversion rate is 1.0
                'amount_usd' => $amount,
            ];
        });
    }

    /**
     * Commission with percentage calculation
     */
    public function percentage(): static
    {
        return $this->state(function (array $attributes) {
            $baseAmount = 10000.00;
            $rate = 15.00;

            return [
                'calculation_method' => 'percentage',
                'base_amount' => $baseAmount,
                'commission_rate' => $rate,
                'amount' => round(($baseAmount * $rate) / 100, 2),
            ];
        });
    }

    /**
     * Commission with fixed calculation
     */
    public function fixed(): static
    {
        return $this->state(function (array $attributes) {
            $fixedAmount = 500.00;

            return [
                'calculation_method' => 'fixed',
                'base_amount' => 10000.00,
                'commission_rate' => $fixedAmount,
                'amount' => $fixedAmount,
            ];
        });
    }

    /**
     * Commission in a batch
     */
    public function inBatch(): static
    {
        return $this->state(fn (array $attributes) => [
            'batch_id' => 'BATCH-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6)),
        ]);
    }

    /**
     * High-value commission
     */
    public function highValue(): static
    {
        return $this->state(function (array $attributes) {
            $amount = fake()->randomFloat(2, 5000, 50000);
            $currency = $attributes['currency'] ?? 'THB';
            $exchangeRate = $currency === 'THB' ? 35.50 : 1.00;

            return [
                'amount' => $amount,
                'amount_usd' => $currency === 'THB' ? round($amount / $exchangeRate, 2) : $amount,
            ];
        });
    }
}
