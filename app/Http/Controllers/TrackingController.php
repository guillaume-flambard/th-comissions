<?php

namespace App\Http\Controllers;

use App\Models\TrackingLink;
use Illuminate\Http\Request;

class TrackingController extends Controller
{
    /**
     * Handle short URL redirect (/r/{code})
     */
    public function redirect(string $code)
    {
        $trackingLink = TrackingLink::where('unique_code', $code)
            ->active()
            ->firstOrFail();

        // Record the click
        $trackingLink->recordClick();

        // Redirect to target URL with UTM parameters preserved
        return redirect($trackingLink->full_url);
    }

    /**
     * Track a click via API (for JavaScript tracking)
     */
    public function trackClick(Request $request)
    {
        $validated = $request->validate([
            'ref' => 'required|string',
            'referrer' => 'nullable|url',
        ]);

        $trackingLink = TrackingLink::where('unique_code', $validated['ref'])
            ->active()
            ->first();

        if ($trackingLink) {
            $trackingLink->recordClick();

            return response()->json([
                'success' => true,
                'tracking_link_id' => $trackingLink->id,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid tracking code',
        ], 404);
    }

    /**
     * Get tracking link stats (for partner to view their own link performance)
     */
    public function stats(string $code)
    {
        $trackingLink = TrackingLink::where('unique_code', $code)
            ->with('partner')
            ->firstOrFail();

        return response()->json([
            'code' => $trackingLink->unique_code,
            'clicks' => $trackingLink->clicks,
            'conversions' => $trackingLink->conversions,
            'conversion_rate' => $trackingLink->conversion_rate,
            'total_revenue' => $trackingLink->total_revenue,
            'last_clicked_at' => $trackingLink->last_clicked_at,
            'is_active' => $trackingLink->is_active,
        ]);
    }
}
