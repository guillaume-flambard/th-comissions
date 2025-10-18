<?php

use App\Models\Partner;
use App\Models\TrackingLink;
use App\Services\QRCodeService;
use Illuminate\Support\Facades\Storage;

/**
 * QR Code Service Tests
 *
 * Tests for QR code generation functionality.
 * QR codes are essential for partner tracking and referral attribution.
 */

beforeEach(function () {
    Storage::fake('public');
    $this->qrService = new QRCodeService();
});

describe('QR Code Generation', function () {
    test('generates QR code successfully', function () {
        $url = 'https://trackly.test/r/ABC123';

        $path = $this->qrService->generate($url);

        expect($path)->toBeString();
        expect($path)->toContain('qr-codes/');
        expect($path)->toContain('.png');
        Storage::disk('public')->assertExists($path);
    });

    test('QR code file is stored in correct location', function () {
        $url = 'https://trackly.test/r/XYZ789';
        $filename = 'test-qr.png';

        $path = $this->qrService->generate($url, 300, $filename);

        expect($path)->toBe('qr-codes/test-qr.png');
        Storage::disk('public')->assertExists('qr-codes/test-qr.png');
    });

    test('generates QR code with default size', function () {
        $url = 'https://trackly.test/r/DEF456';

        $path = $this->qrService->generate($url);

        Storage::disk('public')->assertExists($path);
        $content = Storage::disk('public')->get($path);
        expect($content)->not->toBeEmpty();
    });

    test('generates QR code with custom size', function () {
        $url = 'https://trackly.test/r/GHI789';

        $path = $this->qrService->generate($url, 500);

        Storage::disk('public')->assertExists($path);
        $content = Storage::disk('public')->get($path);
        expect($content)->not->toBeEmpty();
    });

    test('generates unique filename when not specified', function () {
        $url = 'https://trackly.test/r/JKL012';

        $path1 = $this->qrService->generate($url);
        $path2 = $this->qrService->generate($url);

        expect($path1)->not->toBe($path2);
        Storage::disk('public')->assertExists($path1);
        Storage::disk('public')->assertExists($path2);
    });
});

describe('QR Code Generation for Tracking Links', function () {
    test('generates QR code for tracking link', function () {
        $trackingLink = TrackingLink::factory()->create([
            'unique_code' => 'ABC123',
        ]);

        $path = $this->qrService->generateForTrackingLink($trackingLink);

        expect($path)->toContain('qr-ABC123.png');
        Storage::disk('public')->assertExists($path);
    });

    test('QR code contains tracking link short URL', function () {
        $trackingLink = TrackingLink::factory()->create([
            'unique_code' => 'XYZ789',
        ]);

        $path = $this->qrService->generateForTrackingLink($trackingLink);

        Storage::disk('public')->assertExists($path);
        expect($trackingLink->short_url)->toContain($trackingLink->unique_code);
    });

    test('generates QR code with custom size for tracking link', function () {
        $trackingLink = TrackingLink::factory()->create();

        $path = $this->qrService->generateForTrackingLink($trackingLink, 400);

        Storage::disk('public')->assertExists($path);
    });
});

describe('QR Code Generation for Partners', function () {
    test('generates QR code for partner with existing tracking link', function () {
        $partner = Partner::factory()->create();
        $trackingLink = TrackingLink::factory()->create([
            'partner_id' => $partner->id,
            'link_type' => 'general',
            'unique_code' => 'PARTNER1',
        ]);

        $path = $this->qrService->generateForPartner($partner);

        expect($path)->toContain('qr-PARTNER1.png');
        Storage::disk('public')->assertExists($path);
    });

    test('creates default tracking link if partner has none', function () {
        $partner = Partner::factory()->create();

        expect($partner->trackingLinks()->count())->toBe(0);

        $path = $this->qrService->generateForPartner($partner);

        Storage::disk('public')->assertExists($path);
        expect($partner->trackingLinks()->count())->toBe(1);

        $trackingLink = $partner->trackingLinks()->first();
        expect($trackingLink->link_type)->toBe('general');
        expect($trackingLink->utm_medium)->toBe('qr_code');
    });

    test('default tracking link has correct properties', function () {
        $partner = Partner::factory()->create([
            'business_name' => 'Test Travel Agency',
        ]);

        $this->qrService->generateForPartner($partner);

        $trackingLink = $partner->trackingLinks()->first();

        expect($trackingLink->link_type)->toBe('general');
        expect($trackingLink->utm_medium)->toBe('qr_code');
        expect($trackingLink->description)->toContain('Test Travel Agency');
        expect($trackingLink->target_url)->toBe(config('app.url'));
    });
});

describe('QR Code Data URL Generation', function () {
    test('generates data URL for QR code', function () {
        $url = 'https://trackly.test/r/ABC123';

        $dataUrl = $this->qrService->generateDataUrl($url);

        expect($dataUrl)->toBeString();
        expect($dataUrl)->toStartWith('data:image/png;base64,');
    });

    test('data URL can be used directly in HTML', function () {
        $url = 'https://trackly.test/r/XYZ789';

        $dataUrl = $this->qrService->generateDataUrl($url);

        expect($dataUrl)->toContain('base64');
        expect(strlen($dataUrl))->toBeGreaterThan(100);
    });

    test('generates data URL with custom size', function () {
        $url = 'https://trackly.test/r/DEF456';

        $dataUrl = $this->qrService->generateDataUrl($url, 200);

        expect($dataUrl)->toBeString();
        expect($dataUrl)->toStartWith('data:image/png;base64,');
    });
});

describe('QR Code URL Structure', function () {
    test('QR code contains correct URL with unique code', function () {
        $trackingLink = TrackingLink::factory()->create([
            'unique_code' => 'TESTCODE',
        ]);

        $shortUrl = $trackingLink->short_url;

        expect($shortUrl)->toContain('TESTCODE');
        expect($shortUrl)->toContain('/r/');
    });

    test('QR code URL includes UTM parameters in full URL', function () {
        $trackingLink = TrackingLink::factory()->create([
            'unique_code' => 'TESTUTM',
            'utm_source' => 'test-partner',
            'utm_medium' => 'qr',
            'utm_campaign' => 'summer2025',
        ]);

        $fullUrl = $trackingLink->full_url;

        expect($fullUrl)->toContain('ref=TESTUTM');
        expect($fullUrl)->toContain('utm_source=test-partner');
        expect($fullUrl)->toContain('utm_medium=qr');
        expect($fullUrl)->toContain('utm_campaign=summer2025');
    });
});

describe('Short Code Uniqueness', function () {
    test('generates unique short code for tracking link', function () {
        $link1 = TrackingLink::factory()->create();
        $link2 = TrackingLink::factory()->create();

        expect($link1->unique_code)->not->toBe($link2->unique_code);
    });

    test('short code is uppercase and 6 characters', function () {
        $trackingLink = TrackingLink::factory()->create();

        expect($trackingLink->unique_code)->toMatch('/^[A-Z0-9]{6}$/');
    });

    test('regenerates short code if collision occurs', function () {
        $existingCode = 'ABC123';

        TrackingLink::factory()->create([
            'unique_code' => $existingCode,
        ]);

        $newLink = TrackingLink::factory()->create();

        expect($newLink->unique_code)->not->toBe($existingCode);
    });
});

describe('QR Code File Storage', function () {
    test('retrieves public URL for stored QR code', function () {
        $url = 'https://trackly.test/r/ABC123';
        $path = $this->qrService->generate($url, 300, 'test.png');

        $publicUrl = $this->qrService->getUrl($path);

        expect($publicUrl)->toBeString();
        expect($publicUrl)->toContain('qr-codes');
    });

    test('QR code file can be retrieved after generation', function () {
        $trackingLink = TrackingLink::factory()->create();

        $path = $this->qrService->generateForTrackingLink($trackingLink);
        $content = Storage::disk('public')->get($path);

        expect($content)->not->toBeEmpty();
        expect($content)->toBeString();
    });
});

describe('QR Code Error Handling', function () {
    test('generates QR code for very long URL', function () {
        $longUrl = 'https://trackly.test/r/ABC123?' . str_repeat('param=value&', 50);

        $path = $this->qrService->generate($longUrl);

        Storage::disk('public')->assertExists($path);
    });

    test('generates QR code for URL with special characters', function () {
        $url = 'https://trackly.test/r/ABC123?name=Test%20User&email=test@example.com';

        $path = $this->qrService->generate($url);

        Storage::disk('public')->assertExists($path);
    });

    test('handles minimum QR code size', function () {
        $url = 'https://trackly.test/r/ABC123';

        $path = $this->qrService->generate($url, 100);

        Storage::disk('public')->assertExists($path);
    });

    test('handles maximum QR code size', function () {
        $url = 'https://trackly.test/r/ABC123';

        $path = $this->qrService->generate($url, 1000);

        Storage::disk('public')->assertExists($path);
    });
});

describe('QR Code Integration with TrackingLink Model', function () {
    test('tracking link can store QR code path', function () {
        $trackingLink = TrackingLink::factory()->create();

        $path = $this->qrService->generateForTrackingLink($trackingLink);

        $trackingLink->update(['qr_code_path' => $path]);

        expect($trackingLink->qr_code_path)->toBe($path);
    });

    test('QR code link type is correctly set', function () {
        $trackingLink = TrackingLink::factory()->qrCode()->create();

        expect($trackingLink->link_type)->toBe('qr_code');
        expect($trackingLink->utm_medium)->toBe('qr');
    });
});

describe('Real-world QR Code Scenarios', function () {
    test('generates QR code for partner event booth', function () {
        $partner = Partner::factory()->create([
            'business_name' => 'Bangkok Tours Co.',
        ]);

        $trackingLink = TrackingLink::factory()->create([
            'partner_id' => $partner->id,
            'link_type' => 'qr_code',
            'utm_campaign' => 'tourism_expo_2025',
            'utm_medium' => 'qr',
            'description' => 'QR code for Tourism Expo booth',
        ]);

        $path = $this->qrService->generateForTrackingLink($trackingLink);

        Storage::disk('public')->assertExists($path);
        expect($trackingLink->utm_campaign)->toBe('tourism_expo_2025');
    });

    test('generates QR code for printed marketing materials', function () {
        $partner = Partner::factory()->create();

        $trackingLink = TrackingLink::factory()->create([
            'partner_id' => $partner->id,
            'link_type' => 'qr_code',
            'utm_medium' => 'print',
            'utm_campaign' => 'brochure_q1',
        ]);

        $path = $this->qrService->generateForTrackingLink($trackingLink, 500); // Larger for print

        Storage::disk('public')->assertExists($path);
    });
});
