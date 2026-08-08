<?php

namespace App\Http\Controllers;

use App\Models\Partner;
use App\Models\Referral;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the dashboard with real-time statistics
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        // Get user's partners
        $userPartners = Partner::where('user_id', $user->id)
            ->pluck('id')
            ->toArray();

        // Calculate commissions earned (from referrals sent by user's partners)
        $commissionsEarned = Referral::whereIn('referring_partner_id', $userPartners)
            ->where('status', 'paid')
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->sum('commission_amount');

        // Calculate commissions owed (from referrals received by user's partners)
        $commissionsOwed = Referral::whereIn('receiving_partner_id', $userPartners)
            ->where('status', 'paid')
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->sum('commission_amount');

        // Count active partners
        $activePartnersCount = Partner::where('user_id', $user->id)
            ->where('is_active', true)
            ->count();

        // Count pending referrals
        $pendingReferralsCount = Referral::where('user_id', $user->id)
            ->where('status', 'pending')
            ->count();

        // Calculate trends (compare with last month)
        $lastMonthEarned = Referral::whereIn('referring_partner_id', $userPartners)
            ->where('status', 'paid')
            ->whereMonth('paid_at', now()->subMonth()->month)
            ->whereYear('paid_at', now()->subMonth()->year)
            ->sum('commission_amount');

        $earnedTrend = $lastMonthEarned > 0
            ? (($commissionsEarned - $lastMonthEarned) / $lastMonthEarned) * 100
            : 0;

        $lastMonthOwed = Referral::whereIn('receiving_partner_id', $userPartners)
            ->where('status', 'paid')
            ->whereMonth('paid_at', now()->subMonth()->month)
            ->whereYear('paid_at', now()->subMonth()->year)
            ->sum('commission_amount');

        $owedTrend = $lastMonthOwed > 0
            ? (($commissionsOwed - $lastMonthOwed) / $lastMonthOwed) * 100
            : 0;

        // Get top 5 partners by PLV
        $topPartners = Partner::where('user_id', $user->id)
            ->where('is_active', true)
            ->orderBy('calculated_plv', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($partner) {
                return [
                    'id' => $partner->id,
                    'business_name' => $partner->business_name,
                    'business_type' => $partner->business_type,
                    'total_referrals' => $partner->total_referrals ?? 0,
                    'total_commissions_paid' => $partner->total_commissions_paid ?? 0,
                    'calculated_plv' => $partner->calculated_plv ?? 0,
                    'conversion_rate' => $partner->conversion_rate ?? 0,
                    'is_active' => $partner->is_active,
                ];
            });

        // Get recent 10 referrals (both sent and received)
        $recentReferrals = Referral::where('user_id', $user->id)
            ->with(['referringPartner:id,business_name', 'receivingPartner:id,business_name'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($referral) {
                return [
                    'id' => $referral->id,
                    'customer_name' => $referral->customer_name,
                    'service_type' => $referral->service_type,
                    'service_amount' => $referral->service_amount,
                    'commission_amount' => $referral->commission_amount,
                    'status' => $referral->status,
                    'booking_date' => $referral->booking_date,
                    'referring_partner' => [
                        'id' => $referral->referringPartner->id,
                        'business_name' => $referral->referringPartner->business_name,
                    ],
                    'receiving_partner' => [
                        'id' => $referral->receivingPartner->id,
                        'business_name' => $referral->receivingPartner->business_name,
                    ],
                    'created_at' => $referral->created_at,
                ];
            });

        // Calculate monthly commission chart data (last 6 months)
        $monthlyData = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);

            $earned = Referral::whereIn('referring_partner_id', $userPartners)
                ->where('status', 'paid')
                ->whereMonth('paid_at', $date->month)
                ->whereYear('paid_at', $date->year)
                ->sum('commission_amount');

            $owed = Referral::whereIn('receiving_partner_id', $userPartners)
                ->where('status', 'paid')
                ->whereMonth('paid_at', $date->month)
                ->whereYear('paid_at', $date->year)
                ->sum('commission_amount');

            $monthlyData[] = [
                'month' => $date->format('M Y'),
                'earned' => (float) $earned,
                'owed' => (float) $owed,
            ];
        }

        return Inertia::render('dashboard', [
            'stats' => [
                'commissionsEarned' => [
                    'value' => (float) $commissionsEarned,
                    'trend' => round($earnedTrend, 1),
                    'isPositive' => $earnedTrend >= 0,
                ],
                'commissionsOwed' => [
                    'value' => (float) $commissionsOwed,
                    'trend' => round($owedTrend, 1),
                    'isPositive' => $owedTrend >= 0,
                ],
                'activePartners' => [
                    'value' => $activePartnersCount,
                ],
                'pendingReferrals' => [
                    'value' => $pendingReferralsCount,
                ],
            ],
            'topPartners' => $topPartners,
            'recentReferrals' => $recentReferrals,
            'monthlyData' => $monthlyData,
        ]);
    }

    /**
     * Get dashboard statistics as JSON (for real-time updates)
     */
    public function stats(Request $request)
    {
        $user = auth()->user();

        $userPartners = Partner::where('user_id', $user->id)
            ->pluck('id')
            ->toArray();

        $commissionsEarned = Referral::whereIn('referring_partner_id', $userPartners)
            ->where('status', 'paid')
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->sum('commission_amount');

        $commissionsOwed = Referral::whereIn('receiving_partner_id', $userPartners)
            ->where('status', 'paid')
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->sum('commission_amount');

        $activePartnersCount = Partner::where('user_id', $user->id)
            ->where('is_active', true)
            ->count();

        $pendingReferralsCount = Referral::where('user_id', $user->id)
            ->where('status', 'pending')
            ->count();

        return response()->json([
            'commissionsEarned' => (float) $commissionsEarned,
            'commissionsOwed' => (float) $commissionsOwed,
            'activePartners' => $activePartnersCount,
            'pendingReferrals' => $pendingReferralsCount,
        ]);
    }
}
