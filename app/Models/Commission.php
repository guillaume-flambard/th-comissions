<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Commission extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'partner_id',
        'booking_id',
        'commission_type',
        'amount',
        'currency',
        'amount_usd',
        'exchange_rate',
        'base_amount',
        'commission_rate',
        'calculation_method',
        'status',
        'approved_at',
        'approved_by',
        'paid_at',
        'paid_by',
        'payment_method',
        'payment_reference',
        'payment_notes',
        'invoice_number',
        'period_start',
        'period_end',
        'batch_id',
        'notes',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'amount_usd' => 'decimal:2',
        'exchange_rate' => 'decimal:4',
        'base_amount' => 'decimal:2',
        'commission_rate' => 'decimal:2',
        'approved_at' => 'datetime',
        'paid_at' => 'datetime',
        'period_start' => 'date',
        'period_end' => 'date',
        'metadata' => 'array',
    ];

    /**
     * Boot method
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($commission) {
            // Generate invoice number
            if (!$commission->invoice_number) {
                $commission->invoice_number = self::generateInvoiceNumber();
            }
        });

        // When commission is paid, update partner total
        static::updated(function ($commission) {
            if ($commission->wasChanged('status') && $commission->status === 'paid') {
                $commission->partner->increment('total_commissions_paid', $commission->amount);
            }
        });
    }

    /**
     * Generate unique invoice number
     */
    public static function generateInvoiceNumber(): string
    {
        do {
            $number = 'INV-' . now()->format('Ymd') . '-' . strtoupper(\Illuminate\Support\Str::random(6));
        } while (self::where('invoice_number', $number)->exists());

        return $number;
    }

    /**
     * Relationships
     */
    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function paidBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'paid_by');
    }

    /**
     * Approve the commission
     */
    public function approve($userId = null): void
    {
        $this->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $userId,
        ]);
    }

    /**
     * Mark commission as paid
     */
    public function markAsPaid($userId = null, string $paymentMethod = null, string $reference = null): void
    {
        $this->update([
            'status' => 'paid',
            'paid_at' => now(),
            'paid_by' => $userId,
            'payment_method' => $paymentMethod,
            'payment_reference' => $reference,
        ]);
    }

    /**
     * Reject the commission
     */
    public function reject(string $reason = null): void
    {
        $this->update([
            'status' => 'rejected',
            'notes' => $reason,
        ]);
    }

    /**
     * Put commission on hold
     */
    public function hold(string $reason = null): void
    {
        $this->update([
            'status' => 'on_hold',
            'notes' => $reason,
        ]);
    }

    /**
     * Scopes
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopeUnpaid($query)
    {
        return $query->whereIn('status', ['pending', 'approved']);
    }

    public function scopeForPartner($query, $partnerId)
    {
        return $query->where('partner_id', $partnerId);
    }

    public function scopeInPeriod($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    public function scopeInBatch($query, $batchId)
    {
        return $query->where('batch_id', $batchId);
    }

    public function scopeByCurrency($query, $currency)
    {
        return $query->where('currency', $currency);
    }
}

