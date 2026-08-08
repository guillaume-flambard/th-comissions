<?php

namespace App\Http\Controllers;

use App\Http\Requests\GenerateQRCodeRequest;
use App\Models\Partner;
use App\Models\TrackingLink;
use App\Services\QRCodeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class QRCodeController extends Controller
{
    public function __construct(
        protected QRCodeService $qrCodeService
    ) {}

    /**
     * Show QR code generation page
     */
    public function show(Request $request)
    {
        // Get all active partners for the authenticated user
        $partners = Partner::where('user_id', auth()->id())
            ->where('is_active', true)
            ->select(
                'id',
                'business_name as name',
                'business_type as type',
                'commission_rate'
            )
            ->get();

        return Inertia::render('qr-codes/generate', [
            'partners' => $partners,
        ]);
    }

    /**
     * Generate a new QR code for a tracking link
     */
    public function generate(GenerateQRCodeRequest $request)
    {
        $validated = $request->validated();

        // Find partner and verify it belongs to the authenticated user
        $partner = Partner::where('id', $validated['partner_id'])
            ->where('user_id', auth()->id())
            ->firstOrFail();

        // Generate unique short code (8 characters)
        $shortCode = TrackingLink::generateShortCode();

        // Create tracking link
        $trackingLink = TrackingLink::create([
            'partner_id' => $partner->id,
            'user_id' => auth()->id(),
            'unique_code' => $shortCode,
            'utm_source' => $partner->business_name,
            'utm_medium' => 'qr_code',
            'utm_campaign' => $validated['campaign_name'] ?? null,
            'link_type' => 'campaign',
            'is_active' => true,
        ]);

        // Generate QR code
        $size = (int) $validated['size'];
        $filename = "qr-{$shortCode}.png";
        $qrCodePath = $this->qrCodeService->generateWithSize(
            $trackingLink->short_url,
            $size,
            $filename
        );

        // Update tracking link with QR code path
        $trackingLink->update(['qr_code_path' => $qrCodePath]);

        // Get public URL for QR code
        $qrCodeUrl = Storage::disk('public')->url($qrCodePath);

        // Get all active partners again for the form
        $partners = Partner::where('user_id', auth()->id())
            ->where('is_active', true)
            ->select(
                'id',
                'business_name as name',
                'business_type as type',
                'commission_rate'
            )
            ->get();

        return Inertia::render('qr-codes/generate', [
            'partners' => $partners,
            'partner_id' => $partner->id,
            'qr_code' => $qrCodeUrl,
            'qr_link' => $trackingLink->short_url,
        ]);
    }

    /**
     * Download QR code file
     */
    public function download(TrackingLink $trackingLink)
    {
        // Verify tracking link belongs to authenticated user
        if ($trackingLink->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this QR code');
        }

        // Check if QR code exists
        if (!$trackingLink->qr_code_path) {
            abort(404, 'QR code not found for this tracking link');
        }

        // Get file path
        $path = storage_path('app/public/' . $trackingLink->qr_code_path);

        if (!file_exists($path)) {
            abort(404, 'QR code file not found');
        }

        // Generate filename for download
        $filename = "qr-code-{$trackingLink->unique_code}.png";

        // Return file as download
        return response()->download($path, $filename, [
            'Content-Type' => 'image/png',
        ]);
    }

    /**
     * Get statistics for a tracking link
     */
    public function stats(TrackingLink $trackingLink)
    {
        // Verify tracking link belongs to authenticated user
        if ($trackingLink->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this tracking link');
        }

        // Load relationships
        $trackingLink->load(['partner', 'referrals']);

        // Calculate conversion rate
        $referralsCount = $trackingLink->referrals()->count();
        $paidReferralsCount = $trackingLink->referrals()->where('status', 'paid')->count();
        $conversionRate = $trackingLink->clicks > 0
            ? round(($referralsCount / $trackingLink->clicks) * 100, 2)
            : 0;

        return response()->json([
            'success' => true,
            'stats' => [
                'unique_code' => $trackingLink->unique_code,
                'short_url' => $trackingLink->short_url,
                'clicks' => $trackingLink->clicks,
                'referrals' => $referralsCount,
                'paid_referrals' => $paidReferralsCount,
                'conversion_rate' => $conversionRate,
                'total_revenue' => $trackingLink->total_revenue,
                'last_clicked_at' => $trackingLink->last_clicked_at,
                'is_active' => $trackingLink->is_active,
                'created_at' => $trackingLink->created_at,
                'partner' => [
                    'id' => $trackingLink->partner->id,
                    'business_name' => $trackingLink->partner->business_name,
                ],
                'campaign_name' => $trackingLink->utm_campaign,
            ],
        ]);
    }
}
