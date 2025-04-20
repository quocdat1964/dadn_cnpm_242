<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sensor;
use App\Models\Record;
use Carbon\Carbon;
use App\Http\Controllers\NotificationController; // ✂️ import
use Illuminate\Support\Facades\DB;

use App\Events\NewSensorData; // Import event

class SensorController extends Controller
{
    // public function storeData(Request $request)
    // {
    //     $feedKey = $request->input('feed_id');
    //     $value = $request->input('value');

    //     // Tìm sensor theo feed_key
    //     $sensor = Sensor::where('feed_key', $feedKey)->first();

    //     if (!$sensor) {
    //         // Nếu không tìm thấy sensor, trả về lỗi
    //         return response()->json([
    //             'success' => false,
    //             'error' => "Sensor with feed_key '$feedKey' not found",
    //         ], 404);
    //     }

    //     // Tạo record mới với sensor_id, value và thời gian hiện tại
    //     $record = Record::create([
    //         'sensor_id' => $sensor->id,
    //         'value' => floatval($value),
    //         'recorded_at' => Carbon::now()
    //     ]);

    //     return response()->json([
    //         'success' => true,
    //         'message' => 'Data stored successfully',
    //         'data' => $record
    //     ], 200);
    // }

    public function storeData(Request $request)
    {
        $data = $request->validate([
            'feed_id' => 'required|string',
            'value' => 'required|numeric',
            'recorded_at' => 'nullable|date',
        ]);

        $sensor = Sensor::where('feed_key', $data['feed_id'])->firstOrFail();

        // dùng đúng timestamp gốc, hoặc now() nếu không có
        // $ts = $data['recorded_at']
        //     ? Carbon::parse($data['recorded_at'])
        //     : Carbon::now();
        $ts = isset($data['recorded_at'])
            ? Carbon::parse($data['recorded_at'], 'Asia/Ho_Chi_Minh')
            : Carbon::now('Asia/Ho_Chi_Minh');

        // ghi hoặc cập nhật record duy nhất với đúng $ts
        Record::updateOrCreate(
            ['sensor_id' => $sensor->id, 'recorded_at' => $ts],
            ['value' => $data['value']]
        );
        // 4) Gọi API cảnh báo ngay sau khi lưu xong
        try {
            $notifyPayload = [
                'feed_id' => $data['feed_id'],
                'recorded_at' => $ts->toDateTimeString(),
                // nếu client truyền email/chat, dùng client, ngược lại fallback env
                'email' => $request->input('email', env('ALERT_EMAIL')),
                'telegram_chat_id' => $request->input('telegram_chat_id', env('TELEGRAM_CHAT_ID')),
            ];
            // tạo một Request mới để gọi
            $fakeRequest = new Request($notifyPayload);
            // gọi controller
            app(NotificationController::class)->evaluateAndNotify($fakeRequest);
        } catch (\Throwable $e) {
            // chỉ log, không fail toàn bộ storeData
            Log::error('Error dispatching notification: ' . $e->getMessage());
        }

        return response()->json(['success' => true], 200);
    }



    public function getCurrentReadings(Request $request)
    {
        // Lấy tất cả cảm biến từ bảng sensors
        $sensors = Sensor::all();
        $result = [];

        foreach ($sensors as $sensor) {
            // Lấy bản ghi mới nhất (dựa theo recorded_at) từ bảng records cho từng sensor
            $record = Record::where('sensor_id', $sensor->id)
                ->orderBy('recorded_at', 'desc')
                ->first();

            $result[] = [
                'sensor_id' => $sensor->id,
                'sensor_name' => $sensor->name,
                'feed_key' => $sensor->feed_key,
                'reading' => $record ? $record->value : null,
                'recorded_at' => $record ? $record->recorded_at : null,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $result,
        ], 200);
    }



    public function history(Request $request)
    {
        $feedKey = $request->query('feed_key');
        $period = $request->query('period', 'day');

        $sensor = Sensor::where('feed_key', $feedKey)->first();
        if (!$sensor) {
            return response()->json([
                'success' => false,
                'error' => "Sensor với feed_key '{$feedKey}' không tồn tại."
            ], 404);
        }

        $now = Carbon::now();
        switch ($period) {
            case 'week':
                $start = $now->copy()->subDays(6)->startOfDay();
                $timeExpr = 'DATE(recorded_at) as period';
                break;

            case 'month':
                $start = $now->copy()->subDays(29)->startOfDay();
                $timeExpr = 'DATE(recorded_at) as period';
                break;

            case 'day':
            default:
                $start = $now->copy()->startOfDay();
                $timeExpr = 'HOUR(recorded_at) as period';
                break;
        }

        $rows = DB::table('records')
            ->selectRaw("$timeExpr, AVG(value) as avg_value")
            ->where('sensor_id', $sensor->id)
            ->whereBetween('recorded_at', [$start, $now])
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        $data = $rows->map(function ($r) use ($period) {
            if ($period === 'day') {
                $label = str_pad($r->period, 2, '0', STR_PAD_LEFT) . ':00';
            } else {
                // Định dạng ngày: Nên dùng 'Y-m-d' thay vì 'YYYY-MM-DD'
                $label = Carbon::parse($r->period)->format('Y-m-d');
            }
            return ['x' => $label, 'y' => round($r->avg_value, 1)];
        });

        return response()->json([
            'success' => true,
            'feed_key' => $feedKey,
            'period' => $period,
            'data' => $data,
        ], 200);
    }

    /**
     * GET /api/sensors/raw-history
     *
     * Query params:
     *  - feed_key (string, required): khóa feed Adafruit IO
     *  - date     (string, optional): ngày muốn lấy, format "YYYY-MM-DD" (mặc định hôm nay)
     *
     * Trả về toàn bộ bản ghi trong ngày đó:
     * [
     *   { "x": "08:15:23", "y": 24.5 },
     *   { "x": "08:30:05", "y": 25.1 },
     *   …
     * ]
     */
    public function rawHistory(Request $request)
    {
        $feedKey = $request->query('feed_key');
        $date = $request->query('date', Carbon::now()->toDateString());

        // 1. Kiểm tra sensor tồn tại
        $sensor = Sensor::where('feed_key', $feedKey)->first();
        if (!$sensor) {
            return response()->json([
                'success' => false,
                'error' => "Sensor với feed_key '{$feedKey}' không tồn tại."
            ], 404);
        }

        // 2. Lấy tất cả record trong ngày $date
        $records = Record::where('sensor_id', $sensor->id)
            ->whereDate('recorded_at', $date)
            ->orderBy('recorded_at')
            ->get(['recorded_at', 'value']);

        // 3. Map thành { x: "HH:mm:ss", y: value }
        $data = $records->map(function ($r) {
            return [
                // ép chuỗi thành Carbon rồi format
                'x' => Carbon::parse($r->recorded_at, 'Asia/Ho_Chi_Minh')
                    ->format('H:i:s'),
                'y' => $r->value,
            ];
        });

        return response()->json([
            'success' => true,
            'feed_key' => $feedKey,
            'date' => $date,
            'data' => $data,
        ], 200);
    }


}
