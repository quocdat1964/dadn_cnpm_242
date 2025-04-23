<?php

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use App\Http\Controllers\DeviceScheduleController;

/*
|--------------------------------------------------------------------------
| Console Routes
|--------------------------------------------------------------------------
*/

// Lệnh mẫu "inspire"
Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Job đồng bộ cảm biến
app(Schedule::class)->command('sync:sensors')
    ->everyMinute()
    ->name('sync-sensors');

// Job apply device schedules, gọi qua closure để resolve instance
app(Schedule::class)->call(function () {
    app(DeviceScheduleController::class)->apply();
})
    ->everyMinute()
    ->name('apply-device-schedules');
