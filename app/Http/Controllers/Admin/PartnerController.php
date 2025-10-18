<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
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
            ->withCount('bookings', 'commissions');

        // Filters
        if ($request->filled('tier')) {
            $query->whereHas('tier', fn($q) => $q->where('slug', $request->tier));
        }

        if ($request->filled('business_type')) {
            $query->where('business_type', $request->business_type);
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('business_name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'calculated_plv');
        $sortDir = $request->get('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        $partners = $query->paginate(20)->through(function ($partner) {
            return [
                'id' => $partner->id,
                'business_name' => $partner->business_name,
                'business_type' => $partner->business_type,
                'email' => $partner->email,
                'phone' => $partner->phone,
                'calculated_plv' => $partner->calculated_plv,
                'total_revenue_generated' => $partner->total_revenue_generated,
                'total_referrals' => $partner->total_referrals,
                'conversion_rate' => $partner->conversion_rate,
                'engagement_score' => $partner->engagement_score,
                'is_active' => $partner->is_active,
                'last_referral_at' => $partner->last_referral_at?->format('Y-m-d'),
                'tier' => $partner->tier ? [
                    'name' => $partner->tier->name,
                    'slug' => $partner->tier->slug,
                    'color' => $partner->tier->color,
                ] : null,
                'bookings_count' => $partner->bookings_count,
                'commissions_count' => $partner->commissions_count,
            ];
        });

        $tiers = PartnerTier::ordered()->get();
        $businessTypes = ['hotel', 'hostel', 'tour_operator', 'diving_shop', 'transport', 'dmo', 'restaurant'];

        return Inertia::render('admin/partners/index', [
            'partners' => $partners,
            'tiers' => $tiers,
            'businessTypes' => $businessTypes,
            'filters' => $request->only(['tier', 'business_type', 'status', 'search', 'sort_by', 'sort_dir']),
        ]);
    }

    public function show(Partner $partner)
    {
        $partner->load(['tier', 'trackingLinks', 'user']);

        $recentBookings = $partner->bookings()
            ->with('trackingLink')
            ->latest()
            ->limit(20)
            ->get();

        $commissions = $partner->commissions()
            ->with('booking')
            ->latest()
            ->limit(20)
            ->get();

        // Calculate metrics
        $metrics = [
            'arpp' => $partner->calculateARPP(),
            'apl' => $partner->calculateAPL(),
            'churn_rate' => $partner->calculateChurnRate(),
            'plv' => $partner->calculated_plv,
            'partnership_costs' => $partner->calculatePartnershipCosts(),
        ];

        return Inertia::render('admin/partners/show', [
            'partner' => $partner,
            'recentBookings' => $recentBookings,
            'commissions' => $commissions,
            'metrics' => $metrics,
        ]);
    }

    public function create()
    {
        $tiers = PartnerTier::ordered()->get();
        $businessTypes = ['hotel', 'hostel', 'tour_operator', 'diving_shop', 'transport', 'dmo', 'restaurant'];
        $currencies = ['THB', 'USD', 'EUR'];
        $paymentMethods = ['manual', 'stripe', 'promptpay', 'bank_transfer'];

        return Inertia::render('admin/partners/create', [
            'tiers' => $tiers,
            'businessTypes' => $businessTypes,
            'currencies' => $currencies,
            'paymentMethods' => $paymentMethods,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'business_name' => 'required|string|max:255',
            'business_type' => 'required|string',
            'contact_name' => 'required|string|max:255',
            'email' => 'required|email|unique:partners,email',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:2',
            'website' => 'nullable|url',
            'commission_structure' => 'required|in:percentage,fixed,tiered',
            'default_commission_rate' => 'required|numeric|min:0|max:100',
            'payment_method' => 'required|string',
            'payment_currency' => 'required|string|in:THB,USD,EUR',
            'bank_name' => 'nullable|string',
            'bank_account_number' => 'nullable|string',
            'promptpay_id' => 'nullable|string',
            'create_user_account' => 'boolean',
            'user_password' => 'required_if:create_user_account,true|nullable|min:8',
        ]);

        $partner = Partner::create(array_merge($validated, [
            'joined_at' => now(),
        ]));

        // Create user account if requested
        if ($request->boolean('create_user_account')) {
            $user = User::create([
                'name' => $validated['contact_name'],
                'email' => $validated['email'],
                'password' => Hash::make($request->user_password),
            ]);

            $partner->update(['user_id' => $user->id]);
        }

        // Generate default QR code
        $this->qrCodeService->generateForPartner($partner);

        return redirect()->route('admin.partners.show', $partner)
            ->with('success', 'Partner created successfully.');
    }

    public function edit(Partner $partner)
    {
        $tiers = PartnerTier::ordered()->get();
        $businessTypes = ['hotel', 'hostel', 'tour_operator', 'diving_shop', 'transport', 'dmo', 'restaurant'];
        $currencies = ['THB', 'USD', 'EUR'];
        $paymentMethods = ['manual', 'stripe', 'promptpay', 'bank_transfer'];

        return Inertia::render('admin/partners/edit', [
            'partner' => $partner,
            'tiers' => $tiers,
            'businessTypes' => $businessTypes,
            'currencies' => $currencies,
            'paymentMethods' => $paymentMethods,
        ]);
    }

    public function update(Request $request, Partner $partner)
    {
        $validated = $request->validate([
            'business_name' => 'required|string|max:255',
            'business_type' => 'required|string',
            'contact_name' => 'required|string|max:255',
            'email' => 'required|email|unique:partners,email,' . $partner->id,
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:255',
            'website' => 'nullable|url',
            'commission_structure' => 'required|in:percentage,fixed,tiered',
            'default_commission_rate' => 'required|numeric|min:0|max:100',
            'payment_method' => 'required|string',
            'payment_currency' => 'required|string|in:THB,USD,EUR',
            'is_active' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        $partner->update($validated);

        return redirect()->route('admin.partners.show', $partner)
            ->with('success', 'Partner updated successfully.');
    }

    public function destroy(Partner $partner)
    {
        $partner->delete();

        return redirect()->route('admin.partners.index')
            ->with('success', 'Partner deleted successfully.');
    }

    public function recalculatePlv(Partner $partner)
    {
        $plv = $partner->calculatePLV();
        $partner->updateEngagementScore();

        return back()->with('success', "PLV recalculated: " . number_format($plv, 2));
    }

    public function generateQrCode(Partner $partner)
    {
        $path = $this->qrCodeService->generateForPartner($partner);

        return back()->with('success', 'QR Code generated successfully.');
    }
}
