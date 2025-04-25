<?php
// filepath: routes/api.php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SensorController;
use App\Http\Controllers\AdafruitController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\EnvironmentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\DeviceScheduleController;
use App\Http\Controllers\TelegramController;

/*
|--------------------------------------------------------------------------
| Sensors
|--------------------------------------------------------------------------
*/
Route::prefix('sensors')->group(function () {
    // Lịch sử cảm biến
    Route::get('raw-history', [SensorController::class, 'rawHistory']);
    Route::get('history', [SensorController::class, 'history']);

    // Adafruit IO
    Route::prefix('adafruit')->group(function () {
        Route::get('latest', [AdafruitController::class, 'getFeedData']);
        Route::get('current', [SensorController::class, 'getCurrentReadings']);
    });

    // Lưu dữ liệu sensor từ client
    Route::post('data', [SensorController::class, 'storeData']);

    // Ngưỡng cảnh báo
    Route::get('thresholds', [SensorController::class, 'getThreshold']);
    Route::post('thresholds', [SensorController::class, 'setThreshold']);
});


/*
|--------------------------------------------------------------------------
| Devices
|--------------------------------------------------------------------------
*/
Route::prefix('devices')->group(function () {
    Route::get('status', [DeviceController::class, 'getStatus']);      // Trạng thái hiện tại
    Route::post('control', [DeviceController::class, 'toggle']);         // Bật/tắt một device
    Route::post('turn-on-all', [DeviceController::class, 'turnOnAll']);      // Bật tất cả
    Route::post('turn-off-all', [DeviceController::class, 'turnOffAll']);     // Tắt tất cả
});


/*
|--------------------------------------------------------------------------
| Device Schedules
|--------------------------------------------------------------------------
*/
Route::prefix('device-schedules')->group(function () {
    // CRUD cơ bản
    Route::apiResource('/', DeviceScheduleController::class)
        ->parameters(['' => 'schedule'])
        ->except(['create', 'edit', 'show']);

    // Toggle on/off nhanh
    Route::patch('{schedule}/toggle', [DeviceScheduleController::class, 'toggle'])
        ->whereNumber('schedule');

    // Áp dụng tất cả lịch vào Adafruit
    Route::post('apply', [DeviceScheduleController::class, 'apply']);
});


/*
|--------------------------------------------------------------------------
| Notifications
|--------------------------------------------------------------------------
*/
Route::prefix('notifications')->group(function () {
    Route::post('sync', [NotificationController::class, 'evaluateAndNotify']);
    Route::get('all', [NotificationController::class, 'getAllNotifications']);
});


/*
|--------------------------------------------------------------------------
| Environment
|--------------------------------------------------------------------------
*/
Route::post('environment/evaluate', [EnvironmentController::class, 'fetchAndEvaluate']);


/*
|--------------------------------------------------------------------------
| Telegram Webhook
|--------------------------------------------------------------------------
*/
Route::post('telegram/webhook', [TelegramController::class, 'handle']);
