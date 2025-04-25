<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sensor;
use App\Models\Record;
use Carbon\Carbon;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;  // ✂️ thêm Cache facades
use GuzzleHttp\Client;
use App\Repositories\RecordRepository;
use App\Events\NewSensorData;
use App\Services\AdafruitService;

class SensorController extends Controller
{
    protected RecordRepository $records;
    protected AdafruitService $adafruit;

    public function __construct(
        RecordRepository $records,
        AdafruitService $adafruit
    ) {
        $this->records = $records;
        $this->adafruit = $adafruit;
    }

    public function storeData(Request $request)
    {
        $data = $request->validate([
            'feed_id' => 'required|string',
            'value' => 'required|numeric',
            'recorded_at' => 'nullable|date',
        ]);

        $sensor = Sensor::where('feed_key', $data['feed_id'])->firstOrFail();
        $ts = isset($data['recorded_at'])
            ? Carbon::parse($data['recorded_at'], 'Asia/Ho_Chi_Minh')
            : Carbon::now('Asia/Ho_Chi_Minh');

        // Lưu hoặc cập nhật record
        $this->records->upsert($data['feed_id'], $data['value'], $ts);

        // Xoá cache liên quan để khi lấy sẽ trả về dữ liệu mới nhất
        Cache::forget('sensors.current_readings');
        Cache::forget("sensors.history.{$data['feed_id']}.day");
        Cache::forget("sensors.rawHistory.{$data['feed_id']}.{$ts->toDateString()}");

        // Gửi notification ngay sau khi lưu xong
        try {
            $notifyPayload = [
                'feed_id' => $data['feed_id'],
                'recorded_at' => $ts->toDateTimeString(),
                'email' => $request->input('email', env('ALERT_EMAIL')),
                'telegram_chat_id' => $request->input('telegram_chat_id', env('TELEGRAM_CHAT_ID')),
            ];
            $fakeRequest = new Request($notifyPayload);
            app(NotificationController::class)->evaluateAndNotify($fakeRequest);
        } catch (\Throwable $e) {
            Log::error('Error dispatching notification: ' . $e->getMessage());
        }

        return response()->json(['success' => true], 200);
    }

    public function getCurrentReadings(Request $request)
    {
        // Cache 60 giây để trả về nhanh
        $result = Cache::remember('sensors.current_readings', 60, function () {
            $sensors = Sensor::all();
            $data = [];
            foreach ($sensors as $sensor) {
                $record = Record::where('sensor_id', $sensor->id)
                    ->orderBy('recorded_at', 'desc')
                    ->first();
                $data[] = [
                    'sensor_id' => $sensor->id,
                    'sensor_name' => $sensor->name,
                    'feed_key' => $sensor->feed_key,
                    'reading' => $this->records->getLatest($sensor->feed_key),
                    'recorded_at' => $record ? $record->recorded_at : null,
                ];
            }
            return $data;
        });

        return response()->json([
            'success' => true,
            'data' => $result,
        ], 200);
    }

    public function history(Request $request)
    {
        $feedKey = $request->query('feed_key');
        $period = $request->query('period', 'day');
        $cacheKey = "sensors.history.{$feedKey}.{$period}";

        $response = Cache::remember($cacheKey, 300, function () use ($feedKey, $period) {
            $sensor = Sensor::where('feed_key', $feedKey)->first();
            if (!$sensor) {
                return ['success' => false, 'error' => "Sensor với feed_key '{$feedKey}' không tồn tại."];
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
                ->selectRaw("{$timeExpr}, AVG(value) as avg_value")
                ->where('sensor_id', $sensor->id)
                ->whereBetween('recorded_at', [$start, $now])
                ->groupBy('period')
                ->orderBy('period')
                ->get();

            $data = $rows->map(function ($r) use ($period) {
                $label = $period === 'day'
                    ? str_pad($r->period, 2, '0', STR_PAD_LEFT) . ':00'
                    : Carbon::parse($r->period)->format('Y-m-d');
                return ['x' => $label, 'y' => round($r->avg_value, 1)];
            });

            return ['success' => true, 'feed_key' => $feedKey, 'period' => $period, 'data' => $data];
        });

        $statusCode = $response['success'] ? 200 : 404;
        return response()->json($response, $statusCode);
    }

    public function rawHistory(Request $request)
    {
        $feedKey = $request->query('feed_key');
        $date = $request->query('date', Carbon::now()->toDateString());
        $cacheKey = "sensors.rawHistory.{$feedKey}.{$date}";

        $response = Cache::remember($cacheKey, 300, function () use ($feedKey, $date) {
            $sensor = Sensor::where('feed_key', $feedKey)->first();
            if (!$sensor) {
                return ['success' => false, 'error' => "Sensor với feed_key '{$feedKey}' không tồn tại."];
            }
            $records = Record::where('sensor_id', $sensor->id)
                ->whereDate('recorded_at', $date)
                ->orderBy('recorded_at')
                ->get(['recorded_at', 'value']);

            $data = $records->map(function ($r) {
                return [
                    'x' => Carbon::parse($r->recorded_at, 'Asia/Ho_Chi_Minh')->format('H:i:s'),
                    'y' => $r->value,
                ];
            });

            return ['success' => true, 'feed_key' => $feedKey, 'date' => $date, 'data' => $data];
        });

        $statusCode = $response['success'] ? 200 : 404;
        return response()->json($response, $statusCode);
    }

    public function getThreshold(Request $req)
    {
        $feed = $req->query('feed_id');
        $cacheKey = "sensors.threshold.{$feed}";

        $response = Cache::remember($cacheKey, 300, function () use ($feed) {
            $sensor = Sensor::where('feed_key', $feed)->first();
            if (!$sensor) {
                return ['success' => false, 'error' => "Sensor '{$feed}' không tồn tại"];
            }
            return [
                'success' => true,
                'data' => [
                    'feed_id' => $sensor->feed_key,
                    'warning_min' => $sensor->warning_min,
                    'warning_max' => $sensor->warning_max,
                ]
            ];
        });

        $statusCode = $response['success'] ? 200 : 404;
        return response()->json($response, $statusCode);
    }

    public function setThreshold(Request $req)
    {
        $data = $req->validate([
            'feed_id' => 'required|string|exists:sensors,feed_key',
            'warning_min' => 'required|numeric',
            'warning_max' => 'required|numeric|gt:warning_min',
        ]);

        $sensor = Sensor::where('feed_key', $data['feed_id'])->first();
        $sensor->update([
            'warning_min' => $data['warning_min'],
            'warning_max' => $data['warning_max'],
        ]);

        // Xoá cache thresholds
        Cache::forget("sensors.threshold.{$data['feed_id']}");

        return response()->json([
            'success' => true,
            'message' => "Cập nhật ngưỡng thành công cho '{$sensor->feed_key}'.",
            'data' => [
                'feed_id' => $sensor->feed_key,
                'warning_min' => $sensor->warning_min,
                'warning_max' => $sensor->warning_max,
            ]
        ], 200);
    }
}
