<?php

namespace App\Http\Controllers;
use App\Events\EnvironmentUpdated;
use App\Services\AdafruitService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;
use App\Models\Sensor;  // 👉 thêm import


class EnvironmentController extends Controller
{
    protected AdafruitService $adafruit;

    public function __construct(AdafruitService $adafruit)
    {
        $this->adafruit = $adafruit;
    }

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

        // try {
        //     $value = $this->adafruit->fetchLastValue($feedKey);
        // } catch (\Exception $e) {
        //     return response()->json([
        //         'success' => false,
        //         'error' => $e->getMessage(),
        //     ], 500);
        // }


        $advice = '';

        // 4. So sánh và format message theo feed type
        switch ($feedKey) {
            case 'temperature':
                $unit = '°C';
                if ($value < $min) {
                    $status = 'Quá thấp';
                    $warning = "Nhiệt độ ({$value}{$unit}) dưới ngưỡng tối thiểu {$min}{$unit}.";
                    $advice = 'Bạn nên tăng nhiệt hoặc che chắn để giữ ấm.';
                } elseif ($value > $max) {
                    $status = 'Quá cao';
                    $warning = "Nhiệt độ ({$value}{$unit}) vượt ngưỡng tối đa {$max}{$unit}.";
                    $advice = 'Bạn nên làm mát hoặc thông gió khu vực.';
                } else {
                    $status = 'Ổn định';
                    $warning = 'Nhiệt độ trong khoảng lý tưởng.';
                    $advice = 'Nhiệt độ ổn định, tiếp tục duy trì hiện tại.';
                }
                break;

            case 'air-humidity':
                $unit = '%';
                if ($value < $min) {
                    $status = 'Quá thấp';
                    $warning = "Độ ẩm không khí ({$value}{$unit}) quá thấp.";
                    $advice = 'Bạn nên phun sương hoặc tăng độ ẩm không khí.';
                } elseif ($value > $max) {
                    $status = 'Quá cao';
                    $warning = "Độ ẩm không khí ({$value}{$unit}) quá cao.";
                    $advice = 'Bạn nên thông gió để giảm ẩm.';
                } else {
                    $status = 'Ổn định';
                    $warning = 'Độ ẩm không khí phù hợp.';
                    $advice = 'Độ ẩm ổn định, duy trì mức hiện tại.';
                }
                break;

            case 'soil-moisturer':
                $unit = '%';
                if ($value < $min) {
                    $status = 'Quá thấp';
                    $warning = "Độ ẩm đất ({$value}{$unit}) quá thấp.";
                    $advice = 'Bạn nên bật máy bơm để tưới nước.';
                } elseif ($value > $max) {
                    $status = 'Quá cao';
                    $warning = "Độ ẩm đất ({$value}{$unit}) quá cao.";
                    $advice = 'Tạm dừng tưới để đất khô bớt.';
                } else {
                    $status = 'Ổn định';
                    $warning = 'Độ ẩm đất trong khoảng an toàn.';
                    $advice = 'Độ ẩm đất ổn định, tiếp tục giám sát.';
                }
                break;

            case 'light':
                $unit = ' lux';
                if ($value < $min) {
                    $status = 'Quá thấp';
                    $warning = "Ánh sáng ({$value}{$unit}) quá yếu.";
                    $advice = 'Bạn nên bật đèn hoặc tăng cường nguồn sáng.';
                } elseif ($value > $max) {
                    $status = 'Quá cao';
                    $warning = "Ánh sáng ({$value}{$unit}) quá mạnh.";
                    $advice = 'Bạn nên giảm cường độ hoặc che bớt ánh sáng.';
                } else {
                    $status = 'Ổn định';
                    $warning = 'Ánh sáng phù hợp.';
                    $advice = 'Ánh sáng ổn định, giữ nguyên chế độ hiện tại.';
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
                'advice' => $advice,
            ],
        ], 200);
    }



}