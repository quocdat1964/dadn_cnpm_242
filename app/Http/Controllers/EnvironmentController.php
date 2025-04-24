<?php

namespace App\Http\Controllers;
use App\Events\EnvironmentUpdated;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;
use App\Models\Sensor;  // 👉 thêm import


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
    // public function fetchAndEvaluate(Request $request)
    // {
    //     $data = $request->validate([
    //         'feed_id' => 'required|string',
    //         'recorded_at' => 'nullable|date',
    //     ]);

    //     $feedKey = strtolower($data['feed_id']);
    //     $recordedAt = isset($data['recorded_at'])
    //         ? Carbon::parse($data['recorded_at'])
    //         : Carbon::now();

    //     $username = env('ADAFRUIT_IO_USERNAME');
    //     $aioKey = env('ADAFRUIT_IO_KEY');

    //     $url = "https://io.adafruit.com/api/v2/{$username}/feeds/{$feedKey}/data?limit=1";

    //     $response = Http::withHeaders([
    //         'X-AIO-Key' => $aioKey,
    //     ])->get($url);

    //     if (!$response->successful()) {
    //         return response()->json([
    //             'success' => false,
    //             'error' => "Không thể lấy dữ liệu từ Adafruit."
    //         ], 500);
    //     }

    //     $results = $response->json();
    //     if (empty($results)) {
    //         return response()->json([
    //             'success' => false,
    //             'error' => "Không có dữ liệu cho feed: $feedKey"
    //         ], 404);
    //     }

    //     $value = floatval($results[0]['value'] ?? 0);
    //     $status = null;
    //     $warning = null; // Khởi tạo trước để không bị undefined

    //     switch ($feedKey) {
    //         case 'temperature':
    //             $hour = $recordedAt->hour;
    //             if ($hour >= 6 && $hour < 18) {
    //                 $min = 21;
    //                 $max = 25;
    //             } else {
    //                 $min = 15;
    //                 $max = 18;
    //             }
    //             if ($value < $min) {
    //                 $status = "Quá thấp";
    //                 $warning = "Cần kiểm tra hệ thống sưởi hoặc tăng nhiệt độ môi trường.";
    //             } elseif ($value > $max) {
    //                 $status = "Quá cao";
    //                 $warning = "Cần kiểm tra hệ thống làm mát hoặc giảm nhiệt độ môi trường.";
    //             } else {
    //                 $status = "Ổn định";
    //                 $warning = "Nhiệt độ trong khoảng lý tưởng.";
    //             }
    //             break;

    //         case 'air-humidity':
    //             if ($value < 60) {
    //                 $status = "Quá thấp";
    //                 $warning = "Cần tăng độ ẩm: phun sương hoặc đặt khay nước.";
    //             } elseif ($value > 70) {
    //                 $status = "Quá cao";
    //                 $warning = "Cần giảm độ ẩm: tăng thông gió hoặc giảm phun sương.";
    //             } else {
    //                 $status = "Ổn định";
    //                 $warning = "Độ ẩm không khí phù hợp.";
    //             }
    //             break;

    //         case 'soil-moisturer':
    //             if ($value < 60) {
    //                 $status = "Quá thấp";
    //                 $warning = "Cần tăng tưới nước cho đất.";
    //             } elseif ($value > 80) {
    //                 $status = "Quá cao";
    //                 $warning = "Cần giảm tần suất hoặc lượng tưới.";
    //             } else {
    //                 $status = "Ổn định";
    //                 $warning = "Độ ẩm đất trong khoảng an toàn.";
    //             }
    //             break;

    //         case 'light':
    //             if ($value < 100) {
    //                 $status = "Quá thấp";
    //                 $warning = "Cần tăng ánh sáng: đặt cây nơi có nắng hoặc bật đèn.";
    //             } elseif ($value > 300) {
    //                 $status = "Quá cao";
    //                 $warning = "Cần giảm cường độ ánh sáng hoặc che bớt nắng.";
    //             } else {
    //                 $status = "Ổn định";
    //                 $warning = "Ánh sáng phù hợp.";
    //             }
    //             break;

    //         default:
    //             $status = "Chưa xác định";
    //             $warning = "Feed không hợp lệ.";
    //             break;
    //     }

    //     return response()->json([
    //         'success' => true,
    //         'data' => [
    //             'feed_id' => $feedKey,
    //             'value' => $value,
    //             'recorded_at' => $recordedAt->toDateTimeString(),
    //             'status' => $status,
    //             'warning' => $warning,
    //         ],
    //     ], 200);
    // }


    /**
     * POST /api/environment/evaluate
     *
     * Payload ví dụ:
     * {
     *   "feed_id": "temperature",      // hoặc "air-humidity", "soil-moisturer", "light"
     *   "recorded_at": "2025-04-13 14:00:00"  // (optional)
     * }
     */
    public function fetchAndEvaluate(Request $request)
    {
        // 1. Validate input & ensure sensor tồn tại
        $data = $request->validate([
            'feed_id' => 'required|string|exists:sensors,feed_key',
            'recorded_at' => 'nullable|date',
        ]);

        $feedKey = strtolower($data['feed_id']);
        $recordedAt = isset($data['recorded_at'])
            ? Carbon::parse($data['recorded_at'])
            : Carbon::now();

        // 2. Lấy sensor, warning_min và warning_max
        $sensor = Sensor::where('feed_key', $feedKey)->firstOrFail();
        $min = $sensor->warning_min;
        $max = $sensor->warning_max;

        // 3. Gọi Adafruit IO
        $resp = Http::withHeaders(['X-AIO-Key' => env('ADAFRUIT_IO_KEY')])
            ->get("https://io.adafruit.com/api/v2/" . env('ADAFRUIT_IO_USERNAME') . "/feeds/{$feedKey}/data?limit=1");

        if (!$resp->successful()) {
            return response()->json([
                'success' => false,
                'error' => 'Không thể lấy dữ liệu từ Adafruit IO.'
            ], 500);
        }

        $results = $resp->json();
        if (empty($results)) {
            return response()->json([
                'success' => false,
                'error' => "Không có dữ liệu cho feed '{$feedKey}'."
            ], 404);
        }

        $value = floatval($results[0]['value'] ?? 0);

        // 4. So sánh và format message theo feed type
        switch ($feedKey) {
            case 'temperature':
                $unit = '°C';
                $ideal = 'Nhiệt độ trong khoảng lý tưởng.';
                if ($value < $min) {
                    $status = 'Quá thấp';
                    $warning = "Nhiệt độ ({$value}{$unit}) dưới ngưỡng tối thiểu {$min}{$unit}.";
                } elseif ($value > $max) {
                    $status = 'Quá cao';
                    $warning = "Nhiệt độ ({$value}{$unit}) vượt ngưỡng tối đa {$max}{$unit}.";
                } else {
                    $status = 'Ổn định';
                    $warning = $ideal;
                }
                break;

            case 'air-humidity':
                $unit = '%';
                $ideal = 'Độ ẩm không khí phù hợp.';
                if ($value < $min) {
                    $status = 'Quá thấp';
                    $warning = "Độ ẩm không khí ({$value}{$unit}) quá thấp.";
                } elseif ($value > $max) {
                    $status = 'Quá cao';
                    $warning = "Độ ẩm không khí ({$value}{$unit}) quá cao.";
                } else {
                    $status = 'Ổn định';
                    $warning = $ideal;
                }
                break;

            case 'soil-moisturer':
                $unit = '%';
                $ideal = 'Độ ẩm đất trong khoảng an toàn.';
                if ($value < $min) {
                    $status = 'Quá thấp';
                    $warning = "Độ ẩm đất ({$value}{$unit}) quá thấp.";
                } elseif ($value > $max) {
                    $status = 'Quá cao';
                    $warning = "Độ ẩm đất ({$value}{$unit}) quá cao.";
                } else {
                    $status = 'Ổn định';
                    $warning = $ideal;
                }
                break;

            case 'light':
                $unit = ' lux';
                $ideal = 'Ánh sáng phù hợp.';
                if ($value < $min) {
                    $status = 'Quá thấp';
                    $warning = "Ánh sáng ({$value}{$unit}) quá yếu.";
                } elseif ($value > $max) {
                    $status = 'Quá cao';
                    $warning = "Ánh sáng ({$value}{$unit}) quá mạnh.";
                } else {
                    $status = 'Ổn định';
                    $warning = $ideal;
                }
                break;

            default:
                return response()->json([
                    'success' => false,
                    'error' => "Feed '{$feedKey}' không hợp lệ."
                ], 400);
        }



        // 5. Trả về kết quả
        return response()->json([
            'success' => true,
            'data' => [
                'feed_id' => $feedKey,
                'value' => $value,
                'unit' => $unit,
                'recorded_at' => $recordedAt->toDateTimeString(),
                'warning' => $warning,
                'warning_min' => $min,
                'warning_max' => $max,
                'status' => $status,
                'message' => $warning,
            ],
        ], 200);
    }


    // public function fetchAndEvaluate(Request $request)
    // {
    //     // 1) Validate & lấy sensor
    //     $data = $request->validate([
    //         'feed_id' => 'required|string|exists:sensors,feed_key',
    //         'recorded_at' => 'nullable|date',
    //     ]);
    //     $feedKey = strtolower($data['feed_id']);
    //     $recordedAt = isset($data['recorded_at'])
    //         ? Carbon::parse($data['recorded_at'])
    //         : Carbon::now();

    //     $sensor = Sensor::where('feed_key', $feedKey)->firstOrFail();
    //     $min = $sensor->warning_min;
    //     $max = $sensor->warning_max;

    //     // 2) Call Adafruit IO
    //     $resp = Http::withHeaders(['X-AIO-Key' => env('ADAFRUIT_IO_KEY')])
    //         ->get("https://io.adafruit.com/api/v2/" . env('ADAFRUIT_IO_USERNAME')
    //             . "/feeds/{$feedKey}/data?limit=1");

    //     if (!$resp->successful()) {
    //         return response()->json(['success' => false, 'error' => 'Không thể lấy dữ liệu từ Adafruit IO.'], 500);
    //     }
    //     $results = $resp->json();
    //     if (empty($results)) {
    //         return response()->json(['success' => false, 'error' => "Không có dữ liệu cho feed '{$feedKey}'."], 404);
    //     }

    //     // 3) Tính status & warning
    //     $value = floatval($results[0]['value'] ?? 0);
    //     switch ($feedKey) {
    //         case 'temperature':
    //             $unit = '°C';
    //             $ideal = "Nhiệt độ trong khoảng [$min–$max]{$unit}.";
    //             $status = $value < $min ? 'Quá thấp' : ($value > $max ? 'Quá cao' : 'Ổn định');
    //             $warning = $value < $min
    //                 ? "Nhiệt độ ($value{$unit}) dưới ngưỡng tối thiểu $min{$unit}."
    //                 : ($value > $max
    //                     ? "Nhiệt độ ($value{$unit}) vượt ngưỡng tối đa $max{$unit}."
    //                     : $ideal);
    //             break;

    //         case 'air-humidity':
    //             $unit = '%';
    //             $ideal = "Độ ẩm không khí trong khoảng [$min–$max]{$unit}.";
    //             $status = $value < $min ? 'Quá thấp' : ($value > $max ? 'Quá cao' : 'Ổn định');
    //             $warning = $value < $min
    //                 ? "Độ ẩm ($value{$unit}) dưới ngưỡng tối thiểu $min{$unit}."
    //                 : ($value > $max
    //                     ? "Độ ẩm ($value{$unit}) vượt ngưỡng tối đa $max{$unit}."
    //                     : $ideal);
    //             break;

    //         case 'soil-moisturer':
    //             $unit = '%';
    //             $ideal = "Độ ẩm đất trong khoảng [$min–$max]{$unit}.";
    //             $status = $value < $min ? 'Quá thấp' : ($value > $max ? 'Quá cao' : 'Ổn định');
    //             $warning = $value < $min
    //                 ? "Độ ẩm đất ($value{$unit}) dưới ngưỡng tối thiểu $min{$unit}."
    //                 : ($value > $max
    //                     ? "Độ ẩm đất ($value{$unit}) vượt ngưỡng tối đa $max{$unit}."
    //                     : $ideal);
    //             break;

    //         case 'light':
    //             $unit = ' lux';
    //             $ideal = "Ánh sáng trong khoảng [$min–$max]{$unit}.";
    //             $status = $value < $min ? 'Quá thấp' : ($value > $max ? 'Quá cao' : 'Ổn định');
    //             $warning = $value < $min
    //                 ? "Ánh sáng ($value{$unit}) dưới ngưỡng tối thiểu $min{$unit}."
    //                 : ($value > $max
    //                     ? "Ánh sáng ($value{$unit}) vượt ngưỡng tối đa $max{$unit}."
    //                     : $ideal);
    //             break;

    //         default:
    //             return response()->json(['success' => false, 'error' => "Feed '$feedKey' không hợp lệ."], 400);
    //     }

    //     // 4) Chuẩn bị payload và broadcast
    //     $payload = [
    //         'feed_id' => $feedKey,
    //         'value' => $value,
    //         'unit' => $unit,
    //         'recorded_at' => $recordedAt->toDateTimeString(),
    //         'warning' => $warning,
    //         'warning_min' => $min,
    //         'warning_max' => $max,
    //         'status' => $status,
    //     ];
    //     event(new EnvironmentUpdated($payload));

    //     // 5) Trả về response
    //     return response()->json([
    //         'success' => true,
    //         'data' => $payload,
    //     ], 200);
    // }


}
