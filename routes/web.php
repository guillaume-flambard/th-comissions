<?php

use App\Http\Controllers\BookingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TrackingController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Public Tracking Routes (QR code redirects)
Route::get('/r/{code}', [TrackingController::class, 'redirect'])->name('track.redirect');
Route::get('/track/stats/{code}', [TrackingController::class, 'stats'])->name('track.stats');
Route::post('/track/click', [TrackingController::class, 'trackClick'])->name('track.click');

// Public Booking Routes
Route::get('/booking/create', [BookingController::class, 'create'])->name('booking.create');
Route::post('/booking', [BookingController::class, 'store'])->name('booking.store');
Route::get('/booking/success/{bookingReference}', [BookingController::class, 'success'])->name('booking.success');

// Webhook for booking status updates (from external PMS systems)
Route::post('/api/booking/update-status', [BookingController::class, 'updateStatus'])->name('api.booking.update-status');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/api/dashboard/stats', [DashboardController::class, 'stats'])->name('dashboard.stats');

    // QR Code generation
    Route::get('/qr-codes/generate', [\App\Http\Controllers\QRCodeController::class, 'show'])->name('qr-codes.generate');
    Route::post('/qr-codes/generate', [\App\Http\Controllers\QRCodeController::class, 'generate'])->name('qr-codes.store');
    Route::get('/qr-codes/{trackingLink}/download', [\App\Http\Controllers\QRCodeController::class, 'download'])->name('qr-codes.download');
    Route::get('/qr-codes/{trackingLink}/stats', [\App\Http\Controllers\QRCodeController::class, 'stats'])->name('qr-codes.stats');

    // Referral management
    Route::get('/referrals', [\App\Http\Controllers\ReferralController::class, 'index'])->name('referrals.index');
    Route::get('/referrals/create', [\App\Http\Controllers\ReferralController::class, 'create'])->name('referrals.create');
    Route::post('/referrals', [\App\Http\Controllers\ReferralController::class, 'store'])->name('referrals.store');
    Route::put('/referrals/{referral}', [\App\Http\Controllers\ReferralController::class, 'update'])->name('referrals.update');
    Route::post('/referrals/mark-as-paid', [\App\Http\Controllers\ReferralController::class, 'markAsPaid'])->name('referrals.mark-as-paid');
    Route::post('/referrals/{referral}/validate', [\App\Http\Controllers\ReferralController::class, 'markAsValidated'])->name('referrals.validate');
    Route::post('/referrals/{referral}/dispute', [\App\Http\Controllers\ReferralController::class, 'markAsDisputed'])->name('referrals.dispute');
    Route::post('/referrals/{referral}/cancel', [\App\Http\Controllers\ReferralController::class, 'cancel'])->name('referrals.cancel');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
