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

    public function generate(string $url, int $size = 300, string $filename = null): string
    {
        $filename = $filename ?? 'qr-' . uniqid() . '.png';

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
}
