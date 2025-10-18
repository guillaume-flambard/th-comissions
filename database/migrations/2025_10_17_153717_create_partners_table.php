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
        Schema::create('partners', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade'); // Links to User for auth
            $table->foreignId('partner_tier_id')->nullable()->constrained()->onDelete('set null');

            // Business Information
            $table->string('business_name');
            $table->string('business_type'); // hotel, hostel, tour_operator, diving_shop, transport, dmo, restaurant
            $table->string('contact_name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('country')->default('TH');
            $table->string('website')->nullable();

            // Commission Settings
            $table->string('commission_structure')->default('percentage'); // percentage, fixed, tiered, recurring
            $table->decimal('default_commission_rate', 5, 2)->default(10.00); // Default 10%
            $table->decimal('fixed_commission_amount', 10, 2)->nullable(); // For fixed structure
            $table->json('tiered_commission_rules')->nullable(); // For tiered structure

            // Payment Information
            $table->string('payment_method')->default('manual'); // manual, stripe, promptpay, bank_transfer
            $table->string('payment_currency')->default('THB'); // THB, USD, EUR
            $table->string('stripe_account_id')->nullable();
            $table->string('promptpay_id')->nullable(); // Thai phone or ID number
            $table->string('bank_name')->nullable();
            $table->string('bank_account_number')->nullable();
            $table->string('bank_account_name')->nullable();

            // PLV Tracking Fields
            $table->decimal('total_revenue_generated', 15, 2)->default(0); // Lifetime revenue from this partner
            $table->decimal('total_commissions_paid', 15, 2)->default(0);
            $table->decimal('calculated_plv', 15, 2)->default(0); // Cached PLV score
            $table->decimal('engagement_score', 5, 2)->default(0); // 0-100 score
            $table->integer('total_referrals')->default(0);
            $table->integer('successful_conversions')->default(0);
            $table->decimal('conversion_rate', 5, 2)->default(0); // Percentage
            $table->timestamp('last_referral_at')->nullable();
            $table->timestamp('joined_at')->nullable();

            // Status & Metadata
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable(); // Internal admin notes
            $table->json('metadata')->nullable(); // Flexible storage for custom fields

            $table->timestamps();
            $table->softDeletes(); // Soft delete for historical data integrity
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('partners');
    }
};
