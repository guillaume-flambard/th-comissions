<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReferralRequest;
use App\Models\Partner;
use App\Models\Referral;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReferralController extends Controller
{
    /**
     * Display a listing of referrals
     */
    public function index(Request $request)
    {
        $query = Referral::with([
            'referringPartner:id,business_name,business_type',
            'receivingPartner:id,business_name,business_type',
            'trackingLink:id,unique_code,utm_campaign'
        ])->where('user_id', auth()->id());

        // Tab filtering (all, received, sent)
        $tab = $request->get('tab', 'all');

        if ($tab === 'received') {
            // Show referrals where the user's partner received the customer
            $userPartnerIds = Partner::where('user_id', auth()->id())->pluck('id');
            $query->whereIn('receiving_partner_id', $userPartnerIds);
        } elseif ($tab === 'sent') {
            // Show referrals where the user's partner referred the customer
            $userPartnerIds = Partner::where('user_id', auth()->id())->pluck('id');
            $query->whereIn('referring_partner_id', $userPartnerIds);
        }

        // Status filtering
        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        // Search by customer name or service type
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                    ->orWhere('service_type', 'like', "%{$search}%")
                    ->orWhere('customer_email', 'like', "%{$search}%");
            });
        }

        // Date range filtering
        if ($request->filled('date_from')) {
            $query->where('booking_date', '>=', $request->get('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->where('booking_date', '<=', $request->get('date_to'));
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'booking_date');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate results
        $referrals = $query->paginate(20)->withQueryString();

        // Get summary statistics
        $stats = [
            'total' => Referral::where('user_id', auth()->id())->count(),
            'pending' => Referral::where('user_id', auth()->id())->where('status', 'pending')->count(),
            'validated' => Referral::where('user_id', auth()->id())->where('status', 'validated')->count(),
            'paid' => Referral::where('user_id', auth()->id())->where('status', 'paid')->count(),
            'total_commission' => Referral::where('user_id', auth()->id())
                ->where('status', 'paid')
                ->sum('commission_amount'),
        ];

        // Get user's partners for the create form
        $partners = Partner::where('user_id', auth()->id())
            ->where('is_active', true)
            ->select('id', 'business_name', 'business_type', 'default_commission_rate')
            ->get();

        return Inertia::render('referrals/index', [
            'referrals' => $referrals,
            'stats' => $stats,
            'partners' => $partners,
            'filters' => [
                'tab' => $tab,
                'status' => $request->get('status'),
                'search' => $request->get('search'),
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to'),
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
        ]);
    }

    /**
     * Show the form for creating a new referral
     */
    public function create()
    {
        // Get user's partners for the form
        $partners = Partner::where('user_id', auth()->id())
            ->where('is_active', true)
            ->select('id', 'business_name', 'business_type', 'default_commission_rate')
            ->get();

        return Inertia::render('referrals/create', [
            'partners' => $partners,
        ]);
    }

    /**
     * Store a newly created referral
     */
    public function store(StoreReferralRequest $request)
    {
        $validated = $request->validated();

        // Set user_id
        $validated['user_id'] = auth()->id();

        // Get commission rate from partner if not provided
        if (!isset($validated['commission_rate'])) {
            $referringPartner = Partner::findOrFail($validated['referring_partner_id']);
            $validated['commission_rate'] = $referringPartner->default_commission_rate;
        }

        // Set default commission type
        if (!isset($validated['commission_type'])) {
            $validated['commission_type'] = 'percentage';
        }

        // Create referral (commission amount will be auto-calculated by model)
        $referral = Referral::create($validated);

        return redirect()->route('referrals.index')
            ->with('success', 'Referral บันทึกสำเร็จแล้ว');
    }

    /**
     * Update the specified referral
     */
    public function update(Request $request, Referral $referral)
    {
        // Verify ownership
        if ($referral->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this referral');
        }

        $validated = $request->validate([
            'service_amount' => 'sometimes|numeric|min:0',
            'commission_rate' => 'sometimes|numeric|min:0|max:100',
            'notes' => 'nullable|string',
            'status' => 'sometimes|in:pending,validated,paid,disputed,cancelled',
            'service_description' => 'nullable|string',
        ]);

        // Update referral (commission will be recalculated if amount or rate changed)
        $referral->update($validated);

        return redirect()->route('referrals.index')
            ->with('success', 'Referral อัปเดตสำเร็จแล้ว');
    }

    /**
     * Mark referral as validated
     */
    public function markAsValidated(Referral $referral)
    {
        // Verify ownership
        if ($referral->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this referral');
        }

        $referral->markAsValidated();

        if (request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Referral ได้รับการยืนยันแล้ว',
            ]);
        }

        return redirect()->back()
            ->with('success', 'Referral ได้รับการยืนยันแล้ว');
    }

    /**
     * Mark multiple referrals as paid
     */
    public function markAsPaid(Request $request)
    {
        $validated = $request->validate([
            'referral_ids' => 'required|array',
            'referral_ids.*' => 'exists:referrals,id',
            'payment_reference' => 'nullable|string|max:255',
        ]);

        // Get referrals and verify ownership
        $referrals = Referral::whereIn('id', $validated['referral_ids'])
            ->where('user_id', auth()->id())
            ->get();

        if ($referrals->count() !== count($validated['referral_ids'])) {
            return back()->withErrors(['error' => 'Some referrals do not belong to you']);
        }

        // Mark all as paid
        foreach ($referrals as $referral) {
            $referral->markAsPaid($validated['payment_reference'] ?? null);
        }

        $count = $referrals->count();

        if (request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => "{$count} Referrals ถูกทำเครื่องหมายว่าจ่ายแล้ว",
                'count' => $count,
            ]);
        }

        return redirect()->back()
            ->with('success', "{$count} Referrals ถูกทำเครื่องหมายว่าจ่ายแล้ว");
    }

    /**
     * Mark referral as disputed
     */
    public function markAsDisputed(Referral $referral)
    {
        // Verify ownership
        if ($referral->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this referral');
        }

        $referral->markAsDisputed();

        if (request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Referral ถูกทำเครื่องหมายว่ามีข้อโต้แย้ง',
            ]);
        }

        return redirect()->back()
            ->with('success', 'Referral ถูกทำเครื่องหมายว่ามีข้อโต้แย้ง');
    }

    /**
     * Cancel a referral
     */
    public function cancel(Referral $referral)
    {
        // Verify ownership
        if ($referral->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this referral');
        }

        $referral->cancel();

        if (request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Referral ถูกยกเลิกแล้ว',
            ]);
        }

        return redirect()->back()
            ->with('success', 'Referral ถูกยกเลิกแล้ว');
    }
}
