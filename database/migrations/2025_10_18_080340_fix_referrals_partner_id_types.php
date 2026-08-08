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
        Schema::table('referrals', function (Blueprint $table) {
            // Drop indexes first
            $table->dropIndex(['tracking_link_id']);
            $table->dropIndex(['referring_partner_id']);
            $table->dropIndex(['receiving_partner_id']);

            // Drop existing foreign keys
            $table->dropForeign(['tracking_link_id']);
            $table->dropForeign(['referring_partner_id']);
            $table->dropForeign(['receiving_partner_id']);

            // Drop existing columns
            $table->dropColumn(['tracking_link_id', 'referring_partner_id', 'receiving_partner_id']);
        });

        Schema::table('referrals', function (Blueprint $table) {
            // Add new columns with correct types (bigInteger instead of UUID)
            $table->unsignedBigInteger('tracking_link_id')->nullable()->after('id');
            $table->unsignedBigInteger('referring_partner_id')->after('tracking_link_id');
            $table->unsignedBigInteger('receiving_partner_id')->after('referring_partner_id');

            // Add foreign key constraints
            $table->foreign('tracking_link_id')->references('id')->on('tracking_links')->onDelete('set null');
            $table->foreign('referring_partner_id')->references('id')->on('partners')->onDelete('cascade');
            $table->foreign('receiving_partner_id')->references('id')->on('partners')->onDelete('cascade');

            // Add indexes
            $table->index('tracking_link_id');
            $table->index('referring_partner_id');
            $table->index('receiving_partner_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('referrals', function (Blueprint $table) {
            // Drop foreign keys
            $table->dropForeign(['tracking_link_id']);
            $table->dropForeign(['referring_partner_id']);
            $table->dropForeign(['receiving_partner_id']);

            // Drop columns
            $table->dropColumn(['tracking_link_id', 'referring_partner_id', 'receiving_partner_id']);
        });

        Schema::table('referrals', function (Blueprint $table) {
            // Restore UUID columns
            $table->uuid('tracking_link_id')->nullable()->after('id');
            $table->uuid('referring_partner_id')->after('tracking_link_id');
            $table->uuid('receiving_partner_id')->after('referring_partner_id');

            // Restore foreign keys
            $table->foreign('tracking_link_id')->references('id')->on('tracking_links')->onDelete('set null');
            $table->foreign('referring_partner_id')->references('id')->on('partners')->onDelete('cascade');
            $table->foreign('receiving_partner_id')->references('id')->on('partners')->onDelete('cascade');
        });
    }
};
