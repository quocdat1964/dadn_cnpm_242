<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use App\Models\Notification; // Model Notification đã được tạo
use App\Models\Sensor;
use App\Services\AdafruitService;

class NotificationController extends Controller
{
    protected AdafruitService $adafruit;

    public function __construct(AdafruitService $adafruit)
    {
        // Laravel container sẽ chỉ khởi tạo 1 instance vì đã đăng ký singleton
        $this->adafruit = $adafruit;
    }

    /**
     * POST /api/notifications/sync
     *
     * Payload ví dụ:
     * {
     *   "feed_id": "temperature",
     *   "email": "user@gmail.com",        // tuỳ chọn
     *   "telegram_chat_id": "123456789"   // tuỳ chọn
     * }
     */
    public function evaluateAndNotify(Request $request)
    {
        // 1. Validate input
        $data = $request->validate([
            'feed_id' => 'required|string|exists:sensors,feed_key',
            'recorded_at' => 'nullable|date',
            'email' => 'nullable|email',
            'telegram_chat_id' => 'nullable|string',
        ]);

        $feedKey = strtolower($data['feed_id']);
        $recordedAt = isset($data['recorded_at'])
            ? Carbon::parse($data['recorded_at'])
            : Carbon::now();

        // 2. Lấy Sensor và thresholds từ DB
        $sensor = Sensor::where('feed_key', $feedKey)->firstOrFail();

        // 3. Lấy giá trị mới nhất từ Adafruit IO
        // $resp = Http::withHeaders(['X-AIO-Key' => env('ADAFRUIT_IO_KEY')])
        //     ->get("https://io.adafruit.com/api/v2/" . env('ADAFRUIT_IO_USERNAME') . "/feeds/{$feedKey}/data?limit=1");


        // if (!$resp->successful()) {
        //     return response()->json([
        //         'success' => false,
        //         'error' => 'Không thể lấy dữ liệu từ Adafruit IO.'
        //     ], 500);
        // }
        // $results = $resp->json();


        // if (empty($results)) {
        //     return response()->json([
        //         'success' => false,
        //         'error' => "Không có dữ liệu cho feed '{$feedKey}'"
        //     ], 404);
        // }
        // $value = floatval($results[0]['value'] ?? 0);
        try {

            $value = $this->adafruit->fetchLastValue($feedKey);
            if ($value === null) {
                return response()->json([
                    'success' => false,
                    'error' => "Không có dữ liệu cho feed '{$feedKey}'"
                ], 404);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Lỗi khi lấy dữ liệu từ Adafruit IO: ' . $e->getMessage(),
            ], 500);
        }
        // 4. Tính alert message
        $alertMessage = $this->calculateAlert($sensor, $value, $recordedAt);

        // Nếu ổn định -> trả về
        if (empty($alertMessage)) {
            return response()->json([
                'success' => true,
                'message' => "Giá trị '{$sensor->name}' ổn định ({$value})."
            ], 200);
        }

        // 5. Lưu notification
        $notification = Notification::create([
            'feed_id' => $feedKey,
            'content' => $alertMessage,
            'recorded_at' => $recordedAt,
        ]);

        // 6. Gửi Telegram nếu có
        if (!empty($data['telegram_chat_id'])) {
            Http::post("https://api.telegram.org/bot" . env('TELEGRAM_BOT_TOKEN') . "/sendMessage", [
                'chat_id' => $data['telegram_chat_id'],
                'text' => $alertMessage,
                'parse_mode' => 'Markdown',
            ]);
            // \Log::info("Telegram.sendMessage status={$response->status()} body={$response->body()}");
        }

        // 7. Gửi email nếu có
        if (!empty($data['email'])) {
            Mail::to($data['email'])
                ->send(new \App\Mail\SensorAlertMail(
                    $sensor->name,
                    $value,
                    $sensor->warning_min,
                    $sensor->warning_max,
                    $recordedAt->toDateTimeString()
                ));
        }

        // 8. Trả về kết quả
        return response()->json([
            'success' => true,
            'message' => 'Notification created & dispatched.',
            'data' => [
                'id' => $notification->id,
                'feed_id' => $notification->feed_id,
                'content' => $notification->content,
                'value' => $value,
                'recorded_at' => $notification->recorded_at->toDateTimeString(),
            ],
        ], 200);
    }

    /**
     * Tính alert message dựa trên warning_min / warning_max của Sensor
     * và định dạng message theo từng loại feed như bạn yêu cầu.
     *
     * @param Sensor     $sensor
     * @param float      $value
     * @param Carbon     $recordedAt    (chỉ cần nếu feed nào cần tính giờ)
     * @return string    Alert message hoặc chuỗi rỗng nếu ổn định
     */
    protected function calculateAlert(Sensor $sensor, float $value, Carbon $recordedAt): string
    {
        $min = $sensor->warning_min;
        $max = $sensor->warning_max;
        $key = $sensor->feed_key;
        $alert = '';

        switch ($key) {
            case 'temperature':
                // Nếu bạn vẫn muốn chia day/night, bạn có thể override min/max ở đây
                if ($value < $min) {
                    $alert = "Cảnh báo: Nhiệt độ quá thấp ({$value}°C)! Ngưỡng tối thiểu hiện tại là {$min}°C. Vui lòng kiểm tra hệ thống sưởi hoặc điều chỉnh môi trường.";
                } elseif ($value > $max) {
                    $alert = "Cảnh báo: Nhiệt độ quá cao ({$value}°C)! Ngưỡng tối đa hiện tại là {$max}°C. Kiểm tra hệ thống thông gió, làm mát hoặc che chắn để giữ nhiệt độ ổn định.";
                }
                break;

            case 'air-humidity':
                if ($value < $min) {
                    $alert = "Cảnh báo: Độ ẩm không khí quá thấp ({$value}%)! Ngưỡng tối thiểu là {$min}%. Tăng cường tưới phun sương hoặc đặt khay nước.";
                } elseif ($value > $max) {
                    $alert = "Cảnh báo: Độ ẩm không khí quá cao ({$value}%)! Ngưỡng tối đa là {$max}%. Kiểm tra hệ thống thông gió hoặc giảm phun sương.";
                }
                break;

            case 'soil-moisturer':
                if ($value < $min) {
                    $alert = "Cảnh báo: Độ ẩm đất quá thấp ({$value}%)! Ngưỡng tối thiểu là {$min}%. Tưới nước để đảm bảo độ ẩm cho cây.";
                } elseif ($value > $max) {
                    $alert = "Cảnh báo: Độ ẩm đất quá cao ({$value}%)! Ngưỡng tối đa là {$max}%. Giảm tưới hoặc cải thiện hệ thống thoát nước.";
                }
                break;

            case 'light':
                if ($value < $min) {
                    $alert = "Cảnh báo: Ánh sáng quá yếu ({$value} lux)! Ngưỡng tối thiểu là {$min} lux. Bổ sung thêm ánh sáng nhân tạo.";
                } elseif ($value > $max) {
                    $alert = "Cảnh báo: Ánh sáng quá mạnh ({$value} lux)! Ngưỡng tối đa là {$max} lux. Kiểm tra hệ thống che chắn để tránh quá tải.";
                }
                break;

            default:
                $alert = '';
        }

        return $alert;
    }
    /**
     * API trả về toàn bộ thông báo đã lưu trong bảng notifications (mới nhất trước).
     */
    public function getAllNotifications(Request $request)
    {
        $notifications = Notification::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $notifications,
        ], 200);
    }

    /**
     * Trả về ngưỡng min cho feed tại thời điểm recordedAt.
     * Dùng trong email để show range.
     */
    protected function getThresholdMin(string $feedKey, Carbon $t): float
    {
        switch ($feedKey) {
            case 'temperature':
                return ($t->hour >= 6 && $t->hour < 18) ? 21.0 : 15.0;
            case 'air-humidity':
                return 60.0;
            case 'soil-moisturer':
                return 60.0;
            case 'light':
                return 100.0;
        }
        return 0.0;
    }

    protected function getThresholdMax(string $feedKey, Carbon $t): float
    {
        switch ($feedKey) {
            case 'temperature':
                return ($t->hour >= 6 && $t->hour < 18) ? 25.0 : 18.0;
            case 'air-humidity':
                return 70.0;
            case 'soil-moisturer':
                return 80.0;
            case 'light':
                return 300.0;
        }
        return 0.0;
    }
}
