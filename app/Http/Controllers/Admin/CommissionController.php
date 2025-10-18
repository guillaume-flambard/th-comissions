<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Commission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CommissionController extends Controller
{
    public function index(Request $request)
    {
        $query = Commission::with(['partner', 'booking']);

        // Filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('partner_id')) {
            $query->where('partner_id', $request->partner_id);
        }

        if ($request->filled('currency')) {
            $query->where('currency', $request->currency);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $commissions = $query->latest()->paginate(50)->through(function ($commission) {
            return [
                'id' => $commission->id,
                'invoice_number' => $commission->invoice_number,
                'partner' => [
                    'id' => $commission->partner->id,
                    'business_name' => $commission->partner->business_name,
                ],
                'booking' => [
                    'booking_reference' => $commission->booking->booking_reference,
                    'service_name' => $commission->booking->service_name,
                ],
                'amount' => $commission->amount,
                'currency' => $commission->currency,
                'status' => $commission->status,
                'commission_rate' => $commission->commission_rate,
                'created_at' => $commission->created_at->format('Y-m-d'),
                'approved_at' => $commission->approved_at?->format('Y-m-d'),
                'paid_at' => $commission->paid_at?->format('Y-m-d'),
            ];
        });

        // Summary stats
        $stats = [
            'total_pending' => Commission::pending()->sum('amount'),
            'total_approved' => Commission::approved()->sum('amount'),
            'total_paid' => Commission::paid()->sum('amount'),
            'count_pending' => Commission::pending()->count(),
            'count_approved' => Commission::approved()->count(),
        ];

        return Inertia::render('admin/commissions/index', [
            'commissions' => $commissions,
            'stats' => $stats,
            'filters' => $request->only(['status', 'partner_id', 'currency', 'date_from', 'date_to']),
        ]);
    }

    public function show(Commission $commission)
    {
        $commission->load(['partner', 'booking', 'approvedBy', 'paidBy']);

        return Inertia::render('admin/commissions/show', [
            'commission' => $commission,
        ]);
    }

    public function approve(Request $request, Commission $commission)
    {
        if ($commission->status !== 'pending') {
            return back()->withErrors(['error' => 'Only pending commissions can be approved.']);
        }

        $commission->approve($request->user()->id);

        return back()->with('success', 'Commission approved successfully.');
    }

    public function bulkApprove(Request $request)
    {
        $validated = $request->validate([
            'commission_ids' => 'required|array',
            'commission_ids.*' => 'exists:commissions,id',
        ]);

        $count = Commission::whereIn('id', $validated['commission_ids'])
            ->where('status', 'pending')
            ->get()
            ->each(function ($commission) use ($request) {
                $commission->approve($request->user()->id);
            })
            ->count();

        return back()->with('success', "Approved {$count} commissions.");
    }

    public function markAsPaid(Request $request, Commission $commission)
    {
        $validated = $request->validate([
            'payment_method' => 'required|string',
            'payment_reference' => 'nullable|string',
            'payment_notes' => 'nullable|string',
        ]);

        if (!in_array($commission->status, ['pending', 'approved'])) {
            return back()->withErrors(['error' => 'Commission must be pending or approved to mark as paid.']);
        }

        $commission->markAsPaid(
            $request->user()->id,
            $validated['payment_method'],
            $validated['payment_reference']
        );

        if (!empty($validated['payment_notes'])) {
            $commission->update(['payment_notes' => $validated['payment_notes']]);
        }

        return back()->with('success', 'Commission marked as paid.');
    }

    public function bulkPay(Request $request)
    {
        $validated = $request->validate([
            'commission_ids' => 'required|array',
            'commission_ids.*' => 'exists:commissions,id',
            'payment_method' => 'required|string',
            'payment_reference' => 'nullable|string',
        ]);

        $count = Commission::whereIn('id', $validated['commission_ids'])
            ->whereIn('status', ['pending', 'approved'])
            ->get()
            ->each(function ($commission) use ($request, $validated) {
                $commission->markAsPaid(
                    $request->user()->id,
                    $validated['payment_method'],
                    $validated['payment_reference'] ?? null
                );
            })
            ->count();

        return back()->with('success', "Marked {$count} commissions as paid.");
    }

    public function reject(Request $request, Commission $commission)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $commission->reject($validated['reason']);

        return back()->with('success', 'Commission rejected.');
    }

    public function hold(Request $request, Commission $commission)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $commission->hold($validated['reason']);

        return back()->with('success', 'Commission put on hold.');
    }

    public function exportCsv(Request $request)
    {
        $query = Commission::with(['partner', 'booking']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $commissions = $query->get();

        $csv = "Invoice Number,Partner,Booking Reference,Amount,Currency,Status,Created At,Paid At\n";

        foreach ($commissions as $commission) {
            $csv .= implode(',', [
                $commission->invoice_number,
                $commission->partner->business_name,
                $commission->booking->booking_reference,
                $commission->amount,
                $commission->currency,
                $commission->status,
                $commission->created_at->format('Y-m-d'),
                $commission->paid_at?->format('Y-m-d') ?? 'N/A',
            ]) . "\n";
        }

        return response($csv, 200)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="commissions-' . now()->format('Y-m-d') . '.csv"');
    }
}
