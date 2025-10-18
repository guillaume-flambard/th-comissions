<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Booking extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'partner_id',
        'tracking_link_id',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_content',
        'utm_term',
        'referrer_url',
        'customer_name',
        'customer_email',
        'customer_phone',
        'customer_country',
        'booking_reference',
        'service_type',
        'service_name',
        'service_description',
        'booking_date',
        'service_date',
        'service_end_date',
        'quantity',
        'currency',
        'amount',
        'commission_rate',
        'commission_amount',
        'commission_structure',
        'status',
        'confirmed_at',
        'completed_at',
        'cancelled_at',
        'cancellation_reason',
        'is_repeat_customer',
        'customer_satisfaction_score',
        'customer_lifetime_value',
        'metadata',
        'notes',
    ];

    protected $casts = [
        'booking_date' => 'date',
        'service_date' => 'date',
        'service_end_date' => 'date',
        'quantity' => 'integer',
        'amount' => 'decimal:2',
        'commission_rate' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'confirmed_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'is_repeat_customer' => 'boolean',
        'customer_satisfaction_score' => 'integer',
        'customer_lifetime_value' => 'decimal:2',
        'metadata' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($booking) {
            if (!$booking->booking_reference) {
                $booking->booking_reference = self::generateBookingReference();
            }

            if (!$booking->commission_amount && $booking->amount && $booking->commission_rate) {
                $booking->commission_amount = self::calculateCommissionAmount(
                    $booking->amount,
                    $booking->commission_rate,
                    $booking->commission_structure
                );
            }
        });

        static::updated(function ($booking) {
            if ($booking->wasChanged('status') && $booking->status === 'completed') {
                $booking->handleCompletion();
            }
        });
    }

    public static function generateBookingReference(): string
    {
        do {
            $reference = 'BK' . now()->format('Ymd') . strtoupper(Str::random(6));
        } while (self::where('booking_reference', $reference)->exists());

        return $reference;
    }

    public static function calculateCommissionAmount(float $amount, float $rate, string $structure): float
    {
        if ($structure === 'percentage') {
            return round(($amount * $rate) / 100, 2);
        }
        return round($rate, 2);
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    public function trackingLink(): BelongsTo
    {
        return $this->belongsTo(TrackingLink::class);
    }

    public function commissions(): HasMany
    {
        return $this->hasMany(Commission::class);
    }

    public function handleCompletion(): void
    {
        $this->createCommission();
        $this->updatePartnerMetrics();

        if ($this->trackingLink) {
            $this->trackingLink->recordConversion($this->amount);
        }

        if (!$this->completed_at) {
            $this->update(['completed_at' => now()]);
        }
    }

    public function createCommission(): Commission
    {
        return Commission::create([
            'partner_id' => $this->partner_id,
            'booking_id' => $this->id,
            'amount' => $this->commission_amount,
            'currency' => $this->currency,
            'base_amount' => $this->amount,
            'commission_rate' => $this->commission_rate,
            'calculation_method' => $this->commission_structure,
            'status' => 'pending',
        ]);
    }

    public function updatePartnerMetrics(): void
    {
        $partner = $this->partner;

        if (!$partner) {
            return;
        }

        $partner->increment('total_referrals');
        $partner->increment('successful_conversions');
        $partner->increment('total_revenue_generated', $this->amount);
        $partner->update(['last_referral_at' => now()]);
        $partner->updateConversionRate();
        $partner->updateEngagementScore();
        $partner->calculatePLV();
    }

    public function confirm(): void
    {
        $this->update([
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);
    }

    public function complete(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    public function cancel(string $reason = null): void
    {
        $this->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $reason,
        ]);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeForPartner($query, $partnerId)
    {
        return $query->where('partner_id', $partnerId);
    }
}
