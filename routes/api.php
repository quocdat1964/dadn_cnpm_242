<?php
// filepath: routes/api.php
use App\Http\Controllers\SensorController;
use App\Http\Controllers\AdafruitController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\EnvironmentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\DeviceScheduleController;
use App\Http\Controllers\TelegramController;

Route::get('/sensors/raw-history', [SensorController::class, 'rawHistory']);
Route::get('/sensors/history', [SensorController::class, 'history']);
Route::get('/device-schedules', [DeviceScheduleController::class, 'index']);
Route::post('/device-schedules', [DeviceScheduleController::class, 'store']);
Route::patch('/device-schedules/{schedule}/toggle', [DeviceScheduleController::class, 'toggle']);
Route::post('/device-schedules/apply', [DeviceScheduleController::class, 'apply']);
Route::delete('/device-schedules/{schedule}', [DeviceScheduleController::class, 'destroy']);
Route::put('/device-schedules/{schedule}', [DeviceScheduleController::class, 'update']);
Route::post('/devices/turn-on-all', [DeviceController::class, 'turnOnAll']);
Route::post('/devices/turn-off-all', [DeviceController::class, 'turnOffAll']);
Route::post('/notifications/sync', [NotificationController::class, 'evaluateAndNotify']);
Route::get('/notifications/all', [NotificationController::class, 'getAllNotifications']);

Route::get('/devices/status', [DeviceController::class, 'getStatus']);
Route::get('/sensors/adafruit/latest', [AdafruitController::class, 'getFeedData']);
Route::get('/sensors/adafruit/current', [SensorController::class, 'getCurrentReadings']);
Route::post('/environment/evaluate', [EnvironmentController::class, 'fetchAndEvaluate']);
Route::post('/sensors/data', [SensorController::class, 'storeData']);

Route::post('/telegram/webhook', [TelegramController::class, 'handle']);

// Route::post('/devices/control', [DeviceController::class, 'updateStatus']);
// Route::post('/devices/sync-control', [DeviceController::class, 'updateStatus']);

Route::post('/devices/control', [DeviceController::class, 'toggle']);