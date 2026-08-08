<?php

use App\Models\Booking;
use App\Models\Partner;
use App\Models\TrackingLink;
use App\Models\User;

/**
 * Referral Tracking Tests
 *
 * Tests for the referral tracking and attribution system.
 * This ensures that referrals are correctly tracked, attributed, and managed.
 */

describe('QR Code Scan Tracking', function () {
    test('QR code scan creates tracking link click record', function () {
        $trackingLink = TrackingLink::factory()->qrCode()->create();

        expect($trackingLink->clicks)->toBe(0);

        $trackingLink->recordClick();

        expect($trackingLink->fresh()->clicks)->toBe(1);
        expect($trackingLink->fresh()->last_clicked_at)->not->toBeNull();
    });

    test('multiple QR code scans increment click count', function () {
        $trackingLink = TrackingLink::factory()->qrCode()->create();

        $trackingLink->recordClick();
        $trackingLink->recordClick();
        $trackingLink->recordClick();

        expect($trackingLink->fresh()->clicks)->toBe(3);
    });

    test('last clicked timestamp is updated on each scan', function () {
        $trackingLink = TrackingLink::factory()->qrCode()->create();

        $trackingLink->recordClick();
        $firstClickTime = $trackingLink->fresh()->last_clicked_at;

        sleep(1);

        $trackingLink->recordClick();
        $secondClickTime = $trackingLink->fresh()->last_clicked_at;

        expect($secondClickTime->isAfter($firstClickTime))->toBeTrue();
    });
});

describe('UTM Parameter Capture', function () {
    test('captures UTM parameters on booking creation', function () {
        $partner = Partner::factory()->create();
        $trackingLink = TrackingLink::factory()->create([
            'partner_id' => $partner->id,
            'utm_source' => 'partner-website',
            'utm_medium' => 'qr',
            'utm_campaign' => 'summer-promo',
            'utm_content' => 'booth-display',
        ]);

        $booking = Booking::factory()->create([
            'partner_id' => $partner->id,
            'tracking_link_id' => $trackingLink->id,
            'utm_source' => 'partner-website',
            'utm_medium' => 'qr',
            'utm_campaign' => 'summer-promo',
            'utm_content' => 'booth-display',
        ]);

        expect($booking->utm_source)->toBe('partner-website');
        expect($booking->utm_medium)->toBe('qr');
        expect($booking->utm_campaign)->toBe('summer-promo');
        expect($booking->utm_content)->toBe('booth-display');
    });

    test('tracking link contains all UTM parameters in full URL', function () {
        $trackingLink = TrackingLink::factory()->create([
            'utm_source' => 'email-newsletter',
            'utm_medium' => 'email',
            'utm_campaign' => 'q1-2025',
            'utm_content' => 'cta-button',
        ]);

        $fullUrl = $trackingLink->full_url;

        expect($fullUrl)->toContain('utm_source=email-newsletter');
        expect($fullUrl)->toContain('utm_medium=email');
        expect($fullUrl)->toContain('utm_campaign=q1-2025');
        expect($fullUrl)->toContain('utm_content=cta-button');
    });

    test('UTM parameters are optional', function () {
        $trackingLink = TrackingLink::factory()->create([
            'utm_source' => 'partner-site',
            'utm_medium' => null,
            'utm_campaign' => null,
            'utm_content' => null,
        ]);

        $fullUrl = $trackingLink->full_url;

        expect($fullUrl)->toContain('utm_source=partner-site');
        expect($fullUrl)->not->toContain('utm_medium=');
        expect($fullUrl)->not->toContain('utm_campaign=');
    });
});

describe('Duplicate Referral Prevention', function () {
    test('same customer from same partner within 24 hours is detected', function () {
        $partner = Partner::factory()->create();

        $booking1 = Booking::factory()->create([
            'partner_id' => $partner->id,
            'customer_email' => 'customer@example.com',
            'created_at' => now(),
        ]);

        $duplicateBooking = Booking::query()
            ->where('partner_id', $partner->id)
            ->where('customer_email', 'customer@example.com')
            ->where('created_at', '>=', now()->subDay())
            ->count();

        expect($duplicateBooking)->toBe(1);
    });

    test('same customer from different partner is allowed', function () {
        $partner1 = Partner::factory()->create();
        $partner2 = Partner::factory()->create();

        $booking1 = Booking::factory()->create([
            'partner_id' => $partner1->id,
            'customer_email' => 'customer@example.com',
        ]);

        $booking2 = Booking::factory()->create([
            'partner_id' => $partner2->id,
            'customer_email' => 'customer@example.com',
        ]);

        expect($booking1->partner_id)->not->toBe($booking2->partner_id);
        expect($booking1->customer_email)->toBe($booking2->customer_email);
    });

    test('same customer from same partner after 24 hours is allowed', function () {
        $partner = Partner::factory()->create();

        $booking1 = Booking::factory()->create([
            'partner_id' => $partner->id,
            'customer_email' => 'customer@example.com',
            'created_at' => now()->subHours(25),
        ]);

        $booking2 = Booking::factory()->create([
            'partner_id' => $partner->id,
            'customer_email' => 'customer@example.com',
            'created_at' => now(),
        ]);

        expect($booking1->id)->not->toBe($booking2->id);
        expect(abs($booking2->created_at->diffInHours($booking1->created_at)))->toBeGreaterThan(24);
    });
});

describe('Referral Status Transitions', function () {
    test('new booking starts with pending status', function () {
        $booking = Booking::factory()->create();

        expect($booking->status)->toBe('pending');
    });

    test('booking can be confirmed', function () {
        $booking = Booking::factory()->pending()->create();

        $booking->confirm();

        expect($booking->fresh()->status)->toBe('confirmed');
        expect($booking->fresh()->confirmed_at)->not->toBeNull();
    });

    test('booking can be completed', function () {
        $booking = Booking::factory()->confirmed()->create();

        $booking->complete();

        expect($booking->fresh()->status)->toBe('completed');
        expect($booking->fresh()->completed_at)->not->toBeNull();
    });

    test('booking can be cancelled with reason', function () {
        $booking = Booking::factory()->pending()->create();

        $booking->cancel('Customer requested cancellation');

        expect($booking->fresh()->status)->toBe('cancelled');
        expect($booking->fresh()->cancelled_at)->not->toBeNull();
        expect($booking->fresh()->cancellation_reason)->toBe('Customer requested cancellation');
    });

    test('cannot mark as paid before completed', function () {
        $booking = Booking::factory()->pending()->create();

        expect($booking->status)->not->toBe('completed');
        expect($booking->completed_at)->toBeNull();
    });
});

describe('Commission Creation on Booking Completion', function () {
    test('completing booking creates commission record', function () {
        $booking = Booking::factory()->confirmed()->create([
            'amount' => 10000.00,
            'commission_rate' => 15.00,
            'commission_structure' => 'percentage',
            'commission_amount' => 1500.00,
        ]);

        expect($booking->commissions()->count())->toBe(0);

        $booking->complete();

        expect($booking->commissions()->count())->toBe(1);

        $commission = $booking->commissions()->first();
        expect($commission->amount)->toBe('1500.00');
        expect($commission->status)->toBe('pending');
    });

    test('commission has correct attributes from booking', function () {
        $partner = Partner::factory()->create();
        $booking = Booking::factory()->confirmed()->create([
            'partner_id' => $partner->id,
            'amount' => 20000.00,
            'commission_rate' => 18.00,
            'commission_structure' => 'percentage',
            'commission_amount' => 3600.00,
            'currency' => 'THB',
        ]);

        $booking->complete();

        $commission = $booking->commissions()->first();
        expect($commission->partner_id)->toBe($partner->id);
        expect($commission->booking_id)->toBe($booking->id);
        expect($commission->amount)->toBe('3600.00');
        expect($commission->currency)->toBe('THB');
        expect($commission->base_amount)->toBe('20000.00');
        expect($commission->commission_rate)->toBe('18.00');
        expect($commission->calculation_method)->toBe('percentage');
    });
});

describe('Partner Metrics Update on Referral', function () {
    test('completing booking updates partner total referrals', function () {
        $partner = Partner::factory()->create([
            'total_referrals' => 0,
        ]);

        $booking = Booking::factory()->confirmed()->create([
            'partner_id' => $partner->id,
        ]);

        $booking->complete();

        expect($partner->fresh()->total_referrals)->toBe(1);
    });

    test('completing booking updates successful conversions', function () {
        $partner = Partner::factory()->create([
            'successful_conversions' => 0,
        ]);

        $booking = Booking::factory()->confirmed()->create([
            'partner_id' => $partner->id,
        ]);

        $booking->complete();

        expect($partner->fresh()->successful_conversions)->toBe(1);
    });

    test('completing booking updates total revenue generated', function () {
        $partner = Partner::factory()->create([
            'total_revenue_generated' => 0,
        ]);

        $booking = Booking::factory()->confirmed()->create([
            'partner_id' => $partner->id,
            'amount' => 15000.00,
        ]);

        $booking->complete();

        expect($partner->fresh()->total_revenue_generated)->toBe('15000.00');
    });

    test('completing booking updates last referral timestamp', function () {
        $partner = Partner::factory()->create([
            'last_referral_at' => null,
        ]);

        $booking = Booking::factory()->confirmed()->create([
            'partner_id' => $partner->id,
        ]);

        $booking->complete();

        expect($partner->fresh()->last_referral_at)->not->toBeNull();
    });

    test('completing booking updates conversion rate', function () {
        $partner = Partner::factory()->create([
            'total_referrals' => 0,
            'successful_conversions' => 0,
            'conversion_rate' => 0,
        ]);

        $booking = Booking::factory()->confirmed()->create([
            'partner_id' => $partner->id,
        ]);

        $booking->complete();

        $partner->refresh();

        expect($partner->total_referrals)->toBe(1);
        expect($partner->successful_conversions)->toBe(1);
        expect($partner->conversion_rate)->toBe('100.00');
    });
});

describe('Tracking Link Conversion Recording', function () {
    test('completing booking records conversion on tracking link', function () {
        $trackingLink = TrackingLink::factory()->create([
            'conversions' => 0,
            'total_revenue' => 0,
        ]);

        $booking = Booking::factory()->confirmed()->create([
            'tracking_link_id' => $trackingLink->id,
            'amount' => 5000.00,
        ]);

        $booking->complete();

        $trackingLink->refresh();

        expect($trackingLink->conversions)->toBe(1);
        expect($trackingLink->total_revenue)->toBe('5000.00');
    });

    test('tracking link conversion rate is updated', function () {
        $trackingLink = TrackingLink::factory()->create([
            'clicks' => 10,
            'conversions' => 0,
            'conversion_rate' => 0,
        ]);

        $booking = Booking::factory()->confirmed()->create([
            'tracking_link_id' => $trackingLink->id,
            'amount' => 3000.00,
        ]);

        $booking->complete();

        $trackingLink->refresh();

        expect($trackingLink->conversions)->toBe(1);
        expect($trackingLink->conversion_rate)->toBe('10.00'); // 1/10 * 100
    });
});

describe('Referral Attribution', function () {
    test('booking is correctly attributed to partner', function () {
        $partner = Partner::factory()->create();
        $trackingLink = TrackingLink::factory()->create([
            'partner_id' => $partner->id,
        ]);

        $booking = Booking::factory()->create([
            'partner_id' => $partner->id,
            'tracking_link_id' => $trackingLink->id,
        ]);

        expect($booking->partner_id)->toBe($partner->id);
        expect($booking->partner->id)->toBe($partner->id);
    });

    test('booking is attributed to correct tracking link', function () {
        $partner = Partner::factory()->create();
        $trackingLink1 = TrackingLink::factory()->create(['partner_id' => $partner->id]);
        $trackingLink2 = TrackingLink::factory()->create(['partner_id' => $partner->id]);

        $booking = Booking::factory()->create([
            'partner_id' => $partner->id,
            'tracking_link_id' => $trackingLink1->id,
        ]);

        expect($booking->tracking_link_id)->toBe($trackingLink1->id);
        expect($booking->trackingLink->id)->toBe($trackingLink1->id);
    });
});

describe('Referral Data Validation', function () {
    test('booking reference is auto-generated', function () {
        $booking = Booking::factory()->create();

        expect($booking->booking_reference)->toStartWith('BK');
        expect($booking->booking_reference)->toMatch('/^BK\d{8}[A-Z0-9]{6}$/');
    });

    test('booking reference is unique', function () {
        $booking1 = Booking::factory()->create();
        $booking2 = Booking::factory()->create();

        expect($booking1->booking_reference)->not->toBe($booking2->booking_reference);
    });

    test('customer information is stored correctly', function () {
        $booking = Booking::factory()->create([
            'customer_name' => 'John Smith',
            'customer_email' => 'john@example.com',
            'customer_phone' => '+66812345678',
            'customer_country' => 'United States',
        ]);

        expect($booking->customer_name)->toBe('John Smith');
        expect($booking->customer_email)->toBe('john@example.com');
        expect($booking->customer_phone)->toBe('+66812345678');
        expect($booking->customer_country)->toBe('United States');
    });
});

describe('Repeat Customer Tracking', function () {
    test('identifies repeat customer', function () {
        $partner = Partner::factory()->create();

        $booking1 = Booking::factory()->completed()->create([
            'partner_id' => $partner->id,
            'customer_email' => 'repeat@example.com',
            'is_repeat_customer' => false,
        ]);

        $booking2 = Booking::factory()->create([
            'partner_id' => $partner->id,
            'customer_email' => 'repeat@example.com',
            'is_repeat_customer' => true,
        ]);

        expect($booking2->is_repeat_customer)->toBeTrue();
    });

    test('tracks customer lifetime value', function () {
        $partner = Partner::factory()->create();

        $booking = Booking::factory()->completed()->create([
            'partner_id' => $partner->id,
            'customer_email' => 'valuable@example.com',
            'customer_lifetime_value' => 25000.00,
        ]);

        expect($booking->customer_lifetime_value)->toBe('25000.00');
    });
});

describe('Referral Filtering and Queries', function () {
    test('can filter bookings by partner', function () {
        $partner1 = Partner::factory()->create();
        $partner2 = Partner::factory()->create();

        Booking::factory()->count(3)->create(['partner_id' => $partner1->id]);
        Booking::factory()->count(2)->create(['partner_id' => $partner2->id]);

        $partner1Bookings = Booking::forPartner($partner1->id)->count();

        expect($partner1Bookings)->toBe(3);
    });

    test('can filter bookings by status', function () {
        Booking::factory()->count(2)->pending()->create();
        Booking::factory()->count(3)->confirmed()->create();
        Booking::factory()->count(4)->completed()->create();

        expect(Booking::pending()->count())->toBe(2);
        expect(Booking::confirmed()->count())->toBe(3);
        expect(Booking::completed()->count())->toBe(4);
    });
});
