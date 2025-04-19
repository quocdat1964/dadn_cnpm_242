<?php

// app/Http/Controllers/DeviceScheduleController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DeviceSchedule;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;

class DeviceScheduleController extends Controller
{
    // 1. GET /api/device-schedules
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => DeviceSchedule::orderBy('start_at')->get(),
        ], 200);
    }

    // 2. POST /api/device-schedules
    public function store(Request $request)
    {
        $data = $request->validate([
            'feed_key' => 'required|string',
            'start_at' => 'required|date',
            'end_at' => 'required|date|after:start_at',
        ]);

        $schedule = DeviceSchedule::create([
            'feed_key' => $data['feed_key'],
            'start_at' => Carbon::parse($data['start_at']),
            'end_at' => Carbon::parse($data['end_at']),
            'enabled' => true,
        ]);

        return response()->json([
            'success' => true,
            'data' => $schedule
        ], 201);
    }

    // 3. PATCH /api/device-schedules/{schedule}/toggle
    public function toggle(DeviceSchedule $schedule)
    {
        $schedule->enabled = !$schedule->enabled;
        $schedule->save();

        return response()->json([
            'success' => true,
            'data' => $schedule,
        ], 200);
    }

    // 4. POST /api/device-schedules/apply
    //    Bật thiết bị nếu giờ hiện tại nằm trong [start_at, end_at) và schedule đang enabled.
    public function apply()
    {
        $now = Carbon::now();
        $username = env('ADAFRUIT_IO_USERNAME');
        $aioKey = env('ADAFRUIT_IO_KEY');
        $applied = [];

        DeviceSchedule::where('enabled', true)
            ->get()
            ->each(function ($sch) use (&$applied, $now, $username, $aioKey) {
                // lấy trạng thái hiện tại
                $resp = Http::withHeaders(['X-AIO-Key' => $aioKey])
                    ->get("https://io.adafruit.com/api/v2/{$username}/feeds/{$sch->feed_key}/data?limit=1");
                if (!$resp->successful())
                    return;

                $current = floatval($resp->json()[0]['value'] ?? 0);

                // nếu trong khoảng và đang tắt => bật
                if ($now->between($sch->start_at, $sch->end_at, true) && $current === 0.0) {
                    Http::post(config('app.url') . '/api/devices/control', [
                        'feed_key' => $sch->feed_key,
                        'value' => 1
                    ]);
                    $applied[] = [
                        'feed_key' => $sch->feed_key,
                        'action' => 'on',
                        'at' => $now->toDateTimeString(),
                    ];
                }
            });

        return response()->json([
            'success' => true,
            'applied' => $applied,
        ], 200);
    }

    public function destroy(DeviceSchedule $schedule)
    {
        $schedule->delete();

        return response()->json([
            'success' => true,
            'message' => "Schedule #{$schedule->id} đã được xóa."
        ], 200);
    }

    public function update(Request $request, DeviceSchedule $schedule)
    {
        $data = $request->validate([
            'start_at' => 'required|date',
            'end_at' => 'required|date|after:start_at',
        ]);

        $schedule->start_at = Carbon::parse($data['start_at']);
        $schedule->end_at = Carbon::parse($data['end_at']);
        $schedule->save();

        return response()->json([
            'success' => true,
            'message' => 'Schedule updated.',
            'data' => $schedule,
        ], 200);
    }
}
