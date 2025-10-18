<?php

use App\Http\Controllers\Admin\BookingController;
use App\Http\Controllers\Admin\CommissionController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\PartnerController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Partners Management
    Route::resource('partners', PartnerController::class);
    Route::post('partners/{partner}/recalculate-plv', [PartnerController::class, 'recalculatePlv'])->name('partners.recalculate-plv');
    Route::post('partners/{partner}/generate-qr', [PartnerController::class, 'generateQrCode'])->name('partners.generate-qr');

    // Bookings Management
    Route::resource('bookings', BookingController::class)->only(['index', 'show', 'update']);

    // Commissions Management
    Route::get('commissions', [CommissionController::class, 'index'])->name('commissions.index');
    Route::get('commissions/{commission}', [CommissionController::class, 'show'])->name('commissions.show');
    Route::post('commissions/{commission}/approve', [CommissionController::class, 'approve'])->name('commissions.approve');
    Route::post('commissions/bulk-approve', [CommissionController::class, 'bulkApprove'])->name('commissions.bulk-approve');
    Route::post('commissions/{commission}/pay', [CommissionController::class, 'markAsPaid'])->name('commissions.pay');
    Route::post('commissions/bulk-pay', [CommissionController::class, 'bulkPay'])->name('commissions.bulk-pay');
    Route::post('commissions/{commission}/reject', [CommissionController::class, 'reject'])->name('commissions.reject');
    Route::post('commissions/{commission}/hold', [CommissionController::class, 'hold'])->name('commissions.hold');
    Route::get('commissions/export/csv', [CommissionController::class, 'exportCsv'])->name('commissions.export');
});
