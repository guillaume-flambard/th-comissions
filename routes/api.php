<?php

use App\Http\Controllers\TrackingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Tracking API endpoints
Route::post('/track/click', [TrackingController::class, 'trackClick'])->name('api.track.click');
Route::get('/track/stats/{code}', [TrackingController::class, 'stats'])->name('api.track.stats');
