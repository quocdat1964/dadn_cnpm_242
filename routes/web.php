<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdafruitController;
use App\Http\Controllers\SensorController;


Route::get('/', function () {
    return view('welcome');
});

Route::middleware(['api']) // Sử dụng middleware API (không có CSRF)
    ->prefix('api')
    ->group(function () {
        Route::get('/adafruit/feeds/{feed}', [AdafruitController::class, 'getFeedData']);
        // Route::post('/sensors/data', [SensorController::class, 'storeData']);
    });

