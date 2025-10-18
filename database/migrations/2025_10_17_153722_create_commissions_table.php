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
        Schema::create('commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_id')->constrained()->onDelete('cascade');
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');

            // Commission Details
            $table->string('commission_type')->default('standard'); // standard, bonus, recurring, override
            $table->decimal('amount', 10, 2); // Commission amount
            $table->string('currency')->default('THB');
            $table->decimal('amount_usd', 10, 2)->nullable(); // Converted amount for reporting
            $table->decimal('exchange_rate', 10, 4)->nullable(); // Rate used for conversion

            // Commission Calculation Details
            $table->decimal('base_amount', 15, 2); // Booking amount used for calculation
            $table->decimal('commission_rate', 5, 2); // Rate applied (percentage or fixed indicator)
            $table->string('calculation_method')->default('percentage'); // percentage, fixed, tiered

            // Payment Status & Workflow
            $table->string('status')->default('pending'); // pending, approved, paid, rejected, on_hold
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('paid_at')->nullable();
            $table->foreignId('paid_by')->nullable()->constrained('users')->onDelete('set null');
            $table->string('payment_method')->nullable(); // stripe, promptpay, bank_transfer, manual
            $table->string('payment_reference')->nullable(); // Transaction ID from payment provider
            $table->text('payment_notes')->nullable();

            // Reconciliation
            $table->string('invoice_number')->nullable()->unique();
            $table->date('period_start')->nullable(); // For batch/period-based payouts
            $table->date('period_end')->nullable();
            $table->foreignId('batch_id')->nullable(); // Group commissions into payment batches

            // Metadata
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index(['partner_id', 'status']);
            $table->index(['status', 'created_at']);
            $table->index('paid_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commissions');
    }
};
