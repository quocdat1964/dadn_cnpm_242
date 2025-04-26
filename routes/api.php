<?php
// filepath: routes/api.php
use App\Http\Controllers\SensorController;
use App\Http\Controllers\AdafruitController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\EnvironmentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\DeviceScheduleController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\TelegramController;
use App\Http\Controllers\UserController;
//cho phần login anđ logout
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use App\Http\Controllers\Auth\PasswordResetController;



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
Route::get('/sensors/thresholds', [SensorController::class, 'getThreshold']);
Route::post('/sensors/thresholds', [SensorController::class, 'setThreshold']);
// Route::post('/devices/control', [DeviceController::class, 'updateStatus']);
// Route::post('/devices/sync-control', [DeviceController::class, 'updateStatus']);
Route::post('/devices/control', [DeviceController::class, 'toggle']);


// <?php
// // filepath: routes/api.php

// use Illuminate\Support\Facades\Route;
// use App\Http\Controllers\{
//     SensorController,
//     AdafruitController,
//     DeviceController,
//     EnvironmentController,
//     NotificationController,
//     DeviceScheduleController,
//     TelegramController
// };

// // ───── Sensors & Adafruit ───────────────────────────────────────────────────────
// Route::prefix('sensors')->group(function () {
//     Route::controller(SensorController::class)->group(function () {
//         Route::get('raw-history',    'rawHistory');
//         Route::get('history',        'history');
//         Route::get('adafruit/current','getCurrentReadings');
//         Route::post('data',          'storeData');
//         Route::get('thresholds',     'getThreshold');
//         Route::post('thresholds',    'setThreshold');
//     });

//     Route::get('adafruit/latest', [AdafruitController::class, 'getFeedData']);
// });

// // ───── Device Schedules ─────────────────────────────────────────────────────────
// Route::apiResource('device-schedules', DeviceScheduleController::class)
//      ->except(['show']);

// Route::patch('device-schedules/{schedule}/toggle', [DeviceScheduleController::class, 'toggle']);
// Route::post ('device-schedules/apply',            [DeviceScheduleController::class, 'apply']);

// // ───── Devices ─────────────────────────────────────────────────────────────────
// Route::prefix('devices')->controller(DeviceController::class)->group(function () {
//     Route::post('turn-on-all',  'turnOnAll');
//     Route::post('turn-off-all', 'turnOffAll');
//     Route::post('control',      'toggle');
//     Route::get ('status',       'getStatus');
// });

// // ───── Notifications ─────────────────────────────────────────────────────────────
// Route::prefix('notifications')->controller(NotificationController::class)->group(function () {
//     Route::post('sync', 'evaluateAndNotify');
//     Route::get ('all',  'getAllNotifications');
// });

// // ───── Environment ──────────────────────────────────────────────────────────────
// Route::post('environment/evaluate', [EnvironmentController::class, 'fetchAndEvaluate']);

// // ───── Telegram Webhook ─────────────────────────────────────────────────────────
// Route::post('telegram/webhook', [TelegramController::class, 'handle']);
//Route::post('/devices/control', [DeviceController::class, 'updateStatus']);
//Route::post('/devices/sync-control', [DeviceController::class, 'syncControl']);

//cho phần login anđ logout
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::post('/logout',   [AuthController::class, 'logout'])->middleware('auth');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function(Request $request) {
        return $request->user();
    });
    Route::get('/verifytoken', function(Request $request) {
        return response()->json([
            'message' => 'Token hợp lệ',
            'user' => $request->user(),
        ]);
    });
});
//cho phần quên mật khẩu
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLinkEmail']);
Route::post('/reset-password', [PasswordResetController::class, 'reset']);

///activitylog , userinfo
Route::get('/activity-logs', [ActivityLogController::class, 'index']);
Route::middleware('auth:sanctum')->get('/user/profile', [UserController::class, 'profile']);
Route::middleware('auth:sanctum')->put('/user/profile', [UserController::class, 'updateProfile']);