<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePartnerRequest;
use App\Http\Requests\UpdatePartnerRequest;
use App\Models\Partner;
use App\Models\PartnerTier;
use App\Models\User;
use App\Services\QRCodeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class PartnerController extends Controller
{
    public function __construct(protected QRCodeService $qrCodeService)
    {
    }

    public function index(Request $request)
    {
        $query = Partner::with('tier')
            ->where('user_id', auth()->id())
            ->withCount(['referralsSent', 'referralsReceived']);

        // Search
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('business_name', 'like', "%{$request->search}%")
                    ->orWhere('contact_name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        // Filter by business type
        if ($request->filled('business_type')) {
            $query->where('business_type', $request->business_type);
        }

        // Filter by status (active/inactive)
        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        $partners = $query->paginate(15)->through(function ($partner) {
            return [
                'id' => $partner->id,
                'business_name' => $partner->business_name,
                'business_type' => $partner->business_type,
                'contact_name' => $partner->contact_name,
                'email' => $partner->email,
                'phone' => $partner->phone,
                'city' => $partner->city ?? '',
                'calculated_plv' => $partner->calculated_plv ?? 0,
                'total_commissions_paid' => $partner->total_commissions_paid ?? 0,
                'total_referrals' => $partner->total_referrals ?? 0,
                'successful_conversions' => $partner->successful_conversions ?? 0,
                'conversion_rate' => $partner->conversion_rate ?? 0,
                'total_revenue_generated' => $partner->total_revenue_generated ?? 0,
                'engagement_score' => $partner->engagement_score ?? 0,
                'churn_rate' => $partner->churn_rate ?? 0,
                'is_active' => $partner->is_active,
                'last_referral_at' => $partner->last_referral_at?->format('Y-m-d'),
                'joined_at' => $partner->created_at?->format('Y-m-d'),
                'tier' => $partner->tier ? [
                    'id' => $partner->tier->id,
                    'name' => $partner->tier->name,
                    'slug' => $partner->tier->slug,
                    'color' => $partner->tier->color,
                ] : null,
                'referrals_sent_count' => $partner->referrals_sent_count,
                'referrals_received_count' => $partner->referrals_received_count,
            ];
        });

        $businessTypes = [
            'dive_shop',
            'kite_school',
            'hostel',
            'hotel',
            'tour_operator',
            'transfer_service',
        ];

        $tiers = PartnerTier::all();

        return Inertia::render('admin/partners/index', [
            'partners' => $partners,
            'businessTypes' => $businessTypes,
            'tiers' => $tiers,
            'filters' => $request->only(['business_type', 'status', 'search', 'sort_by', 'sort_dir']),
        ]);
    }

    public function show(Partner $partner)
    {
        // Authorize: check partner belongs to auth user
        if ($partner->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $partner->load(['tier', 'trackingLinks', 'user']);

        // Load recent referrals sent (last 10)
        $referralsSent = $partner->referralsSent()
            ->with(['receivingPartner', 'trackingLink'])
            ->latest()
            ->limit(10)
            ->get();

        // Load recent referrals received (last 10)
        $referralsReceived = $partner->referralsReceived()
            ->with(['referringPartner', 'trackingLink'])
            ->latest()
            ->limit(10)
            ->get();

        // Calculate stats for the partner show page
        $totalPaid = $partner->referralsReceived()
            ->where('status', 'paid')
            ->sum('commission_amount') ?? 0;

        $totalReceived = $partner->referralsSent()
            ->where('status', 'paid')
            ->sum('commission_amount') ?? 0;

        $paidReferralsCount = $partner->referralsSent()
            ->where('status', 'paid')
            ->count();

        $avgCommissionPerReferral = $paidReferralsCount > 0
            ? $totalReceived / $paidReferralsCount
            : 0;

        $pendingPayments = $partner->referralsSent()
            ->whereIn('status', ['pending', 'validated'])
            ->sum('commission_amount') ?? 0;

        $stats = [
            'total_paid' => $totalPaid,
            'total_received' => $totalReceived,
            'avg_commission_per_referral' => $avgCommissionPerReferral,
            'pending_payments' => $pendingPayments,
        ];

        return Inertia::render('admin/partners/show', [
            'partner' => $partner,
            'referralsSent' => $referralsSent,
            'referralsReceived' => $referralsReceived,
            'stats' => $stats,
        ]);
    }

    public function create()
    {
        $businessTypes = [
            'Dive Shop',
            'Kite School',
            'Hostel',
            'Hotel',
            'Tour Operator',
            'Transfer Service',
        ];

        $commissionStructures = [
            'percentage' => 'Percentage-based',
            'fixed' => 'Fixed amount',
            'tiered' => 'Tiered (volume-based)',
        ];

        return Inertia::render('admin/partners/create', [
            'businessTypes' => $businessTypes,
            'commissionStructures' => $commissionStructures,
            'defaultCommissionRate' => 15, // Default 15% commission
        ]);
    }

    public function store(StorePartnerRequest $request)
    {
        $validated = $request->validated();

        // Create partner for authenticated user
        $partner = Partner::create(array_merge($validated, [
            'user_id' => auth()->id(),
            'joined_at' => now(),
            'is_active' => $validated['is_active'] ?? true,
            'payment_currency' => $validated['payment_currency'] ?? 'THB',
        ]));

        // Generate default QR code if QRCodeService is available
        try {
            $this->qrCodeService->generateForPartner($partner);
        } catch (\Exception $e) {
            // QR code generation failed, but partner was created successfully
            // Log the error but don't fail the request
            logger()->warning('QR code generation failed for partner: ' . $partner->id, [
                'error' => $e->getMessage(),
            ]);
        }

        return redirect()->route('admin.partners.show', $partner)
            ->with('success', 'Partner created successfully!');
    }

    public function edit(Partner $partner)
    {
        // Authorize: check partner belongs to auth user
        if ($partner->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $businessTypes = [
            'Dive Shop',
            'Kite School',
            'Hostel',
            'Hotel',
            'Tour Operator',
            'Transfer Service',
        ];

        $commissionStructures = [
            'percentage' => 'Percentage-based',
            'fixed' => 'Fixed amount',
            'tiered' => 'Tiered (volume-based)',
        ];

        return Inertia::render('admin/partners/edit', [
            'partner' => $partner,
            'businessTypes' => $businessTypes,
            'commissionStructures' => $commissionStructures,
        ]);
    }

    public function update(UpdatePartnerRequest $request, Partner $partner)
    {
        // Authorize: check partner belongs to auth user
        if ($partner->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validated();
        $partner->update($validated);

        return redirect()->route('admin.partners.show', $partner)
            ->with('success', 'Partner updated successfully!');
    }

    public function destroy(Partner $partner)
    {
        // Authorize: check partner belongs to auth user
        if ($partner->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $partner->delete();

        return redirect()->route('admin.partners.index')
            ->with('success', 'Partner deleted successfully!');
    }

    public function recalculatePlv(Partner $partner)
    {
        // Authorize: check partner belongs to auth user
        if ($partner->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $plv = $partner->calculatePLV();
        $partner->updateEngagementScore();

        return back()->with('success', "PLV recalculated: " . number_format($plv, 2) . " THB");
    }

    public function generateQrCode(Partner $partner)
    {
        // Authorize: check partner belongs to auth user
        if ($partner->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        try {
            $path = $this->qrCodeService->generateForPartner($partner);
            return back()->with('success', 'QR Code generated successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to generate QR Code: ' . $e->getMessage());
        }
    }
}
