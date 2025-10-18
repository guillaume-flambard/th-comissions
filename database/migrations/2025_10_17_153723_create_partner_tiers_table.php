<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('partner_tiers', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Gold, Silver, Bronze
            $table->string('slug')->unique(); // gold, silver, bronze
            $table->text('description')->nullable();
            $table->decimal('min_plv', 15, 2)->default(0); // Minimum PLV threshold for this tier
            $table->decimal('commission_rate', 5, 2)->default(0); // Default commission % for this tier
            $table->json('benefits')->nullable(); // Array of tier benefits
            $table->string('color')->nullable(); // UI color for badges (#FFD700 for gold, etc.)
            $table->integer('priority')->default(0); // For sorting (higher = better tier)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('partner_tiers');
    }
};
