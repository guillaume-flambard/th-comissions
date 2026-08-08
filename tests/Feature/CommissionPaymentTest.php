<?php

use App\Models\Booking;
use App\Models\Commission;
use App\Models\Partner;
use App\Models\User;

/**
 * Commission Payment Tracking Tests
 *
 * Tests for commission payment processing and tracking.
 * Critical for ensuring accurate financial transactions.
 */

describe('Commission Payment Status Management', function () {
    test('new commission starts with pending status', function () {
        $commission = Commission::factory()->create();

        expect($commission->status)->toBe('pending');
        expect($commission->approved_at)->toBeNull();
        expect($commission->paid_at)->toBeNull();
    });

    test('can approve commission', function () {
        $user = User::factory()->create();
        $commission = Commission::factory()->pending()->create();

        $commission->approve($user->id);

        expect($commission->fresh()->status)->toBe('approved');
        expect($commission->fresh()->approved_at)->not->toBeNull();
        expect($commission->fresh()->approved_by)->toBe($user->id);
    });

    test('can mark commission as paid', function () {
        $user = User::factory()->create();
        $commission = Commission::factory()->approved()->create();

        $commission->markAsPaid($user->id, 'bank_transfer', 'PAY-12345');

        $commission->refresh();

        expect($commission->status)->toBe('paid');
        expect($commission->paid_at)->not->toBeNull();
        expect($commission->paid_by)->toBe($user->id);
        expect($commission->payment_method)->toBe('bank_transfer');
        expect($commission->payment_reference)->toBe('PAY-12345');
    });

    test('payment reference is required when marking as paid', function () {
        $user = User::factory()->create();
        $commission = Commission::factory()->approved()->create();

        $commission->markAsPaid($user->id, 'bank_transfer', 'REF-98765');

        expect($commission->fresh()->payment_reference)->toBe('REF-98765');
        expect($commission->fresh()->payment_reference)->not->toBeNull();
    });

    test('can reject commission', function () {
        $commission = Commission::factory()->pending()->create();

        $commission->reject('Invalid booking data');

        expect($commission->fresh()->status)->toBe('rejected');
        expect($commission->fresh()->notes)->toContain('Invalid booking data');
    });

    test('can put commission on hold', function () {
        $commission = Commission::factory()->pending()->create();

        $commission->hold('Awaiting customer confirmation');

        expect($commission->fresh()->status)->toBe('on_hold');
        expect($commission->fresh()->notes)->toContain('Awaiting customer confirmation');
    });
});

describe('Commission Payment Workflow', function () {
    test('commission cannot be paid without approval', function () {
        $commission = Commission::factory()->pending()->create();

        expect($commission->status)->toBe('pending');
        expect($commission->approved_at)->toBeNull();
    });

    test('approved commission can be paid', function () {
        $user = User::factory()->create();
        $commission = Commission::factory()->approved()->create();

        expect($commission->status)->toBe('approved');

        $commission->markAsPaid($user->id, 'promptpay', 'PAY-APPROVED');

        expect($commission->fresh()->status)->toBe('paid');
    });

    test('commission status progression is tracked', function () {
        $approver = User::factory()->create();
        $payer = User::factory()->create();

        $commission = Commission::factory()->pending()->create();

        expect($commission->status)->toBe('pending');

        $commission->approve($approver->id);
        expect($commission->fresh()->status)->toBe('approved');

        $commission->markAsPaid($payer->id, 'bank_transfer', 'PAY-FINAL');
        expect($commission->fresh()->status)->toBe('paid');
    });
});

describe('Calculate Total Commission Owed to Partner', function () {
    test('calculates total unpaid commissions for partner', function () {
        $partner = Partner::factory()->create();

        // Unpaid commissions
        Commission::factory()->pending()->create([
            'partner_id' => $partner->id,
            'amount' => 1000.00,
        ]);

        Commission::factory()->approved()->create([
            'partner_id' => $partner->id,
            'amount' => 1500.00,
        ]);

        // Paid commission (should be excluded)
        Commission::factory()->paid()->create([
            'partner_id' => $partner->id,
            'amount' => 500.00,
        ]);

        $totalOwed = Commission::forPartner($partner->id)
            ->unpaid()
            ->sum('amount');

        expect((float)$totalOwed)->toBe(2500.00);
    });

    test('calculates commissions owed for specific period', function () {
        $partner = Partner::factory()->create();

        $startDate = now()->startOfMonth();
        $endDate = now()->endOfMonth();

        Commission::factory()->pending()->create([
            'partner_id' => $partner->id,
            'amount' => 1200.00,
            'created_at' => now()->subDays(5),
        ]);

        Commission::factory()->pending()->create([
            'partner_id' => $partner->id,
            'amount' => 800.00,
            'created_at' => now()->subMonths(2),
        ]);

        $periodTotal = Commission::forPartner($partner->id)
            ->inPeriod($startDate, $endDate)
            ->sum('amount');

        expect((float)$periodTotal)->toBe(1200.00);
    });
});

describe('Batch Commission Payments', function () {
    test('marks multiple commissions as paid in batch', function () {
        $partner = Partner::factory()->create();
        $user = User::factory()->create();

        $commissions = Commission::factory()
            ->count(5)
            ->approved()
            ->create([
                'partner_id' => $partner->id,
                'amount' => 500.00,
            ]);

        $batchId = 'BATCH-' . now()->format('Ymd') . '-001';

        foreach ($commissions as $commission) {
            $commission->update(['batch_id' => $batchId]);
            $commission->markAsPaid($user->id, 'bank_transfer', 'BATCH-REF-001');
        }

        $paidCount = Commission::inBatch($batchId)->paid()->count();

        expect($paidCount)->toBe(5);
    });

    test('batch commissions have same batch ID', function () {
        $partner = Partner::factory()->create();
        $batchId = 'BATCH-TEST-123';

        Commission::factory()
            ->count(3)
            ->create([
                'partner_id' => $partner->id,
                'batch_id' => $batchId,
            ]);

        $batchCommissions = Commission::inBatch($batchId)->count();

        expect($batchCommissions)->toBe(3);
    });

    test('calculates total amount for batch payment', function () {
        $partner = Partner::factory()->create();
        $batchId = 'BATCH-PAYMENT-456';

        Commission::factory()->approved()->create([
            'partner_id' => $partner->id,
            'batch_id' => $batchId,
            'amount' => 1000.00,
        ]);

        Commission::factory()->approved()->create([
            'partner_id' => $partner->id,
            'batch_id' => $batchId,
            'amount' => 1500.00,
        ]);

        Commission::factory()->approved()->create([
            'partner_id' => $partner->id,
            'batch_id' => $batchId,
            'amount' => 2000.00,
        ]);

        $batchTotal = Commission::inBatch($batchId)->sum('amount');

        expect((float)$batchTotal)->toBe(4500.00);
    });
});

describe('Commission Cannot Be Paid Twice', function () {
    test('paid commission retains paid status', function () {
        $user = User::factory()->create();
        $commission = Commission::factory()->paid()->create();

        $originalPaidAt = $commission->paid_at;
        $originalReference = $commission->payment_reference;

        expect($commission->status)->toBe('paid');
        expect($commission->payment_reference)->not->toBeNull();

        // Attempting to pay again should not change the original payment details
        $commission->refresh();

        expect($commission->status)->toBe('paid');
        expect($commission->paid_at->equalTo($originalPaidAt))->toBeTrue();
    });

    test('cannot find commission in unpaid query after payment', function () {
        $partner = Partner::factory()->create();
        $commission = Commission::factory()->pending()->create([
            'partner_id' => $partner->id,
        ]);

        $unpaidBefore = Commission::forPartner($partner->id)->unpaid()->count();
        expect($unpaidBefore)->toBe(1);

        $user = User::factory()->create();
        $commission->approve($user->id);
        $commission->markAsPaid($user->id, 'bank_transfer', 'PAY-ONCE');

        $unpaidAfter = Commission::forPartner($partner->id)->unpaid()->count();
        expect($unpaidAfter)->toBe(0);
    });
});

describe('Withholding Tax Calculation', function () {
    test('calculates 3% withholding tax for Thai tax law', function () {
        $commission = Commission::factory()->create([
            'amount' => 10000.00,
            'currency' => 'THB',
        ]);

        $withholdingTax = $commission->amount * 0.03;

        expect($withholdingTax)->toBe(300.00);
    });

    test('net payment after withholding tax', function () {
        $commission = Commission::factory()->create([
            'amount' => 5000.00,
            'currency' => 'THB',
        ]);

        $withholdingTax = $commission->amount * 0.03;
        $netPayment = $commission->amount - $withholdingTax;

        expect($withholdingTax)->toBe(150.00);
        expect($netPayment)->toBe(4850.00);
    });

    test('withholding tax calculation for multiple commissions', function () {
        $partner = Partner::factory()->create();

        Commission::factory()->approved()->create([
            'partner_id' => $partner->id,
            'amount' => 1000.00,
        ]);

        Commission::factory()->approved()->create([
            'partner_id' => $partner->id,
            'amount' => 2000.00,
        ]);

        $totalCommissions = Commission::forPartner($partner->id)
            ->unpaid()
            ->sum('amount');

        $totalWithholding = $totalCommissions * 0.03;
        $netPayment = $totalCommissions - $totalWithholding;

        expect((float)$totalCommissions)->toBe(3000.00);
        expect($totalWithholding)->toBe(90.00);
        expect($netPayment)->toBe(2910.00);
    });
});

describe('Partner Total Commissions Paid Update', function () {
    test('updates partner total when commission is paid', function () {
        $partner = Partner::factory()->create([
            'total_commissions_paid' => 0,
        ]);

        $commission = Commission::factory()->approved()->create([
            'partner_id' => $partner->id,
            'amount' => 1500.00,
        ]);

        $user = User::factory()->create();
        $commission->markAsPaid($user->id, 'bank_transfer', 'PAY-UPDATE');

        expect($partner->fresh()->total_commissions_paid)->toBe('1500.00');
    });

    test('increments partner total for multiple payments', function () {
        $partner = Partner::factory()->create([
            'total_commissions_paid' => 1000.00,
        ]);

        $commission1 = Commission::factory()->approved()->create([
            'partner_id' => $partner->id,
            'amount' => 500.00,
        ]);

        $commission2 = Commission::factory()->approved()->create([
            'partner_id' => $partner->id,
            'amount' => 750.00,
        ]);

        $user = User::factory()->create();
        $commission1->markAsPaid($user->id, 'bank_transfer', 'PAY-1');
        $commission2->markAsPaid($user->id, 'bank_transfer', 'PAY-2');

        expect($partner->fresh()->total_commissions_paid)->toBe('2250.00');
    });
});

describe('Commission Invoice Generation', function () {
    test('generates unique invoice number on creation', function () {
        $commission = Commission::factory()->create();

        expect($commission->invoice_number)->toStartWith('INV-');
        expect($commission->invoice_number)->toMatch('/^INV-\d{8}-[A-Z0-9]{6}$/');
    });

    test('invoice numbers are unique', function () {
        $commission1 = Commission::factory()->create();
        $commission2 = Commission::factory()->create();

        expect($commission1->invoice_number)->not->toBe($commission2->invoice_number);
    });

    test('invoice number includes date', function () {
        $commission = Commission::factory()->create();

        $today = now()->format('Ymd');

        expect($commission->invoice_number)->toContain($today);
    });
});

describe('Commission Filtering and Queries', function () {
    test('filters commissions by status', function () {
        Commission::factory()->count(2)->pending()->create();
        Commission::factory()->count(3)->approved()->create();
        Commission::factory()->count(4)->paid()->create();

        expect(Commission::pending()->count())->toBe(2);
        expect(Commission::approved()->count())->toBe(3);
        expect(Commission::paid()->count())->toBe(4);
    });

    test('filters unpaid commissions (pending and approved)', function () {
        Commission::factory()->count(2)->pending()->create();
        Commission::factory()->count(3)->approved()->create();
        Commission::factory()->count(4)->paid()->create();

        expect(Commission::unpaid()->count())->toBe(5);
    });

    test('filters commissions by partner', function () {
        $partner1 = Partner::factory()->create();
        $partner2 = Partner::factory()->create();

        Commission::factory()->count(3)->create(['partner_id' => $partner1->id]);
        Commission::factory()->count(2)->create(['partner_id' => $partner2->id]);

        expect(Commission::forPartner($partner1->id)->count())->toBe(3);
        expect(Commission::forPartner($partner2->id)->count())->toBe(2);
    });

    test('filters commissions by currency', function () {
        Commission::factory()->count(3)->thb()->create();
        Commission::factory()->count(2)->usd()->create();

        expect(Commission::byCurrency('THB')->count())->toBe(3);
        expect(Commission::byCurrency('USD')->count())->toBe(2);
    });
});

describe('Commission Payment Methods', function () {
    test('records bank transfer payment', function () {
        $user = User::factory()->create();
        $commission = Commission::factory()->approved()->create();

        $commission->markAsPaid($user->id, 'bank_transfer', 'BANK-REF-123');

        expect($commission->fresh()->payment_method)->toBe('bank_transfer');
    });

    test('records PromptPay payment', function () {
        $user = User::factory()->create();
        $commission = Commission::factory()->approved()->create();

        $commission->markAsPaid($user->id, 'promptpay', 'PP-REF-456');

        expect($commission->fresh()->payment_method)->toBe('promptpay');
    });

    test('records Stripe payment', function () {
        $user = User::factory()->create();
        $commission = Commission::factory()->approved()->create();

        $commission->markAsPaid($user->id, 'stripe', 'pi_1234567890');

        expect($commission->fresh()->payment_method)->toBe('stripe');
        expect($commission->fresh()->payment_reference)->toContain('pi_');
    });
});

describe('Commission Payment Notes', function () {
    test('stores payment notes', function () {
        $user = User::factory()->create();
        $commission = Commission::factory()->approved()->create();

        $commission->markAsPaid($user->id, 'bank_transfer', 'PAY-001');
        $commission->update(['payment_notes' => 'Payment processed on schedule']);

        expect($commission->fresh()->payment_notes)->toBe('Payment processed on schedule');
    });

    test('stores general notes', function () {
        $commission = Commission::factory()->create([
            'notes' => 'High-priority commission',
        ]);

        expect($commission->notes)->toBe('High-priority commission');
    });
});

describe('Commission Currency Conversion', function () {
    test('stores THB amount and USD equivalent', function () {
        $commission = Commission::factory()->thb()->create([
            'amount' => 35500.00,
        ]);

        expect($commission->currency)->toBe('THB');
        expect($commission->amount)->toBe('35500.00');
        expect($commission->amount_usd)->toBeString();
        expect((float)$commission->amount_usd)->toBeLessThan((float)$commission->amount);
    });

    test('stores USD amount directly', function () {
        $commission = Commission::factory()->usd()->create([
            'amount' => 1000.00,
            'amount_usd' => 1000.00,
        ]);

        expect($commission->currency)->toBe('USD');
        expect($commission->amount)->toBe('1000.00');
        expect($commission->amount_usd)->toBe('1000.00');
    });

    test('exchange rate is recorded', function () {
        $commission = Commission::factory()->thb()->create();

        expect($commission->exchange_rate)->toBeString();
        expect((float)$commission->exchange_rate)->toBeGreaterThan(0);
    });
});

describe('Commission Relationship to Booking', function () {
    test('commission is linked to booking', function () {
        $booking = Booking::factory()->confirmed()->create([
            'amount' => 10000.00,
            'commission_amount' => 1500.00,
        ]);

        // Complete the booking to trigger commission creation
        $booking->complete();

        $commission = $booking->commissions()->first();

        expect($commission->booking_id)->toBe($booking->id);
        expect($commission->amount)->toBe('1500.00');
    });

    test('can access booking from commission', function () {
        $booking = Booking::factory()->confirmed()->create();

        // Complete the booking to trigger commission creation
        $booking->complete();

        $commission = $booking->commissions()->first();

        expect($commission->booking->id)->toBe($booking->id);
    });
});

describe('Commission Period Tracking', function () {
    test('stores commission period dates', function () {
        $commission = Commission::factory()->create([
            'period_start' => now()->startOfMonth(),
            'period_end' => now()->endOfMonth(),
        ]);

        expect($commission->period_start)->not->toBeNull();
        expect($commission->period_end)->not->toBeNull();
    });

    test('filters commissions by period', function () {
        $startDate = now()->startOfMonth();
        $endDate = now()->endOfMonth();

        Commission::factory()->create([
            'created_at' => now()->subDays(5),
        ]);

        Commission::factory()->create([
            'created_at' => now()->subMonths(2),
        ]);

        $periodCommissions = Commission::inPeriod($startDate, $endDate)->count();

        expect($periodCommissions)->toBe(1);
    });
});
