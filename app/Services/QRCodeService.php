<?php

namespace App\Services;

use App\Models\Partner;
use App\Models\TrackingLink;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\RoundBlockSizeMode;
use Illuminate\Support\Facades\Storage;

class QRCodeService
{
    public function generateForTrackingLink(TrackingLink $trackingLink, int $size = 300): string
    {
        $url = $trackingLink->short_url;
        return $this->generate($url, $size, "qr-{$trackingLink->unique_code}.png");
    }

    public function generateForPartner(Partner $partner, int $size = 300): string
    {
        $trackingLink = $partner->trackingLinks()->where('link_type', 'general')->first();

        if (!$trackingLink) {
            $trackingLink = $this->createDefaultTrackingLink($partner);
        }

        return $this->generateForTrackingLink($trackingLink, $size);
    }

    public function generate(string $url, int $size = 300, string $filename = null, string $format = 'png'): string
    {
        $extension = strtolower($format);
        $filename = $filename ?? 'qr-' . uniqid() . '.' . $extension;

        $qrCode = new QrCode(
            data: $url,
            encoding: new Encoding('UTF-8'),
            errorCorrectionLevel: ErrorCorrectionLevel::High,
            size: $size,
            margin: 10,
            roundBlockSizeMode: RoundBlockSizeMode::Margin,
        );

        $writer = new PngWriter();
        $result = $writer->write($qrCode);

        $path = 'qr-codes/' . $filename;
        Storage::disk('public')->put($path, $result->getString());

        return $path;
    }

    public function generateDataUrl(string $url, int $size = 300): string
    {
        $qrCode = new QrCode(
            data: $url,
            encoding: new Encoding('UTF-8'),
            errorCorrectionLevel: ErrorCorrectionLevel::High,
            size: $size,
            margin: 10,
            roundBlockSizeMode: RoundBlockSizeMode::Margin,
        );

        $writer = new PngWriter();
        $result = $writer->write($qrCode);

        return $result->getDataUri();
    }

    protected function createDefaultTrackingLink(Partner $partner): TrackingLink
    {
        return TrackingLink::create([
            'partner_id' => $partner->id,
            'link_type' => 'general',
            'utm_medium' => 'qr_code',
            'target_url' => config('app.url'),
            'description' => 'Default QR code for ' . $partner->business_name,
        ]);
    }

    public function getUrl(string $path): string
    {
        return Storage::disk('public')->url($path);
    }

    /**
     * Delete QR code file
     */
    public function delete(string $path): bool
    {
        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->delete($path);
        }
        return false;
    }

    /**
     * Regenerate QR code for tracking link
     */
    public function regenerateForTrackingLink(TrackingLink $trackingLink, int $size = 300): string
    {
        // Delete old QR code if exists
        if ($trackingLink->qr_code_path) {
            $this->delete($trackingLink->qr_code_path);
        }

        // Generate new QR code
        $path = $this->generateForTrackingLink($trackingLink, $size);

        // Update tracking link with new path
        $trackingLink->update(['qr_code_path' => $path]);

        return $path;
    }

    /**
     * Generate QR code with specific size options
     */
    public function generateWithSize(string $url, int $size, string $filename = null): string
    {
        // Validate size (must be one of the supported sizes)
        $validSizes = [256, 512, 1024];
        if (!in_array($size, $validSizes)) {
            $size = 512; // Default to 512 if invalid
        }

        return $this->generate($url, $size, $filename);
    }
}
