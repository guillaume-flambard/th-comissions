<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class TrackingLink extends Model
{
    use HasFactory;

    protected $fillable = [
        'partner_id',
        'unique_code',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_content',
        'link_type',
        'target_url',
        'description',
        'qr_code_path',
        'clicks',
        'conversions',
        'conversion_rate',
        'total_revenue',
        'last_clicked_at',
        'is_active',
        'expires_at',
    ];

    protected $casts = [
        'clicks' => 'integer',
        'conversions' => 'integer',
        'conversion_rate' => 'decimal:2',
        'total_revenue' => 'decimal:2',
        'is_active' => 'boolean',
        'last_clicked_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    /**
     * Boot method to generate unique code
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($link) {
            if (!$link->unique_code) {
                $link->unique_code = self::generateUniqueCode();
            }

            // Auto-populate UTM source from partner if not set
            if (!$link->utm_source && $link->partner) {
                $link->utm_source = Str::slug($link->partner->business_name);
            }
        });
    }

    /**
     * Generate a unique short code for the tracking link
     */
    public static function generateUniqueCode(): string
    {
        do {
            $code = strtoupper(Str::random(6));
        } while (self::where('unique_code', $code)->exists());

        return $code;
    }

    /**
     * Relationships
     */
    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Get the full tracking URL
     */
    public function getFullUrlAttribute(): string
    {
        $baseUrl = config('app.url');
        $params = [
            'ref' => $this->unique_code,
        ];

        if ($this->utm_source) {
            $params['utm_source'] = $this->utm_source;
        }
        if ($this->utm_medium) {
            $params['utm_medium'] = $this->utm_medium;
        }
        if ($this->utm_campaign) {
            $params['utm_campaign'] = $this->utm_campaign;
        }
        if ($this->utm_content) {
            $params['utm_content'] = $this->utm_content;
        }

        $queryString = http_build_query($params);
        $targetUrl = $this->target_url ?: $baseUrl;

        return $targetUrl . '?' . $queryString;
    }

    /**
     * Get short URL for easier sharing
     */
    public function getShortUrlAttribute(): string
    {
        return config('app.url') . '/r/' . $this->unique_code;
    }

    /**
     * Record a click on this link
     */
    public function recordClick(): void
    {
        $this->increment('clicks');
        $this->update(['last_clicked_at' => now()]);
    }

    /**
     * Record a conversion from this link
     */
    public function recordConversion(float $revenue): void
    {
        $this->increment('conversions');
        $this->increment('total_revenue', $revenue);
        $this->updateConversionRate();
    }

    /**
     * Update conversion rate
     */
    public function updateConversionRate(): void
    {
        if ($this->clicks > 0) {
            $rate = ($this->conversions / $this->clicks) * 100;
            $this->update(['conversion_rate' => $rate]);
        }
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }

    public function scopeExpired($query)
    {
        return $query->whereNotNull('expires_at')
            ->where('expires_at', '<=', now());
    }

    public function scopeTopPerformers($query, $limit = 10)
    {
        return $query->active()
            ->where('clicks', '>', 0)
            ->orderBy('conversion_rate', 'desc')
            ->limit($limit);
    }
}
