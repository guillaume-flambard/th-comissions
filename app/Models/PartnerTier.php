<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PartnerTier extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'min_plv',
        'commission_rate',
        'benefits',
        'color',
        'priority',
    ];

    protected $casts = [
        'min_plv' => 'decimal:2',
        'commission_rate' => 'decimal:2',
        'benefits' => 'array',
        'priority' => 'integer',
    ];

    /**
     * Get all partners in this tier
     */
    public function partners(): HasMany
    {
        return $this->hasMany(Partner::class);
    }

    /**
     * Scope to get tiers ordered by priority
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('priority', 'desc');
    }
}
