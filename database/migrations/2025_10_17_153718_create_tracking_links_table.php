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
        Schema::create('tracking_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_id')->constrained()->onDelete('cascade');

            // Tracking Identifiers
            $table->string('unique_code')->unique(); // Short code for URL (e.g., "ABC123")
            $table->string('utm_source')->nullable(); // Partner business name
            $table->string('utm_medium')->nullable(); // referral, qr_code, widget
            $table->string('utm_campaign')->nullable(); // Campaign name if applicable
            $table->string('utm_content')->nullable(); // For A/B testing different materials

            // Link Details
            $table->string('link_type')->default('general'); // general, product_specific, campaign
            $table->string('target_url')->nullable(); // Where the link points to
            $table->text('description')->nullable(); // Internal description
            $table->string('qr_code_path')->nullable(); // Path to generated QR code image

            // Analytics
            $table->integer('clicks')->default(0);
            $table->integer('conversions')->default(0);
            $table->decimal('conversion_rate', 5, 2)->default(0);
            $table->decimal('total_revenue', 15, 2)->default(0); // Revenue from this specific link
            $table->timestamp('last_clicked_at')->nullable();

            // Status
            $table->boolean('is_active')->default(true);
            $table->timestamp('expires_at')->nullable(); // Optional expiration for campaign links

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tracking_links');
    }
};
