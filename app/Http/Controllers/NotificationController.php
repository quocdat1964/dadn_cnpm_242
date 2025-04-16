<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;
use App\Models\Notification; // Model Notification đã được tạo

class NotificationController extends Controller
{
    /**
     * API lấy dữ liệu từ Adafruit, so sánh điều kiện của cảm biến và nếu vượt ngưỡng tối ưu
     * thì tạo thông báo và lưu vào bảng notifications.
     *
     * Yêu cầu JSON input:
     * {
     *    "feed_id": "temperature",  // hoặc "air-humidity", "soil-moisturer", "light"
     *    "recorded_at": "2025-04-13 14:00:00"  // (optional)
     * }
     *
     * Response JSON trả về các thông tin của notification nếu có, hoặc thông báo ổn định.
     */
    public function evaluateAndNotify(Request $request)
    {
        // Validate input
        $data = $request->validate([
            'feed_id' => 'required|string',
            'recorded_at' => 'nullable|date'
        ]);

        // Chuyển feed_id về chữ thường để nhất quán
        $feedKey = strtolower($data['feed_id']);
        $recordedAt = isset($data['recorded_at'])
            ? Carbon::parse($data['recorded_at'])
            : Carbon::now();

        $username = env('ADAFRUIT_IO_USERNAME');
        $aioKey = env('ADAFRUIT_IO_KEY');

        // URL API từ Adafruit để lấy dữ liệu mới nhất cho feedKey
        $url = "https://io.adafruit.com/api/v2/{$username}/feeds/{$feedKey}/data?limit=1";

        $response = Http::withHeaders([
            'X-AIO-Key' => $aioKey,
        ])->get($url);

        if (!$response->successful()) {
            return response()->json([
                'success' => false,
                'error' => "Không thể lấy dữ liệu từ Adafruit."
            ], 500);
        }

        $results = $response->json();
        if (empty($results)) {
            return response()->json([
                'success' => false,
                'error' => "Không có dữ liệu cho feed: {$feedKey}"
            ], 404);
        }

        // Lấy giá trị đo được và chuyển sang kiểu số thực
        $value = floatval($results[0]['value'] ?? 0);

        // Tính toán thông báo dựa trên loại cảm biến, giá trị đo và thời gian đo
        $alertMessage = $this->calculateAlert($feedKey, $value, $recordedAt);

        // Nếu không có cảnh báo (trong khoảng tối ưu) -> trả về thông báo ổn định
        if (empty($alertMessage)) {
            return response()->json([
                'success' => true,
                'message' => "Giá trị của feed '{$feedKey}' ổn định ({$value}).",
                'data' => null
            ], 200);
        }

        // Nếu có cảnh báo, tạo thông báo và lưu vào bảng notifications
        $notification = Notification::create([
            'feed_id' => $feedKey,
            'content' => $alertMessage,
            'recorded_at' => $recordedAt, // Bạn có thể dùng thời gian đo từ Adafruit (nếu có) hoặc thời gian hiện tại
        ]);

        return response()->json([
            'success' => true,
            'message' => "Notification created.",
            'data' => [
                'id' => $notification->id,
                'feed_id' => $notification->feed_id,
                'content' => $notification->content,
                'value' => $value,
                'recorded_at' => $notification->recorded_at->toDateTimeString(),
            ]
        ], 200);
    }

    /**
     * Phương thức tính toán thông báo dựa trên loại cảm biến, giá trị đo và thời gian đo.
     *
     * @param string   $feedKey
     * @param float    $value
     * @param Carbon   $recordedAt
     *
     * @return string Alert message nếu vượt ngưỡng, rỗng nếu ổn định.
     */
    protected function calculateAlert(string $feedKey, float $value, Carbon $recordedAt): string
    {
        $alert = "";
        switch ($feedKey) {
            case 'temperature':
                $hour = $recordedAt->hour;
                if ($hour >= 6 && $hour < 18) { // Ban ngày: 21°C – 25°C
                    if ($value < 21) {
                        $alert = "Cảnh báo: Nhiệt độ ban ngày quá thấp ({$value}°C)! Vui lòng kiểm tra hệ thống sưởi hoặc điều chỉnh điều kiện môi trường.";
                    } elseif ($value > 25) {
                        $alert = "Cảnh báo: Nhiệt độ ban ngày quá cao ({$value}°C)! Kiểm tra hệ thống thông gió, làm mát hoặc che chắn để giữ nhiệt độ ổn định.";
                    }
                } else { // Ban đêm: 15°C – 18°C
                    if ($value < 15) {
                        $alert = "Cảnh báo: Nhiệt độ ban đêm quá thấp ({$value}°C)! Vui lòng thiết lập hệ thống sưởi hoặc cách nhiệt nhằm bảo vệ cây.";
                    } elseif ($value > 18) {
                        $alert = "Cảnh báo: Nhiệt độ ban đêm quá cao ({$value}°C)! Kiểm tra hệ thống tản nhiệt hoặc thông gió để giảm nhiệt độ.";
                    }
                }
                break;

            case 'air-humidity':
                if ($value < 60) {
                    $alert = "Cảnh báo: Độ ẩm không khí quá thấp ({$value}%)! Tăng cường tưới phun sương để duy trì môi trường ẩm ướt cho cây.";
                } elseif ($value > 70) {
                    $alert = "Cảnh báo: Độ ẩm không khí quá cao ({$value}%)! Kiểm tra hệ thống thông gió hoặc giảm phun sương.";
                }
                break;

            case 'soil-moisturer':
                if ($value < 60) {
                    $alert = "Cảnh báo: Độ ẩm đất quá thấp ({$value}%)! Tưới nước để đảm bảo đất đủ ẩm cho sự phát triển của cây.";
                } elseif ($value > 80) {
                    $alert = "Cảnh báo: Độ ẩm đất quá cao ({$value}%)! Giảm tưới nước hoặc cải thiện hệ thống thoát nước để tránh ngập úng.";
                }
                break;

            case 'light':
                if ($value < 100) {
                    $alert = "Cảnh báo: Ánh sáng quá yếu ({$value} lux)! Bổ sung thêm ánh sáng nhân tạo.";
                } elseif ($value > 300) {
                    $alert = "Cảnh báo: Ánh sáng quá mạnh ({$value} lux)! Kiểm tra hệ thống che chắn để tránh quá tải.";
                }
                break;

            default:
                $alert = "";
        }

        return $alert;
    }

    /**
     * API trả về toàn bộ thông báo đã lưu trong bảng notifications (mới nhất trước).
     */
    public function getAllNotifications(Request $request)
    {
        $notifications = \App\Models\Notification::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $notifications,
        ], 200);
    }
}
