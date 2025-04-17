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
     *   "recorded_at": "2025-04-13 14:00:00"   // (optional)
     * }
     */
    public function fetchAndEvaluate(Request $request)
    {
        $data = $request->validate([
            'feed_id' => 'required|string',
            'recorded_at' => 'nullable|date',
        ]);

        $feedKey = strtolower($data['feed_id']);
        $recordedAt = isset($data['recorded_at'])
            ? Carbon::parse($data['recorded_at'])
            : Carbon::now();

        $username = env('ADAFRUIT_IO_USERNAME');
        $aioKey = env('ADAFRUIT_IO_KEY');

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
        $status = null;
        $warning = null; // Khởi tạo trước để không bị undefined

        switch ($feedKey) {
            case 'temperature':
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
                    $warning = "Cần kiểm tra hệ thống sưởi hoặc tăng nhiệt độ môi trường.";
                } elseif ($value > $max) {
                    $status = "Quá cao";
                    $warning = "Cần kiểm tra hệ thống làm mát hoặc giảm nhiệt độ môi trường.";
                } else {
                    $status = "Ổn định";
                    $warning = "Nhiệt độ trong khoảng lý tưởng.";
                }
                break;

            case 'air-humidity':
                if ($value < 60) {
                    $status = "Quá thấp";
                    $warning = "Cần tăng độ ẩm: phun sương hoặc đặt khay nước.";
                } elseif ($value > 70) {
                    $status = "Quá cao";
                    $warning = "Cần giảm độ ẩm: tăng thông gió hoặc giảm phun sương.";
                } else {
                    $status = "Ổn định";
                    $warning = "Độ ẩm không khí phù hợp.";
                }
                break;

            case 'soil-moisturer':
                if ($value < 60) {
                    $status = "Quá thấp";
                    $warning = "Cần tăng tưới nước cho đất.";
                } elseif ($value > 80) {
                    $status = "Quá cao";
                    $warning = "Cần giảm tần suất hoặc lượng tưới.";
                } else {
                    $status = "Ổn định";
                    $warning = "Độ ẩm đất trong khoảng an toàn.";
                }
                break;

            case 'light':
                if ($value < 100) {
                    $status = "Quá thấp";
                    $warning = "Cần tăng ánh sáng: đặt cây nơi có nắng hoặc bật đèn.";
                } elseif ($value > 300) {
                    $status = "Quá cao";
                    $warning = "Cần giảm cường độ ánh sáng hoặc che bớt nắng.";
                } else {
                    $status = "Ổn định";
                    $warning = "Ánh sáng phù hợp.";
                }
                break;

            default:
                $status = "Chưa xác định";
                $warning = "Feed không hợp lệ.";
                break;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'feed_id' => $feedKey,
                'value' => $value,
                'recorded_at' => $recordedAt->toDateTimeString(),
                'status' => $status,
                'warning' => $warning,
            ],
        ], 200);
    }
}
