<?php

use App\Http\Controllers\BookingController;
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
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
