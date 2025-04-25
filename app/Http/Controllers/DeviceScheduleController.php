<?php

// app/Http/Controllers/DeviceScheduleController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DeviceSchedule;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use App\Jobs\ToggleDeviceJob;
use App\Services\AdafruitService;
use Illuminate\Support\Facades\Log;


class DeviceScheduleController extends Controller
{

    protected AdafruitService $adafruit;

    public function __construct(AdafruitService $adafruit)
    {
        $this->adafruit = $adafruit;
    }


    // 1. GET /api/device-schedules
    public function index()
    {
        // return response()->json([
        //     'success' => true,
        //     'data' => DeviceSchedule::orderBy('start_at')->get(),
        // ], 200);

        $schedules = DeviceSchedule::orderBy('start_at')->get();
        return response()->json(['success' => true, 'data' => $schedules]);

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

        ToggleDeviceJob::dispatch($schedule->feed_key, 1)
            ->delay($schedule->start_at);
        ToggleDeviceJob::dispatch($schedule->feed_key, 0)
            ->delay($schedule->end_at);


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
        $now = Carbon::now('Asia/Ho_Chi_Minh');
        Log::info(">> APPLY at {$now}");

        DeviceSchedule::where('enabled', true)
            ->where('end_at', '>=', $now)
            ->get()
            ->groupBy('feed_key')
            ->each(function ($group, $feedKey) use ($now) {
                $inWindow = $group->contains(function (DeviceSchedule $sch) use ($now) {
                    $start = Carbon::parse($sch->start_at, 'Asia/Ho_Chi_Minh');
                    $end = Carbon::parse($sch->end_at, 'Asia/Ho_Chi_Minh');
                    return $now->between($start, $end, true);
                });
                // $inWindow = $now->between($start, $end, true);
    
                Log::info(" feed {$feedKey}, inWindow? " . ($inWindow ? 'YES' : 'NO'));


                // Log::info(" schedule #{$sch->id}: {$start} → {$end}, inWindow? " . ($inWindow ? 'YES' : 'NO'));
    
                // Lấy giá trị hiện tại
                try {
                    $current = $this->adafruit->fetchLastValue($feedKey);
                } catch (\Throwable $e) {
                    Log::warning(" fetchLastValue({$feedKey}) failed: " . $e->getMessage());
                    return;
                }

                Log::info(" current value: {$current}");

                // Nếu trong window & đang off → on
                if ($inWindow && $current === 0.0) {
                    Log::info(" TURN ON {$feedKey}");
                    $this->adafruit->publishValue($feedKey, 1);
                }
                // Nếu ngoài window & đang on → off
                elseif (!$inWindow && $current === 1.0) {
                    Log::info(" TURN OFF {$feedKey}");
                    $this->adafruit->publishValue($feedKey, 0);
                }
            });

        return response()->json(['success' => true], 200);
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

        ToggleDeviceJob::dispatch($schedule->feed_key, 1)
            ->delay($schedule->start_at);
        ToggleDeviceJob::dispatch($schedule->feed_key, 0)
            ->delay($schedule->end_at);


        return response()->json([
            'success' => true,
            'message' => 'Schedule updated.',
            'data' => $schedule,
        ], 200);
    }


    /**
     * Bật/tắt thiết bị và (tuỳ chọn) trả lời lại trên Telegram.
     *
     * @param string $deviceKey
     * @param int    $chatId
     * @param bool   $shouldReply
     * @return bool newStatus
     */
    public function toggleFromTelegram(string $deviceKey, int $chatId, bool $shouldReply)
    {
        // 1) Thực hiện bật/tắt qua feed_key (bạn tự viết)
        $newStatus = $this->toggleByFeedKey($deviceKey); // true = bật, false = tắt

        // 2) Nếu cần, trả lời lại Telegram
        if ($shouldReply) {
            $token = config('services.telegram.bot_token');
            Http::post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id' => $chatId,
                'text' => "Thiết bị **{$deviceKey}** đã được " . ($newStatus ? 'bật' : 'tắt'),
                'parse_mode' => 'Markdown',
            ]);
        }

        return $newStatus;
    }

    /**
     * Ví dụ hàm bật/tắt theo feed_key, trả về trạng thái mới.
     */
    protected function toggleByFeedKey(string $feedKey): bool
    {
        // TODO: gọi API internals của bạn để bật/tắt
        // Ví dụ:
        $res = Http::post(config('app.url') . '/api/devices/control', [
            'feed_key' => $feedKey,
            'value' => 1, // hoặc 0
        ]);
        return $res->successful() && $res->json('device.status') === 'on';
    }
}
