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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_id')->constrained()->onDelete('cascade'); // Referring partner
            $table->foreignId('tracking_link_id')->nullable()->constrained()->onDelete('set null'); // Which link was used

            // Attribution Data (captured from UTM params)
            $table->string('utm_source')->nullable();
            $table->string('utm_medium')->nullable();
            $table->string('utm_campaign')->nullable();
            $table->string('utm_content')->nullable();
            $table->string('utm_term')->nullable();
            $table->string('referrer_url')->nullable(); // HTTP referrer if available

            // Customer Information
            $table->string('customer_name')->nullable();
            $table->string('customer_email')->nullable();
            $table->string('customer_phone')->nullable();
            $table->string('customer_country')->nullable();

            // Booking Details
            $table->string('booking_reference')->unique(); // Unique reference code
            $table->string('service_type'); // accommodation, tour, diving, transport, etc.
            $table->string('service_name'); // Name of the product/service booked
            $table->text('service_description')->nullable();
            $table->date('booking_date'); // When customer made the booking
            $table->date('service_date')->nullable(); // When service is scheduled (check-in, tour date, etc.)
            $table->date('service_end_date')->nullable(); // Check-out date, multi-day tour end, etc.
            $table->integer('quantity')->default(1); // Number of people, rooms, etc.

            // Financial Information
            $table->string('currency')->default('THB');
            $table->decimal('amount', 15, 2); // Total booking amount
            $table->decimal('commission_rate', 5, 2); // Rate at time of booking
            $table->decimal('commission_amount', 10, 2)->default(0); // Calculated commission
            $table->string('commission_structure')->default('percentage'); // percentage, fixed, tiered

            // Status & Validation Workflow
            $table->string('status')->default('pending'); // pending, confirmed, completed, cancelled, no_show
            $table->timestamp('confirmed_at')->nullable(); // When booking was confirmed
            $table->timestamp('completed_at')->nullable(); // When service was delivered (validated stay)
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();

            // Customer Quality Tracking (for PLV calculations)
            $table->boolean('is_repeat_customer')->default(false);
            $table->integer('customer_satisfaction_score')->nullable(); // 1-5 or 1-10
            $table->decimal('customer_lifetime_value', 15, 2)->default(0);

            // Metadata
            $table->json('metadata')->nullable(); // Flexible storage for additional data
            $table->text('notes')->nullable(); // Internal notes

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
