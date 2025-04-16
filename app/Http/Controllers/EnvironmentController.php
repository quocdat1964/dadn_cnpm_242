<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;

class EnvironmentController extends Controller
{
    /**
     * API lấy dữ liệu từ Adafruit IO và đánh giá tình trạng môi trường.
     * Yêu cầu JSON input:
     * {
     *   "feed_id": "temperature",   // hoặc "air-humidity", "soil-moisturer", "light"
     *   "recorded_at": "2025-04-13 14:00:00"   // (optional) thời điểm đo; nếu không có thì dùng giờ hiện tại
     * }
     *
     * Response JSON ví dụ:
     * {
     *    "success": true,
     *    "data": {
     *         "feed_id": "temperature",
     *         "value": 24,
     *         "recorded_at": "2025-04-13 14:00:00",
     *         "status": "Ổn định"
     *    }
     * }
     */
    public function fetchAndEvaluate(Request $request)
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
                'error' => "Không có dữ liệu cho feed: $feedKey"
            ], 404);
        }

        $value = floatval($results[0]['value'] ?? 0);

        // Tính toán trạng thái dựa trên loại cảm biến và giá trị đo.
        switch ($feedKey) {
            case 'temperature':
                // Xét khoảng nhiệt độ theo khung giờ đo:
                // Ban ngày (6AM - 18PM): 21-25°C; Ban đêm (18PM - 6AM): 15-18°C
                $hour = $recordedAt->hour;
                if ($hour >= 6 && $hour < 18) {
                    $min = 21;
                    $max = 25;
                } else {
                    $min = 15;
                    $max = 18;
                }
                if ($value < $min) {
                    $status = "Quá thấp";
                } elseif ($value > $max) {
                    $status = "Quá cao";
                } else {
                    $status = "Ổn định";
                }
                break;

            case 'air-humidity':
                // Độ ẩm môi trường tối ưu: 60 - 70%
                if ($value < 60) {
                    $status = "Quá thấp";
                } elseif ($value > 70) {
                    $status = "Quá cao";
                } else {
                    $status = "Ổn định";
                }
                break;

            case 'soil-moisturer':
                // Độ ẩm đất tối ưu: 60 - 80%
                if ($value < 60) {
                    $status = "Quá thấp";
                } elseif ($value > 80) {
                    $status = "Quá cao";
                } else {
                    $status = "Ổn định";
                }
                break;

            case 'light':
                // Ánh sáng tối ưu: 100 - 300 lux
                if ($value < 100) {
                    $status = "Quá thấp";
                } elseif ($value > 300) {
                    $status = "Quá cao";
                } else {
                    $status = "Ổn định";
                }
                break;

            default:
                $status = "Chưa xác định";
                break;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'feed_id' => $feedKey,
                'value' => $value,
                'recorded_at' => $recordedAt->toDateTimeString(),
                'status' => $status,
            ]
        ], 200);
    }



}
