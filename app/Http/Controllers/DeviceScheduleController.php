<?php

// app/Http/Controllers/DeviceScheduleController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DeviceSchedule;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use App\Jobs\ToggleDeviceJob;

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
        \Log::info(">> APPLY at $now");

        $username = env('ADAFRUIT_IO_USERNAME');
        $aioKey = env('ADAFRUIT_IO_KEY');
        $internalControlUrl = config('app.url') . '/api/devices/control';

        // Lấy tất cả schedule enabled
        DeviceSchedule::where('enabled', true)
            ->get()
            ->each(function ($sch) use ($now, $username, $aioKey, $internalControlUrl) {

                // 1. Chuyển start/end về cùng timezone với $now
                $start = Carbon::parse($sch->start_at)
                    ->timezone('Asia/Ho_Chi_Minh');
                $end = Carbon::parse($sch->end_at)
                    ->timezone('Asia/Ho_Chi_Minh');

                \Log::info("   schedule #{$sch->id}: $start → $end");

                // 2. Kiểm tra xem hiện tại có trong window không
                $inWindow = $now->between($start, $end, true);
                \Log::info("    → inWindow? " . ($inWindow ? 'YES' : 'NO'));

                // 3. Lấy trạng thái hiện tại của feed
                $resp = Http::withHeaders(['X-AIO-Key' => $aioKey])
                    ->get("https://io.adafruit.com/api/v2/{$username}/feeds/{$sch->feed_key}/data?limit=1");
                if (!$resp->successful()) {
                    \Log::warning("    → FAIL fetch feed {$sch->feed_key}: HTTP {$resp->status()}");
                    return;
                }

                // Adafruit trả mảng, element đầu có key 'value'
                $json = $resp->json();
                $current = floatval(data_get($json, '0.value', 0));
                \Log::info("    → current value: $current");

                // 4. Nếu trong khoảng mà đang OFF thì ON
                if ($inWindow && $current === 0.0) {
                    \Log::info("    → TURN ON {$sch->feed_key}");
                    $r = Http::post($internalControlUrl, [
                        'feed_key' => $sch->feed_key,
                        'value' => 1,
                    ]);
                    \Log::info("       control resp: {$r->status()} / {$r->body()}");
                }
                // 5. Nếu ngoài khoảng mà đang ON thì OFF
                elseif (!$inWindow && $current === 1.0) {
                    \Log::info("    → TURN OFF {$sch->feed_key}");
                    $r = Http::post($internalControlUrl, [
                        'feed_key' => $sch->feed_key,
                        'value' => 0,
                    ]);
                    \Log::info("       control resp: {$r->status()} / {$r->body()}");
                }
            });
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
