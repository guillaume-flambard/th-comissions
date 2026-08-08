<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Referral extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'tracking_link_id',
        'referring_partner_id',
        'receiving_partner_id',
        'user_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'service_type',
        'service_description',
        'booking_date',
        'service_date',
        'service_amount',
        'commission_rate',
        'commission_amount',
        'commission_type',
        'status',
        'pms_booking_id',
        'notes',
        'metadata',
        'validated_at',
        'paid_at',
        'payment_reference',
    ];

    protected $casts = [
        'metadata' => 'array',
        'commission_rate' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'service_amount' => 'decimal:2',
        'booking_date' => 'datetime',
        'service_date' => 'datetime',
        'validated_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    /**
     * Boot method to auto-calculate commission
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($referral) {
            // Auto-calculate commission amount if not explicitly set
            // Only recalculate if commission_amount wasn't manually provided
            if (!$referral->isDirty('commission_amount') && $referral->isDirty(['service_amount', 'commission_rate'])) {
                $referral->calculateCommission();
            }
        });
    }

    /**
     * Relationships
     */
    public function trackingLink(): BelongsTo
    {
        return $this->belongsTo(TrackingLink::class);
    }

    public function referringPartner(): BelongsTo
    {
        return $this->belongsTo(Partner::class, 'referring_partner_id');
    }

    public function receivingPartner(): BelongsTo
    {
        return $this->belongsTo(Partner::class, 'receiving_partner_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Calculate commission amount based on service amount and commission rate
     */
    public function calculateCommission(): void
    {
        if ($this->commission_type === 'percentage') {
            $this->commission_amount = ($this->service_amount * $this->commission_rate) / 100;
        } else {
            // For fixed commission type, commission_amount should be set directly
            // commission_rate field can be ignored for fixed type
        }
    }

    /**
     * Scopes
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeValidated($query)
    {
        return $query->where('status', 'validated');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopeDisputed($query)
    {
        return $query->where('status', 'disputed');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForReferringPartner($query, $partnerId)
    {
        return $query->where('referring_partner_id', $partnerId);
    }

    public function scopeForReceivingPartner($query, $partnerId)
    {
        return $query->where('receiving_partner_id', $partnerId);
    }

    /**
     * Mark referral as validated
     */
    public function markAsValidated(): void
    {
        $this->update([
            'status' => 'validated',
            'validated_at' => now(),
        ]);
    }

    /**
     * Mark referral as paid
     */
    public function markAsPaid(?string $paymentReference = null): void
    {
        $this->update([
            'status' => 'paid',
            'paid_at' => now(),
            'payment_reference' => $paymentReference,
        ]);
    }

    /**
     * Mark referral as disputed
     */
    public function markAsDisputed(): void
    {
        $this->update([
            'status' => 'disputed',
        ]);
    }

    /**
     * Cancel referral
     */
    public function cancel(): void
    {
        $this->update([
            'status' => 'cancelled',
        ]);
    }
}
