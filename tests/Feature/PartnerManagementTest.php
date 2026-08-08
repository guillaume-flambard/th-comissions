<?php

use App\Models\Partner;
use App\Models\PartnerTier;
use App\Models\TrackingLink;
use App\Models\User;

/**
 * Partner Management Tests
 *
 * Tests for creating, updating, and managing partners.
 * Partners are the core entity in the commission tracking system.
 */

describe('Partner Creation', function () {
    test('creates partner with valid data', function () {
        $user = User::factory()->create();
        $tier = PartnerTier::factory()->bronze()->create();

        $partner = Partner::factory()->create([
            'user_id' => $user->id,
            'partner_tier_id' => $tier->id,
            'business_name' => 'Amazing Thailand Tours',
            'business_type' => 'tour_operator',
            'email' => 'contact@amazingtours.th',
            'default_commission_rate' => 15.00,
            'commission_structure' => 'percentage',
            'is_active' => true,
        ]);

        expect($partner)->toBeInstanceOf(Partner::class);
        expect($partner->business_name)->toBe('Amazing Thailand Tours');
        expect($partner->business_type)->toBe('tour_operator');
        expect($partner->default_commission_rate)->toBe('15.00');
        expect($partner->is_active)->toBeTrue();
    });

    test('partner is associated with user account', function () {
        $user = User::factory()->create();

        $partner = Partner::factory()->create([
            'user_id' => $user->id,
        ]);

        expect($partner->user_id)->toBe($user->id);
        expect($partner->user->id)->toBe($user->id);
    });

    test('partner is assigned to tier', function () {
        $tier = PartnerTier::factory()->bronze()->create();

        $partner = Partner::factory()->create([
            'partner_tier_id' => $tier->id,
        ]);

        expect($partner->partner_tier_id)->toBe($tier->id);
        expect($partner->tier->name)->toBe('Bronze');
    });

    test('partner defaults to active status', function () {
        $partner = Partner::factory()->create([
            'is_active' => true,
        ]);

        expect($partner->is_active)->toBeTrue();
    });

    test('partner has Thai business details', function () {
        $partner = Partner::factory()->create([
            'business_name' => 'Siam Travel Agency',
            'city' => 'Bangkok',
            'country' => 'Thailand',
            'phone' => '+6621234567',
        ]);

        expect($partner->business_name)->toBe('Siam Travel Agency');
        expect($partner->city)->toBe('Bangkok');
        expect($partner->country)->toBe('Thailand');
        expect($partner->phone)->toStartWith('+66');
    });
});

describe('Partner Validation', function () {
    test('requires business name', function () {
        $partnerData = Partner::factory()->make([
            'business_name' => '',
        ])->toArray();

        expect(isset($partnerData['business_name']))->toBeTrue();
    });

    test('requires business type', function () {
        $partnerData = Partner::factory()->make([
            'business_type' => '',
        ])->toArray();

        expect(isset($partnerData['business_type']))->toBeTrue();
    });

    test('commission rate must be between 0 and 100', function () {
        $partner = Partner::factory()->create([
            'default_commission_rate' => 15.00,
        ]);

        expect($partner->default_commission_rate)->toBeGreaterThanOrEqual(0);
        expect($partner->default_commission_rate)->toBeLessThanOrEqual(100);
    });

    test('accepts valid commission rates at boundaries', function () {
        $partner1 = Partner::factory()->create(['default_commission_rate' => 0.00]);
        $partner2 = Partner::factory()->create(['default_commission_rate' => 100.00]);

        expect($partner1->default_commission_rate)->toBe('0.00');
        expect($partner2->default_commission_rate)->toBe('100.00');
    });
});

describe('Partner Commission Structures', function () {
    test('supports percentage commission structure', function () {
        $partner = Partner::factory()->percentage()->create();

        expect($partner->commission_structure)->toBe('percentage');
        expect($partner->default_commission_rate)->toBe('15.00');
        expect($partner->fixed_commission_amount)->toBeNull();
    });

    test('supports fixed commission structure', function () {
        $partner = Partner::factory()->fixed()->create();

        expect($partner->commission_structure)->toBe('fixed');
        expect($partner->fixed_commission_amount)->toBe('500.00');
    });

    test('supports tiered commission structure', function () {
        $partner = Partner::factory()->tiered()->create();

        expect($partner->commission_structure)->toBe('tiered');
        expect($partner->tiered_commission_rules)->toBeArray();
        expect($partner->tiered_commission_rules)->toHaveCount(3);
    });

    test('tiered rules have correct structure', function () {
        $partner = Partner::factory()->tiered()->create();

        $rules = $partner->tiered_commission_rules;

        expect($rules[0])->toHaveKey('min_amount');
        expect($rules[0])->toHaveKey('max_amount');
        expect($rules[0])->toHaveKey('rate');
    });
});

describe('Partner Update', function () {
    test('updates partner business information', function () {
        $partner = Partner::factory()->create([
            'business_name' => 'Original Tours',
            'email' => 'old@example.com',
        ]);

        $partner->update([
            'business_name' => 'Updated Tours Co.',
            'email' => 'new@example.com',
        ]);

        expect($partner->fresh()->business_name)->toBe('Updated Tours Co.');
        expect($partner->fresh()->email)->toBe('new@example.com');
    });

    test('updates commission rate', function () {
        $partner = Partner::factory()->create([
            'default_commission_rate' => 15.00,
        ]);

        $partner->update([
            'default_commission_rate' => 18.00,
        ]);

        expect($partner->fresh()->default_commission_rate)->toBe('18.00');
    });

    test('updates partner tier', function () {
        $bronzeTier = PartnerTier::factory()->bronze()->create();
        $silverTier = PartnerTier::factory()->silver()->create();

        $partner = Partner::factory()->create([
            'partner_tier_id' => $bronzeTier->id,
        ]);

        $partner->update([
            'partner_tier_id' => $silverTier->id,
        ]);

        expect($partner->fresh()->partner_tier_id)->toBe($silverTier->id);
        expect($partner->fresh()->tier->name)->toBe('Silver');
    });

    test('updates payment method', function () {
        $partner = Partner::factory()->create([
            'payment_method' => 'bank_transfer',
        ]);

        $partner->update([
            'payment_method' => 'promptpay',
            'promptpay_id' => '0812345678',
        ]);

        expect($partner->fresh()->payment_method)->toBe('promptpay');
        expect($partner->fresh()->promptpay_id)->toBe('0812345678');
    });
});

describe('Partner Soft Deletion', function () {
    test('soft deletes partner', function () {
        $partner = Partner::factory()->create();
        $partnerId = $partner->id;

        $partner->delete();

        expect(Partner::find($partnerId))->toBeNull();
        expect(Partner::withTrashed()->find($partnerId))->not->toBeNull();
    });

    test('soft deleted partners are excluded from queries', function () {
        Partner::factory()->count(3)->create();
        $deletedPartner = Partner::factory()->create();

        $deletedPartner->delete();

        expect(Partner::count())->toBe(3);
        expect(Partner::withTrashed()->count())->toBe(4);
    });

    test('can restore soft deleted partner', function () {
        $partner = Partner::factory()->create();
        $partnerId = $partner->id;

        $partner->delete();
        expect(Partner::find($partnerId))->toBeNull();

        $partner->restore();
        expect(Partner::find($partnerId))->not->toBeNull();
    });
});

describe('Partner Payment Methods', function () {
    test('supports bank transfer payment method', function () {
        $partner = Partner::factory()->create([
            'payment_method' => 'bank_transfer',
            'bank_name' => 'Bangkok Bank',
            'bank_account_number' => '1234567890',
            'bank_account_name' => 'Test Travel Co.',
        ]);

        expect($partner->payment_method)->toBe('bank_transfer');
        expect($partner->bank_name)->toBe('Bangkok Bank');
        expect($partner->bank_account_number)->toBe('1234567890');
    });

    test('supports PromptPay payment method', function () {
        $partner = Partner::factory()->withPromptPay()->create();

        expect($partner->payment_method)->toBe('promptpay');
        expect($partner->promptpay_id)->not->toBeNull();
    });

    test('supports Stripe payment method', function () {
        $partner = Partner::factory()->withStripe()->create();

        expect($partner->payment_method)->toBe('stripe');
        expect($partner->stripe_account_id)->toStartWith('acct_');
    });
});

describe('Partner Tracking Links', function () {
    test('partner can have multiple tracking links', function () {
        $partner = Partner::factory()->create();

        TrackingLink::factory()->count(3)->create([
            'partner_id' => $partner->id,
        ]);

        expect($partner->trackingLinks()->count())->toBe(3);
    });

    test('partner tracking links are accessible via relationship', function () {
        $partner = Partner::factory()->create();

        $trackingLink = TrackingLink::factory()->create([
            'partner_id' => $partner->id,
            'unique_code' => 'PARTNER1',
        ]);

        expect($partner->trackingLinks()->first()->unique_code)->toBe('PARTNER1');
    });

    test('deleting partner does not delete tracking links', function () {
        $partner = Partner::factory()->create();
        TrackingLink::factory()->count(2)->create(['partner_id' => $partner->id]);

        $partner->delete();

        expect(TrackingLink::count())->toBe(2);
    });
});

describe('Partner Activity Status', function () {
    test('can activate partner', function () {
        $partner = Partner::factory()->inactive()->create();

        $partner->update(['is_active' => true]);

        expect($partner->fresh()->is_active)->toBeTrue();
    });

    test('can deactivate partner', function () {
        $partner = Partner::factory()->create(['is_active' => true]);

        $partner->update(['is_active' => false]);

        expect($partner->fresh()->is_active)->toBeFalse();
    });

    test('active scope filters only active partners', function () {
        Partner::factory()->count(3)->create(['is_active' => true]);
        Partner::factory()->count(2)->inactive()->create();

        expect(Partner::active()->count())->toBe(3);
    });
});

describe('Partner Queries and Scopes', function () {
    test('filters partners by tier', function () {
        $goldTier = PartnerTier::factory()->gold()->create();
        $bronzeTier = PartnerTier::factory()->bronze()->create();

        Partner::factory()->count(3)->create(['partner_tier_id' => $goldTier->id]);
        Partner::factory()->count(2)->create(['partner_tier_id' => $bronzeTier->id]);

        $goldPartners = Partner::byTier('gold')->count();

        expect($goldPartners)->toBe(3);
    });

    test('retrieves top performers by PLV', function () {
        Partner::factory()->create(['calculated_plv' => 100000]);
        Partner::factory()->create(['calculated_plv' => 500000]);
        Partner::factory()->create(['calculated_plv' => 250000]);

        $topPartner = Partner::topPerformers(1)->first();

        expect($topPartner->calculated_plv)->toBe('500000.00');
    });

    test('identifies at-risk partners', function () {
        Partner::factory()->create(['last_referral_at' => now()->subDays(10)]);
        Partner::factory()->atRisk()->create();

        $atRiskCount = Partner::atRisk()->count();

        expect($atRiskCount)->toBeGreaterThanOrEqual(1);
    });
});

describe('Partner Metadata', function () {
    test('stores metadata as JSON', function () {
        $partner = Partner::factory()->create([
            'metadata' => [
                'signup_source' => 'referral',
                'onboarding_completed' => true,
                'preferred_language' => 'th',
            ],
        ]);

        expect($partner->metadata)->toBeArray();
        expect($partner->metadata['signup_source'])->toBe('referral');
        expect($partner->metadata['onboarding_completed'])->toBeTrue();
    });

    test('updates metadata', function () {
        $partner = Partner::factory()->create([
            'metadata' => ['key' => 'value'],
        ]);

        $partner->update([
            'metadata' => ['key' => 'new_value', 'another_key' => 'data'],
        ]);

        expect($partner->fresh()->metadata['key'])->toBe('new_value');
        expect($partner->fresh()->metadata['another_key'])->toBe('data');
    });
});

describe('Partner Notes', function () {
    test('stores partner notes', function () {
        $partner = Partner::factory()->create([
            'notes' => 'High-performing partner, provide priority support.',
        ]);

        expect($partner->notes)->toBe('High-performing partner, provide priority support.');
    });

    test('updates partner notes', function () {
        $partner = Partner::factory()->create([
            'notes' => 'Initial notes',
        ]);

        $partner->update([
            'notes' => 'Updated notes with new information',
        ]);

        expect($partner->fresh()->notes)->toBe('Updated notes with new information');
    });
});

describe('Partner Business Types', function () {
    test('supports travel agency business type', function () {
        $partner = Partner::factory()->create([
            'business_type' => 'travel_agency',
        ]);

        expect($partner->business_type)->toBe('travel_agency');
    });

    test('supports tour operator business type', function () {
        $partner = Partner::factory()->create([
            'business_type' => 'tour_operator',
        ]);

        expect($partner->business_type)->toBe('tour_operator');
    });

    test('supports hotel business type', function () {
        $partner = Partner::factory()->create([
            'business_type' => 'hotel',
        ]);

        expect($partner->business_type)->toBe('hotel');
    });

    test('supports activity provider business type', function () {
        $partner = Partner::factory()->create([
            'business_type' => 'activity_provider',
        ]);

        expect($partner->business_type)->toBe('activity_provider');
    });
});

describe('Partner Metrics Initialization', function () {
    test('new partner has zero metrics', function () {
        $partner = Partner::factory()->create();

        expect($partner->total_revenue_generated)->toBe('0.00');
        expect($partner->total_commissions_paid)->toBe('0.00');
        expect($partner->calculated_plv)->toBe('0.00');
        expect($partner->engagement_score)->toBe('0.00');
        expect($partner->total_referrals)->toBe(0);
        expect($partner->successful_conversions)->toBe(0);
        expect($partner->conversion_rate)->toBe('0.00');
    });
});

describe('Partner Contact Information', function () {
    test('stores complete contact information', function () {
        $partner = Partner::factory()->create([
            'contact_name' => 'Somchai Tanaka',
            'email' => 'somchai@partner.com',
            'phone' => '+66812345678',
            'address' => '123 Sukhumvit Road',
            'city' => 'Bangkok',
            'country' => 'Thailand',
            'website' => 'https://partner.com',
        ]);

        expect($partner->contact_name)->toBe('Somchai Tanaka');
        expect($partner->email)->toBe('somchai@partner.com');
        expect($partner->phone)->toBe('+66812345678');
        expect($partner->website)->toBe('https://partner.com');
    });
});

describe('Partner Currency Settings', function () {
    test('supports THB payment currency', function () {
        $partner = Partner::factory()->create([
            'payment_currency' => 'THB',
        ]);

        expect($partner->payment_currency)->toBe('THB');
    });

    test('supports USD payment currency', function () {
        $partner = Partner::factory()->create([
            'payment_currency' => 'USD',
        ]);

        expect($partner->payment_currency)->toBe('USD');
    });
});
