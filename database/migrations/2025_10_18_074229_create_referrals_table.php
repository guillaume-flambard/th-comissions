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
        Schema::create('referrals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tracking_link_id')->nullable();
            $table->uuid('referring_partner_id'); // Who sent the customer
            $table->uuid('receiving_partner_id'); // Who received the customer
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Customer information
            $table->string('customer_name');
            $table->string('customer_email')->nullable();
            $table->string('customer_phone')->nullable();

            // Service information
            $table->string('service_type', 100); // 'diving', 'kite_lesson', 'transfer', 'tour', 'accommodation'
            $table->text('service_description')->nullable();
            $table->timestamp('booking_date');
            $table->timestamp('service_date')->nullable();

            // Financial information
            $table->decimal('service_amount', 10, 2); // Total service cost in THB
            $table->decimal('commission_rate', 5, 2); // Applied commission percentage
            $table->decimal('commission_amount', 10, 2); // Calculated commission
            $table->enum('commission_type', ['percentage', 'fixed'])->default('percentage');

            // Status tracking
            $table->enum('status', ['pending', 'validated', 'paid', 'disputed', 'cancelled'])->default('pending');

            // PMS integration
            $table->string('pms_booking_id', 100)->nullable(); // Integration with STAAH, Cloudbeds, etc.

            // Notes and metadata
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable(); // For additional data (UTM params, etc.)

            // Payment tracking
            $table->timestamp('validated_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->string('payment_reference')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('tracking_link_id');
            $table->index('referring_partner_id');
            $table->index('receiving_partner_id');
            $table->index('user_id');
            $table->index('status');
            $table->index('booking_date');
            $table->index(['user_id', 'status']);

            // Foreign keys
            $table->foreign('tracking_link_id')->references('id')->on('tracking_links')->onDelete('set null');
            $table->foreign('referring_partner_id')->references('id')->on('partners')->onDelete('cascade');
            $table->foreign('receiving_partner_id')->references('id')->on('partners')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('referrals');
    }
};
