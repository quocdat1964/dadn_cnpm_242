<?php

namespace App\Jobs;

use App\Models\DeviceSchedule;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Http;

class TurnOnDeviceJob implements ShouldQueue
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
        if (!$sch || $sch->activated) {
            return;
        }

        // Gửi lệnh bật
        Http::post(config('app.url') . '/api/devices/control', [
            'feed_key' => $sch->feed_key,
            'value' => 1,   // bật
        ]);

        $sch->update(['activated' => true]);
    }
}
