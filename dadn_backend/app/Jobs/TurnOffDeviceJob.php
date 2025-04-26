<?php

namespace App\Jobs;

use App\Models\DeviceSchedule;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Http;

class TurnOffDeviceJob implements ShouldQueue
{
    use Dispatchable, Queueable;

    protected int $scheduleId;

    public function __construct(int $scheduleId)
    {
        $this->scheduleId = $scheduleId;
    }

    public function handle()
    {
        $sch = DeviceSchedule::find($this->scheduleId);
        if (!$sch || $sch->deactivated) {
            return;
        }

        // Gửi lệnh tắt
        Http::post(config('app.url') . '/api/devices/control', [
            'feed_key' => $sch->feed_key,
            'value' => 0,   // tắt
        ]);

        $sch->update(['deactivated' => true]);
    }
}
