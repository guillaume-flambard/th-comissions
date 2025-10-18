<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Partner;
use App\Models\TrackingLink;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookingController extends Controller
{
    /**
     * Show booking form (for direct bookings with tracking)
     */
    public function create(Request $request)
    {
        // Capture UTM parameters from query string
        $utmParams = [
            'ref' => $request->get('ref'),
            'utm_source' => $request->get('utm_source'),
            'utm_medium' => $request->get('utm_medium'),
            'utm_campaign' => $request->get('utm_campaign'),
            'utm_content' => $request->get('utm_content'),
        ];

        // Find tracking link if ref code provided
        $trackingLink = null;
        $partner = null;

        if ($utmParams['ref']) {
            $trackingLink = TrackingLink::where('unique_code', $utmParams['ref'])->first();
            if ($trackingLink) {
                $partner = $trackingLink->partner;
            }
        }

        return Inertia::render('booking/create', [
            'utmParams' => $utmParams,
            'partner' => $partner,
        ]);
    }

    /**
     * Store a new booking (can be called from external systems or direct booking form)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            // Attribution
            'ref' => 'nullable|string',
            'partner_id' => 'required_without:ref|exists:partners,id',
            'utm_source' => 'nullable|string',
            'utm_medium' => 'nullable|string',
            'utm_campaign' => 'nullable|string',
            'utm_content' => 'nullable|string',

            // Customer info
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email',
            'customer_phone' => 'nullable|string',
            'customer_country' => 'nullable|string|max:2',

            // Service details
            'service_type' => 'required|string',
            'service_name' => 'required|string|max:255',
            'service_description' => 'nullable|string',
            'service_date' => 'required|date',
            'service_end_date' => 'nullable|date|after_or_equal:service_date',
            'quantity' => 'required|integer|min:1',

            // Financial
            'amount' => 'required|numeric|min:0',
            'currency' => 'required|string|in:THB,USD,EUR',
        ]);

        // Find partner and tracking link
        $trackingLink = null;
        $partner = null;

        if (!empty($validated['ref'])) {
            $trackingLink = TrackingLink::where('unique_code', $validated['ref'])->first();
            if ($trackingLink) {
                $partner = $trackingLink->partner;
                $validated['tracking_link_id'] = $trackingLink->id;
            }
        }

        if (!$partner && !empty($validated['partner_id'])) {
            $partner = Partner::find($validated['partner_id']);
        }

        if (!$partner) {
            return back()->withErrors(['error' => 'Invalid partner or tracking code']);
        }

        // Get commission rate from partner
        $validated['partner_id'] = $partner->id;
        $validated['commission_rate'] = $partner->default_commission_rate;
        $validated['commission_structure'] = $partner->commission_structure;
        $validated['booking_date'] = now();

        // Create booking
        $booking = Booking::create($validated);

        // Return response based on request type
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'booking' => [
                    'id' => $booking->id,
                    'booking_reference' => $booking->booking_reference,
                    'status' => $booking->status,
                ],
            ], 201);
        }

        return redirect()->route('booking.success', $booking->booking_reference)
            ->with('success', 'Booking created successfully!');
    }

    /**
     * Show booking success page
     */
    public function success(string $bookingReference)
    {
        $booking = Booking::where('booking_reference', $bookingReference)->firstOrFail();

        return Inertia::render('booking/success', [
            'booking' => $booking,
        ]);
    }

    /**
     * Update booking status (webhook for external systems)
     */
    public function updateStatus(Request $request)
    {
        $validated = $request->validate([
            'booking_reference' => 'required|string|exists:bookings,booking_reference',
            'status' => 'required|in:pending,confirmed,completed,cancelled,no_show',
            'api_key' => 'required|string', // Simple API key auth for webhook
        ]);

        // Verify API key (you should store this in config)
        if ($validated['api_key'] !== config('app.booking_api_key')) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $booking = Booking::where('booking_reference', $validated['booking_reference'])->first();

        switch ($validated['status']) {
            case 'confirmed':
                $booking->confirm();
                break;
            case 'completed':
                $booking->complete();
                break;
            case 'cancelled':
                $booking->cancel($request->get('reason'));
                break;
            case 'no_show':
                $booking->markAsNoShow();
                break;
        }

        return response()->json([
            'success' => true,
            'booking' => [
                'booking_reference' => $booking->booking_reference,
                'status' => $booking->status,
            ],
        ]);
    }
}
