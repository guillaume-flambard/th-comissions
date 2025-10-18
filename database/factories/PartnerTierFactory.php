<?php

namespace Database\Factories;

use App\Models\PartnerTier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PartnerTier>
 */
class PartnerTierFactory extends Factory
{
    protected $model = PartnerTier::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        static $priority = 1;

        $tiers = [
            'Bronze' => ['min_plv' => 0, 'rate' => 10.00, 'color' => '#CD7F32'],
            'Silver' => ['min_plv' => 50000, 'rate' => 12.50, 'color' => '#C0C0C0'],
            'Gold' => ['min_plv' => 150000, 'rate' => 15.00, 'color' => '#FFD700'],
            'Platinum' => ['min_plv' => 500000, 'rate' => 18.00, 'color' => '#E5E4E2'],
        ];

        $tierName = fake()->randomElement(array_keys($tiers));
        $tierData = $tiers[$tierName];

        return [
            'name' => $tierName,
            'slug' => strtolower($tierName),
            'description' => "The {$tierName} tier for partners generating significant value.",
            'min_plv' => $tierData['min_plv'],
            'commission_rate' => $tierData['rate'],
            'benefits' => [
                'priority_support',
                'marketing_materials',
                'dedicated_account_manager',
            ],
            'color' => $tierData['color'],
            'priority' => $priority++,
        ];
    }

    /**
     * Bronze tier
     */
    public function bronze(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Bronze',
            'slug' => 'bronze',
            'min_plv' => 0,
            'commission_rate' => 10.00,
            'color' => '#CD7F32',
            'priority' => 1,
        ]);
    }

    /**
     * Silver tier
     */
    public function silver(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Silver',
            'slug' => 'silver',
            'min_plv' => 50000,
            'commission_rate' => 12.50,
            'color' => '#C0C0C0',
            'priority' => 2,
        ]);
    }

    /**
     * Gold tier
     */
    public function gold(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Gold',
            'slug' => 'gold',
            'min_plv' => 150000,
            'commission_rate' => 15.00,
            'color' => '#FFD700',
            'priority' => 3,
        ]);
    }

    /**
     * Platinum tier
     */
    public function platinum(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Platinum',
            'slug' => 'platinum',
            'min_plv' => 500000,
            'commission_rate' => 18.00,
            'color' => '#E5E4E2',
            'priority' => 4,
        ]);
    }
}
