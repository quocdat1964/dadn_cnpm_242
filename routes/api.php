<?php
// filepath: routes/api.php
use App\Http\Controllers\SensorController;

use App\Http\Controllers\AdafruitController;
use App\Http\Controllers\DeviceController;

use App\Http\Controllers\EnvironmentController;

use App\Http\Controllers\NotificationController;
//cho phần login anđ logout
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;


Route::post('/notifications/sync', [NotificationController::class, 'evaluateAndNotify']);

Route::get('/notifications/all', [NotificationController::class, 'getAllNotifications']);

Route::get('/sensors/current', [SensorController::class, 'getCurrentReadings']);

Route::post('/environment/evaluate', [EnvironmentController::class, 'fetchAndEvaluate']);

Route::post('/sensors/data', [SensorController::class, 'storeData']);
Route::post('/devices/control', [DeviceController::class, 'updateStatus']);
Route::post('/devices/sync-control', [DeviceController::class, 'syncControl']);

//cho phần login anđ logout
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::post('/logout',   [AuthController::class, 'logout'])->middleware('auth');
