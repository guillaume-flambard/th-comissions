<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Commission;
use App\Models\Partner;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            // Overview Stats
            'total_partners' => Partner::count(),
            'active_partners' => Partner::active()->count(),
            'total_bookings' => Booking::count(),
            'completed_bookings' => Booking::completed()->count(),

            // Revenue Stats
            'total_revenue' => (float) (Booking::completed()->sum('amount') ?? 0),
            'total_commissions_pending' => (float) (Commission::pending()->sum('amount') ?? 0),
            'total_commissions_paid' => (float) (Commission::paid()->sum('amount') ?? 0),
            'total_commissions_approved' => (float) (Commission::approved()->sum('amount') ?? 0),

            // This Month Stats
            'month_revenue' => (float) (Booking::completed()
                ->whereMonth('completed_at', now()->month)
                ->sum('amount') ?? 0),
            'month_bookings' => Booking::completed()
                ->whereMonth('completed_at', now()->month)
                ->count(),
            'month_new_partners' => Partner::whereMonth('created_at', now()->month)->count(),

            // Conversion Metrics
            'average_conversion_rate' => (float) (Partner::active()->avg('conversion_rate') ?? 0),
            'average_plv' => (float) (Partner::active()->avg('calculated_plv') ?? 0),
        ];

        // Top 10 Partners by PLV
        $topPartners = Partner::with('tier')
            ->active()
            ->orderBy('calculated_plv', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($partner) {
                return [
                    'id' => $partner->id,
                    'business_name' => $partner->business_name,
                    'business_type' => $partner->business_type,
                    'plv' => (float) ($partner->calculated_plv ?? 0),
                    'total_revenue' => (float) ($partner->total_revenue_generated ?? 0),
                    'total_referrals' => (int) ($partner->total_referrals ?? 0),
                    'conversion_rate' => (float) ($partner->conversion_rate ?? 0),
                    'engagement_score' => (float) ($partner->engagement_score ?? 0),
                    'tier' => $partner->tier ? [
                        'name' => $partner->tier->name,
                        'color' => $partner->tier->color,
                    ] : null,
                ];
            });

        // Partners at Risk (churn prediction)
        $atRiskPartners = Partner::atRisk()
            ->limit(5)
            ->get()
            ->map(function ($partner) {
                return [
                    'id' => $partner->id,
                    'business_name' => $partner->business_name,
                    'last_referral_at' => $partner->last_referral_at?->toISOString(),
                    'engagement_score' => (float) ($partner->engagement_score ?? 0),
                    'churn_rate' => (float) $partner->calculateChurnRate(),
                ];
            });

        // Recent Bookings
        $recentBookings = Booking::with(['partner', 'trackingLink'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'booking_reference' => $booking->booking_reference,
                    'partner_name' => $booking->partner->business_name,
                    'service_name' => $booking->service_name,
                    'amount' => (float) ($booking->amount ?? 0),
                    'commission_amount' => (float) ($booking->commission_amount ?? 0),
                    'status' => $booking->status,
                    'booking_date' => $booking->booking_date->format('Y-m-d'),
                    'customer_name' => $booking->customer_name,
                ];
            });

        // Revenue by Service Type (last 30 days)
        $revenueByServiceType = Booking::completed()
            ->where('completed_at', '>=', now()->subDays(30))
            ->selectRaw('service_type, SUM(amount) as total, COUNT(*) as count')
            ->groupBy('service_type')
            ->get();

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
            'topPartners' => $topPartners,
            'atRiskPartners' => $atRiskPartners,
            'recentBookings' => $recentBookings,
            'revenueByServiceType' => $revenueByServiceType,
        ]);
    }
}
