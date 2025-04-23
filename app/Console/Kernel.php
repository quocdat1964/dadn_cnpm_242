<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Http\Controllers\DeviceScheduleController;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule)
    {
        // Đồng bộ cảm biến mỗi phút
        $schedule->command('sync:sensors')
            ->everyMinute()
            ->name('sync-sensors');

        // Gọi apply() mỗi phút để bật/tắt devices theo schedule
        $schedule->call([DeviceScheduleController::class, 'apply'])
            ->everyMinute()
            ->name('apply-device-schedules');
    }

    protected function commands()
    {
        $this->load(__DIR__ . '/Commands');
        require base_path('routes/console.php');
    }
}
